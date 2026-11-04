"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Load env FIRST — before any other imports read process.env
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const leads_1 = require("./routes/leads");
const search_1 = require("./routes/search");
const team_1 = require("./routes/team");
const export_1 = require("./routes/export");
const pitch_1 = require("./routes/pitch");
const database_1 = require("./database");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express_1.default.json());
app.use('/api/leads', leads_1.leadsRouter);
app.use('/api/search', search_1.searchRouter);
app.use('/api/team', team_1.teamRouter);
app.use('/api/export', export_1.exportRouter);
app.use('/api/pitch', pitch_1.pitchRouter);
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        serp_key_set: !!process.env.SERP_API_KEY,
    });
});
async function main() {
    await (0, database_1.initDatabase)();
    console.log('🔑 SERP_API_KEY:', process.env.SERP_API_KEY ? '✅ Set' : '❌ NOT SET');
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
}
main().catch(console.error);
exports.default = app;
