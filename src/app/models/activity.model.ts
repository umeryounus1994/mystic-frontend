import { BaseModel, GeoPoint } from './common.model';

export interface Activity extends BaseModel {
  title: string;
  description: string;
  category: ActivityCategory;
  price: number;
  images: string[];
  location: GeoPoint;
  address: string;
  duration: number; // in minutes
  max_participants: number;
  partner_id: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'inactive';
  difficulty_level?: 'easy' | 'medium' | 'hard';
  age_restriction?: {
    min_age: number;
    max_age?: number;
  };
  requirements?: string[];
  included_items?: string[];
  cancellation_policy?: string;
  rating?: number;
  total_reviews?: number;
  available_dates?: Date[];
  time_slots?: TimeSlot[];
}

export interface TimeSlot {
  start_time: string; // "09:00"
  end_time: string;   // "11:00"
  available_spots: number;
}

export type ActivityCategory = 
  | 'outdoor' 
  | 'indoor' 
  | 'educational' 
  | 'sports' 
  | 'arts' 
  | 'adventure'
  | 'cultural'
  | 'wellness'
  | 'technology';

export interface ActivityFilter {
  category?: ActivityCategory;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  search?: string;
  difficulty?: string;
  date?: Date;
  radius?: number; // km from user location
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  category: ActivityCategory;
  price: number;
  images: string[];
  location: GeoPoint;
  address: string;
  duration: number;
  max_participants: number;
  difficulty_level?: string;
  requirements?: string[];
  included_items?: string[];
}