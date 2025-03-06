import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FAQ } from '../../../../types';
import { PRFAQState } from '../../../../store/prfaqSlice';
import FAQList from './FAQList';
import { FAQForm, FAQGenerate } from './FAQForm';

export interface CustomerFAQTabProps {
  prfaq: PRFAQState;
  newCustomerFAQ: FAQ;
  editingCustomerFAQIndex: number;
  customerFaqComment: string;
  onQuestionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnswerChange: (value: string) => void;
  onSaveFAQ: () => void;
  onEditFAQ: (index: number) => void;
  onDeleteFAQ: (index: number) => void;
  onCommentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateFAQ: (index: number, field: 'question' | 'answer', value: string) => void;
  onGenerateFAQs: () => void;
  onGenerateSingleFAQ: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

/**
 * Component for the Customer FAQ tab
 */
export const CustomerFAQTab: React.FC<CustomerFAQTabProps> = ({
  prfaq,
  newCustomerFAQ,
  editingCustomerFAQIndex,
  customerFaqComment,
  onQuestionChange,
  onAnswerChange,
  onSaveFAQ,
  onEditFAQ,
  onDeleteFAQ,
  onCommentChange,
  onUpdateFAQ,
  onGenerateFAQs,
  onGenerateSingleFAQ,
  isGenerating,
  disabled = false,
}) => {
  const isPRFAQEmpty = !prfaq.title || 
    !prfaq.pressRelease.introduction || 
    !prfaq.pressRelease.problemStatement || 
    !prfaq.pressRelease.solution;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Customer Frequently Asked Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add questions and answers that address common concerns, objections, and details that potential customers might have about your innovation.
        </Typography>

        {isPRFAQEmpty ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" color="info.contrastText">
              Please fill out the Press Release tab first before adding FAQs.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Existing Customer FAQs */}
            <FAQList
              faqs={prfaq.customerFaqs}
              editingIndex={editingCustomerFAQIndex}
              onEdit={onEditFAQ}
              onDelete={onDeleteFAQ}
              onUpdate={onUpdateFAQ}
              onSave={onSaveFAQ}
              disabled={disabled}
              emptyMessage="No customer FAQs added yet. Generate FAQs or add your first FAQ below."
            />

            {/* Generate Customer FAQs */}
            <FAQGenerate
              comment={customerFaqComment}
              onCommentChange={onCommentChange}
              onGenerateMultiple={onGenerateFAQs}
              onGenerateSingle={onGenerateSingleFAQ}
              isGenerating={isGenerating}
              isDisabled={disabled}
            />

            {/* Add new Customer FAQ */}
            <FAQForm
              newFAQ={newCustomerFAQ}
              onQuestionChange={onQuestionChange}
              onAnswerChange={onAnswerChange}
              onSave={onSaveFAQ}
              disabled={disabled}
              title="Add New Customer FAQ"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerFAQTab; 