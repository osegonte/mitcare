export type UserRole = 'client' | 'provider';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  language?: string;
  created_at: string;
}

export interface Provider {
  id: string;
  user_id: string;
  agency_name: string;
  description?: string;
  location: string;
  service_areas: string[];
  languages: string[];
  services_offered: string[];
  price_ranges: Record<string, { min: number; max: number }>;
  availability: Record<string, string[]>;
  verification_status: 'pending' | 'verified' | 'rejected';
  years_experience?: number;
  completed_bookings: number;
  response_time?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  service_type: string;
  date_time: string;
  address: string;
  notes?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface SavedProvider {
  id: string;
  client_id: string;
  provider_id: string;
  created_at: string;
}