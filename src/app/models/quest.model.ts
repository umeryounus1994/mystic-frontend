import { BaseModel, GeoPoint } from './common.model';

export interface Quest extends BaseModel {
  title: string;
  description: string;
  type: QuestType;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  crypes_reward: number;
  location?: GeoPoint;
  radius?: number; // meters for location-based quests
  requirements: QuestRequirement[];
  completion_criteria: CompletionCriteria;
  time_limit?: number; // minutes
  max_attempts?: number;
  status: 'active' | 'inactive' | 'draft';
  start_date?: Date;
  end_date?: Date;
  participant_limit?: number;
  current_participants: number;
}

export type QuestType = 
  | 'picture_mystery' 
  | 'location_check_in' 
  | 'activity_completion'
  | 'social_sharing'
  | 'trivia'
  | 'scavenger_hunt'
  | 'daily_challenge';

export interface QuestRequirement {
  type: 'level' | 'activity' | 'location' | 'time' | 'social';
  value: any;
  description: string;
}

export interface CompletionCriteria {
  type: 'photo_upload' | 'location_verify' | 'activity_book' | 'quiz_complete';
  target_value?: any;
  verification_method: 'automatic' | 'manual' | 'ai_verification';
}

export interface UserQuest extends BaseModel {
  user_id: string;
  quest_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed' | 'expired';
  progress: number; // 0-100
  started_at?: Date;
  completed_at?: Date;
  attempts_used: number;
  submission_data?: any; // Photos, answers, etc.
  verification_status?: 'pending' | 'approved' | 'rejected';
}

export interface QuestSubmission {
  quest_id: string;
  submission_type: 'photo' | 'text' | 'location' | 'multiple_choice';
  data: any;
  location?: GeoPoint;
  timestamp: Date;
}

export interface PictureMysteryQuest extends Quest {
  target_image: string;
  clues: string[];
  acceptable_similarity: number; // 0-1
  location_hint?: string;
}