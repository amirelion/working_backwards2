import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip, 
  LinearProgress,
  Grid,
  Avatar,
  Divider
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../utils/permissions';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useNavigate } from 'react-router-dom';

export default function UserProfile() {
  const { userProfile, isAdmin, isPremium, isTrial } = useAuth();
  const { 
    sessionLimit, 
    sessionCount, 
    canCreateUnlimitedSessions,
    trialDaysRemaining 
  } = usePermissions();
  const navigate = useNavigate();
  
  const getRoleChip = () => {
    if (isAdmin) {
      return <Chip label="Admin" color="error" />;
    }
    if (isPremium) {
      return <Chip label="Premium" color="primary" />;
    }
    if (isTrial) {
      return <Chip label={`Trial (${trialDaysRemaining} days left)`} color="secondary" />;
    }
    return <Chip label="Free" color="default" />;
  };
  
  return (
    <ProtectedRoute>
      <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Profile Header */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={userProfile?.photoURL || ''} 
                alt={userProfile?.displayName}
                sx={{ width: 80, height: 80 }}
              />
              <Box>
                <Typography variant="h4">
                  {userProfile?.displayName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {userProfile?.email}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {getRoleChip()}
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            {/* Subscription Status */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Subscription Status
              </Typography>
              {!isPremium && !isAdmin && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Upgrade to Premium to unlock all features and get unlimited sessions.
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => navigate('/pricing')}
                  >
                    Upgrade to Premium
                  </Button>
                </Box>
              )}
            </Grid>
            
            {/* Usage Stats */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Usage
              </Typography>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">
                    Sessions Used
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {sessionCount} {!canCreateUnlimitedSessions && `/ ${sessionLimit}`}
                  </Typography>
                </Box>
                {!canCreateUnlimitedSessions && (
                  <LinearProgress 
                    variant="determinate" 
                    value={(sessionCount / sessionLimit) * 100} 
                  />
                )}
              </Box>
            </Grid>
            
            {/* Feature Access */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Features
              </Typography>
              <Grid container spacing={1}>
                {[
                  { name: 'Advanced AI Suggestions', premium: true },
                  { name: 'Export as PDF', premium: false },
                  { name: 'Export as DOCX', premium: true },
                  { name: 'Share Sessions', premium: true },
                  { name: 'Unlimited Sessions', premium: true },
                ].map((feature) => (
                  <Grid item xs={12} key={feature.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        size="small"
                        label={feature.premium ? 'Premium' : 'Free'}
                        color={feature.premium ? 'primary' : 'default'}
                        variant="outlined"
                      />
                      <Typography variant="body2">
                        {feature.name}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </ProtectedRoute>
  );
} 