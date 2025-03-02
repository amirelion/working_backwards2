import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ArrowForward, ArrowBack, Check, Lightbulb, ContentPaste } from '@mui/icons-material';
import { useRecoilState } from 'recoil';
import { useDispatch } from 'react-redux';
import { workingBackwardsQuestionsState, WorkingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { getAIResponse, getWorkingBackwardsPrompt } from '../services/aiService';
import { updateWorkingBackwardsResponse } from '../store/sessionSlice';

// Define the type for working backwards questions
interface WorkingBackwardsQuestion {
  id: keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>;
  label: string;
  placeholder: string;
  helperText: string;
  aiPrompt: string;
}

// Define the questions for the working backwards process
const questionsList: WorkingBackwardsQuestion[] = [
  {
    id: 'customer',
    label: 'Who is the customer?',
    placeholder: 'Describe your target customer in detail...',
    helperText: 'Be specific about who will use and benefit from your solution.',
    aiPrompt: 'Who is the customer for your innovation?',
  },
  {
    id: 'problem',
    label: 'What is the customer problem or opportunity?',
    placeholder: 'Describe the problem your solution addresses...',
    helperText: 'Focus on the customer pain point or unmet need.',
    aiPrompt: 'What customer problem or opportunity does your innovation address?',
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit to the customer...',
    helperText: 'What value does your solution provide that customers can\'t get elsewhere?',
    aiPrompt: 'What is the most important customer benefit of your innovation?',
  },
  {
    id: 'validation',
    label: 'How do you know what customers need or want?',
    placeholder: 'Describe your evidence of customer demand...',
    helperText: 'What research, data, or insights support your understanding of the customer need?',
    aiPrompt: 'How do you know customers need or want your innovation?',
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey with your solution...',
    helperText: 'Walk through how customers will discover, use, and benefit from your solution.',
    aiPrompt: 'What does the customer experience look like with your innovation?',
  },
];

const WorkingBackwardsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [questionsState, setQuestionsState] = useRecoilState(workingBackwardsQuestionsState);
  const [initialThoughts] = useRecoilState(initialThoughtsState);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(questionsList[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');

  // Initialize current response from Recoil state when active step changes
  useEffect(() => {
    if (!showSummary) {
      const question = questionsList[currentStep];
      setCurrentQuestion(question);
      const questionId = question.id;
      setCurrentResponse(questionsState[questionId] || '');
      
      // Check if there's an AI suggestion for this question
      if (questionsState.aiSuggestions) {
        const questionNumber = currentStep + 1;
        const fullQuestionKey = `${questionNumber}. ${question.label}`;
        if (questionsState.aiSuggestions[fullQuestionKey]) {
          setAiSuggestion(questionsState.aiSuggestions[fullQuestionKey]);
        } else {
          setAiSuggestion('');
        }
      }
    }
  }, [currentStep, questionsState, showSummary]);

  // Get AI suggestion for the current question
  const getAISuggestion = async () => {
    setIsLoading(true);
    
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      Object.entries(questionsState)
        .filter(([key]) => key !== 'aiSuggestions' && key !== currentQuestion.id)
        .forEach(([key, value]) => {
          contextObj[key] = value as string;
        });
      
      const promptText = getWorkingBackwardsPrompt(currentQuestion.aiPrompt, contextObj, initialThoughts);
      
      // Call the AI service
      const response = await getAIResponse({
        prompt: promptText,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
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

  const handleNext = () => {
    // Save current response to Recoil state
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));

    // Also update Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id,
      value: currentResponse
    }));

    // Move to next step or show summary
    if (currentStep === questionsList.length - 1) {
      setShowSummary(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    // Save current response to Recoil state
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));

    // Also update Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id,
      value: currentResponse
    }));

    // Move to previous step or hide summary
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleResponseChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentResponse(event.target.value);
  };

  const handleContinueToPRFAQ = () => {
    // Make sure all responses are saved to Redux before navigating
    Object.entries(questionsState).forEach(([key, value]) => {
      // Skip aiSuggestions
      if (key !== 'aiSuggestions') {
        dispatch(updateWorkingBackwardsResponse({
          field: key as keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>,
          value: value as string
        }));
      }
    });
    
    navigate('/prfaq');
  };

  const handleUseSuggestion = async () => {
    try {
      // Update the current response state
      setCurrentResponse(aiSuggestion);
      
      // Update Redux store
      dispatch(updateWorkingBackwardsResponse({
        field: currentQuestion.id,
        value: aiSuggestion
      }));

      // Copy to clipboard using the Clipboard API
      await navigator.clipboard.writeText(aiSuggestion);
    } catch (error) {
      console.error('Error using suggestion:', error);
      // Still update the text field even if clipboard fails
      setCurrentResponse(aiSuggestion);
      dispatch(updateWorkingBackwardsResponse({
        field: currentQuestion.id,
        value: aiSuggestion
      }));
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Working Backwards
        </Typography>
        <Typography variant="body1" paragraph>
          Answer these key questions to clarify your thinking about your product or service. 
          This process helps you focus on the customer and their needs before diving into solutions.
        </Typography>

        {!showSummary ? (
          <Box sx={{ mt: 4 }}>
            <Stepper activeStep={currentStep} orientation="vertical">
              {questionsList.map((question, index) => (
                <Step key={question.id}>
                  <StepLabel>{question.label}</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {question.helperText}
                      </Typography>
                      
                      {questionsState.aiSuggestions && 
                       questionsState.aiSuggestions[`${index + 1}`] && (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: 'rgba(255, 240, 230, 0.5)', 
                            borderColor: 'secondary.light',
                            display: 'flex',
                            alignItems: 'flex-start'
                          }}
                        >
                          <Lightbulb color="secondary" sx={{ mr: 1, mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="secondary.dark" gutterBottom>
                              AI Suggestion based on your initial thoughts:
                            </Typography>
                            <Typography variant="body2">
                              {questionsState.aiSuggestions[`${index + 1}`]}
                            </Typography>
                          </Box>
                          <Tooltip title="Use this suggestion">
                            <IconButton 
                              size="small" 
                              onClick={handleUseSuggestion}
                              sx={{ ml: 1 }}
                            >
                              <ContentPaste fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      )}
                      
                      <TextField
                        fullWidth
                        multiline
                        rows={6}
                        variant="outlined"
                        placeholder={question.placeholder}
                        value={currentResponse}
                        onChange={handleResponseChange}
                        sx={{ mb: 2 }}
                      />
                      
                      {!questionsState.aiSuggestions?.[`${index + 1}`] && (
                        <Button
                          variant="text"
                          color="secondary"
                          onClick={getAISuggestion}
                          disabled={isLoading}
                          startIcon={isLoading ? <CircularProgress size={20} /> : <Lightbulb />}
                          sx={{ mb: 2 }}
                        >
                          {isLoading ? 'Getting suggestion...' : 'Get AI suggestion'}
                        </Button>
                      )}
                      
                      {aiSuggestion && !questionsState.aiSuggestions?.[`${index + 1}`] && (
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            p: 2, 
                            mb: 2, 
                            bgcolor: 'rgba(255, 240, 230, 0.5)', 
                            borderColor: 'secondary.light',
                            display: 'flex',
                            alignItems: 'flex-start'
                          }}
                        >
                          <Lightbulb color="secondary" sx={{ mr: 1, mt: 0.5 }} />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" color="secondary.dark" gutterBottom>
                              AI Suggestion:
                            </Typography>
                            <Typography variant="body2">
                              {aiSuggestion}
                            </Typography>
                          </Box>
                          <Tooltip title="Use this suggestion">
                            <IconButton 
                              size="small" 
                              onClick={handleUseSuggestion}
                              sx={{ ml: 1 }}
                            >
                              <ContentPaste fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Paper>
                      )}
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                        <Button
                          disabled={currentStep === 0}
                          onClick={handleBack}
                          startIcon={<ArrowBack />}
                        >
                          Back
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleNext}
                          endIcon={<ArrowForward />}
                        >
                          {currentStep === questionsList.length - 1 ? 'Review' : 'Next'}
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Working Backwards Summary
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {questionsList.map((question) => (
                <Box key={question.id} sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {question.label}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {questionsState[question.id] || 'Not answered'}
                  </Typography>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleContinueToPRFAQ}
                  endIcon={<ArrowForward />}
                >
                  Continue to PR/FAQ
                </Button>
              </Box>
            </Paper>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default WorkingBackwardsPage;