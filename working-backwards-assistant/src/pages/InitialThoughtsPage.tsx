import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  CircularProgress
} from '@mui/material';
import { useRecoilState } from 'recoil';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import VoiceTranscriber from '../components/VoiceTranscriber';
import { processInitialThoughts } from '../utils/aiProcessing';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SkipNextIcon from '@mui/icons-material/SkipNext';

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
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  const [workingBackwardsQuestions, setWorkingBackwardsQuestions] = useRecoilState(workingBackwardsQuestionsState);
  const [tabValue, setTabValue] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInitialThoughts(event.target.value);
  };

  const handleVoiceInput = (transcription: string) => {
    setInitialThoughts(transcription);
  };

  const handleContinue = async () => {
    if (!initialThoughts.trim()) {
      alert("Please share your initial thoughts before continuing.");
      return;
    }

    setIsProcessing(true);
    setProcessingError(null);
    
    try {
      // Process the initial thoughts with AI
      const suggestions = await processInitialThoughts(initialThoughts);
      
      // Update working backwards questions with AI suggestions
      setWorkingBackwardsQuestions(prev => ({
        ...prev,
        aiSuggestions: suggestions
      }));
      
      // Navigate to working backwards questions page
      navigate('/working-backwards');
    } catch (error) {
      console.error("Error processing initial thoughts:", error);
      setProcessingError("There was an error processing your input. You can try again or skip to the questions.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSkip = () => {
    // Navigate directly to working backwards questions without processing
    navigate('/working-backwards');
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Share Your Initial Thoughts
        </Typography>
        
        <Typography variant="body1" paragraph>
          Before we dive into the structured Working Backwards process, you can share your initial thoughts about:
        </Typography>
        
        <Box component="ul" sx={{ mb: 3, pl: 4 }}>
          <Typography component="li">Who is your customer?</Typography>
          <Typography component="li">What problem are you trying to solve?</Typography>
          <Typography component="li">What solution are you considering?</Typography>
        </Box>
        
        <Typography variant="body1" paragraph>
          Don't worry about structure - just share your thinking, and we'll help organize it in the next steps.
          This step is optional, but it can help generate suggestions for the Working Backwards questions.
        </Typography>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="input method tabs">
            <Tab label="Type Your Thoughts" id="initial-thoughts-tab-0" />
            <Tab label="Record Your Voice" id="initial-thoughts-tab-1" />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TextField
            fullWidth
            multiline
            rows={10}
            variant="outlined"
            placeholder="Share your thoughts here..."
            value={initialThoughts}
            onChange={handleTextChange}
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <VoiceTranscriber 
            onTranscription={handleVoiceInput} 
            currentText={initialThoughts}
            label="Record your thoughts"
          />
        </TabPanel>
        
        {processingError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {processingError}
          </Alert>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={handleSkip}
            startIcon={<SkipNextIcon />}
          >
            Skip to Questions
          </Button>
          
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleContinue}
            disabled={isProcessing || !initialThoughts.trim()}
            endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardIcon />}
          >
            {isProcessing ? "Processing..." : "Continue with AI Suggestions"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default InitialThoughtsPage; 