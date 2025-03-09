import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Description as DescriptionIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import AuthMenu from './AuthMenu';
import { useAuth } from '../contexts/AuthContext';
import { useAppSelector } from '../store/hooks';
import { 
  selectCurrentUser, 
  selectUserProfile, 
  selectIsAdmin, 
  selectLoading 
} from '../store/authSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use both context for backward compatibility and Redux directly
  const { currentUser } = useAuth(); // Keep this for the Firebase User object
  const userProfile = useAppSelector(selectUserProfile);
  const isAdmin = useAppSelector(selectIsAdmin);
  const authLoading = useAppSelector(selectLoading);
  const reduxUser = useAppSelector(selectCurrentUser);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
  ];

  // Only add these items if user is logged in
  if (userProfile) {
    navItems.push({ text: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> });
    navItems.push({ text: 'Working Backwards', path: '/working-backwards', icon: <QuestionAnswerIcon /> });
    navItems.push({ text: 'PRFAQ', path: '/prfaq', icon: <DescriptionIcon /> });
    navItems.push({ text: 'Assumptions', path: '/assumptions', icon: <PsychologyIcon /> });
    navItems.push({ text: 'Experiments', path: '/experiments', icon: <ScienceIcon /> });
    navItems.push({ text: 'Profile', path: '/profile', icon: <PersonIcon /> });
    if (isAdmin) {
      navItems.push({ text: 'Admin', path: '/admin', icon: <AdminIcon /> });
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0,
              marginRight: 4
            }}
          >
            Working Backwards
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                onClick={() => handleNavigation(item.path)}
                sx={{
                  mx: 1,
                  ...(location.pathname === item.path && {
                    borderBottom: '2px solid',
                    borderColor: 'secondary.main',
                  }),
                }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Debug info */}
            <Typography variant="caption" sx={{ mr: 2, color: 'white' }}>
              {authLoading ? 'Auth loading...' : 
               reduxUser ? `Logged in: ${reduxUser.email}` : 'Not logged in'}
            </Typography>
            <AuthMenu />
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          mt: 8,
          p: 3,
        }}
      >
        <Container 
          maxWidth="lg" 
          sx={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            py: 3,
          }}
        >
          {children}
        </Container>

        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: (theme) => theme.palette.grey[100],
          }}
        >
          <Container maxWidth="lg">
            <Typography variant="body2" color="text.secondary" align="center">
              Working Backwards Innovation Assistant - Session data is stored locally in your browser
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default Layout; 