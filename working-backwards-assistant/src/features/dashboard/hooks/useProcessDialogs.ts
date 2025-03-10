import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../../store/hooks';
import { resetProcessState } from '../../../store/resetState';
import { useProcessList } from '../../../hooks/useProcessList';
import { useCurrentProcess } from '../../../hooks/useCurrentProcess';
import * as workingBackwardsService from '../../../services/workingBackwardsService';
import * as saveService from '../../../services/saveService';

/**
 * Custom hook to manage process-related dialogs and their actions
 */
const useProcessDialogs = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { createNewProcess, deleteProcess, processes } = useProcessList();
  const { loadProcess } = useCurrentProcess();

  // New process dialog state
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false); // Track deletion in progress
  
  // Snackbar notification state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [processToRename, setProcessToRename] = useState<string | null>(null);

  // Process menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  /**
   * Handle creating a new process
   */
  const handleCreateProcess = async () => {
    if (!newProcessTitle.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      // Reset all process-related state
      resetProcessState(dispatch);
      
      const processId = await createNewProcess(newProcessTitle);
      setOpenNewDialog(false);
      setNewProcessTitle('');
      
      // Navigate to the initial thoughts page with the new process ID
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error creating process:', error);
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Handle opening an existing process
   */
  const handleOpenProcess = async (processId: string) => {
    try {
      // Reset all process-related state before loading new process
      resetProcessState(dispatch);
      
      await loadProcess(processId);
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error opening process:', error);
    }
  };

  /**
   * Handle deleting a process
   */
  const handleConfirmDelete = async () => {
    if (processToDelete) {
      setIsDeleting(true);
      try {
        // Get process title for the notification
        const processTitle = processes.find(p => p.id === processToDelete)?.title || 'Process';
        
        // Use the saveService to delete the process with animation
        await saveService.deleteProcessWithAnimation(processToDelete);
        
        // Update the local state after successful deletion
        deleteProcess(processToDelete);
        
        // Show success notification
        setSnackbarMessage(`"${processTitle}" has been deleted successfully`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Close the dialog
        setDeleteDialogOpen(false);
        setProcessToDelete(null);
      } catch (error) {
        console.error('Error deleting process:', error);
        
        // Show error notification
        setSnackbarMessage(`Failed to delete process: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  /**
   * Handle renaming a process
   */
  const handleRenameProcess = async () => {
    if (processToRename && newName.trim()) {
      try {
        await workingBackwardsService.renameProcess(processToRename, newName);
        setRenameDialogOpen(false);
        setProcessToRename(null);
        setNewName('');
      } catch (error) {
        console.error('Error renaming process:', error);
      }
    }
  };
  
  /**
   * Handle process menu open
   */
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, processId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedProcessId(processId);
  };
  
  /**
   * Handle process menu close
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProcessId(null);
  };
  
  /**
   * Handle menu actions
   */
  const handleMenuAction = (action: 'open' | 'rename' | 'delete') => {
    if (!selectedProcessId) return;
    
    switch (action) {
      case 'open':
        handleOpenProcess(selectedProcessId);
        break;
      case 'rename':
        const processItem = processes.find(p => p.id === selectedProcessId);
        if (processItem) {
          setProcessToRename(selectedProcessId);
          setNewName(processItem.title);
          setRenameDialogOpen(true);
        }
        break;
      case 'delete':
        setProcessToDelete(selectedProcessId);
        setDeleteDialogOpen(true);
        break;
    }
    
    handleMenuClose();
  };

  /**
   * Handle closing the snackbar
   */
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return {
    // Dialog states
    openNewDialog,
    setOpenNewDialog,
    newProcessTitle,
    setNewProcessTitle,
    isCreating,
    deleteDialogOpen, 
    setDeleteDialogOpen,
    processToDelete,
    setProcessToDelete,
    isDeleting,
    renameDialogOpen,
    setRenameDialogOpen,
    newName,
    setNewName,
    processToRename,
    setProcessToRename,
    
    // Snackbar states
    snackbarOpen,
    setSnackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    
    // Menu states
    menuAnchorEl,
    selectedProcessId,
    
    // Handlers
    handleCreateProcess,
    handleOpenProcess,
    handleConfirmDelete,
    handleRenameProcess,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction
  };
};

export default useProcessDialogs; 