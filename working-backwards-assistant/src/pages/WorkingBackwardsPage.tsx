import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRecoilState } from 'recoil';
import { workingBackwardsQuestionsState, WorkingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import { ArrowForward, ArrowBack, Lightbulb, ContentPaste, Edit } from '@mui/icons-material';
import { getAIResponse, getWorkingBackwardsPrompt } from '../services/aiService';
import { updateWorkingBackwardsResponse } from '../store/sessionSlice';
import { initialThoughtsState } from '../atoms/initialThoughtsState';
import { WorkingBackwardsResponses } from '../types';

// Define the type for working backwards questions
interface WorkingBackwardsQuestion {
  id: keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>;
  label: string;
  placeholder: string;
  helperText: string;
  aiPrompt: string;
}

// List of working backwards questions
const questionsList: WorkingBackwardsQuestion[] = [
  {
    id: 'customer',
    label: 'Who is the customer?',
    placeholder: 'Describe your target customer in detail...',
    helperText: 'Be specific about who will use and benefit from your solution.',
    aiPrompt: 'Based on the initial thoughts, who would be the target customer for this product or service? Please provide a detailed description of the customer profile, including their needs, pain points, and characteristics.'
  },
  {
    id: 'problem',
    label: 'What is the customer problem or opportunity?',
    placeholder: 'Describe the problem your solution addresses...',
    helperText: 'What pain point or unmet need does your solution address?',
    aiPrompt: 'Based on the initial thoughts and the identified customer, what specific problem or opportunity does this product or service address? Please describe the pain points, challenges, or unmet needs that exist in the market.'
  },
  {
    id: 'benefit',
    label: 'What is the most important customer benefit?',
    placeholder: 'Describe the primary benefit to the customer...',
    helperText: 'What is the single most compelling benefit your solution provides?',
    aiPrompt: 'Based on the initial thoughts, the identified customer, and the problem described, what is the most important benefit that this product or service provides to the customer? Focus on the primary value proposition that would be most compelling to the customer.'
  },
  {
    id: 'validation',
    label: 'How do you know what customers need or want?',
    placeholder: 'Describe your customer research or validation...',
    helperText: 'What evidence do you have that customers want this solution?',
    aiPrompt: 'Based on the information provided so far, how might you validate that customers actually need or want this solution? What research methods, experiments, or evidence could be gathered to confirm the customer need? If you were advising a product team, what validation approach would you recommend?'
  },
  {
    id: 'experience',
    label: 'What does the customer experience look like?',
    placeholder: 'Describe the customer journey and experience...',
    helperText: 'Walk through the customer experience from start to finish.',
    aiPrompt: 'Based on all the information provided so far, describe what the customer experience would look like when using this product or service. Walk through the customer journey from discovery to adoption and ongoing usage. What would be the key touchpoints and moments that matter in this experience?'
  }
];

const WorkingBackwardsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [questionsState, setQuestionsState] = useRecoilState(workingBackwardsQuestionsState);
  const [initialThoughts, setInitialThoughts] = useRecoilState(initialThoughtsState);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(questionsList[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Get AI suggestion for the current question
  const getAISuggestion = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      Object.entries(questionsState)
        .filter(([key]) => key !== 'aiSuggestions' && key !== currentQuestion.id)
        .forEach(([key, value]) => {
          if (typeof value === 'string') {
            contextObj[key] = value;
          }
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
        
        // Store the suggestion in the questionsState
        setQuestionsState(prev => ({
          ...prev,
          aiSuggestions: {
            ...prev.aiSuggestions,
            [`${currentStep + 1}. ${currentQuestion.label}`]: response.content
          }
        }));
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [currentQuestion, currentStep, initialThoughts, questionsState, setQuestionsState]);

  // Effect to run once on first load to generate AI suggestions if none exist
  useEffect(() => {
    const generateInitialSuggestions = async () => {
      if (isFirstLoad && initialThoughts && !questionsState.aiSuggestions?.['1. Who is the customer?']) {
        setIsFirstLoad(false);
        
        // Only generate suggestions if we have initial thoughts and no existing suggestions
        if (Object.keys(questionsState.aiSuggestions || {}).length === 0) {
          console.log('Generating initial AI suggestions based on initial thoughts');
          
          try {
            // Create a context object from existing responses
            const contextObj: Record<string, string> = {};
            
            // Generate suggestions for all questions at once
            const suggestions: Record<string, string> = {};
            
            for (let i = 0; i < questionsList.length; i++) {
              const question = questionsList[i];
              const questionNumber = i + 1;
              const fullQuestionKey = `${questionNumber}. ${question.label}`;
              
              // Set current question for the getAISuggestion function
              setCurrentQuestion(question);
              setCurrentStep(i);
              
              // Call the AI service
              const promptText = getWorkingBackwardsPrompt(question.aiPrompt, contextObj, initialThoughts);
              
              const response = await getAIResponse({
                prompt: promptText,
                model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
                provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
              });
              
              if (!response.error) {
                suggestions[fullQuestionKey] = response.content;
                
                // Update context for next questions
                contextObj[question.id] = response.content;
              }
            }
            
            // Store all suggestions in the questionsState
            setQuestionsState(prev => ({
              ...prev,
              aiSuggestions: {
                ...prev.aiSuggestions,
                ...suggestions
              }
            }));
            
            // Reset to first question
            setCurrentQuestion(questionsList[0]);
            setCurrentStep(0);
            
            // Set the current AI suggestion
            if (suggestions[`1. ${questionsList[0].label}`]) {
              setAiSuggestion(suggestions[`1. ${questionsList[0].label}`]);
            }
            
          } catch (error) {
            console.error('Error generating initial AI suggestions:', error);
          }
        }
      }
    };
    
    generateInitialSuggestions();
  }, [isFirstLoad, initialThoughts, questionsState.aiSuggestions, setQuestionsState]);

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
        
        console.log('Checking for AI suggestion with key:', fullQuestionKey);
        console.log('Available AI suggestions:', questionsState.aiSuggestions);
        
        if (questionsState.aiSuggestions[fullQuestionKey]) {
          setAiSuggestion(questionsState.aiSuggestions[fullQuestionKey]);
        } else {
          setAiSuggestion('');
        }
      }
    }
  }, [currentStep, questionsState, showSummary]);

  const handleNext = () => {
    // Save current response to Recoil state
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));

    // Also update Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
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
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
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
          field: key as keyof WorkingBackwardsResponses,
          value: value as string
        }));
      }
    });
    
    navigate('/prfaq');
  };

  const handleUseSuggestion = () => {
    if (aiSuggestion) {
      // Update the current response
      setCurrentResponse(aiSuggestion);
      
      // Update the questionsState in Recoil
      setQuestionsState(prev => ({
        ...prev,
        [currentQuestion.id]: aiSuggestion
      }));
    }
  };

  const handleBackToInitialThoughts = () => {
    navigate('/initial-thoughts');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box>
        {!showSummary ? (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Working Backwards Questions</Typography>
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleBackToInitialThoughts}
                size="small"
              >
                Edit Initial Thoughts
              </Button>
            </Box>
            
            <Paper elevation={3} sx={{ p: 3 }}>
              <Stepper activeStep={currentStep} orientation="vertical">
                {questionsList.map((question, index) => (
                  <Step key={question.id.toString()}>
                    <StepLabel>{question.label}</StepLabel>
                    <StepContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                          {question.helperText}
                        </Typography>
                        
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
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                          {aiSuggestion && (
                            <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                              <Typography variant="subtitle2" gutterBottom>
                                AI Suggestion:
                              </Typography>
                              <Typography variant="body2" paragraph>
                                {aiSuggestion}
                              </Typography>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ContentPaste />}
                                onClick={handleUseSuggestion}
                              >
                                Use suggestion
                              </Button>
                            </Paper>
                          )}
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Tooltip title="Get AI suggestion">
                              <IconButton 
                                onClick={getAISuggestion} 
                                disabled={isLoading}
                                color="primary"
                              >
                                {isLoading ? <CircularProgress size={24} /> : <Lightbulb />}
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
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
                            color="primary"
                            onClick={handleNext}
                            endIcon={<ArrowForward />}
                          >
                            {index === questionsList.length - 1 ? 'Finish' : 'Next'}
                          </Button>
                        </Box>
                      </Box>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Working Backwards Summary
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<Edit />}
                  onClick={handleBackToInitialThoughts}
                  size="small"
                >
                  Edit Initial Thoughts
                </Button>
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {questionsList.map((question) => (
                <Box key={question.id.toString()} sx={{ mb: 3 }}>
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