import { BaseModel } from './common.model';

export interface Booking extends BaseModel {
  user_id: string;
  activity_id: string;
  partner_id: string;
  booking_date: Date;
  time_slot: string;
  participants: number;
  total_amount: number;
  discount_applied?: number;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  special_requests?: string;
  cancellation_reason?: string;
  cancelled_at?: Date;
  refund_amount?: number;
  check_in_time?: Date;
  check_out_time?: Date;
  qr_code?: string;
  
  // Populated fields
  activity?: any; // Activity details
  user?: any;     // User details
  partner?: any;  // Partner details
}

export type PaymentStatus = 
  | 'pending' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export type BookingStatus = 
  | 'confirmed' 
  | 'pending' 
  | 'cancelled' 
  | 'completed' 
  | 'no_show'
  | 'in_progress';

export interface CreateBookingRequest {
  activity_id: string;
  booking_date: Date;
  time_slot: string;
  participants: number;
  special_requests?: string;
  payment_method: 'card' | 'wallet' | 'cash';
}

export interface BookingFilter {
  status?: BookingStatus;
  date_from?: Date;
  date_to?: Date;
  activity_category?: string;
  partner_id?: string;
}

export interface BookingStats {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_revenue: number;
  average_rating: number;
}