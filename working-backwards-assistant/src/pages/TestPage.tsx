import React from 'react';
import { Container, Typography, Box, Button, Divider } from '@mui/material';
import SessionInfo from '../features/session/SessionInfo';
import { useAppDispatch } from '../store/hooks';
import { 
  updateWorkingBackwardsResponse, 
  updatePRFAQTitle 
} from '../features/session/sessionSlice';

function TestPage() {
  const dispatch = useAppDispatch();

  // Helper function to update the Working Backwards responses with dummy data
  const populateDummyData = () => {
    dispatch(updateWorkingBackwardsResponse({ 
      field: 'customer', 
      value: 'Enterprise product teams and executives' 
    }));
    
    dispatch(updateWorkingBackwardsResponse({ 
      field: 'problem', 
      value: 'Product teams struggle to define clear product vision and validate ideas early' 
    }));
    
    dispatch(updateWorkingBackwardsResponse({ 
      field: 'benefit', 
      value: 'Structured approach to product development with AI assistance' 
    }));
    
    dispatch(updateWorkingBackwardsResponse({ 
      field: 'validation', 
      value: 'Improved product-market fit and reduced development waste' 
    }));
    
    dispatch(updateWorkingBackwardsResponse({ 
      field: 'experience', 
      value: 'Guided, step-by-step process that feels like working with an expert consultant' 
    }));
    
    dispatch(updatePRFAQTitle('Working Backwards Assistant - Enterprise Edition'));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Test Page
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page demonstrates the refactored session functionality using Redux Toolkit 
        best practices and functional components.
      </Typography>
      
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={populateDummyData}
          sx={{ mr: 2 }}
        >
          Populate Dummy Data
        </Button>
      </Box>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" gutterBottom>
        Session Component
      </Typography>
      
      <SessionInfo />
    </Container>
  );
}

export default TestPage; 