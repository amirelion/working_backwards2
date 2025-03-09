import React, { lazy, Suspense } from 'react';
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
import { useCurrentProcess } from '../../../../hooks/useCurrentProcess';

// Lazy load ReactQuill
const LazyReactQuill = lazy(() => import('react-quill-new'));

interface FAQFormProps {
  newFAQ: FAQ;
  onQuestionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnswerChange: (value: string) => void;
  onSave: () => void;
  disabled?: boolean;
  title: string;
}

/**
 * Component for adding a new FAQ
 */
export const FAQForm: React.FC<FAQFormProps> = ({
  newFAQ,
  onQuestionChange,
  onAnswerChange,
  onSave,
  disabled = false,
  title,
}) => {
  const { saveCurrentProcess } = useCurrentProcess();
  
  const handleBlur = async () => {
    try {
      await saveCurrentProcess();
    } catch (error) {
      console.error('Error saving on blur:', error);
    }
  };

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
        onBlur={handleBlur}
        sx={{ mb: 2 }}
        disabled={disabled}
      />
      <Typography variant="subtitle2" gutterBottom>
        Answer
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Suspense fallback={<div style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </div>}>
          <LazyReactQuill
            value={newFAQ.answer}
            onChange={onAnswerChange}
            onBlur={handleBlur}
            style={{ height: '150px', marginBottom: '50px' }}
            modules={{
              toolbar: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link'],
                ['clean']
              ],
            }}
          />
        </Suspense>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            onSave();
            handleBlur();
          }}
          startIcon={<SaveIcon />}
          disabled={disabled || !newFAQ.question.trim() || !newFAQ.answer.trim()}
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
  const { saveCurrentProcess } = useCurrentProcess();
  
  const handleBlur = async () => {
    try {
      await saveCurrentProcess();
    } catch (error) {
      console.error('Error saving on blur:', error);
    }
  };

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
        onBlur={handleBlur}
        placeholder="Add specific instructions for generating FAQs (e.g., 'Focus on pricing and support questions')"
        sx={{ mb: 2 }}
        disabled={isDisabled}
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