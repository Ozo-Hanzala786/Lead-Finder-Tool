"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebsite = verifyWebsite;
exports.batchVerify = batchVerify;
const axios_1 = __importDefault(require("axios"));
const SOCIAL_DOMAINS = [
    { domain: 'facebook.com', type: 'facebook' },
    { domain: 'fb.com', type: 'facebook' },
    { domain: 'instagram.com', type: 'instagram' },
    { domain: 'tiktok.com', type: 'other' },
    { domain: 'twitter.com', type: 'other' },
    { domain: 'x.com', type: 'other' },
    { domain: 'youtube.com', type: 'other' },
    { domain: 'linkedin.com', type: 'other' },
    { domain: 'pinterest.com', type: 'other' },
    { domain: 'snapchat.com', type: 'other' },
    { domain: 'whatsapp.com', type: 'other' },
    { domain: 'telegram.org', type: 'other' },
    { domain: 'linktr.ee', type: 'other' },
    { domain: 'linktree.com', type: 'other' },
];
function checkSocialMedia(url) {
    try {
        const hostname = new URL(url).hostname.toLowerCase().replace('www.', '');
        const found = SOCIAL_DOMAINS.find((d) => hostname === d.domain || hostname.endsWith('.' + d.domain));
        if (found) {
            return { isSocial: true, type: found.type };
        }
    }
    catch {
        // invalid URL format
    }
    return { isSocial: false };
}
async function checkUrlReachable(url) {
    try {
        const response = await axios_1.default.head(url, {
            timeout: 5000,
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
            validateStatus: (s) => s < 400,
        });
        return response.status >= 200 && response.status < 400;
    }
    catch {
        return false;
    }
}
async function verifyWebsite(businessName, websiteFromApi, _googleMapsUrl) {
    let facebook_url;
    let instagram_url;
    // 1. If API already returned a URL, check whether it is social media
    if (websiteFromApi && websiteFromApi.trim() !== '') {
        const socialCheck = checkSocialMedia(websiteFromApi);
        if (socialCheck.isSocial) {
            if (socialCheck.type === 'facebook')
                facebook_url = websiteFromApi;
            if (socialCheck.type === 'instagram')
                instagram_url = websiteFromApi;
            // Social media does NOT count as an official website!
            // Business relies on social page, so it has NO official website.
            return { status: 'no_website', facebook_url, instagram_url };
        }
        // It's a regular website URL. Verify if it's reachable.
        const reachable = await checkUrlReachable(websiteFromApi);
        if (reachable) {
            return { status: 'website_found', website_url: websiteFromApi };
        }
        // URL provided on Maps profile exists (domain registered/pointed) -> exclude to avoid false leads
        return { status: 'website_found', website_url: websiteFromApi };
    }
    // 2. No website was linked on the business profile.
    // Check if they have an obvious dedicated .com domain (e.g. brandname.com)
    const cleanName = businessName
        .replace(/[^\w\s]/gi, '')
        .trim()
        .toLowerCase();
    // Only guess for single or double word clean names to avoid false positive domain collisions
    const words = cleanName.split(/\s+/).filter(Boolean);
    if (words.length <= 2 && words.join('').length >= 4) {
        const slug = words.join('');
        const candidate = `https://www.${slug}.com`;
        try {
            const exists = await checkUrlReachable(candidate);
            if (exists) {
                return { status: 'website_found', website_url: candidate };
            }
        }
        catch {
            // not reachable
        }
    }
    // 3. No official website found
    return {
        status: 'no_website',
        facebook_url,
        instagram_url,
    };
}
async function batchVerify(businesses) {
    const results = [];
    for (const biz of businesses) {
        const result = await verifyWebsite(biz.name, biz.website, biz.mapsUrl);
        results.push(result);
        await new Promise((r) => setTimeout(r, 200));
    }
    return results;
}
