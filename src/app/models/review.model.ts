import { BaseModel } from './common.model';

export interface Review extends BaseModel {
  user_id: string;
  activity_id?: string;
  partner_id?: string;
  booking_id: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  images?: string[];
  helpful_votes: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  response?: PartnerResponse;
  
  // Populated fields
  user?: any;
  activity?: any;
  partner?: any;
}

export interface PartnerResponse {
  message: string;
  responded_at: Date;
  responder_name: string;
}

export interface CreateReviewRequest {
  booking_id: string;
  rating: number;
  title?: string;
  comment: string;
  images?: string[];
}

export interface ReviewStats {
  average_rating: number;
  total_reviews: number;
  rating_distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface ReviewFilter {
  rating?: number;
  date_from?: Date;
  date_to?: Date;
  status?: string;
  has_images?: boolean;
}