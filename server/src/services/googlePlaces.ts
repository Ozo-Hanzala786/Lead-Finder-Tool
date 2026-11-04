import axios from 'axios';

export interface PlaceResult {
  place_id?: string;
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  url?: string;
  types?: string[];
  rating?: number;
  editorial_summary?: { overview: string };
}

interface SerpPlace {
  place_id?: string;
  title?: string;
  address?: string;
  phone?: string;
  website?: string;
  type?: string;
  types?: string[];
  rating?: number;
  country?: string;
  links?: { website?: string };
}

// ─── SerpAPI Google Maps Search ─────────────────────────────────────────────
// NOTE: env key is read lazily (inside the fn) so dotenv has time to load first.

export async function searchPlaces(
  query: string,
  location: string,
  limit: number
): Promise<PlaceResult[]> {
  const SERP_API_KEY = process.env.SERP_API_KEY || '';

  if (!SERP_API_KEY) {
    console.warn('⚠️  SERP_API_KEY not set in server/.env — returning empty results.');
    return [];
  }

  console.log(`🔍 SerpAPI search: "${query} in ${location}" (limit: ${limit})`);

  const results: PlaceResult[] = [];
  let start = 0;

  try {
    while (results.length < limit) {
      const params = new URLSearchParams({
        engine: 'google_maps',
        q: `${query} in ${location}`,
        type: 'search',
        api_key: SERP_API_KEY,
        hl: 'en',
        start: String(start),
      });

      const response = await axios.get(`https://serpapi.com/search?${params}`, {
        timeout: 15000,
      });
      const data = response.data;

      if (data.error) {
        console.error('SerpAPI returned error:', data.error);
        break;
      }

      const places: SerpPlace[] = data.local_results || [];
      console.log(`  → Page start=${start}: got ${places.length} results`);

      if (!places.length) break;

      for (const p of places) {
        if (results.length >= limit) break;
        results.push({
          place_id: p.place_id,
          name: p.title || 'Unknown',
          formatted_address: p.address,
          formatted_phone_number: p.phone,
          website: p.website || p.links?.website,
          url: p.place_id
            ? `https://www.google.com/maps/place/?q=place_id:${p.place_id}`
            : undefined,
          types: p.types || (p.type ? [p.type] : []),
          rating: p.rating,
        });
      }

      if (places.length < 20) break;      // last page
      start += 20;
      await new Promise((r) => setTimeout(r, 400));
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error('SerpAPI HTTP error:', error.response?.status, JSON.stringify(error.response?.data));
    } else {
      console.error('SerpAPI error:', error instanceof Error ? error.message : error);
    }
  }

  console.log(`✅ SerpAPI returned ${results.length} raw results`);
  return results.slice(0, limit);
}

// ─── Get place details ───────────────────────────────────────────────────────

export async function getPlaceDetails(placeId: string): Promise<PlaceResult | null> {
  const SERP_API_KEY = process.env.SERP_API_KEY || '';
  if (!SERP_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      engine: 'google_maps',
      place_id: placeId,
      type: 'place',
      api_key: SERP_API_KEY,
      hl: 'en',
    });

    const response = await axios.get(`https://serpapi.com/search?${params}`, {
      timeout: 10000,
    });
    const data = response.data;
    const place = data.place_results;
    if (!place) return null;

    return {
      place_id: placeId,
      name: place.title,
      formatted_address: place.address,
      formatted_phone_number: place.phone,
      website: place.website,
      url: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
      editorial_summary: place.description
        ? { overview: place.description }
        : undefined,
    };
  } catch {
    return null;
  }
}
