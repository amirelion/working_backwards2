import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserProfile, UserRole } from '../types/auth';
import { RootState } from './rootStore';

// Create a serializable version of the Firebase User
interface SerializableUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Create a serializable version of UserProfile with Date as strings
interface SerializableUserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  role: UserRole;
  createdAt: string; // ISO string
  lastLoginAt: string; // ISO string
  trialStartDate?: string; // ISO string
  trialEndDate?: string; // ISO string
  sessionCount: number;
  maxSessions: number;
}

// Define the state structure
interface AuthState {
  currentUser: SerializableUser | null;
  userProfile: SerializableUserProfile | null;
  loading: boolean;
  error: string | null;
}

// Define the initial state
const initialState: AuthState = {
  currentUser: null,
  userProfile: null,
  loading: true,
  error: null
};

// Create the slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<SerializableUser | null>) => {
      state.currentUser = action.payload;
    },
    setUserProfile: (state, action: PayloadAction<SerializableUserProfile | null>) => {
      state.userProfile = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  }
});

// Export actions
export const {
  setCurrentUser,
  setUserProfile,
  setLoading,
  setError
} = authSlice.actions;

// Selectors
export const selectCurrentUser = (state: RootState) => state.auth.currentUser;
export const selectUserProfile = (state: RootState) => state.auth.userProfile;
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;

// Derived selectors
export const selectUserRole = (state: RootState) => state.auth.userProfile?.role || 'free';
export const selectIsAdmin = (state: RootState) => state.auth.userProfile?.role === 'admin';
export const selectIsPremium = (state: RootState) => state.auth.userProfile?.role === 'premium';
export const selectIsTrial = (state: RootState) => state.auth.userProfile?.role === 'trial';
export const selectIsTrialExpired = (state: RootState) => {
  const profile = state.auth.userProfile;
  if (!profile || profile.role !== 'trial' || !profile.trialEndDate) return false;
  return new Date(profile.trialEndDate) < new Date();
};

export default authSlice.reducer; 