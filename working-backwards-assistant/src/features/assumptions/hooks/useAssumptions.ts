import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { 
  addAssumption as addAssumptionAction,
  updateAssumption as updateAssumptionAction,
  removeAssumption as removeAssumptionAction,
} from '../../../features/session/sessionSlice';
import { backwardCompatSelectors } from '../../../store/compatUtils';
import { 
  EnhancedAssumption, 
  AssumptionCategory, 
  AssumptionImpact, 
  AssumptionConfidence,
  AssumptionStatus
} from '../types';
import { AssumptionFormState } from '../types';
import { RootState } from '../../../store';
import { logAssumptions } from '../../../utils/debugUtils';
import { useProcessSync } from '../../../features/working-backwards/contexts/ProcessSyncContext';

export const useAssumptions = () => {
  const dispatch = useDispatch();
  const { isModified, setIsModified } = useProcessSync();
  
  const assumptions = useSelector((state: RootState) => 
    backwardCompatSelectors.assumptions(state) as EnhancedAssumption[]
  );
  const experiments = useSelector((state: RootState) => backwardCompatSelectors.experiments(state));
  
  // Form state
  const [newAssumption, setNewAssumption] = useState<AssumptionFormState>({
    statement: '',
    description: '',
    category: 'customer',
    impact: 'medium',
    confidence: 'medium',
  });
  
  const [editingAssumption, setEditingAssumption] = useState<EnhancedAssumption | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assumptionToDelete, setAssumptionToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setNewAssumption({
      statement: '',
      description: '',
      category: 'customer',
      impact: 'medium',
      confidence: 'medium',
    });
    setEditingAssumption(null);
  }, []);
  
  // Mark the state as modified
  const markAsModified = useCallback(() => {
    console.log('[useAssumptions] Setting isModified to true');
    setIsModified(true);
  }, [setIsModified]);
  
  // Handle adding assumption
  const addAssumption = useCallback((assumption: Omit<EnhancedAssumption, 'id'>) => {
    const newId = uuidv4();
    console.log('[useAssumptions] Adding assumption:', {
      ...assumption,
      id: newId
    });
    
    dispatch(addAssumptionAction({
      ...assumption,
      id: newId,
      priority: assumptions.length,
      status: assumption.status || 'unvalidated'
    }));
    
    markAsModified();
    return newId;
  }, [dispatch, assumptions.length, markAsModified]);
  
  // Handle updating assumption
  const updateAssumption = useCallback((id: string, updates: Partial<EnhancedAssumption>) => {
    console.log('[useAssumptions] Updating assumption:', id);
    console.log('[useAssumptions] Updates:', updates);
    
    dispatch(updateAssumptionAction({
      id,
      updates
    }));
    
    console.log('[useAssumptions] Setting isModified to true');
    markAsModified();
    
    // Log the updated assumptions
    setTimeout(() => {
      logAssumptions();
    }, 100);
  }, [dispatch, markAsModified]);
  
  // Handle updating assumption status
  const updateAssumptionStatus = useCallback((id: string, status: AssumptionStatus) => {
    dispatch(updateAssumptionAction({
      id,
      updates: { status }
    }));
    markAsModified();
  }, [dispatch, markAsModified]);
  
  // Open delete confirmation dialog
  const openDeleteDialog = useCallback((id: string) => {
    setAssumptionToDelete(id);
    setDeleteDialogOpen(true);
  }, []);
  
  // Close delete confirmation dialog
  const closeDeleteDialog = useCallback(() => {
    setDeleteDialogOpen(false);
    setAssumptionToDelete(null);
  }, []);
  
  // Handle confirming deletion
  const confirmDeleteAssumption = useCallback(async () => {
    if (assumptionToDelete) {
      setIsDeleting(true);
      try {
        // Add a small delay to show the loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        dispatch(removeAssumptionAction(assumptionToDelete));
        markAsModified();
        
        // Close the dialog
        setDeleteDialogOpen(false);
        setAssumptionToDelete(null);
      } catch (error) {
        console.error('Error deleting assumption:', error);
      } finally {
        setIsDeleting(false);
      }
    }
  }, [assumptionToDelete, dispatch, markAsModified]);
  
  // Legacy deletion function (kept for backward compatibility)
  const deleteAssumption = useCallback((id: string) => {
    openDeleteDialog(id);
  }, [openDeleteDialog]);
  
  // Handle linking experiments to assumption
  const linkExperimentsToAssumption = useCallback((assumptionId: string, experimentIds: string[]) => {
    dispatch(updateAssumptionAction({
      id: assumptionId,
      updates: {
        relatedExperiments: experimentIds
      }
    }));
    markAsModified();
  }, [dispatch, markAsModified]);
  
  // Form handlers
  const handleStatementChange = useCallback((value: string) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        statement: value
      }));
    } else {
      setNewAssumption(prev => ({
        ...prev,
        statement: value
      }));
    }
  }, [editingAssumption]);
  
  const handleDescriptionChange = useCallback((value: string) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        description: value
      }));
    } else {
      setNewAssumption(prev => ({
        ...prev,
        description: value
      }));
    }
  }, [editingAssumption]);
  
  const handleCategoryChange = useCallback((value: AssumptionCategory) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        category: value
      }));
    } else {
      setNewAssumption(prev => ({
        ...prev,
        category: value
      }));
    }
  }, [editingAssumption]);
  
  const handleImpactChange = useCallback((value: AssumptionImpact) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        impact: value
      }));
    } else {
      setNewAssumption(prev => ({
        ...prev,
        impact: value
      }));
    }
  }, [editingAssumption]);
  
  const handleConfidenceChange = useCallback((value: AssumptionConfidence) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        confidence: value
      }));
    } else {
      setNewAssumption(prev => ({
        ...prev,
        confidence: value
      }));
    }
  }, [editingAssumption]);
  
  // Handle status change
  const handleStatusChange = useCallback((value: AssumptionStatus) => {
    if (editingAssumption) {
      setEditingAssumption(prev => ({
        ...prev!,
        status: value
      }));
    } else {
      // For new assumptions, we don't expose status in the form typically
      // but we handle it here for completeness
      console.log('[useAssumptions] Setting status for new assumption:', value);
    }
  }, [editingAssumption]);
  
  // Add or update assumption
  const handleAddOrUpdateAssumption = useCallback(async () => {
    if (editingAssumption) {
      // Update existing assumption
      console.log('[useAssumptions] Updating existing assumption:', editingAssumption.id);
      
      // First update the assumption in the Redux store
      updateAssumption(editingAssumption.id, {
        statement: editingAssumption.statement,
        description: editingAssumption.description,
        category: editingAssumption.category,
        impact: editingAssumption.impact,
        confidence: editingAssumption.confidence,
        status: editingAssumption.status
      });
      
      // Clear the editing state
      setEditingAssumption(null);
      
      // Log the updated assumptions
      setTimeout(() => {
        logAssumptions();
      }, 100);
      
      return true; // Return true to indicate successful update
    } else {
      // Add new assumption
      console.log('[useAssumptions] Adding new assumption');
      addAssumption({
        statement: newAssumption.statement,
        description: newAssumption.description,
        category: newAssumption.category,
        impact: newAssumption.impact,
        confidence: newAssumption.confidence,
        priority: assumptions.length,
        relatedExperiments: [],
        status: 'unvalidated'
      });
      resetForm();
      
      // Log the updated assumptions
      setTimeout(() => {
        logAssumptions();
      }, 100);
      
      return true; // Return true to indicate successful addition
    }
  }, [editingAssumption, newAssumption, addAssumption, updateAssumption, assumptions.length, resetForm]);
  
  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    setEditingAssumption(null);
  }, []);
  
  // Edit an assumption
  const handleEditAssumption = useCallback((id: string) => {
    const assumption = assumptions.find(a => a.id === id);
    if (assumption) {
      setEditingAssumption(assumption);
    }
  }, [assumptions]);
  
  return {
    assumptions,
    experiments,
    addAssumption,
    updateAssumption,
    updateAssumptionStatus,
    deleteAssumption,
    linkExperimentsToAssumption,
    
    // Delete dialog state and handlers
    deleteDialogOpen,
    setDeleteDialogOpen,
    assumptionToDelete,
    setAssumptionToDelete,
    isDeleting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDeleteAssumption,
    
    isModified,
    setIsModified,
    newAssumption,
    setNewAssumption,
    editingAssumption,
    setEditingAssumption,
    resetForm,
    
    // Form handlers
    handleStatementChange,
    handleDescriptionChange,
    handleCategoryChange,
    handleImpactChange,
    handleConfidenceChange,
    handleStatusChange,
    handleAddOrUpdateAssumption,
    handleEditAssumption,
    handleCancelEdit
  };
}; 