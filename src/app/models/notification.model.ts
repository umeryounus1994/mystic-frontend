import { BaseModel } from './common.model';

export interface Notification extends BaseModel {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  data?: any; // Additional data for the notification
  read: boolean;
  action_url?: string;
  action_text?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  expires_at?: Date;
  image?: string;
}

export type NotificationType = 
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'booking_cancellation'
  | 'quest_available'
  | 'quest_completed'
  | 'level_up'
  | 'friend_request'
  | 'review_request'
  | 'payment_success'
  | 'payment_failed'
  | 'partner_approval'
  | 'system_maintenance';

export type NotificationCategory = 
  | 'booking'
  | 'quest'
  | 'social'
  | 'payment'
  | 'system'
  | 'marketing';

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  categories: {
    booking: boolean;
    quest: boolean;
    social: boolean;
    payment: boolean;
    marketing: boolean;
  };
}

export interface CreateNotificationRequest {
  user_ids: string[];
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  data?: any;
  action_url?: string;
  priority?: string;
}