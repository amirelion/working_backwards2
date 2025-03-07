import React from 'react';
import { Box, Button } from '@mui/material';
import { ArrowBack, ArrowForward } from '@mui/icons-material';

interface StepperNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  backDisabled?: boolean;
}

/**
 * Navigation component for the stepper interface
 */
const StepperNavigation: React.FC<StepperNavigationProps> = ({
  currentStep,
  totalSteps,
  onNext,
  onBack,
  backDisabled = false
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
      <Button
        disabled={backDisabled || currentStep === 0}
        onClick={onBack}
        startIcon={<ArrowBack />}
      >
        Back
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={onNext}
        endIcon={<ArrowForward />}
      >
        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
      </Button>
    </Box>
  );
};

export default StepperNavigation; 