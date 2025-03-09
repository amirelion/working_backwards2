import React from 'react';
import { Container, Box } from '@mui/material';
import WorkingBackwardsForm from './components/WorkingBackwardsForm';
import WorkingBackwardsSummary from './components/WorkingBackwardsSummary';
import useFormState from './hooks/useFormState';
import { questionsList } from './constants/questions';

/**
 * Main Working Backwards page component that manages navigation between form and summary views
 */
const WorkingBackwardsPage: React.FC = () => {
  const {
    showSummary,
    questions,
    handleBack,
    handleContinueToPRFAQ,
    handleBackToInitialThoughts
  } = useFormState();

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box>
        {!showSummary ? (
          <WorkingBackwardsForm />
        ) : (
          <WorkingBackwardsSummary
            questionsState={questions}
            questionsList={questionsList}
            onBack={handleBack}
            onContinueToPRFAQ={handleContinueToPRFAQ}
            onBackToInitialThoughts={handleBackToInitialThoughts}
          />
        )}
      </Box>
    </Container>
  );
};

export default WorkingBackwardsPage; 