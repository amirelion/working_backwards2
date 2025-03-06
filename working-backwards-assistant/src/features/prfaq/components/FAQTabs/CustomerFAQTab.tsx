import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FAQ } from '../../../../types';
import FAQList from './FAQList';
import { FAQForm, FAQGenerate } from './FAQForm';

interface CustomerFAQTabProps {
  isPRFAQEmpty: boolean;
  customerFaqs: FAQ[];
  editingCustomerFAQIndex: number;
  newCustomerFAQ: FAQ;
  customerFaqComment: string;
  tabValue: number;
  onEditCustomerFAQ: (index: number) => void;
  onDeleteCustomerFAQ: (index: number) => void;
  onUpdateCustomerFAQ: (index: number, field: 'question' | 'answer', value: string) => void;
  onSaveCustomerFAQ: () => void;
  onCustomerFAQQuestionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCustomerFAQAnswerChange: (value: string) => void;
  onCustomerFaqCommentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateCustomerFAQs: () => void;
  onGenerateSingleCustomerFAQ: () => void;
  isGeneratingCustomerFAQ: boolean;
  hasWorkingBackwardsResponses: boolean;
  reactQuillComponent: React.FC<{
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    visible?: boolean;
  }>;
}

/**
 * Component for the Customer FAQ tab
 */
export const CustomerFAQTab: React.FC<CustomerFAQTabProps> = ({
  isPRFAQEmpty,
  customerFaqs,
  editingCustomerFAQIndex,
  newCustomerFAQ,
  customerFaqComment,
  tabValue,
  onEditCustomerFAQ,
  onDeleteCustomerFAQ,
  onUpdateCustomerFAQ,
  onSaveCustomerFAQ,
  onCustomerFAQQuestionChange,
  onCustomerFAQAnswerChange,
  onCustomerFaqCommentChange,
  onGenerateCustomerFAQs,
  onGenerateSingleCustomerFAQ,
  isGeneratingCustomerFAQ,
  hasWorkingBackwardsResponses,
  reactQuillComponent,
}) => {
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
              faqs={customerFaqs}
              editingIndex={editingCustomerFAQIndex}
              onEdit={onEditCustomerFAQ}
              onDelete={onDeleteCustomerFAQ}
              onUpdate={onUpdateCustomerFAQ}
              onSave={onSaveCustomerFAQ}
              reactQuillComponent={reactQuillComponent}
              tabValue={tabValue}
              currentTabIndex={1}
              emptyMessage="No customer FAQs added yet. Generate FAQs or add your first FAQ below."
            />

            {/* Generate Customer FAQs */}
            <FAQGenerate
              comment={customerFaqComment}
              onCommentChange={onCustomerFaqCommentChange}
              onGenerateMultiple={onGenerateCustomerFAQs}
              onGenerateSingle={onGenerateSingleCustomerFAQ}
              isGenerating={isGeneratingCustomerFAQ}
              isDisabled={!hasWorkingBackwardsResponses}
            />

            {/* Add new Customer FAQ */}
            <FAQForm
              newFAQ={newCustomerFAQ}
              onQuestionChange={onCustomerFAQQuestionChange}
              onAnswerChange={onCustomerFAQAnswerChange}
              onSave={onSaveCustomerFAQ}
              reactQuillComponent={reactQuillComponent}
              title="Add New Customer FAQ"
              tabValue={tabValue}
              currentTabIndex={1}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerFAQTab; 