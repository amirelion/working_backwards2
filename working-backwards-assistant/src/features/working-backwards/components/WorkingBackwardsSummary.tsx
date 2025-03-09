import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Button
} from '@mui/material';
import { ArrowBack, ArrowForward, Edit } from '@mui/icons-material';
import { WorkingBackwardsQuestionsState } from '../../../types/WorkingBackwardsQuestionsState';
import { WorkingBackwardsQuestion } from '../constants/questions';

interface WorkingBackwardsSummaryProps {
  questionsState: WorkingBackwardsQuestionsState;
  questionsList: WorkingBackwardsQuestion[];
  onBack: () => void;
  onContinueToPRFAQ: () => void;
  onBackToInitialThoughts: () => void;
}

/**
 * Summary component showing all answered questions in the Working Backwards process
 */
const WorkingBackwardsSummary: React.FC<WorkingBackwardsSummaryProps> = ({
  questionsState,
  questionsList,
  onBack,
  onContinueToPRFAQ,
  onBackToInitialThoughts
}) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Working Backwards Summary
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={onBackToInitialThoughts}
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
            onClick={onBack}
            startIcon={<ArrowBack />}
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onContinueToPRFAQ}
            endIcon={<ArrowForward />}
          >
            Continue to PR/FAQ
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default WorkingBackwardsSummary; 