import React, { lazy, Suspense } from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { FAQ } from '../../../../types';
import { useCurrentProcess } from '../../../working-backwards/contexts/CurrentProcessContext';

// Lazy load ReactQuill
const LazyReactQuill = lazy(() => import('react-quill-new'));

interface FAQItemProps {
  faq: FAQ;
  index: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, field: 'question' | 'answer', value: string) => void;
  onSave: () => void;
  disabled?: boolean;
}

/**
 * Component for displaying and editing a single FAQ item
 */
export const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  index,
  isEditing,
  onEdit,
  onDelete,
  onUpdate,
  onSave,
  disabled = false,
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
    <Paper key={index} sx={{ p: 2, mb: 2 }}>
      {isEditing ? (
        // Editing mode
        <>
          <TextField
            fullWidth
            label="Question"
            variant="outlined"
            value={faq.question}
            onChange={(e) => onUpdate(index, 'question', e.target.value)}
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
                value={faq.answer}
                onChange={(value) => onUpdate(index, 'answer', value)}
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
              disabled={disabled}
            >
              Save
            </Button>
          </Box>
        </>
      ) : (
        // Display mode
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Typography variant="subtitle1" fontWeight="bold">
              Q: {faq.question}
            </Typography>
            <Box>
              <IconButton size="small" onClick={() => onEdit(index)} disabled={disabled}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(index)} disabled={disabled}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body1" sx={{ mt: 1 }}>
            A: <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default FAQItem; 