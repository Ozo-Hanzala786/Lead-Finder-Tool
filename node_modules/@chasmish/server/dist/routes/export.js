"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportRouter = void 0;
const express_1 = require("express");
const database_1 = require("../database");
const XLSX = __importStar(require("xlsx"));
const router = (0, express_1.Router)();
exports.exportRouter = router;
async function getFilteredLeads(query) {
    const db = await (0, database_1.getDb)();
    let leads = db.data.businesses.filter((b) => b.website_status === 'no_website');
    if (query.city)
        leads = leads.filter((b) => b.city?.toLowerCase().includes(query.city.toLowerCase()));
    if (query.category)
        leads = leads.filter((b) => b.category === query.category);
    if (query.lead_status)
        leads = leads.filter((b) => b.lead_status === query.lead_status);
    return leads.sort((a, b) => (b.quality_score || 0) - (a.quality_score || 0));
}
router.get('/csv', async (req, res) => {
    const leads = await getFilteredLeads(req.query);
    const headers = ['Business Name', 'Phone', 'Email', 'Address', 'City', 'Country', 'Category', 'Description', 'Website Status', 'Google Maps', 'Instagram', 'Facebook', 'Lead Status', 'Quality Score', 'Notes', 'Assigned To'];
    const rows = leads.map((b) => [b.name, b.phone || '', b.email || '', b.address || '', b.city || '', b.country || '', b.category, b.description || '', b.website_status, b.google_maps_url || '', b.instagram_url || '', b.facebook_url || '', b.lead_status, b.quality_score || '', b.notes || '', b.assigned_to || '']);
    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.csv"');
    res.send(csv);
});
router.get('/xlsx', async (req, res) => {
    const leads = await getFilteredLeads(req.query);
    const data = leads.map((b) => ({ 'Business Name': b.name, 'Phone': b.phone || '', 'Email': b.email || '', 'Address': b.address || '', 'City': b.city || '', 'Country': b.country || '', 'Category': b.category, 'Description': b.description || '', 'Website Status': b.website_status, 'Google Maps URL': b.google_maps_url || '', 'Instagram': b.instagram_url || '', 'Facebook': b.facebook_url || '', 'Lead Status': b.lead_status, 'Quality Score': b.quality_score || 0, 'Notes': b.notes || '', 'Assigned To': b.assigned_to || '', 'Added On': b.created_at }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="leads.xlsx"');
    res.send(buf);
});
router.get('/json', async (req, res) => {
    const leads = await getFilteredLeads(req.query);
    res.json(leads);
});
