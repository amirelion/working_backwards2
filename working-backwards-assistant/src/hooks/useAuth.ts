import { useAppSelector } from '../store/hooks';
import { 
  selectCurrentUser, 
  selectUserProfile, 
  selectUserRole, 
  selectIsAdmin,
  selectIsPremium, 
  selectIsTrial, 
  selectIsTrialExpired,
  selectLoading, 
  selectError 
} from '../store/authSlice';
import { User } from 'firebase/auth';
import { auth } from '../lib/firebase/firebase';
import { useState, useEffect } from 'react';
import { UserProfile } from '../types/auth';

/**
 * Custom hook providing auth state from Redux
 * This is a drop-in replacement for the context-based useAuth hook
 */
export const useAuth = () => {
  // Get auth state from Redux
  const reduxCurrentUser = useAppSelector(selectCurrentUser);
  const reduxUserProfile = useAppSelector(selectUserProfile);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isPremium = useAppSelector(selectIsPremium);
  const isTrial = useAppSelector(selectIsTrial);
  const isTrialExpired = useAppSelector(selectIsTrialExpired);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  
  // Keep track of the actual Firebase User object for auth operations
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Update currentUser when auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    
    return () => unsubscribe();
  }, []);

  // Convert serialized user profile to the expected UserProfile format with Date objects
  const userProfile: UserProfile | null = reduxUserProfile ? {
    ...reduxUserProfile,
    createdAt: new Date(reduxUserProfile.createdAt),
    lastLoginAt: new Date(reduxUserProfile.lastLoginAt),
    trialStartDate: reduxUserProfile.trialStartDate ? new Date(reduxUserProfile.trialStartDate) : undefined,
    trialEndDate: reduxUserProfile.trialEndDate ? new Date(reduxUserProfile.trialEndDate) : undefined
  } : null;

  // Check if user can create a new session (respecting limits)
  const canCreateSession = async () => {
    if (!reduxCurrentUser || !reduxUserProfile) return false;
    if (isAdmin || isPremium) return true;
    if (isTrial && !isTrialExpired) return true;
    
    // For free users, check session count
    return reduxUserProfile.sessionCount < reduxUserProfile.maxSessions;
  };

  return {
    currentUser,
    userProfile,
    userRole,
    isAdmin,
    isPremium,
    isTrial,
    isTrialExpired,
    loading,
    error,
    canCreateSession
  };
}; 