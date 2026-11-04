import { JSONFilePreset } from 'lowdb/node';
import path from 'path';
import fs from 'fs';
import { Business, TeamMember } from './types';

const DB_DIR = path.join(__dirname, '../../data');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

interface DbSchema {
  businesses: Business[];
  team: TeamMember[];
}

const defaultData: DbSchema = { businesses: [], team: [] };

let dbInstance: Awaited<ReturnType<typeof JSONFilePreset<DbSchema>>> | null = null;

export async function getDb() {
  if (!dbInstance) {
    dbInstance = await JSONFilePreset<DbSchema>(
      path.join(DB_DIR, 'leads.json'),
      defaultData
    );
  }
  return dbInstance;
}

export async function initDatabase() {
  await getDb();
  console.log('✅ Database initialized');
}
