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
import { useAuth } from '../lib/hooks/useAuth';

const AuthMenu: React.FC = () => {
  const { user, signInWithGoogle, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleCloseMenu();
  };

  if (!user) {
    return (
      <Button
        color="inherit"
        onClick={signInWithGoogle}
        sx={{
          ml: 2,
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        Sign In
      </Button>
    );
  }

  return (
    <Box sx={{ ml: 2 }}>
      <Tooltip title="Account settings">
        <IconButton onClick={handleOpenMenu} sx={{ p: 0 }}>
          <Avatar
            alt={user.displayName || 'User'}
            src={user.photoURL || undefined}
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