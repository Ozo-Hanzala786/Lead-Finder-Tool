import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { Business } from '../types';
import * as XLSX from 'xlsx';

const router = Router();

async function getFilteredLeads(query: Record<string, unknown>): Promise<Business[]> {
  const db = await getDb();
  let leads = db.data.businesses.filter((b) => b.website_status === 'no_website');
  if (query.city) leads = leads.filter((b) => b.city?.toLowerCase().includes((query.city as string).toLowerCase()));
  if (query.category) leads = leads.filter((b) => b.category === query.category);
  if (query.lead_status) leads = leads.filter((b) => b.lead_status === query.lead_status);
  return leads.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
}

router.get('/csv', async (req: Request, res: Response) => {
  const leads = await getFilteredLeads(req.query as Record<string, unknown>);
  const headers = ['Business Name', 'Phone', 'Email', 'Address', 'City', 'Country', 'Category', 'Description', 'Website Status', 'Google Maps', 'Instagram', 'Facebook', 'Lead Status', 'Quality Score', 'Notes', 'Assigned To'];
  const rows = leads.map((b) => [b.name, b.phone || '', b.email || '', b.address || '', b.city || '', b.country || '', b.category, b.description || '', b.website_status, b.google_maps_url || '', b.instagram_url || '', b.facebook_url || '', b.lead_status, b.quality_score || '', b.notes || '', b.assigned_to || '']);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
  res.send(csv);
});

router.get('/xlsx', async (req: Request, res: Response) => {
  const leads = await getFilteredLeads(req.query as Record<string, unknown>);
  const data = leads.map((b) => ({ 'Business Name': b.name, 'Phone': b.phone || '', 'Email': b.email || '', 'Address': b.address || '', 'City': b.city || '', 'Country': b.country || '', 'Category': b.category, 'Description': b.description || '', 'Website Status': b.website_status, 'Google Maps URL': b.google_maps_url || '', 'Instagram': b.instagram_url || '', 'Facebook': b.facebook_url || '', 'Lead Status': b.lead_status, 'Quality Score': b.quality_score || 0, 'Notes': b.notes || '', 'Assigned To': b.assigned_to || '', 'Added On': b.created_at }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Leads');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="leads.xlsx"');
  res.send(buf);
});

router.get('/json', async (req: Request, res: Response) => {
  const leads = await getFilteredLeads(req.query as Record<string, unknown>);
  res.json(leads);
});

export { router as exportRouter };
