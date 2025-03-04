import { User } from 'firebase/auth';

export type UserRole = 'admin' | 'premium' | 'free' | 'trial';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date;
  trialStartDate?: Date;
  trialEndDate?: Date;
  sessionCount: number;
  maxSessions: number;
}

export interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  userRole: UserRole;
  isAdmin: boolean;
  isPremium: boolean;
  isTrial: boolean;
  isTrialExpired: boolean;
  loading: boolean;
  error: string | null;
  canCreateSession: () => Promise<boolean>;
} 