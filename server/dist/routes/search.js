"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = require("express");
const uuid_1 = require("uuid");
const database_1 = require("../database");
const googlePlaces_1 = require("../services/googlePlaces");
const websiteVerifier_1 = require("../services/websiteVerifier");
const leadScorer_1 = require("../services/leadScorer");
const router = (0, express_1.Router)();
exports.searchRouter = router;
// POST /api/search (SSE streaming)
router.post('/', async (req, res) => {
    const params = req.body;
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
    const send = (event, data) => {
        res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };
    try {
        const db = await (0, database_1.getDb)();
        send('status', { message: `Searching for "${query}" in ${location}…`, step: 1 });
        const places = await (0, googlePlaces_1.searchPlaces)(query, location, limit * 3);
        send('status', { message: `Found ${places.length} raw results. Verifying websites…`, step: 2 });
        const savedLeads = [];
        let searched = 0;
        let excluded = 0;
        for (const place of places) {
            if (savedLeads.length >= limit)
                break;
            searched++;
            send('progress', { searched, found: savedLeads.length, total: places.length });
            // Fetch details if needed
            const details = place.place_id ? await (0, googlePlaces_1.getPlaceDetails)(place.place_id) : null;
            const merged = details ? { ...place, ...details } : place;
            // Duplicate check (by name + city)
            const isDuplicate = db.data.businesses.some((b) => b.name.toLowerCase() === merged.name.toLowerCase() && b.city?.toLowerCase() === params.city.toLowerCase());
            if (isDuplicate) {
                send('status', { message: `Duplicate skipped: ${merged.name}`, step: 2 });
                continue;
            }
            // Website verification
            send('status', { message: `Checking website for ${merged.name}…`, step: 3 });
            const verification = await (0, websiteVerifier_1.verifyWebsite)(merged.name, merged.website, merged.url);
            if (verification.status !== 'no_website') {
                excluded++;
                send('excluded', {
                    name: merged.name,
                    reason: verification.status === 'website_found' ? 'Has website' : 'Unverified',
                });
                continue;
            }
            const now = new Date().toISOString();
            const biz = {
                id: (0, uuid_1.v4)(),
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
            biz.quality_score = (0, leadScorer_1.calculateQualityScore)(biz);
            db.data.businesses.push(biz);
            await db.write();
            savedLeads.push(biz);
            send('lead', biz);
        }
        send('done', { businesses: savedLeads, total: savedLeads.length, searched, excluded });
        res.end();
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        send('error', { message: msg });
        res.end();
    }
});
