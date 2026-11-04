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

export interface SearchParams {
  country: string;
  city: string;
  area?: string;
  category: string;
  keywords?: string;
  limit: number;
}

export interface SearchResult {
  businesses: Business[];
  total: number;
  searched: number;
  excluded: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface PitchOptions {
  channel: 'whatsapp' | 'instagram' | 'email';
  business: Business;
  agency_name?: string;
  services?: string[];
}

export const BUSINESS_CATEGORIES = [
  'Restaurants',
  'Cafes',
  'Clothing Stores',
  'Barber Shops',
  'Beauty Salons',
  'Medical Clinics',
  'Dental Clinics',
  'Construction Companies',
  'Real Estate Agencies',
  'Interior Designers',
  'Gyms and Fitness Centers',
  'Auto Repair Shops',
  'Car Dealerships',
  'Cleaning Services',
  'Travel Agencies',
  'Hotels',
  'E-commerce Businesses',
  'Education Centers',
  'Law Firms',
  'Other',
] as const;

export const LEAD_STATUSES: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'yellow' },
  { value: 'interested', label: 'Interested', color: 'green' },
  { value: 'follow_up', label: 'Follow-up', color: 'orange' },
  { value: 'converted', label: 'Converted', color: 'emerald' },
  { value: 'rejected', label: 'Rejected', color: 'red' },
];

