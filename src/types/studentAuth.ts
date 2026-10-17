import { ClassLevel } from './curriculum';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  classLevel: ClassLevel;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudentSession {
  user: StudentProfile;
  token: string;
  expiresAt: number;
}

export interface SupabaseConfigStatus {
  isConfigured: boolean;
  supabaseUrl: string;
  hasAnonKey: boolean;
  mode: 'live' | 'simulated';
}
