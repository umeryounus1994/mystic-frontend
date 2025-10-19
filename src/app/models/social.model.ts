import { BaseModel } from './common.model';

export interface Friend extends BaseModel {
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  requested_by: string;
  
  // Populated fields
  user?: any;
  friend?: any;
}

export interface Group extends BaseModel {
  name: string;
  description: string;
  image?: string;
  created_by: string;
  members: GroupMember[];
  privacy: 'public' | 'private' | 'invite_only';
  max_members: number;
  activity_preferences: string[];
  location?: string;
}

export interface GroupMember {
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: Date;
  status: 'active' | 'inactive';
}

export interface GroupActivity extends BaseModel {
  group_id: string;
  activity_id: string;
  organizer_id: string;
  scheduled_date: Date;
  max_participants: number;
  current_participants: string[];
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface Achievement extends BaseModel {
  name: string;
  description: string;
  icon: string;
  category: 'booking' | 'quest' | 'social' | 'level' | 'special';
  criteria: AchievementCriteria;
  reward: {
    xp: number;
    crypes: number;
    badge?: string;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface AchievementCriteria {
  type: string;
  target_value: number;
  description: string;
}

export interface UserAchievement extends BaseModel {
  user_id: string;
  achievement_id: string;
  earned_at: Date;
  progress: number;
  claimed: boolean;
}