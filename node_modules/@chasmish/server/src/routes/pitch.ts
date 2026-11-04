import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { generatePitch } from '../services/leadScorer';
import { Business } from '../types';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  const { business_id, channel, agency_name, services } = req.body;
  if (!business_id || !channel) { res.status(400).json({ error: 'business_id and channel are required' }); return; }

  const db = await getDb();
  const biz = db.data.businesses.find((b) => b.id === business_id) as Business | undefined;
  if (!biz) { res.status(404).json({ error: 'Business not found' }); return; }

  const pitch = generatePitch(biz, channel, agency_name, services);
  res.json({ pitch, business: biz.name, channel });
});

export { router as pitchRouter };
