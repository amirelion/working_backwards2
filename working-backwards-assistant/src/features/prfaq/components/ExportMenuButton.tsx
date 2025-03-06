import React from 'react';
import { Button } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

interface ExportMenuButtonProps {
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

/**
 * ExportMenuButton component that displays the button to open the export menu
 */
export const ExportMenuButton: React.FC<ExportMenuButtonProps> = ({ 
  onClick, 
  disabled = false 
}) => {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={<DownloadIcon />}
      disabled={disabled}
    >
      Export
    </Button>
  );
};

export default ExportMenuButton; 