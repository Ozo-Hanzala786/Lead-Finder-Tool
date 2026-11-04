// Load env FIRST — before any other imports read process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { leadsRouter } from './routes/leads';
import { searchRouter } from './routes/search';
import { teamRouter } from './routes/team';
import { exportRouter } from './routes/export';
import { pitchRouter } from './routes/pitch';
import { initDatabase } from './database';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/leads', leadsRouter);
app.use('/api/search', searchRouter);
app.use('/api/team', teamRouter);
app.use('/api/export', exportRouter);
app.use('/api/pitch', pitchRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serp_key_set: !!process.env.SERP_API_KEY,
  });
});

async function main() {
  await initDatabase();
  console.log('🔑 SERP_API_KEY:', process.env.SERP_API_KEY ? '✅ Set' : '❌ NOT SET');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
  });
}

main().catch(console.error);

export default app;
