import { BaseModel, GeoPoint } from './common.model';

export interface Partner extends BaseModel {
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  location: GeoPoint;
  business_type: BusinessType;
  description: string;
  website?: string;
  social_media?: SocialMedia;
  verification_status: 'pending' | 'verified' | 'rejected';
  status: 'active' | 'inactive' | 'suspended';
  commission_rate: number; // percentage
  payment_details: PaymentDetails;
  business_documents: BusinessDocument[];
  rating: number;
  total_reviews: number;
  total_activities: number;
  total_bookings: number;
  join_date: Date;
}

export type BusinessType = 
  | 'tour_operator' 
  | 'adventure_sports' 
  | 'educational_center'
  | 'wellness_center'
  | 'cultural_site'
  | 'entertainment'
  | 'restaurant'
  | 'accommodation';

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

export interface PaymentDetails {
  bank_name: string;
  account_number: string;
  account_holder: string;
  routing_number?: string;
  swift_code?: string;
  payment_method: 'bank_transfer' | 'paypal' | 'stripe';
}

export interface BusinessDocument {
  type: 'business_license' | 'tax_certificate' | 'insurance' | 'permit';
  file_url: string;
  expiry_date?: Date;
  verification_status: 'pending' | 'approved' | 'rejected';
}

export interface PartnerStats {
  total_revenue: number;
  monthly_revenue: number;
  total_bookings: number;
  monthly_bookings: number;
  average_rating: number;
  active_activities: number;
  pending_payouts: number;
}

export interface PartnerApplication {
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  business_type: BusinessType;
  description: string;
  address: string;
  documents: File[];
}