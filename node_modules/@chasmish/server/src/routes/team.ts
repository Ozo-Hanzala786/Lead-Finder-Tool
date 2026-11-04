import { Router, Request, Response } from 'express';
import { getDb } from '../database';
import { v4 as uuidv4 } from 'uuid';
import { TeamMember } from '../types';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const db = await getDb();
  res.json([...db.data.team].sort((a, b) => a.name.localeCompare(b.name)));
});

router.post('/', async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  if (!name || !email) { res.status(400).json({ error: 'name and email required' }); return; }
  const db = await getDb();
  if (db.data.team.some((m) => m.email === email)) { res.status(409).json({ error: 'Email already exists' }); return; }
  const member: TeamMember = { id: uuidv4(), name, email, role: role || 'agent', created_at: new Date().toISOString() };
  db.data.team.push(member);
  await db.write();
  res.status(201).json(member);
});

router.delete('/:id', async (req: Request, res: Response) => {
  const db = await getDb();
  const before = db.data.team.length;
  db.data.team = db.data.team.filter((m) => m.id !== req.params.id);
  if (db.data.team.length === before) { res.status(404).json({ error: 'Not found' }); return; }
  await db.write();
  res.json({ success: true });
});

export { router as teamRouter };
