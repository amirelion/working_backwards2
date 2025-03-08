import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Typography, Paper, Container, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

function LoadingSpinner() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function AccessDenied({ message }: { message: string }) {
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom color="error">
            Access Denied
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {message}
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { currentUser, isAdmin, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!currentUser) {
    return <AccessDenied message="Please sign in to access this page." />;
  }
  
  if (requireAdmin && !isAdmin) {
    return <AccessDenied message="You don't have permission to access this page. This area is restricted to administrators only." />;
  }
  
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      {children}
    </ProtectedRoute>
  );
} 