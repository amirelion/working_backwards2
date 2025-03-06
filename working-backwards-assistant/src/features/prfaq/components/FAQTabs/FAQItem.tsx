import React from 'react';
import {
  Paper,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { FAQ } from '../../../../types';

interface FAQItemProps {
  faq: FAQ;
  index: number;
  isEditing: boolean;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, field: 'question' | 'answer', value: string) => void;
  onSave: () => void;
  reactQuillComponent: React.FC<{
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    visible?: boolean;
  }>;
  tabValue: number;
  currentTabIndex: number;
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
  reactQuillComponent: ReactQuill,
  tabValue,
  currentTabIndex,
}) => {
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
            sx={{ mb: 2 }}
          />
          <Typography variant="subtitle2" gutterBottom>
            Answer
          </Typography>
          <Box sx={{ mb: 2 }}>
            <ReactQuill
              value={faq.answer}
              onChange={(value) => onUpdate(index, 'answer', value)}
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
              <IconButton size="small" onClick={() => onEdit(index)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => onDelete(index)}>
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