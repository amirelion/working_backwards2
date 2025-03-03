import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AuthContextType, UserProfile, UserRole } from '../types/auth';
import { onAuthStateChanged } from 'firebase/auth';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Derived state
  const userRole = userProfile?.role || 'free';
  const isAdmin = userRole === 'admin';
  const isPremium = userRole === 'premium';
  const isTrial = userRole === 'trial';
  const isTrialExpired = isTrial && userProfile?.trialEndDate ? 
    userProfile.trialEndDate < new Date() : false;

  // Function to fetch user profile
  const fetchUserProfile = async (user: User) => {
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
        console.log('Setting user profile with role:', profile.role);
        setUserProfile(profile);
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
          setUserProfile(newUser);
        } catch (error) {
          console.error('Error creating user document:', error);
          setError('Failed to create user profile. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setError('Failed to load user profile. Please try again.');
    }
  };
  
  useEffect(() => {
    let mounted = true;
    
    try {
      console.log('Setting up auth state listener');
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('Auth State Changed. User:', user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : 'No user');
        
        if (user && mounted) {
          setCurrentUser(user);
          await fetchUserProfile(user);
        } else {
          if (mounted) {
            setCurrentUser(null);
            setUserProfile(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
        }
      });
      
      return () => {
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      if (mounted) {
        setError('Failed to initialize authentication. Please refresh the page.');
        setLoading(false);
      }
    }
  }, []);
  
  // Check if user can create a new session (respecting limits)
  const canCreateSession = async () => {
    if (!currentUser || !userProfile) return false;
    if (isAdmin || isPremium) return true;
    if (isTrial && !isTrialExpired) return true;
    
    // For free users, check session count
    return userProfile.sessionCount < userProfile.maxSessions;
  };
  
  const value = {
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