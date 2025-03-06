import React from 'react';
import { Grid } from '@mui/material';
import PressReleaseSection from './PressReleaseSection';
import { PRFAQState } from '../../../../store/prfaqSlice';

interface PressReleaseFormProps {
  prfaq: PRFAQState;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPressReleaseChange: (field: keyof PRFAQState['pressRelease'], value: string) => void;
  onGenerateSection: (section: string) => Promise<void>;
  isGenerating: boolean;
  generatingSection: string;
  disabled?: boolean;
}

/**
 * Component for the Press Release tab containing all sections
 */
export const PressReleaseForm: React.FC<PressReleaseFormProps> = ({
  prfaq,
  onTitleChange,
  onPressReleaseChange,
  onGenerateSection,
  isGenerating,
  generatingSection,
  disabled = false,
}) => {
  // Helper function to create a handler for text field changes
  const createChangeHandler = (field: keyof PRFAQState['pressRelease']) => 
    (value: string) => onPressReleaseChange(field, value);

  return (
    <Grid container spacing={3}>
      <PressReleaseSection
        section="title"
        label="Title"
        value={prfaq.title}
        onChange={(value) => onTitleChange({ target: { value } } as React.ChangeEvent<HTMLInputElement>)}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Enter a title for your PRFAQ..."
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="introduction"
        label="First Paragraph - Summary"
        value={prfaq.pressRelease.introduction}
        onChange={createChangeHandler('introduction')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Introduce your product or feature with a compelling summary..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="problemStatement"
        label="Second Paragraph - Problem"
        value={prfaq.pressRelease.problemStatement}
        onChange={createChangeHandler('problemStatement')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Describe the problem your product or feature solves..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="solution"
        label="Third Paragraph - Solution"
        value={prfaq.pressRelease.solution}
        onChange={createChangeHandler('solution')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Explain how your product or feature solves the problem..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="stakeholderQuote"
        label="Fourth Paragraph - Executive Quote"
        value={prfaq.pressRelease.stakeholderQuote}
        onChange={createChangeHandler('stakeholderQuote')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Include a quote from a company executive..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="customerJourney"
        label="Fifth Paragraph - Customer Journey"
        value={prfaq.pressRelease.customerJourney}
        onChange={createChangeHandler('customerJourney')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Describe the customer journey and experience..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="customerQuote"
        label="Sixth Paragraph - Customer Quote"
        value={prfaq.pressRelease.customerQuote}
        onChange={createChangeHandler('customerQuote')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="Include a quote from a customer..."
        rows={4}
        disabled={disabled}
      />
      
      <PressReleaseSection
        section="callToAction"
        label="Call to Action"
        value={prfaq.pressRelease.callToAction}
        onChange={createChangeHandler('callToAction')}
        onGenerate={onGenerateSection}
        isGenerating={isGenerating}
        generatingSection={generatingSection}
        placeholder="End with a call to action..."
        rows={2}
        disabled={disabled}
      />
    </Grid>
  );
};

export default PressReleaseForm; 