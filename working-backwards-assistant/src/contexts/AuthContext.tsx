import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../lib/firebase/firebase';
import { User } from 'firebase/auth';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';
import { useAppSelector } from '../store/hooks';
import {
  selectCurrentUser,
  selectUserProfile,
  selectLoading,
  selectError,
  selectUserRole,
  selectIsAdmin,
  selectIsPremium,
  selectIsTrial,
  selectIsTrialExpired
} from '../store/authSlice';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    // Return a default value instead of null to maintain type safety
    return {
      currentUser: null,
      userProfile: null,
      userRole: 'free',
      isAdmin: false,
      isPremium: false,
      isTrial: false,
      isTrialExpired: false,
      loading: true,
      error: null,
      canCreateSession: async () => false
    };
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Using Redux state instead of local state
  const reduxCurrentUser = useAppSelector(selectCurrentUser);
  const reduxUserProfile = useAppSelector(selectUserProfile);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isPremium = useAppSelector(selectIsPremium);
  const isTrial = useAppSelector(selectIsTrial);
  const isTrialExpired = useAppSelector(selectIsTrialExpired);
  
  // Store the actual Firebase User object for auth operations
  // This isn't stored in Redux since it's not serializable
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);
  
  // Keep firebaseUser in sync with auth.currentUser
  useEffect(() => {
    console.log('AuthProvider: Syncing firebaseUser with auth.currentUser');
    
    // Update firebaseUser whenever auth.currentUser changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('AuthProvider: Auth state changed, updating firebaseUser', 
        user ? `User: ${user.email}` : 'No user');
      setFirebaseUser(user);
    });
    
    return () => {
      console.log('AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);
  
  // Check if user can create a new session (respecting limits)
  const canCreateSession = async () => {
    if (!reduxCurrentUser || !reduxUserProfile) return false;
    if (isAdmin || isPremium) return true;
    if (isTrial && !isTrialExpired) return true;
    
    // For free users, check session count
    return reduxUserProfile.sessionCount < reduxUserProfile.maxSessions;
  };
  
  const value = {
    // For compatibility, provide the Firebase User object through context
    currentUser: firebaseUser,
    userProfile: reduxUserProfile ? {
      ...reduxUserProfile,
      createdAt: new Date(reduxUserProfile.createdAt),
      lastLoginAt: new Date(reduxUserProfile.lastLoginAt),
      trialStartDate: reduxUserProfile.trialStartDate ? new Date(reduxUserProfile.trialStartDate) : undefined,
      trialEndDate: reduxUserProfile.trialEndDate ? new Date(reduxUserProfile.trialEndDate) : undefined
    } : null,
    userRole,
    isAdmin,
    isPremium,
    isTrial,
    isTrialExpired,
    loading,
    error,
    canCreateSession
  };
  
  console.log('AuthProvider state:', {
    hasCurrentUser: !!reduxCurrentUser,
    hasUserProfile: !!reduxUserProfile,
    userRole,
    isLoading: loading,
    error
  });
  
  if (error) {
    return <div style={{ padding: 20, color: 'red' }}>{error}</div>;
  }
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 