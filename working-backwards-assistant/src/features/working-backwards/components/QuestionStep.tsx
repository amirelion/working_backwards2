import React from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { WorkingBackwardsQuestion } from '../constants/questions';
import AISuggestionPanel from './AISuggestionPanel';
import StepperNavigation from './StepperNavigation';

interface QuestionStepProps {
  question: WorkingBackwardsQuestion;
  currentResponse: string;
  isActive: boolean;
  stepIndex: number;
  totalSteps: number;
  aiSuggestion: string;
  isLoadingSuggestion: boolean;
  onResponseChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onNext: () => void;
  onBack: () => void;
  onUseSuggestion: () => void;
}

/**
 * Component for a single question step in the Working Backwards process
 */
const QuestionStep: React.FC<QuestionStepProps> = ({
  question,
  currentResponse,
  isActive,
  stepIndex,
  totalSteps,
  aiSuggestion,
  isLoadingSuggestion,
  onResponseChange,
  onNext,
  onBack,
  onUseSuggestion
}) => {
  if (!isActive) {
    return null;
  }

  return (
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
        onChange={onResponseChange}
        sx={{ mb: 2 }}
      />
      
      <AISuggestionPanel
        suggestion={aiSuggestion}
        isLoading={isLoadingSuggestion}
        onUseSuggestion={onUseSuggestion}
      />
      
      <StepperNavigation
        currentStep={stepIndex}
        totalSteps={totalSteps}
        onNext={onNext}
        onBack={onBack}
      />
    </Box>
  );
};

export default QuestionStep; 