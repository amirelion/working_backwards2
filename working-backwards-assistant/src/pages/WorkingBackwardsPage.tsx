import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
} from '@mui/material';
import { ArrowForward, ArrowBack, Check } from '@mui/icons-material';
import { RootState } from '../store';
import { updateWorkingBackwardsResponse } from '../store/sessionSlice';
import { getAIResponse, getWorkingBackwardsPrompt } from '../services/aiService';
import { WorkingBackwardsResponses } from '../types';

// Define the type for working backwards questions
interface WorkingBackwardsQuestion {
  id: keyof WorkingBackwardsResponses;
  label: string;
  placeholder: string;
  helperText: string;
  aiPrompt: string;
}

// Define the questions for the Working Backwards process
const workingBackwardsQuestions: WorkingBackwardsQuestion[] = [
  {
    id: 'customer',
    label: 'Who is the customer?',
    placeholder: 'Describe your target customer in detail...',
    helperText: 'Be specific about who will use and benefit from your product or service.',
    aiPrompt: 'Who is the customer for your innovation?',
  },
  {
    id: 'problem',
    label: 'What is the customer problem?',
    placeholder: 'Describe the problem your customers are facing...',
    helperText: 'Focus on the pain points and challenges that your customers experience.',
    aiPrompt: 'What problem does your innovation solve for the customer?',
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit your solution provides...',
    helperText: 'What value does your solution deliver? How does it improve the customer\'s life?',
    aiPrompt: 'What is the most important benefit your innovation provides to customers?',
  },
  {
    id: 'validation',
    label: 'How do you know what customers need?',
    placeholder: 'Describe your customer research and validation...',
    helperText: 'What evidence do you have that this is a real problem worth solving?',
    aiPrompt: 'How do you know what your customers need? What validation do you have?',
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey and experience...',
    helperText: 'Walk through how customers will discover, use, and benefit from your solution.',
    aiPrompt: 'What does the customer experience look like with your innovation?',
  },
];

const WorkingBackwardsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const responses = useSelector((state: RootState) => state.session.workingBackwardsResponses);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(workingBackwardsQuestions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // Initialize current response from Redux store when active step changes
  useEffect(() => {
    if (!showSummary) {
      setCurrentQuestion(workingBackwardsQuestions[currentStep]);
      setCurrentResponse(responses[currentQuestion.id] || '');
    }
  }, [currentStep, responses, showSummary, currentQuestion.id]);

  // Get AI suggestion for the current question
  const getAISuggestion = async () => {
    setIsLoading(true);
    
    try {
      // Create a copy of responses without the current question to avoid circular reasoning
      const previousResponses: Record<string, string> = {};
      Object.entries(responses).forEach(([key, value]) => {
        if (key !== currentQuestion.id && value) {
          previousResponses[key] = value;
        }
      });
      
      const prompt = getWorkingBackwardsPrompt(currentQuestion.aiPrompt, previousResponses);
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        console.error('AI suggestion error:', response.error);
        setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
      } else {
        setAiSuggestion(response.content);
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle next button click
  const handleNext = () => {
    // Save current response to Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
      value: currentResponse,
    }));
    
    // Move to next step or show summary
    if (currentStep === workingBackwardsQuestions.length - 1) {
      setShowSummary(true);
    } else {
      setCurrentStep((prevStep) => prevStep + 1);
      setCurrentQuestion(workingBackwardsQuestions[currentStep + 1]);
      setAiSuggestion('');
    }
  };

  // Handle back button click
  const handleBack = () => {
    if (showSummary) {
      setShowSummary(false);
    } else {
      setCurrentStep((prevStep) => prevStep - 1);
      setCurrentQuestion(workingBackwardsQuestions[currentStep - 1]);
      setAiSuggestion('');
    }
  };

  // Handle response change
  const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentResponse(event.target.value);
  };

  // Handle continue to PRFAQ
  const handleContinueToPRFAQ = () => {
    navigate('/prfaq');
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Working Backwards Process
      </Typography>
      <Typography variant="body1" paragraph>
        Answer the following questions to clarify your thinking about your innovation. This will help you focus on the customer and their needs before diving into solutions.
      </Typography>

      {!showSummary ? (
        <Grid container spacing={3}>
          {/* Left side - Stepper */}
          <Grid item xs={12} md={4}>
            <Stepper activeStep={currentStep} orientation="vertical">
              {workingBackwardsQuestions.map((question, index) => (
                <Step key={question.id}>
                  <StepLabel>{question.label}</StepLabel>
                  <StepContent>
                    <Typography variant="body2" color="text.secondary">
                      {question.helperText}
                    </Typography>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Grid>

          {/* Right side - Current question */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {currentQuestion.label}
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  variant="outlined"
                  placeholder={currentQuestion.placeholder}
                  value={currentResponse}
                  onChange={handleResponseChange}
                  margin="normal"
                />

                {/* AI Suggestion */}
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={getAISuggestion}
                    disabled={isLoading}
                    startIcon={isLoading ? <CircularProgress size={20} /> : null}
                  >
                    Get AI Suggestions
                  </Button>

                  {aiSuggestion && (
                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        AI Suggestion:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {aiSuggestion}
                      </Typography>
                    </Paper>
                  )}
                </Box>

                {/* Navigation buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    variant="outlined"
                    onClick={handleBack}
                    startIcon={<ArrowBack />}
                    disabled={currentStep === 0}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    endIcon={<ArrowForward />}
                    disabled={!currentResponse.trim()}
                  >
                    {currentStep === workingBackwardsQuestions.length - 1 ? 'Review' : 'Next'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // Summary view
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Working Backwards Summary
            </Typography>
            <Typography variant="body2" paragraph>
              Review your responses before moving on to create your PRFAQ document.
            </Typography>

            {workingBackwardsQuestions.map((question) => (
              <Box key={question.id} sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {question.label}
                </Typography>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {responses[question.id as keyof WorkingBackwardsResponses] || 'Not answered'}
                </Typography>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}

            {/* Navigation buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleBack}
                startIcon={<ArrowBack />}
              >
                Edit Responses
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleContinueToPRFAQ}
                endIcon={<Check />}
              >
                Continue to PRFAQ
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default WorkingBackwardsPage;