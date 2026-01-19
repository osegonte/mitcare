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

export interface Caretaker {
  id: string;
  provider_id: string;
  full_name: string;
  photo_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  languages: string[];
  specializations: string[];
  certifications?: string[];
  years_experience: number;
  hourly_rate_min: number;
  hourly_rate_max: number;
  available_for_live_in: boolean;
  available_for_overnight: boolean;
  rating: number;
  total_reviews: number;
  completed_bookings: number;
  is_active: boolean;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  client_id: string;
  provider_id: string;
  caretaker_id?: string;
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

export interface Review {
  id: string;
  booking_id: string;
  client_id: string;
  provider_id: string;
  caretaker_id?: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface ReviewWithClient extends Review {
  client: {
    full_name: string;
  };
}

export interface ProviderWithCaretakers extends Provider {
  caretakers: Caretaker[];
}

export interface BookingWithDetails extends Booking {
  provider: Provider;
  caretaker?: Caretaker;
  client?: {
    full_name: string;
    email: string;
  };
}