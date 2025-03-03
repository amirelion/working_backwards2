import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button } from '@mui/material';
import { Google } from '@mui/icons-material';

export default function GoogleSignIn() {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError(null);
      console.log('Starting Google sign-in process...');
      
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Initiating popup sign-in...');
      const result = await signInWithPopup(auth, provider);
      console.log('Sign-in successful:', result.user.email);
      
    } catch (error: any) {
      console.error('Detailed sign-in error:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      });
      
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Please allow popups for this site to sign in with Google.';
      } else if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in cancelled. Please try again.';
      }
      
      setError(errorMessage);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <Button
        variant="contained"
        color="primary"
        onClick={handleSignIn}
        disabled={isSigningIn}
        startIcon={<Google />}
        sx={{ mb: error ? 2 : 0 }}
      >
        {isSigningIn ? 'Signing in...' : 'Sign in with Google'}
      </Button>
      
      {error && (
        <div className="text-red-600 mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 