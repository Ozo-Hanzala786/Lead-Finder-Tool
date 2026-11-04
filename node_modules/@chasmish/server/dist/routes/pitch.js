"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pitchRouter = void 0;
const express_1 = require("express");
const database_1 = require("../database");
const leadScorer_1 = require("../services/leadScorer");
const router = (0, express_1.Router)();
exports.pitchRouter = router;
router.post('/', async (req, res) => {
    const { business_id, channel, agency_name, services } = req.body;
    if (!business_id || !channel) {
        res.status(400).json({ error: 'business_id and channel are required' });
        return;
    }
    const db = await (0, database_1.getDb)();
    const biz = db.data.businesses.find((b) => b.id === business_id);
    if (!biz) {
        res.status(404).json({ error: 'Business not found' });
        return;
    }
    const pitch = (0, leadScorer_1.generatePitch)(biz, channel, agency_name, services);
    res.json({ pitch, business: biz.name, channel });
});
