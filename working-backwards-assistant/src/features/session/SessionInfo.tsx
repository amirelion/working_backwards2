import React from 'react';
import { Box, Typography, Button, Paper, Stack, CircularProgress } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  selectCurrentSession, 
  selectSessionStatus, 
  selectSessionError,
  resetSession,
  setLoading,
  setError
} from './sessionSlice';
import { format } from 'date-fns';

interface SessionInfoProps {
  showControls?: boolean;
}

function SessionInfo({ showControls = true }: SessionInfoProps) {
  const dispatch = useAppDispatch();
  const session = useAppSelector(selectCurrentSession);
  const status = useAppSelector(selectSessionStatus);
  const error = useAppSelector(selectSessionError);
  
  // Early return for loading state
  if (status === 'loading') 
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  
  // Early return for error state
  if (status === 'failed' && error) 
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 3, 
          mb: 4, 
          bgcolor: 'error.light', 
          color: 'error.contrastText' 
        }}
      >
        <Typography variant="h6">Error</Typography>
        <Typography>{error}</Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => dispatch(resetSession())}
          sx={{ mt: 2 }}
        >
          Reset Session
        </Button>
      </Paper>
    );

  // Format timestamps for display
  const createdAtFormatted = format(new Date(session.createdAt), 'PPpp');
  const updatedAtFormatted = format(new Date(session.updatedAt), 'PPpp');

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        Session Information
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Session ID
          </Typography>
          <Typography variant="body1">{session.id}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Created At
          </Typography>
          <Typography variant="body1">{createdAtFormatted}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Last Updated
          </Typography>
          <Typography variant="body1">{updatedAtFormatted}</Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary">
            Content Summary
          </Typography>
          <Typography variant="body1">
            {`PRFAQ: ${session.prfaq.title || 'Untitled'}`}
          </Typography>
          <Typography variant="body1">
            {`Assumptions: ${session.assumptions.length}`}
          </Typography>
          <Typography variant="body1">
            {`Experiments: ${session.experiments.length}`}
          </Typography>
        </Box>
      </Stack>

      {showControls && (
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => dispatch(resetSession())}
          >
            Reset Session
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => {
              dispatch(setLoading());
              // Simulate async operation
              setTimeout(() => {
                dispatch(resetSession());
              }, 1000);
            }}
          >
            New Session
          </Button>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={() => dispatch(setError('This is a simulated error'))}
          >
            Simulate Error
          </Button>
        </Stack>
      )}
    </Paper>
  );
}

export default SessionInfo; 