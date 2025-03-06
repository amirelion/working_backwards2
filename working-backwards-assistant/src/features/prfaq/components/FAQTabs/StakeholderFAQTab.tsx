import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { FAQ } from '../../../../types';
import FAQList from './FAQList';
import { FAQForm, FAQGenerate } from './FAQForm';

interface StakeholderFAQTabProps {
  isPRFAQEmpty: boolean;
  stakeholderFaqs: FAQ[];
  editingStakeholderFAQIndex: number;
  newStakeholderFAQ: FAQ;
  stakeholderFaqComment: string;
  tabValue: number;
  onEditStakeholderFAQ: (index: number) => void;
  onDeleteStakeholderFAQ: (index: number) => void;
  onUpdateStakeholderFAQ: (index: number, field: 'question' | 'answer', value: string) => void;
  onSaveStakeholderFAQ: () => void;
  onStakeholderFAQQuestionChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onStakeholderFAQAnswerChange: (value: string) => void;
  onStakeholderFaqCommentChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateStakeholderFAQs: () => void;
  onGenerateSingleStakeholderFAQ: () => void;
  isGeneratingStakeholderFAQ: boolean;
  hasWorkingBackwardsResponses: boolean;
  reactQuillComponent: React.FC<{
    value: string;
    onChange: (value: string) => void;
    style?: React.CSSProperties;
    visible?: boolean;
  }>;
}

/**
 * Component for the Stakeholder FAQ tab
 */
export const StakeholderFAQTab: React.FC<StakeholderFAQTabProps> = ({
  isPRFAQEmpty,
  stakeholderFaqs,
  editingStakeholderFAQIndex,
  newStakeholderFAQ,
  stakeholderFaqComment,
  tabValue,
  onEditStakeholderFAQ,
  onDeleteStakeholderFAQ,
  onUpdateStakeholderFAQ,
  onSaveStakeholderFAQ,
  onStakeholderFAQQuestionChange,
  onStakeholderFAQAnswerChange,
  onStakeholderFaqCommentChange,
  onGenerateStakeholderFAQs,
  onGenerateSingleStakeholderFAQ,
  isGeneratingStakeholderFAQ,
  hasWorkingBackwardsResponses,
  reactQuillComponent,
}) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Stakeholder Frequently Asked Questions
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Add questions and answers that address strategic concerns, risks, and implementation details that internal stakeholders (investors, executives, team members) might have.
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
              faqs={stakeholderFaqs}
              editingIndex={editingStakeholderFAQIndex}
              onEdit={onEditStakeholderFAQ}
              onDelete={onDeleteStakeholderFAQ}
              onUpdate={onUpdateStakeholderFAQ}
              onSave={onSaveStakeholderFAQ}
              reactQuillComponent={reactQuillComponent}
              tabValue={tabValue}
              currentTabIndex={2}
              emptyMessage="No stakeholder FAQs added yet. Generate FAQs or add your first FAQ below."
            />

            {/* Generate Stakeholder FAQs */}
            <FAQGenerate
              comment={stakeholderFaqComment}
              onCommentChange={onStakeholderFaqCommentChange}
              onGenerateMultiple={onGenerateStakeholderFAQs}
              onGenerateSingle={onGenerateSingleStakeholderFAQ}
              isGenerating={isGeneratingStakeholderFAQ}
              isDisabled={!hasWorkingBackwardsResponses}
            />

            {/* Add new Stakeholder FAQ */}
            <FAQForm
              newFAQ={newStakeholderFAQ}
              onQuestionChange={onStakeholderFAQQuestionChange}
              onAnswerChange={onStakeholderFAQAnswerChange}
              onSave={onSaveStakeholderFAQ}
              reactQuillComponent={reactQuillComponent}
              title="Add New Stakeholder FAQ"
              tabValue={tabValue}
              currentTabIndex={2}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default StakeholderFAQTab; 