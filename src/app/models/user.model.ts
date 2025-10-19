import { BaseModel } from './common.model';

export interface User extends BaseModel {
  username?: string;
  email?: string;
  password?: string;
  image?: string;
  access_token?: string;
  current_level: number;
  current_xp: number;
  status: 'active' | 'blocked';
  purchased_package: boolean;
  package_type?: 'weekly' | 'monthly' | 'yearly';
  package_start_date?: Date;
  package_end_date?: Date;
  package_status?: 'active' | 'expired';
  subscription: UserSubscription;
  friends?: string[]; // User IDs
  groups?: string[]; // Group IDs
  achievements?: string[]; // Achievement IDs
  wallet_balance?: number; // Crypes balance
}

export interface UserSubscription {
  plan_type: 'free' | 'basic' | 'premium';
  expires_at?: Date;
  features: {
    booking_discount: number;
    exclusive_access: boolean;
    max_bookings_per_month: number;
    priority_support: boolean;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface UserProfile {
  username: string;
  email: string;
  image?: string;
  bio?: string;
  interests?: string[];
  location?: string;
}

export interface UserStats {
  total_bookings: number;
  completed_quests: number;
  current_level: number;
  current_xp: number;
  total_crypes: number;
  achievements_count: number;
}