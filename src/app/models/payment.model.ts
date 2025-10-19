import { BaseModel } from './common.model';

export interface Payment extends BaseModel {
  user_id: string;
  booking_id?: string;
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_provider: 'stripe' | 'paypal' | 'razorpay' | 'wallet';
  transaction_id: string;
  provider_transaction_id?: string;
  status: PaymentStatus;
  description: string;
  metadata?: any;
  refund_amount?: number;
  refund_reason?: string;
  refunded_at?: Date;
}

export type PaymentMethod = 
  | 'credit_card'
  | 'debit_card'
  | 'paypal'
  | 'wallet'
  | 'bank_transfer'
  | 'cash';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface Wallet extends BaseModel {
  user_id: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
}

export interface WalletTransaction extends BaseModel {
  wallet_id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference_id?: string;
  reference_type?: 'booking' | 'quest_reward' | 'refund' | 'topup';
  balance_after: number;
}

export interface PaymentIntent {
  amount: number;
  currency: string;
  payment_method: PaymentMethod;
  booking_id?: string;
  description: string;
  return_url?: string;
  cancel_url?: string;
}

export interface RefundRequest {
  payment_id: string;
  amount?: number;
  reason: string;
}