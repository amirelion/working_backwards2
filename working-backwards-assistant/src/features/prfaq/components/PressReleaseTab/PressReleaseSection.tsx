import React from 'react';
import {
  Grid,
  TextField,
  Typography,
  Box,
  Button,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import { AutoFixHigh as AutoFixHighIcon } from '@mui/icons-material';
import { useWorkingBackwards } from '../../../../contexts/WorkingBackwardsContext';

interface PressReleaseSectionProps {
  section: string;
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onChange: (value: string) => void;
  onGenerate?: (section: string) => Promise<void>;
  isGenerating?: boolean;
  generatingSection?: string;
  disabled?: boolean;
}

/**
 * A reusable component for each section of the press release
 * Includes a text field for content and optionally a generate button
 */
export const PressReleaseSection: React.FC<PressReleaseSectionProps> = ({
  section,
  label,
  value,
  placeholder = '',
  rows = 3,
  onChange,
  onGenerate,
  isGenerating = false,
  generatingSection = '',
  disabled = false,
}) => {
  const { saveCurrentProcess } = useWorkingBackwards();
  const isCurrentSectionGenerating = isGenerating && generatingSection === section;
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    onChange(e.target.value);
  };
  
  const handleBlur = async () => {
    try {
      await saveCurrentProcess();
    } catch (error) {
      console.error('Error saving on blur:', error);
    }
  };

  return (
    <Grid item xs={12} sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
        
        {onGenerate && (
          <Tooltip title={value.trim() ? "Regenerate this section" : "Generate content for this section"}>
            <span>
              <Button
                size="small"
                variant="outlined"
                color="primary"
                onClick={() => onGenerate(section)}
                disabled={isGenerating || disabled}
                startIcon={isCurrentSectionGenerating ? <CircularProgress size={16} /> : <AutoFixHighIcon />}
              >
                {value.trim() ? "Regenerate" : "Generate"}
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
      
      <TextField
        fullWidth
        multiline
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        variant="outlined"
        disabled={isCurrentSectionGenerating || disabled}
      />
    </Grid>
  );
};

export default PressReleaseSection; 