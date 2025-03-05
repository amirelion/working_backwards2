import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  CircularProgress,
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
import { useDispatch } from 'react-redux';
import { resetSession } from '../store/sessionSlice';
import AuthMenu from './AuthMenu';
import { useAuth } from '../contexts/AuthContext';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';
import { useRecoilState } from 'recoil';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { userProfile, isAdmin, currentUser, loading: authLoading } = useAuth();
  const { currentProcessId, saveCurrentProcess, isSaving, createNewProcess, setCurrentProcessId } = useWorkingBackwards();
  
  // Recoil state
  const [_, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [__, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  
  // State for new session dialog
  const [newSessionDialogOpen, setNewSessionDialogOpen] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [isCreatingProcess, setIsCreatingProcess] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleNewSessionClick = () => {
    if (currentProcessId) {
      // If there's a current process, open the dialog to save or discard
      setNewSessionDialogOpen(true);
    } else {
      // If no current process, just reset the session
      handleNewSession();
    }
  };

  const handleNewSession = async (saveFirst: boolean = false, newTitle: string = '') => {
    try {
      if (saveFirst && currentProcessId) {
        // Save the current process before resetting
        await saveCurrentProcess();
      } else if (saveFirst && !currentProcessId && newTitle) {
        // Create a new process with the current data
        setIsCreatingProcess(true);
        await createNewProcess(newTitle);
        setIsCreatingProcess(false);
      }
      
      // Reset the session state
      dispatch(resetSession());
      
      // Reset Recoil state
      setInitialThoughts('');
      setWorkingBackwardsQuestions({
        customer: '',
        problem: '',
        benefit: '',
        validation: '',
        experience: '',
        aiSuggestions: {}
      });
      
      // Clear the current process ID
      setCurrentProcessId(null);
      
      // Close the dialog if it's open
      setNewSessionDialogOpen(false);
      setNewProcessTitle('');
      
      // Navigate to the home page
      navigate('/');
    } catch (error) {
      console.error('Error handling new session:', error);
      // Keep the dialog open if there was an error
    }
  };

  const handleCancelNewSession = () => {
    setNewSessionDialogOpen(false);
    setNewProcessTitle('');
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
               currentUser ? `Logged in: ${currentUser.email}` : 'Not logged in'}
            </Typography>
            <Button 
              color="secondary" 
              variant="outlined" 
              onClick={handleNewSessionClick}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} color="secondary" /> : 'New Session'}
            </Button>
            <AuthMenu />
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* New Session Dialog */}
      <Dialog open={newSessionDialogOpen} onClose={handleCancelNewSession}>
        <DialogTitle>Start New Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have unsaved changes in your current session. Would you like to save them before starting a new session?
          </DialogContentText>
          {!currentProcessId && (
            <TextField
              autoFocus
              margin="dense"
              id="process-title"
              label="Process Title"
              type="text"
              fullWidth
              variant="outlined"
              value={newProcessTitle}
              onChange={(e) => setNewProcessTitle(e.target.value)}
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelNewSession} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={() => handleNewSession(false)} 
            color="error"
            disabled={isCreatingProcess || isSaving}
          >
            Discard Changes
          </Button>
          <Button 
            onClick={() => handleNewSession(true, newProcessTitle)} 
            color="primary"
            variant="contained"
            disabled={(isCreatingProcess || isSaving) || (!currentProcessId && !newProcessTitle.trim())}
          >
            {isCreatingProcess || isSaving ? <CircularProgress size={24} /> : 'Save & Start New'}
          </Button>
        </DialogActions>
      </Dialog>
      
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