import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
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
import { useRecoilState } from 'recoil';
import { resetSession } from '../store/sessionSlice';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import AuthMenu from './AuthMenu';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleMobileMenuClose();
  };

  const handleNewSession = () => {
    if (window.confirm('Starting a new session will clear all current data. Are you sure you want to continue?')) {
      dispatch(resetSession());
      setInitialThoughts('');
      setWorkingBackwardsQuestions({
        customer: '',
        problem: '',
        benefit: '',
        validation: '',
        experience: '',
        aiSuggestions: {}
      });
      navigate('/');
    }
    handleMobileMenuClose();
  };

  const navItems = [
    { text: 'Home', path: '/', icon: <HomeIcon /> },
    { text: 'Working Backwards', path: '/working-backwards', icon: <QuestionAnswerIcon /> },
    { text: 'PRFAQ', path: '/prfaq', icon: <DescriptionIcon /> },
    { text: 'Assumptions', path: '/assumptions', icon: <PsychologyIcon /> },
    { text: 'Experiments', path: '/experiments', icon: <ScienceIcon /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open menu"
              edge="start"
              onClick={handleMobileMenuOpen}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1,
              textAlign: isMobile ? 'left' : 'center'
            }}
          >
            Working Backwards Innovation Assistant
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
              <AuthMenu />
            </Box>
          )}
          {isMobile && <AuthMenu />}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Menu
        anchorEl={mobileMenuAnchor}
        open={Boolean(mobileMenuAnchor)}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          mt: '45px',
        }}
      >
        {navItems.map((item) => (
          <MenuItem
            key={item.text}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            {item.icon}
            <Typography sx={{ ml: 1 }}>{item.text}</Typography>
          </MenuItem>
        ))}
        <MenuItem onClick={handleNewSession}>
          <InfoIcon />
          <Typography sx={{ ml: 1 }}>New Session</Typography>
        </MenuItem>
      </Menu>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          marginTop: '64px', // Height of AppBar
          display: 'flex',
          flexDirection: 'column',
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