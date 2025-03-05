import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Description,
  Science,
  ArrowForward,
  CheckCircle,
  QuestionAnswer,
} from '@mui/icons-material';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { createNewProcess } = useWorkingBackwards();
  const { currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processTitle, setProcessTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');

  const handleGetStarted = () => {
    if (currentUser) {
      // Create a new process with default name instead of showing dialog
      createProcessWithDefaultName();
    } else {
      // If not logged in, just navigate to initial thoughts
      navigate('/initial-thoughts');
    }
  };

  const createProcessWithDefaultName = async () => {
    setIsCreating(true);
    try {
      const defaultTitle = "New Working Backwards";
      const processId = await createNewProcess(defaultTitle);
      
      if (!processId) {
        throw new Error("Failed to create process - no process ID returned");
      }
      
      // Navigate to the initial thoughts page with the new process ID
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error creating process:', error);
      setSnackbarMessage('Failed to create process. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      // If process creation fails, still navigate to initial thoughts
      navigate('/initial-thoughts');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateProcess = async () => {
    if (!processTitle.trim()) {
      setSnackbarMessage('Please enter a title for your process');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }

    setIsCreating(true);
    try {
      const processId = await createNewProcess(processTitle);
      setDialogOpen(false);
      setProcessTitle('');
      
      // Navigate to the initial thoughts page with the new process ID
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error creating process:', error);
      setSnackbarMessage('Failed to create process. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setProcessTitle('');
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'primary.main',
          color: 'white',
          mb: 4,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          p: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography component="h1" variant="h2" color="inherit" gutterBottom>
              Innovate Like Amazon
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Use the Working Backwards methodology to transform your ideas into customer-focused innovations
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForward />}
              sx={{ mt: 4, fontWeight: 'bold', px: 4, py: 1.5 }}
            >
              Start Delighting Customers
            </Button>
          </Box>
        </Container>
      </Paper>

      {/* What is Working Backwards */}
      <Container maxWidth="lg">
        <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4 }}>
          What is Working Backwards?
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph>
              <strong>Working Backwards</strong> is Amazon's innovation methodology that starts with the customer and works backwards to the solution. Instead of starting with an idea for a product and trying to find customers for it, Working Backwards starts by defining the customer problem and then developing the right solution.
            </Typography>
            <Typography variant="body1" paragraph>
              The process begins by writing a <strong>Press Release and FAQ (PRFAQ)</strong> document that describes the finished product as if it were already launched. This forces teams to focus on the customer experience and value proposition before any development begins.
            </Typography>
            <Typography variant="body1">
              By working backwards from the customer need, teams create products that truly solve real problems and deliver meaningful benefits.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Key Principles
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Start with the customer and work backwards" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Define the problem before the solution" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Write the press release before building the product" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Test assumptions with experiments" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="secondary" />
                    </ListItemIcon>
                    <ListItemText primary="Iterate based on customer feedback" />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* How It Works */}
        <Typography variant="h3" component="h2" gutterBottom sx={{ mb: 4 }}>
          How It Works
        </Typography>
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <QuestionAnswer fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  1. Working Backwards
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Answer key questions about your customer, their problem, and how your solution provides value. This guided process helps you clarify your thinking and focus on what matters most.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Description fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  2. Create PRFAQ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Draft a Press Release and FAQ document that describes your product as if it were already launched. This forces clarity of thought and ensures you're building something customers will actually want.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Science fontSize="large" color="primary" />
                </Box>
                <Typography variant="h5" component="div" gutterBottom align="center">
                  3. Test & Validate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Identify key assumptions in your PRFAQ and design experiments to test them. This helps validate your ideas with real customers before investing significant resources in development.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Get Started */}
        <Box sx={{ textAlign: 'center', my: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Transform Your Innovation Process?
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={handleGetStarted}
            endIcon={<ArrowForward />}
            sx={{ mt: 2, fontWeight: 'bold', px: 4, py: 1.5 }}
          >
            Start Working Backwards
          </Button>
        </Box>
      </Container>

      {/* Create Process Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Create New Process</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Process Title"
            fullWidth
            variant="outlined"
            value={processTitle}
            onChange={(e) => setProcessTitle(e.target.value)}
            placeholder="Enter a title for your new process"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleCreateProcess} 
            variant="contained" 
            color="primary"
            disabled={isCreating}
            startIcon={isCreating ? <CircularProgress size={20} /> : undefined}
          >
            {isCreating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        slotProps={{
          content: {
            sx: { width: '100%' }
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 