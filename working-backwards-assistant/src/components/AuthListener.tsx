import React, { useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '../lib/firebase/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types/auth';
import { useAppDispatch } from '../store/hooks';
import {
  setCurrentUser,
  setUserProfile,
  setLoading,
  setError
} from '../store/authSlice';

/**
 * AuthListener is a component that listens for authentication state changes
 * and updates the Redux store accordingly. It doesn't render anything visible.
 */
const AuthListener: React.FC = () => {
  const dispatch = useAppDispatch();

  // Function to fetch user profile from Firestore
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

  // Set up auth state listener
  useEffect(() => {
    console.log('AuthListener: Setting up auth state listener');
    let mounted = true;
    
    try {
      dispatch(setLoading(true));
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('AuthListener: Auth State Changed. User:', user ? {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName
        } : 'No user');
        
        if (user && mounted) {
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
            dispatch(setCurrentUser(null));
            dispatch(setUserProfile(null));
          }
        }
        
        if (mounted) {
          dispatch(setLoading(false));
        }
      });
      
      return () => {
        console.log('AuthListener: Cleaning up auth state listener');
        mounted = false;
        unsubscribe();
      };
    } catch (error) {
      console.error('AuthListener: Error setting up auth listener:', error);
      if (mounted) {
        dispatch(setError('Failed to initialize authentication. Please refresh the page.'));
        dispatch(setLoading(false));
      }
    }
  }, [dispatch, fetchUserProfile]);

  // This component doesn't render anything
  return null;
};

export default AuthListener; 