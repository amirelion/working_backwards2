import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Alert
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { useAppSelector } from '../../../store/hooks';
import { 
  selectInitialThoughts, 
  selectSkipInitialThoughts
} from '../../../store/initialThoughtsSlice';
import { questionsList } from '../constants/questions';
import QuestionStep from './QuestionStep';
import useFormState from '../hooks/useFormState';
import useAISuggestions from '../hooks/useAISuggestions';

/**
 * Form component with stepper for the Working Backwards process
 */
const WorkingBackwardsForm: React.FC = () => {
  const {
    currentStep,
    currentResponse,
    currentQuestion,
    isFirstLoad,
    setIsFirstLoad,
    handleNext,
    handleBack,
    handleResponseChange,
    handleBackToInitialThoughts,
    handleUseSuggestion
  } = useFormState();
  
  const {
    aiSuggestion,
    isLoadingFirstSuggestion,
    isGeneratingSuggestion,
    generateInitialSuggestions,
    loadSuggestionForQuestion
  } = useAISuggestions();

  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  const initialThoughts = useAppSelector(selectInitialThoughts);

  // Effect to run once on first load to generate AI suggestions if none exist
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      
      // Only generate suggestions if not skipped and there are initial thoughts
      if (!skipInitialThoughts && initialThoughts.trim()) {
        generateInitialSuggestions(questionsList, currentStep);
      }
    } else {
      // If not first load, load existing suggestion for current question
      loadSuggestionForQuestion(currentQuestion, currentStep);
    }
  }, [
    currentQuestion, 
    currentStep, 
    generateInitialSuggestions, 
    initialThoughts,
    isFirstLoad, 
    loadSuggestionForQuestion, 
    setIsFirstLoad,
    skipInitialThoughts
  ]);

  // Handle text input changes - need to adapt from the new signature
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleResponseChange(event.target.value);
  };

  return (
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
      
      {skipInitialThoughts && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="body1">You skipped entering initial thoughts, so AI suggestions have been disabled.</Typography>
            <Typography variant="body2">You can manually enter your answers or go back to add initial thoughts.</Typography>
          </Box>
        </Alert>
      )}
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Stepper activeStep={currentStep} orientation="vertical">
          {questionsList.map((question, index) => (
            <Step key={question.id.toString()}>
              <StepLabel>{question.label}</StepLabel>
              <StepContent>
                <QuestionStep
                  question={question}
                  currentResponse={index === currentStep ? currentResponse : ''}
                  isActive={index === currentStep}
                  stepIndex={index}
                  totalSteps={questionsList.length}
                  aiSuggestion={index === currentStep ? aiSuggestion : ''}
                  isLoadingSuggestion={
                    (isLoadingFirstSuggestion && index === 0) || 
                    (isGeneratingSuggestion && index === currentStep)
                  }
                  onResponseChange={handleInputChange}
                  onNext={handleNext}
                  onBack={handleBack}
                  onUseSuggestion={() => handleUseSuggestion(aiSuggestion)}
                />
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Paper>
    </Box>
  );
};

export default WorkingBackwardsForm; 