import { BaseModel } from './common.model';

export interface Commission extends BaseModel {
  partner_id: string;
  booking_id: string;
  activity_id: string;
  booking_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  payment_date?: Date;
  payment_reference?: string;
  notes?: string;
  
  // Populated fields
  partner?: any;
  booking?: any;
  activity?: any;
}

export interface CommissionPayout extends BaseModel {
  partner_id: string;
  total_amount: number;
  commission_ids: string[];
  payment_method: 'bank_transfer' | 'paypal' | 'stripe';
  payment_reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at?: Date;
  failure_reason?: string;
}

export interface CommissionStats {
  total_earned: number;
  pending_amount: number;
  paid_amount: number;
  current_month_earnings: number;
  commission_rate: number;
  next_payout_date: Date;
}