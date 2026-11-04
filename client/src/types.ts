export type WebsiteStatus = 'no_website' | 'website_found' | 'unverified'
export type LeadStatus = 'new' | 'contacted' | 'interested' | 'follow_up' | 'converted' | 'rejected'

export interface Business {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  city?: string
  country?: string
  category: string
  description?: string
  website_status: WebsiteStatus
  website_url?: string
  google_maps_url?: string
  instagram_url?: string
  facebook_url?: string
  source_url?: string
  quality_score?: number
  lead_status: LeadStatus
  notes?: string
  assigned_to?: string
  created_at: string
  updated_at: string
}

export interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

export const BUSINESS_CATEGORIES = [
  'Restaurants', 'Cafes', 'Clothing Stores', 'Barber Shops', 'Beauty Salons',
  'Medical Clinics', 'Dental Clinics', 'Construction Companies', 'Real Estate Agencies',
  'Interior Designers', 'Gyms and Fitness Centers', 'Auto Repair Shops', 'Car Dealerships',
  'Cleaning Services', 'Travel Agencies', 'Hotels', 'E-commerce Businesses',
  'Education Centers', 'Law Firms', 'Other',
] as const

export const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  interested: { label: 'Interested', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  follow_up: { label: 'Follow-up', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
}

export const WEBSITE_STATUS_CONFIG: Record<WebsiteStatus, { label: string; color: string }> = {
  no_website: { label: 'No Website ✓', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  website_found: { label: 'Has Website', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  unverified: { label: 'Unverified', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
}

export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria', 'Azerbaijan',
  'Bahrain', 'Bangladesh', 'Belgium', 'Bolivia', 'Bosnia and Herzegovina', 'Brazil',
  'Cambodia', 'Canada', 'Chile', 'China', 'Colombia', 'Croatia', 'Czech Republic',
  'Denmark', 'Dominican Republic', 'Ecuador', 'Egypt', 'Ethiopia',
  'Finland', 'France', 'Germany', 'Ghana', 'Greece', 'Guatemala',
  'Honduras', 'Hungary', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya',
  'Kuwait', 'Lebanon', 'Libya', 'Malaysia', 'Mexico', 'Morocco',
  'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Oman',
  'Pakistan', 'Palestine', 'Panama', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Senegal', 'Serbia', 'Singapore',
  'South Africa', 'South Korea', 'Spain', 'Sri Lanka', 'Sudan', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey',
  'UAE', 'Uganda', 'Ukraine', 'United Kingdom', 'United States', 'Uruguay',
  'Uzbekistan', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe',
]

