import React from 'react';
import { Menu, MenuItem, Divider } from '@mui/material';
import {
  Launch as LaunchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { ProcessMenuProps } from '../types';

/**
 * Component for the process options menu
 */
const ProcessMenu: React.FC<ProcessMenuProps> = ({
  menuAnchorEl,
  onMenuClose,
  onMenuAction
}) => {
  return (
    <Menu
      anchorEl={menuAnchorEl}
      open={Boolean(menuAnchorEl)}
      onClose={onMenuClose}
    >
      <MenuItem onClick={() => onMenuAction('open')}>
        <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
        Open
      </MenuItem>
      <MenuItem onClick={() => onMenuAction('rename')}>
        <EditIcon fontSize="small" sx={{ mr: 1 }} />
        Rename
      </MenuItem>
      <Divider />
      <MenuItem onClick={() => onMenuAction('delete')} sx={{ color: 'error.main' }}>
        <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
        Delete
      </MenuItem>
    </Menu>
  );
};

export default ProcessMenu; 