export type WebsiteStatus = 'no_website' | 'website_found' | 'unverified';
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'rejected';

export interface Business {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  category: string;
  description?: string;
  website_status: WebsiteStatus;
  website_url?: string;
  google_maps_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  source_url?: string;
  quality_score?: number;
  lead_status: LeadStatus;
  notes?: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface SearchParams {
  country: string;
  city: string;
  area?: string;
  category: string;
  keywords?: string;
  limit: number;
}

