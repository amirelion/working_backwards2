import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProcessList } from '../../../features/working-backwards/contexts/ProcessListContext';
import { useCurrentProcess } from '../../../features/working-backwards/contexts/CurrentProcessContext';
import * as workingBackwardsService from '../../../services/workingBackwardsService';

/**
 * Custom hook to manage process-related dialogs and their actions
 */
const useProcessDialogs = () => {
  const navigate = useNavigate();
  const { createNewProcess, deleteProcess, processes } = useProcessList();
  const { loadProcess } = useCurrentProcess();

  // New process dialog state
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);

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
      await loadProcess(processId);
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error loading process:', error);
    }
  };

  /**
   * Handle deleting a process
   */
  const handleConfirmDelete = async () => {
    if (processToDelete) {
      try {
        await deleteProcess(processToDelete);
        setDeleteDialogOpen(false);
        setProcessToDelete(null);
      } catch (error) {
        console.error('Error deleting process:', error);
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
    renameDialogOpen,
    setRenameDialogOpen,
    newName,
    setNewName,
    processToRename,
    setProcessToRename,
    
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