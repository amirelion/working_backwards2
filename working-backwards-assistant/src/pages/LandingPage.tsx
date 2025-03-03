import React from 'react';
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
} from '@mui/material';
import {
  Description,
  Science,
  ArrowForward,
  CheckCircle,
  QuestionAnswer,
} from '@mui/icons-material';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/initial-thoughts');
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
    </Box>
  );
} 