import React from 'react';
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  TextSnippet as TxtIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { ExportFormat } from '../../../types';

interface ExportMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => void;
}

/**
 * Export menu component that provides options for exporting PRFAQ in various formats
 */
export const ExportMenu: React.FC<ExportMenuProps> = ({
  anchorEl,
  open,
  onClose,
  onExport,
}) => {
  return (
    <>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={onClose}
      >
        <MenuItem onClick={() => onExport('pdf')}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onExport('docx')}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Word</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onExport('txt')}>
          <ListItemIcon>
            <TxtIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Text</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => onExport('email')}>
          <ListItemIcon>
            <EmailIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as Email</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default ExportMenu; 