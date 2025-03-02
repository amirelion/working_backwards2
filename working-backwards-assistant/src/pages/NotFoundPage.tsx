import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography, Paper } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 6, mt: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            size="large"
          >
            Back to Home
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NotFoundPage; 