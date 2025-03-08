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
  AssumptionConfidence 
} from '../types';
import { AssumptionFormState } from '../types';
import { RootState } from '../../../store';

export const useAssumptions = () => {
  const dispatch = useDispatch();
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
  const [isModified, setIsModified] = useState(false);
  
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
  
  // Handle adding assumption
  const addAssumption = useCallback((assumption: Omit<EnhancedAssumption, 'id'>) => {
    const newId = uuidv4();
    dispatch(addAssumptionAction({
      ...assumption,
      id: newId,
      priority: assumptions.length
    }));
    setIsModified(true);
    return newId;
  }, [dispatch, assumptions.length]);
  
  // Handle updating assumption
  const updateAssumption = useCallback((id: string, updates: Partial<EnhancedAssumption>) => {
    dispatch(updateAssumptionAction({
      id,
      updates
    }));
    setIsModified(true);
  }, [dispatch]);
  
  // Handle deleting assumption
  const deleteAssumption = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this assumption?')) {
      dispatch(removeAssumptionAction(id));
      setIsModified(true);
    }
  }, [dispatch]);
  
  // Handle linking experiments to assumption
  const linkExperimentsToAssumption = useCallback((assumptionId: string, experimentIds: string[]) => {
    dispatch(updateAssumptionAction({
      id: assumptionId,
      updates: {
        relatedExperiments: experimentIds
      }
    }));
    setIsModified(true);
  }, [dispatch]);
  
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
  
  // Handle add or update assumption
  const handleAddOrUpdateAssumption = useCallback(() => {
    if (editingAssumption) {
      // Update existing assumption
      updateAssumption(editingAssumption.id, {
        statement: editingAssumption.statement,
        description: editingAssumption.description,
        category: editingAssumption.category,
        impact: editingAssumption.impact,
        confidence: editingAssumption.confidence
      });
      setEditingAssumption(null);
    } else {
      // Add new assumption
      addAssumption({
        statement: newAssumption.statement,
        description: newAssumption.description,
        category: newAssumption.category,
        impact: newAssumption.impact,
        confidence: newAssumption.confidence,
        priority: assumptions.length,
        relatedExperiments: []
      });
      resetForm();
    }
  }, [editingAssumption, newAssumption, assumptions.length, addAssumption, updateAssumption, resetForm]);
  
  // Handle editing assumption
  const handleEditAssumption = useCallback((id: string) => {
    const assumption = assumptions.find(a => a.id === id);
    if (assumption) {
      setEditingAssumption(assumption);
    }
  }, [assumptions]);
  
  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingAssumption(null);
  }, []);
  
  return {
    assumptions,
    experiments,
    addAssumption,
    updateAssumption,
    deleteAssumption,
    linkExperimentsToAssumption,
    isModified,
    newAssumption,
    editingAssumption,
    resetForm,
    handleStatementChange,
    handleDescriptionChange,
    handleCategoryChange,
    handleImpactChange,
    handleConfidenceChange,
    handleAddOrUpdateAssumption,
    handleEditAssumption,
    handleCancelEdit,
    setNewAssumption,
    setEditingAssumption,
  };
}; 