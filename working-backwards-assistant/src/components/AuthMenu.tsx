import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Button,
  Tooltip,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase/firebase';
import { useNavigate } from 'react-router-dom';

const AuthMenu: React.FC = () => {
  const { currentUser: user, userProfile } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      handleCloseMenu();
      navigate('/'); // Redirect to home page after logout
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSignIn = async () => {
    try {
      console.log('Starting Google sign-in process from AuthMenu...');
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
      setError('Failed to sign in. Please try again.');
    }
  };

  if (!user) {
    return (
      <>
        <Button
          color="inherit"
          onClick={handleSignIn}
          sx={{
            ml: 2,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Sign In
        </Button>
        {error && (
          <Box sx={{ color: 'error.main', ml: 2 }}>
            {error}
          </Box>
        )}
      </>
    );
  }

  return (
    <Box sx={{ ml: 2 }}>
      <Tooltip title="Account settings">
        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
          <Avatar
            alt={userProfile?.displayName || user.displayName || 'User'}
            src={userProfile?.photoURL || user.photoURL || undefined}
            sx={{
              width: 40,
              height: 40,
              border: '2px solid white',
            }}
          />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: '45px' }}
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={handleSignOut}>
          Sign Out
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AuthMenu; 