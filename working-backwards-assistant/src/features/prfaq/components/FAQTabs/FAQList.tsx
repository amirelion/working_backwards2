import React from 'react';
import { Box, Typography } from '@mui/material';
import { FAQ } from '../../../../types';
import FAQItem from './FAQItem';

interface FAQListProps {
  faqs: FAQ[];
  editingIndex: number;
  onEdit: (index: number) => void;
  onDelete: (index: number) => void;
  onUpdate: (index: number, field: 'question' | 'answer', value: string) => void;
  onSave: () => void;
  disabled?: boolean;
  emptyMessage?: string;
}

/**
 * Component for displaying a list of FAQs with editing capabilities
 */
export const FAQList: React.FC<FAQListProps> = ({
  faqs,
  editingIndex,
  onEdit,
  onDelete,
  onUpdate,
  onSave,
  disabled = false,
  emptyMessage = 'No FAQs added yet. Generate FAQs or add your first FAQ below.',
}) => {
  if (faqs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          faq={faq}
          index={index}
          isEditing={editingIndex === index}
          onEdit={onEdit}
          onDelete={onDelete}
          onUpdate={onUpdate}
          onSave={onSave}
          disabled={disabled}
        />
      ))}
    </Box>
  );
};

export default FAQList; 