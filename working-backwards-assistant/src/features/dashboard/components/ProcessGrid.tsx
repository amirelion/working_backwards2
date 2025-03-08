import React from 'react';
import { Box, CircularProgress, Grid, Typography } from '@mui/material';
import ProcessCard from './ProcessCard';
import { ProcessGridProps } from '../types';

/**
 * Component for displaying a grid of process cards
 */
const ProcessGrid: React.FC<ProcessGridProps> = ({
  processes,
  loading,
  onOpenProcess,
  onMenuOpen,
  searchQuery,
  processDeletingId
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (processes.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No processes found
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {searchQuery ? 'Try a different search term' : 'Create your first Working Backwards process'}
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {processes.map((process) => (
        <Grid item xs={12} sm={6} md={4} key={process.id}>
          <ProcessCard
            process={process}
            onOpenProcess={onOpenProcess}
            onMenuOpen={onMenuOpen}
            isBeingDeleted={processDeletingId === process.id}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ProcessGrid; 