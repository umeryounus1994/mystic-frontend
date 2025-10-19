// Common interfaces used across models
export interface GeoPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BaseModel {
  _id?: string;
  created_at?: Date;
  updated_at?: Date;
}

export type Status = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected' | 'blocked';