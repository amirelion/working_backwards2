import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FAQ } from '../../../../types';
import { PRFAQState } from '../../../../store/prfaqSlice';
import FAQList from './FAQList';
import { FAQForm, FAQGenerate } from './FAQForm';

export interface StakeholderFAQTabProps {
  prfaq: PRFAQState;
  newStakeholderFAQ: FAQ;
  editingStakeholderFAQIndex: number;
  stakeholderFaqComment: string;
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
 * Component for the Stakeholder FAQ tab
 */
export const StakeholderFAQTab: React.FC<StakeholderFAQTabProps> = ({
  prfaq,
  newStakeholderFAQ,
  editingStakeholderFAQIndex,
  stakeholderFaqComment,
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
          Stakeholder Frequently Asked Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add questions and answers that address concerns from internal stakeholders such as executives, legal, marketing, finance, and engineering.
        </Typography>

        {isPRFAQEmpty ? (
          <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
            <Typography variant="body1" color="info.contrastText">
              Please fill out the Press Release tab first before adding FAQs.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Existing Stakeholder FAQs */}
            <FAQList
              faqs={prfaq.stakeholderFaqs}
              editingIndex={editingStakeholderFAQIndex}
              onEdit={onEditFAQ}
              onDelete={onDeleteFAQ}
              onUpdate={onUpdateFAQ}
              onSave={onSaveFAQ}
              disabled={disabled}
              emptyMessage="No stakeholder FAQs added yet. Generate FAQs or add your first FAQ below."
            />

            {/* Generate Stakeholder FAQs */}
            <FAQGenerate
              comment={stakeholderFaqComment}
              onCommentChange={onCommentChange}
              onGenerateMultiple={onGenerateFAQs}
              onGenerateSingle={onGenerateSingleFAQ}
              isGenerating={isGenerating}
              isDisabled={disabled}
            />

            {/* Add new Stakeholder FAQ */}
            <FAQForm
              newFAQ={newStakeholderFAQ}
              onQuestionChange={onQuestionChange}
              onAnswerChange={onAnswerChange}
              onSave={onSaveFAQ}
              disabled={disabled}
              title="Add New Stakeholder FAQ"
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StakeholderFAQTab; 