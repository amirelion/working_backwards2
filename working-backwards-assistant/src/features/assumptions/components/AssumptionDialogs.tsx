import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

interface DeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export const DeleteAssumptionDialog: React.FC<DeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  isDeleting = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onClose()}
      disableEnforceFocus
      disableRestoreFocus
    >
      <DialogTitle>Delete Assumption</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this assumption? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error"
          disabled={isDeleting}
          startIcon={isDeleting ? <CircularProgress size={20} color="error" /> : null}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create a named object for the export
const AssumptionDialogs = {
  DeleteAssumptionDialog,
};

export default AssumptionDialogs; 