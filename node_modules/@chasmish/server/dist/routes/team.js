"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.teamRouter = void 0;
const express_1 = require("express");
const database_1 = require("../database");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
exports.teamRouter = router;
router.get('/', async (_req, res) => {
    const db = await (0, database_1.getDb)();
    res.json([...db.data.team].sort((a, b) => a.name.localeCompare(b.name)));
});
router.post('/', async (req, res) => {
    const { name, email, role } = req.body;
    if (!name || !email) {
        res.status(400).json({ error: 'name and email required' });
        return;
    }
    const db = await (0, database_1.getDb)();
    if (db.data.team.some((m) => m.email === email)) {
        res.status(409).json({ error: 'Email already exists' });
        return;
    }
    const member = { id: (0, uuid_1.v4)(), name, email, role: role || 'agent', created_at: new Date().toISOString() };
    db.data.team.push(member);
    await db.write();
    res.status(201).json(member);
});
router.delete('/:id', async (req, res) => {
    const db = await (0, database_1.getDb)();
    const before = db.data.team.length;
    db.data.team = db.data.team.filter((m) => m.id !== req.params.id);
    if (db.data.team.length === before) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    await db.write();
    res.json({ success: true });
});
