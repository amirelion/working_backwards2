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
  Divider,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { useRecoilState } from 'recoil';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import VoiceTranscriber from '../components/VoiceTranscriber';
import { processInitialThoughts } from '../utils/aiProcessing';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SaveIcon from '@mui/icons-material/Save';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';

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
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
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
  } = useWorkingBackwards();
  
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
    setInitialThoughts(event.target.value);
  };

  const handleVoiceInput = (transcription: string) => {
    setInitialThoughts(prev => prev + ' ' + transcription);
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
      
      // Show success message
      setSnackbarMessage('Initial thoughts processed successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
      // Update the working backwards questions state with the processed data
      setWorkingBackwardsQuestions(prev => ({
        ...prev,
        customer: processedQuestions.customer || prev.customer,
        problem: processedQuestions.problem || prev.problem,
        benefit: processedQuestions.benefit || prev.benefit,
        validation: processedQuestions.validation || prev.validation,
        experience: processedQuestions.experience || prev.experience,
        aiSuggestions: {
          ...prev.aiSuggestions,
          ...processedQuestions.aiSuggestions
        }
      }));
      
      // Save the current process
      if (currentProcessId) {
        await saveCurrentProcess();
      }
      
      // Navigate to the working backwards page
      navigate('/working-backwards');
    } catch (error) {
      console.error('Error processing initial thoughts:', error);
      
      // Show error message
      setSnackbarMessage('Failed to process your initial thoughts. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      
      setProcessingError('Failed to process your initial thoughts. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Add handler for closing snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleSkip = () => {
    navigate('/working-backwards');
  };
  
  const handleSave = async () => {
    if (currentProcessId) {
      try {
        await saveCurrentProcess();
        setSaveSuccess(true);
      } catch (error) {
        console.error('Error saving process:', error);
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      {/* Fix Snackbar component */}
      {snackbarOpen && (
        <Snackbar 
          open={snackbarOpen} 
          autoHideDuration={snackbarSeverity === 'info' ? undefined : 6000} 
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleSnackbarClose} 
            severity={snackbarSeverity} 
            sx={{ width: '100%' }}
            variant="filled"
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      )}

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
              Working on: {workingBackwardsQuestions.customer || 'Untitled Process'}
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
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={!currentProcessId || isProcessing}
            >
              Save Progress
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
              onClick={handleSave}
              startIcon={<SaveIcon />}
              disabled={!currentProcessId || isProcessing}
            >
              Save Progress
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
          message="Progress saved successfully"
        />
      )}
    </Container>
  );
}

export default InitialThoughtsPage; 