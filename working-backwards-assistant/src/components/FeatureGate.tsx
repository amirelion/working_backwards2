import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { usePermissions } from '../utils/permissions';
import { useNavigate } from 'react-router-dom';

type FeatureType = 
  | 'advancedAI' 
  | 'unlimitedSessions' 
  | 'exportDocx' 
  | 'shareSessions'
  | 'analytics'
  | 'userManagement';

interface FeatureGateProps {
  feature: FeatureType;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function FeatureGate({ feature, fallback, children }: FeatureGateProps) {
  const permissions = usePermissions();
  const navigate = useNavigate();
  
  const hasPermission = (() => {
    switch (feature) {
      case 'advancedAI':
        return permissions.canUseAdvancedAI;
      case 'unlimitedSessions':
        return permissions.canCreateUnlimitedSessions;
      case 'exportDocx':
        return permissions.canExportAsDocx;
      case 'shareSessions':
        return permissions.canShareSessions;
      case 'analytics':
        return permissions.canAccessAnalytics;
      case 'userManagement':
        return permissions.canManageUsers;
      default:
        return false;
    }
  })();
  
  if (hasPermission) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  return (
    <Box 
      sx={{ 
        p: 3, 
        bgcolor: 'background.paper', 
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        textAlign: 'center',
        maxWidth: 400,
        mx: 'auto',
        my: 2
      }}
    >
      <Typography variant="h6" gutterBottom>
        Premium Feature
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        This feature is available to Premium users only. Upgrade your account to access advanced features and unlimited sessions.
      </Typography>
      <Button 
        variant="contained" 
        color="primary"
        onClick={() => navigate('/pricing')}
        sx={{ mt: 1 }}
      >
        View Pricing
      </Button>
    </Box>
  );
} 