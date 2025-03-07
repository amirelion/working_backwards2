import React from 'react';
import {
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress
} from '@mui/material';
import { ContentPaste } from '@mui/icons-material';

interface AISuggestionPanelProps {
  suggestion: string;
  isLoading: boolean;
  onUseSuggestion: () => void;
}

/**
 * Component for displaying AI suggestions with loading state and action button
 */
const AISuggestionPanel: React.FC<AISuggestionPanelProps> = ({
  suggestion,
  isLoading,
  onUseSuggestion
}) => {
  if (isLoading) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          AI Suggestion:
        </Typography>
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Generating suggestion...
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (!suggestion) {
    return null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        AI Suggestion:
      </Typography>
      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="body2">{suggestion}</Typography>
      </Paper>
      <Button
        size="small"
        startIcon={<ContentPaste />}
        onClick={onUseSuggestion}
        sx={{ mt: 1 }}
      >
        Use Suggestion
      </Button>
    </Box>
  );
};

export default AISuggestionPanel; 