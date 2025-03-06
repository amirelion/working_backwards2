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
  reactQuillComponent: React.FC<{
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    visible?: boolean;
  }>;
  tabValue: number;
  currentTabIndex: number;
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
  reactQuillComponent,
  tabValue,
  currentTabIndex,
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
          reactQuillComponent={reactQuillComponent}
          tabValue={tabValue}
          currentTabIndex={currentTabIndex}
        />
      ))}
    </Box>
  );
};

export default FAQList; 