import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { Business } from '../types';
import { calculateQualityScore } from '../services/leadScorer';

const router = Router();

// GET /api/leads
router.get('/', async (req: Request, res: Response) => {
  const db = await getDb();
  let businesses = [...db.data.businesses];

  const { status, city, category, website_status, has_phone, search, page = '1', limit = '50' } = req.query;

  if (status) businesses = businesses.filter((b) => b.lead_status === status);
  if (city) businesses = businesses.filter((b) => b.city?.toLowerCase().includes((city as string).toLowerCase()));
  if (category) businesses = businesses.filter((b) => b.category === category);
  if (website_status) businesses = businesses.filter((b) => b.website_status === website_status);
  if (has_phone === 'true') businesses = businesses.filter((b) => b.phone);
  if (search) {
    const s = (search as string).toLowerCase();
    businesses = businesses.filter((b) =>
      b.name.toLowerCase().includes(s) ||
      b.city?.toLowerCase().includes(s) ||
      b.category.toLowerCase().includes(s) ||
      b.description?.toLowerCase().includes(s)
    );
  }

  // Sort by quality score desc
  businesses.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));

  const total = businesses.length;
  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const paginated = businesses.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({ businesses: paginated, total, page: pageNum, limit: limitNum });
});

// GET /api/leads/stats/overview
router.get('/stats/overview', async (_req: Request, res: Response) => {
  const db = await getDb();
  const all = db.data.businesses;
  const total = all.length;
  const noWebsite = all.filter((b) => b.website_status === 'no_website').length;

  const byStatus: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const b of all) {
    byStatus[b.lead_status] = (byStatus[b.lead_status] || 0) + 1;
    byCategory[b.category] = (byCategory[b.category] || 0) + 1;
  }

  res.json({
    total,
    noWebsite,
    byStatus: Object.entries(byStatus).map(([lead_status, cnt]) => ({ lead_status, cnt })),
    byCategory: Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([category, cnt]) => ({ category, cnt })),
  });
});

// GET /api/leads/:id
router.get('/:id', async (req: Request, res: Response) => {
  const db = await getDb();
  const biz = db.data.businesses.find((b) => b.id === req.params.id);
  if (!biz) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(biz);
});

// POST /api/leads
router.post('/', async (req: Request, res: Response) => {
  const data: Partial<Business> = req.body;
  if (!data.name || !data.category) { res.status(400).json({ error: 'name and category required' }); return; }

  const db = await getDb();
  const now = new Date().toISOString();
  const biz: Business = {
    id: uuidv4(),
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    country: data.country,
    category: data.category,
    description: data.description,
    website_status: data.website_status || 'unverified',
    website_url: data.website_url,
    google_maps_url: data.google_maps_url,
    instagram_url: data.instagram_url,
    facebook_url: data.facebook_url,
    source_url: data.source_url,
    quality_score: 0,
    lead_status: data.lead_status || 'new',
    notes: data.notes,
    assigned_to: data.assigned_to,
    created_at: now,
    updated_at: now,
  };
  biz.quality_score = calculateQualityScore(biz);

  db.data.businesses.push(biz);
  await db.write();
  res.status(201).json(biz);
});

// PATCH /api/leads/:id
router.patch('/:id', async (req: Request, res: Response) => {
  const db = await getDb();
  const idx = db.data.businesses.findIndex((b) => b.id === req.params.id);
  if (idx === -1) { res.status(404).json({ error: 'Not found' }); return; }

  const allowedFields: (keyof Business)[] = [
    'name', 'phone', 'email', 'address', 'city', 'country', 'category',
    'description', 'website_status', 'website_url', 'google_maps_url',
    'instagram_url', 'facebook_url', 'source_url', 'quality_score',
    'lead_status', 'notes', 'assigned_to'
  ];

  const updated = { ...db.data.businesses[idx] };
  for (const field of allowedFields) {
    if (field in req.body) {
      (updated as Record<string, unknown>)[field] = req.body[field];
    }
  }
  updated.updated_at = new Date().toISOString();
  updated.quality_score = calculateQualityScore(updated);

  db.data.businesses[idx] = updated;
  await db.write();
  res.json(updated);
});

// DELETE /api/leads/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const db = await getDb();
  const before = db.data.businesses.length;
  db.data.businesses = db.data.businesses.filter((b) => b.id !== req.params.id);
  if (db.data.businesses.length === before) { res.status(404).json({ error: 'Not found' }); return; }
  await db.write();
  res.json({ success: true });
});

// DELETE /api/leads (bulk)
router.delete('/', async (req: Request, res: Response) => {
  const { ids } = req.body as { ids: string[] };
  if (!ids?.length) { res.status(400).json({ error: 'ids array required' }); return; }
  const db = await getDb();
  const idSet = new Set(ids);
  const before = db.data.businesses.length;
  db.data.businesses = db.data.businesses.filter((b) => !idSet.has(b.id));
  await db.write();
  res.json({ success: true, deleted: before - db.data.businesses.length });
});

export { router as leadsRouter };
