import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress
} from '@mui/material';
import { DialogsProps } from '../types';

/**
 * Component containing all dialog modals for the dashboard
 */
const ProcessDialogs: React.FC<DialogsProps> = ({
  openNewDialog,
  setOpenNewDialog,
  newProcessTitle,
  setNewProcessTitle,
  isCreating,
  handleCreateProcess,
  
  deleteDialogOpen,
  setDeleteDialogOpen,
  handleConfirmDelete,
  
  renameDialogOpen,
  setRenameDialogOpen,
  newName,
  setNewName,
  handleRenameProcess
}) => {
  return (
    <>
      {/* New Process Dialog */}
      <Dialog 
        open={openNewDialog} 
        onClose={() => setOpenNewDialog(false)}
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle>Create New Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a title for your new Working Backwards process.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Process Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newProcessTitle}
            onChange={(e) => setNewProcessTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProcess} 
            variant="contained" 
            color="primary"
            disabled={!newProcessTitle.trim() || isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle>Delete Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this process? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Process Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
        disableEnforceFocus
        disableRestoreFocus
      >
        <DialogTitle>Rename Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for this process.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rename"
            label="New Process Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRenameProcess} 
            variant="contained" 
            color="primary"
            disabled={!newName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProcessDialogs; 