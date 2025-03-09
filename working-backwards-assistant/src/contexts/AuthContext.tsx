import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth, db } from '../lib/firebase/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  setCurrentUser,
  setUserProfile,
  setLoading,
  setError,
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
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const userProfile = useAppSelector(selectUserProfile);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const userRole = useAppSelector(selectUserRole);
  const isAdmin = useAppSelector(selectIsAdmin);
  const isPremium = useAppSelector(selectIsPremium);
  const isTrial = useAppSelector(selectIsTrial);
  const isTrialExpired = useAppSelector(selectIsTrialExpired);
  
  // Store the actual Firebase User object for auth operations
  // This isn't stored in Redux since it's not serializable
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  // Function to fetch user profile
  const fetchUserProfile = useCallback(async (user: User) => {
    if (!user) {
      console.log('No user provided to fetchUserProfile');
      return;
    }

    try {
      console.log('Fetching user profile for:', user.uid);
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        console.log('User document exists:', userDoc.id);
        const data = userDoc.data();
        console.log('User data:', data);
        
        // Convert from Firestore data to UserProfile
        const profile: UserProfile = {
          uid: userDoc.id,
          email: data.email || '',
          displayName: data.displayName || '',
          photoURL: data.photoURL || '',
          role: data.role as UserRole,
          createdAt: data.createdAt?.toDate() || new Date(),
          lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          sessionCount: data.sessionCount || 0,
          maxSessions: data.maxSessions || 3
        };
        
        // Add trial dates if they exist
        if (data.trialStartDate) {
          profile.trialStartDate = data.trialStartDate.toDate();
        }
        if (data.trialEndDate) {
          profile.trialEndDate = data.trialEndDate.toDate();
        }
        
        console.log('Setting user profile with role:', profile.role);
        
        // Convert dates to strings for Redux
        const serializedProfile = {
          ...profile,
          createdAt: profile.createdAt.toISOString(),
          lastLoginAt: profile.lastLoginAt.toISOString(),
          trialStartDate: profile.trialStartDate?.toISOString(),
          trialEndDate: profile.trialEndDate?.toISOString()
        };
        
        dispatch(setUserProfile(serializedProfile));
      } else {
        console.log('No existing user document found for:', user.uid);
        console.log('Creating new user profile...');
        const newUser: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'free',
          createdAt: new Date(),
          lastLoginAt: new Date(),
          sessionCount: 0,
          maxSessions: 3
        };

        try {
          console.log('Attempting to create user document:', newUser);
          await setDoc(userRef, newUser);
          console.log('User document created successfully');
          
          // Convert dates to strings for Redux
          const serializedProfile = {
            ...newUser,
            createdAt: newUser.createdAt.toISOString(),
            lastLoginAt: newUser.lastLoginAt.toISOString(),
            trialStartDate: newUser.trialStartDate?.toISOString(),
            trialEndDate: newUser.trialEndDate?.toISOString()
          };
          
          dispatch(setUserProfile(serializedProfile));
        } catch (error) {
          console.error('Error creating user document:', error);
          dispatch(setError('Failed to create user profile. Please try again.'));
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      dispatch(setError('Failed to load user profile. Please try again.'));
    }
  }, [dispatch]);
  
  useEffect(() => {
    let mounted = true;
    
    try {
      console.log('Setting up auth state listener');
      dispatch(setLoading(true));
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth State Changed. User:', user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : 'No user');
        
        if (user && mounted) {
          // Store the actual Firebase User object for auth operations
          setFirebaseUser(user);
          
          // Create a serializable version for Redux
          const serializedUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified
          };
          
          dispatch(setCurrentUser(serializedUser));
          await fetchUserProfile(user);
        } else {
          if (mounted) {
            setFirebaseUser(null);
            dispatch(setCurrentUser(null));
            dispatch(setUserProfile(null));
          }
        }
        
        if (mounted) {
          dispatch(setLoading(false));
        }
      });
      
      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted) {
        dispatch(setError('Failed to initialize authentication. Please refresh the page.'));
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, fetchUserProfile]);
  
  // Check if user can create a new session (respecting limits)
  const canCreateSession = async () => {
    if (!currentUser || !userProfile) return false;
    if (isAdmin || isPremium) return true;
    if (isTrial && !isTrialExpired) return true;
    
    // For free users, check session count
    return userProfile.sessionCount < userProfile.maxSessions;
  };
  
  const value = {
    // For compatibility, provide the Firebase User object through context
    currentUser: firebaseUser,
    userProfile: userProfile ? {
      ...userProfile,
      createdAt: new Date(userProfile.createdAt),
      lastLoginAt: new Date(userProfile.lastLoginAt),
      trialStartDate: userProfile.trialStartDate ? new Date(userProfile.trialStartDate) : undefined,
      trialEndDate: userProfile.trialEndDate ? new Date(userProfile.trialEndDate) : undefined
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
    hasCurrentUser: !!currentUser,
    hasUserProfile: !!userProfile,
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