import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { FAQ } from '../../../../types';

interface FAQFormProps {
  newFAQ: FAQ;
  onQuestionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnswerChange: (value: string) => void;
  onSave: () => void;
  reactQuillComponent: React.FC<{
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    visible?: boolean;
  }>;
  title: string;
  tabValue: number;
  currentTabIndex: number;
  isSaveDisabled?: boolean;
}

/**
 * Component for adding a new FAQ
 */
export const FAQForm: React.FC<FAQFormProps> = ({
  newFAQ,
  onQuestionChange,
  onAnswerChange,
  onSave,
  reactQuillComponent: ReactQuill,
  title,
  tabValue,
  currentTabIndex,
  isSaveDisabled = false,
}) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Divider sx={{ my: 3 }} />
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      <TextField
        fullWidth
        label="Question"
        variant="outlined"
        value={newFAQ.question}
        onChange={onQuestionChange}
        sx={{ mb: 2 }}
      />
      <Typography variant="subtitle2" gutterBottom>
        Answer
      </Typography>
      <Box sx={{ mb: 2 }}>
        <ReactQuill
          value={newFAQ.answer}
          onChange={onAnswerChange}
          style={{ height: '150px', marginBottom: '50px' }}
          visible={tabValue === currentTabIndex}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          startIcon={<SaveIcon />}
          disabled={isSaveDisabled || !newFAQ.question.trim() || !newFAQ.answer.trim()}
        >
          Add FAQ
        </Button>
      </Box>
    </Box>
  );
};

interface FAQGenerateProps {
  comment: string;
  onCommentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateMultiple: () => void;
  onGenerateSingle: () => void;
  isGenerating: boolean;
  isDisabled: boolean;
}

/**
 * Component for generating FAQs using AI
 */
export const FAQGenerate: React.FC<FAQGenerateProps> = ({
  comment,
  onCommentChange,
  onGenerateMultiple,
  onGenerateSingle,
  isGenerating,
  isDisabled,
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="subtitle1" gutterBottom>
        Generate FAQs
      </Typography>
      <TextField
        fullWidth
        label="Instructions (optional)"
        variant="outlined"
        value={comment}
        onChange={onCommentChange}
        placeholder="Add specific instructions for generating FAQs (e.g., 'Focus on pricing and support questions')"
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onGenerateMultiple}
          disabled={isGenerating || isDisabled}
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          Generate Multiple FAQs
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={onGenerateSingle}
          disabled={isGenerating || isDisabled}
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          Generate Single FAQ
        </Button>
      </Box>
    </Box>
  );
};

export default FAQForm; 