import { BaseModel } from './common.model';

export interface AdminUser extends BaseModel {
  username: string;
  email: string;
  role: AdminRole;
  permissions: Permission[];
  status: 'active' | 'inactive';
  last_login?: Date;
  created_by: string;
}

export type AdminRole = 
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'support'
  | 'finance';

export interface Permission {
  resource: string;
  actions: string[]; // ['create', 'read', 'update', 'delete']
}

export interface SystemStats {
  total_users: number;
  active_users: number;
  total_partners: number;
  active_partners: number;
  total_activities: number;
  pending_activities: number;
  total_bookings: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_reviews: number;
  pending_partner_applications: number;
}

export interface DashboardMetrics {
  user_growth: MetricData[];
  booking_trends: MetricData[];
  revenue_trends: MetricData[];
  activity_categories: CategoryData[];
  top_partners: PartnerMetric[];
  recent_activities: any[];
}

export interface MetricData {
  date: string;
  value: number;
  label?: string;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface PartnerMetric {
  partner_id: string;
  business_name: string;
  total_bookings: number;
  total_revenue: number;
  rating: number;
}