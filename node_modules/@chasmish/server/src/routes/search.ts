import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database';
import { searchPlaces, getPlaceDetails } from '../services/googlePlaces';
import { verifyWebsite } from '../services/websiteVerifier';
import { calculateQualityScore } from '../services/leadScorer';
import { Business, SearchParams } from '../types';

const router = Router();

// POST /api/search (SSE streaming)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const params: SearchParams = req.body;

  if (!params.country || !params.city || !params.category) {
    res.status(400).json({ error: 'country, city, and category are required' });
    return;
  }

  const limit = Math.min(params.limit || 25, 100);
  const location = `${params.city}, ${params.country}`;
  const query = `${params.keywords || ''} ${params.category} ${params.area || ''}`.trim();

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const db = await getDb();

    send('status', { message: `Searching for "${query}" in ${location}…`, step: 1 });

    const places = await searchPlaces(query, location, limit * 3);
    send('status', { message: `Found ${places.length} raw results. Verifying websites…`, step: 2 });

    const savedLeads: Business[] = [];
    let searched = 0;
    let excluded = 0;

    for (const place of places) {
      if (savedLeads.length >= limit) break;

      searched++;
      send('progress', { searched, found: savedLeads.length, total: places.length });

      // Fetch details if needed
      const details = place.place_id ? await getPlaceDetails(place.place_id) : null;
      const merged = details ? { ...place, ...details } : place;

      // Duplicate check (by name + city)
      const isDuplicate = db.data.businesses.some(
        (b) => b.name.toLowerCase() === merged.name.toLowerCase() && b.city?.toLowerCase() === params.city.toLowerCase()
      );
      if (isDuplicate) {
        send('status', { message: `Duplicate skipped: ${merged.name}`, step: 2 });
        continue;
      }

      // Website verification
      send('status', { message: `Checking website for ${merged.name}…`, step: 3 });
      const verification = await verifyWebsite(merged.name, merged.website, merged.url);

      if (verification.status !== 'no_website') {
        excluded++;
        send('excluded', {
          name: merged.name,
          reason: verification.status === 'website_found' ? 'Has website' : 'Unverified',
        });
        continue;
      }

      const now = new Date().toISOString();
      const biz: Business = {
        id: uuidv4(),
        name: merged.name,
        phone: merged.formatted_phone_number,
        address: merged.formatted_address,
        city: params.city,
        country: params.country,
        category: params.category,
        description: merged.editorial_summary?.overview,
        website_status: 'no_website',
        google_maps_url: merged.url,
        facebook_url: verification.facebook_url,
        instagram_url: verification.instagram_url,
        lead_status: 'new',
        created_at: now,
        updated_at: now,
      };

      biz.quality_score = calculateQualityScore(biz);

      db.data.businesses.push(biz);
      await db.write();

      savedLeads.push(biz);
      send('lead', biz);
    }

    send('done', { businesses: savedLeads, total: savedLeads.length, searched, excluded });
    res.end();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    send('error', { message: msg });
    res.end();
  }
});

export { router as searchRouter };
