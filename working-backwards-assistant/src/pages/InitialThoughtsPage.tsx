import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  TextField, 
  Typography, 
  Tab, 
  Tabs, 
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import VoiceTranscriber from '../components/VoiceTranscriber';
import CustomSnackbar from '../components/CustomSnackbar';
import { processInitialThoughts } from '../utils/aiProcessing';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import { useCurrentProcess } from '../features/working-backwards/contexts/CurrentProcessContext';
import ClearIcon from '@mui/icons-material/Clear';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { 
  selectInitialThoughts,
  setInitialThoughts,
  appendToInitialThoughts,
  setSkipInitialThoughts,
  clearInitialThoughts
} from '../store/initialThoughtsSlice';
import {
  updateQuestionField,
  setAISuggestions
} from '../store/workingBackwardsSlice';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`initial-thoughts-tabpanel-${index}`}
      aria-labelledby={`initial-thoughts-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function InitialThoughtsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const dispatch = useAppDispatch();
  
  const prfaq = useSelector((state: RootState) => state.prfaq);
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<React.ReactNode | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Add state for snackbar
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  
  // Get process ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const processId = queryParams.get('process');
  
  // Working Backwards context
  const { 
    currentProcessId, 
    setCurrentProcessId, 
    loadProcess, 
    saveCurrentProcess 
  } = useCurrentProcess();
  
  // Load process if ID is in URL but not loaded yet
  useEffect(() => {
    const loadProcessFromUrl = async () => {
      if (processId && processId !== currentProcessId) {
        try {
          await loadProcess(processId);
        } catch (error) {
          console.error('Error loading process:', error);
        }
      }
    };
    
    loadProcessFromUrl();
  }, [processId, currentProcessId, loadProcess]);
  
  // Set current process ID when component mounts
  useEffect(() => {
    if (processId) {
      setCurrentProcessId(processId);
    }
  }, [processId, setCurrentProcessId]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleInitialThoughtsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setInitialThoughts(event.target.value));
  };

  const handleVoiceInput = (transcription: string) => {
    dispatch(appendToInitialThoughts(transcription));
  };

  const handleProcessInitialThoughts = async () => {
    if (!initialThoughts.trim()) {
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);

    try {
      // Show a loading message with snackbar
      setSnackbarMessage('Processing your initial thoughts with AI...');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);

      // Process the initial thoughts
      const processedQuestions = await processInitialThoughts(initialThoughts);
      console.log('Processed questions:', processedQuestions);
      
      // Update the working backwards questions state with the processed data using Redux
      if (processedQuestions.customer) {
        dispatch(updateQuestionField({ field: 'customer', value: processedQuestions.customer }));
      }
      if (processedQuestions.problem) {
        dispatch(updateQuestionField({ field: 'problem', value: processedQuestions.problem }));
      }
      if (processedQuestions.benefit) {
        dispatch(updateQuestionField({ field: 'benefit', value: processedQuestions.benefit }));
      }
      if (processedQuestions.validation) {
        dispatch(updateQuestionField({ field: 'validation', value: processedQuestions.validation }));
      }
      if (processedQuestions.experience) {
        dispatch(updateQuestionField({ field: 'experience', value: processedQuestions.experience }));
      }
      
      // Update AI suggestions using Redux
      if (processedQuestions.aiSuggestions) {
        dispatch(setAISuggestions(processedQuestions.aiSuggestions));
      }
      
      // Save the current process
      if (currentProcessId) {
        try {
          await saveCurrentProcess();
        } catch (saveError) {
          console.error('Error saving current process:', saveError);
          // Continue with navigation even if save fails
        }
      }
      
      // Show success message
      setSnackbarMessage('Initial thoughts processed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Small delay to ensure state updates are complete
      setTimeout(() => {
        // Navigation should happen last, after all state updates
        try {
          navigate('/working-backwards');
        } catch (navError) {
          console.error('Navigation error:', navError);
          setProcessingError('Error navigating to Working Backwards page. Please try manually clicking "Working Backwards" in the menu.');
        }
      }, 100);
    } catch (error) {
      console.error('Error processing initial thoughts:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to process your initial thoughts. Please try again.';
      
      // Check if it's the Lambda function specific error
      const isLambdaError = errorMessage.includes('AI service is temporarily unavailable');
      
      // Show error message
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      setProcessingError(errorMessage);
      
      // For Lambda invocation errors, we'll save what we have and offer to continue
      if (isLambdaError || errorMessage.includes('Server error') || errorMessage.includes('invalid JSON')) {
        // Still save the initial thoughts
        if (currentProcessId) {
          try {
            await saveCurrentProcess();
          } catch (saveError) {
            console.error('Error saving current process after AI failure:', saveError);
          }
        }
        
        // Add a button to the error message that allows continuing without AI suggestions
        setProcessingError(
          <>
            {errorMessage}
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  dispatch(setSkipInitialThoughts(true));
                  navigate('/working-backwards');
                }}
                sx={{ mr: 1 }}
              >
                Continue Without AI Suggestions
              </Button>
              <Button 
                variant="contained"
                onClick={() => setProcessingError(null)}
              >
                Try Again
              </Button>
            </Box>
          </>
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Add handler for closing snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSkip = () => {
    // Set the skipInitialThoughts flag to true when skipping
    dispatch(setSkipInitialThoughts(true));
    navigate('/working-backwards');
  };
  
  const handleClear = () => {
    dispatch(clearInitialThoughts());
    setSnackbarMessage('Initial thoughts cleared');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleSnackbarClose}
        variant="filled"
      />

      <Paper elevation={2} sx={{ p: 0 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="initial thoughts tabs">
            <Tab label="Initial Thoughts" />
            <Tab label="Voice Input" />
          </Tabs>
        </Box>
        
        {/* Process title display */}
        {currentProcessId && (
          <Box sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
            <Typography variant="subtitle1">
              Working on: {prfaq.title || 'Untitled Process'}
            </Typography>
          </Box>
        )}
        
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h5" gutterBottom>
            Capture Your Initial Thoughts
          </Typography>
          <Typography variant="body1" paragraph>
            Start by writing down your initial thoughts about your product, service, or feature. 
            What problem are you trying to solve? Who is your customer? What benefits will they receive?
          </Typography>
          <TextField
            label="Initial Thoughts"
            multiline
            rows={10}
            fullWidth
            value={initialThoughts}
            onChange={handleInitialThoughtsChange}
            placeholder="Start typing your initial thoughts here..."
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          {processingError && (
            <Alert severity="error" sx={{ mb: 2 }}>
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
      
      {/* Success snackbar - also fix this one */}
      {saveSuccess && (
        <Snackbar
          open={saveSuccess}
          autoHideDuration={3000}
          onClose={() => setSaveSuccess(false)}
          slotProps={{
            content: {
              children: "Progress saved successfully"
            }
          }}
        />
      )}
    </Container>
  );
}

export default InitialThoughtsPage; 