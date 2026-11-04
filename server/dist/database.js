"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
exports.initDatabase = initDatabase;
const node_1 = require("lowdb/node");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const DB_DIR = path_1.default.join(__dirname, '../../data');
if (!fs_1.default.existsSync(DB_DIR)) {
    fs_1.default.mkdirSync(DB_DIR, { recursive: true });
}
const defaultData = { businesses: [], team: [] };
let dbInstance = null;
async function getDb() {
    if (!dbInstance) {
        dbInstance = await (0, node_1.JSONFilePreset)(path_1.default.join(DB_DIR, 'leads.json'), defaultData);
    }
    return dbInstance;
}
async function initDatabase() {
    await getDb();
    console.log('✅ Database initialized');
}
