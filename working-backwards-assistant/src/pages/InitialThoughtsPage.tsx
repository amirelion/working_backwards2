import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
  Alert,
  Tabs,
  Tab,
  Snackbar,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ClearIcon from '@mui/icons-material/Clear';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SaveIcon from '@mui/icons-material/Save';
import MicIcon from '@mui/icons-material/Mic';
import { useAppSelector } from '../store/hooks';
import {
  setInitialThoughts,
  appendToInitialThoughts,
  selectInitialThoughts,
  setSkipInitialThoughts
} from '../store/initialThoughtsSlice';
import VoiceTranscriber from '../components/VoiceTranscriber';
import { TabPanel } from '../components/TabPanel';
import { useAuth } from '../hooks/useAuth';
import { useCurrentProcess } from '../hooks/useCurrentProcess';
import { PageTitle } from '../components/PageTitle';
import { getDateString } from '../utils/dateFormatter';

// Helper function to determine if we can continue based on text length
const canContinue = (text: string) => text.trim().length >= 50;

/**
 * Tab panel props interface
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Initial Thoughts Page Component
 * This page allows users to enter their initial thoughts about a product idea
 */
const InitialThoughtsPage: React.FC = () => {
  const { processId } = useParams<{ processId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useAuth();
  const initialThoughts = useAppSelector(selectInitialThoughts);
  
  const {
    currentProcessId,
    setCurrentProcessId,
    saveCurrentProcess,
    setIsModified
  } = useCurrentProcess();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<React.ReactNode | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');

  // Auto-save effect
  useEffect(() => {
    if (lastChangeTime === 0) return;
    
    // Auto-save after 3 seconds of inactivity
    const AUTOSAVE_DELAY = 3000;
    
    const timerId = setTimeout(async () => {
      console.log('Auto-saving initial thoughts...');
      try {
        await saveCurrentProcess();
        console.log('Auto-save completed successfully');
      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    }, AUTOSAVE_DELAY);
    
    // Clean up timer
    return () => clearTimeout(timerId);
  }, [lastChangeTime, saveCurrentProcess]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInitialThoughtsChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setInitialThoughts(event.target.value));
    
    // Mark the process as modified
    setIsModified(true);
    
    // Update last change time to trigger auto-save
    setLastChangeTime(Date.now());
  }, [dispatch, setIsModified]);

  const handleVoiceInput = useCallback((transcription: string) => {
    dispatch(appendToInitialThoughts(transcription));
    
    // Mark the process as modified
    setIsModified(true);
    
    // Update last change time to trigger auto-save
    setLastChangeTime(Date.now());
  }, [dispatch, setIsModified]);

  const handleProcessInitialThoughts = async () => {
    if (!initialThoughts.trim()) {
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Show a loading message with snackbar
      setSnackbarMessage('Preparing your Working Backwards document...');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      
      // Skip the AI processing step and just save the current process
      if (currentProcessId) {
        try {
          await saveCurrentProcess();
        } catch (saveError) {
          console.error('Error saving current process:', saveError);
          // Continue with navigation even if save fails
        }
      }
      
      // Show success message
      setSnackbarMessage('Moving to Working Backwards questions!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Small delay to ensure state updates are complete
      setTimeout(() => {
        // Navigation should happen last, after all state updates
        try {
          navigate('/working-backwards');
        } catch (navigateError) {
          console.error('Navigation error:', navigateError);
          setProcessingError('Failed to navigate to the Working Backwards page. Please try again.');
          setIsProcessing(false);
        }
      }, 500);
    } catch (error) {
      console.error('Error in processing:', error);
      setProcessingError(`An error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setSnackbarMessage('Error processing initial thoughts.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    dispatch(setSkipInitialThoughts(true));
    
    // Save the process if we have an ID
    if (currentProcessId) {
      saveCurrentProcess()
        .then(() => {
          navigate('/working-backwards');
        })
        .catch(error => {
          console.error('Error saving process during skip:', error);
          navigate('/working-backwards');
        });
    } else {
      navigate('/working-backwards');
    }
  };

  const handleSave = async () => {
    try {
      await saveCurrentProcess();
      
      // Show success message
      setSnackbarMessage('Initial thoughts saved successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving initial thoughts:', error);
      setSnackbarMessage('Error saving initial thoughts.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  const handleClear = () => {
    dispatch(setInitialThoughts(''));
    setIsModified(true);
  };

  // Set the process ID from the route if provided
  useEffect(() => {
    if (processId && processId !== currentProcessId) {
      setCurrentProcessId(processId);
    }
  }, [processId, setCurrentProcessId, currentProcessId]);

  // Get some info about the length of the input
  const charCount = initialThoughts.length;
  const wordCount = initialThoughts.trim() 
    ? initialThoughts.trim().split(/\s+/).length 
    : 0;

  // Snackbar close handler
  const handleCloseSnackbar = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <PageTitle 
        title="Initial Thoughts" 
        subtitle="Share your initial thoughts about your product or feature idea."
        actionButton={
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!initialThoughts.trim()}
          >
            Save
          </Button>
        }
      />
      
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="Input method tabs">
            <Tab label="Text Input" />
            <Tab label="Voice Input" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Text Input
          </Typography>
          <Typography variant="body1" paragraph>
            Describe your initial product idea in as much detail as possible. What problem does it solve? Who are the users? What makes it unique?
          </Typography>
          <TextField
            label="Initial Thoughts"
            multiline
            rows={10}
            fullWidth
            value={initialThoughts}
            onChange={handleInitialThoughtsChange}
            variant="outlined"
            placeholder="Start typing your initial thoughts about your product idea..."
            sx={{ mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {charCount} characters | {wordCount} words
            </Typography>
            {!canContinue(initialThoughts) && (
              <Typography variant="body2" color="text.secondary">
                Add more details to continue
              </Typography>
            )}
          </Box>
          
          {processingError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {processingError}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClear}
              startIcon={<ClearIcon />}
              disabled={isProcessing || !initialThoughts.trim()}
            >
              Clear
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                onClick={handleSkip}
                endIcon={<SkipNextIcon />}
                sx={{ mr: 2 }}
                disabled={isProcessing}
              >
                Skip
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProcessInitialThoughts}
                endIcon={<ArrowForwardIcon />}
                disabled={!initialThoughts.trim() || isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h5" gutterBottom>
            Voice Input
          </Typography>
          <Typography variant="body1" paragraph>
            Speak your thoughts and they will be transcribed automatically. 
            Click the microphone button to start recording.
          </Typography>
          <VoiceTranscriber onTranscription={handleVoiceInput} />
          <TextField
            label="Transcribed Text"
            multiline
            rows={10}
            fullWidth
            value={initialThoughts}
            onChange={handleInitialThoughtsChange}
            variant="outlined"
            sx={{ mt: 3, mb: 3 }}
          />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleClear}
              startIcon={<ClearIcon />}
              disabled={isProcessing || !initialThoughts.trim()}
            >
              Clear
            </Button>
            
            <Box>
              <Button
                variant="outlined"
                onClick={handleSkip}
                endIcon={<SkipNextIcon />}
                sx={{ mr: 2 }}
                disabled={isProcessing}
              >
                Skip
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleProcessInitialThoughts}
                endIcon={<ArrowForwardIcon />}
                disabled={!initialThoughts.trim() || isProcessing}
              >
                {isProcessing ? <CircularProgress size={24} /> : 'Continue'}
              </Button>
            </Box>
          </Box>
        </TabPanel>
      </Paper>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default InitialThoughtsPage; 