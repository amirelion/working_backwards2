import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
  ListItemButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  QuestionAnswer as QuestionAnswerIcon,
  Description as DescriptionIcon,
  Psychology as PsychologyIcon,
  Science as ScienceIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { resetSession } from '../store/sessionSlice';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setDrawerOpen(false);
    }
  };

  const handleNewSession = () => {
    if (window.confirm('Starting a new session will clear all current data. Are you sure you want to continue?')) {
      dispatch(resetSession());
      navigate('/');
    }
  };

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Working Backwards', path: '/working-backwards', icon: <QuestionAnswerIcon /> },
    { text: 'PRFAQ', path: '/prfaq', icon: <DescriptionIcon /> },
    { text: 'Assumptions', path: '/assumptions', icon: <PsychologyIcon /> },
    { text: 'Experiments', path: '/experiments', icon: <ScienceIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation">
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
          Working Backwards
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            disablePadding
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 153, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 153, 0, 0.2)',
                },
              },
            }}
          >
            <ListItemButton 
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleNewSession}>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="New Session" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Working Backwards Innovation Assistant
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex' }}>
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
              <Button color="secondary" variant="outlined" onClick={handleNewSession} sx={{ ml: 2 }}>
                New Session
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
            position: isMobile ? 'fixed' : 'relative',
            height: isMobile ? '100%' : 'auto',
          },
          width: isMobile ? 0 : 250,
          flexShrink: 0,
          display: { xs: 'block', md: 'none' },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${isMobile ? 0 : 250}px)` },
          ml: { md: isMobile ? 0 : '250px' },
        }}
      >
        <Container maxWidth="lg" sx={{ mt: 2 }}>
          {children}
        </Container>
      </Box>

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
  );
};

export default Layout; 