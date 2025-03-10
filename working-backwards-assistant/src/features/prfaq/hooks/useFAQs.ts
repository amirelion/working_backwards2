import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { 
  addCustomerFAQ, 
  updateCustomerFAQ, 
  removeCustomerFAQ,
  addStakeholderFAQ,
  updateStakeholderFAQ,
  removeStakeholderFAQ
} from '../../../store/prfaqSlice';
import { FAQ } from '../../../types';
import { useProcessSync } from '../../../hooks/useProcessSync';

/**
 * Custom hook for managing FAQ state and operations
 */
export const useFAQs = () => {
  const dispatch = useDispatch();
  const { setIsModified } = useProcessSync();
  
  // State for new FAQs
  const [newCustomerFAQ, setNewCustomerFAQ] = useState<FAQ>({ question: '', answer: '' });
  const [newStakeholderFAQ, setNewStakeholderFAQ] = useState<FAQ>({ question: '', answer: '' });
  
  // State for editing existing FAQs
  const [editingCustomerFAQIndex, setEditingCustomerFAQIndex] = useState<number>(-1);
  const [editingStakeholderFAQIndex, setEditingStakeholderFAQIndex] = useState<number>(-1);
  
  // State for generation comments
  const [customerFaqComment, setCustomerFaqComment] = useState<string>('');
  const [stakeholderFaqComment, setStakeholderFaqComment] = useState<string>('');

  // Customer FAQ handlers
  const handleNewCustomerFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomerFAQ(prev => ({ ...prev, question: event.target.value }));
  };

  const handleNewCustomerFAQAnswerChange = (value: string) => {
    setNewCustomerFAQ(prev => ({ ...prev, answer: value }));
  };

  const handleSaveCustomerFAQ = () => {
    if (editingCustomerFAQIndex >= 0) {
      // We're done editing, reset the editing index
      setEditingCustomerFAQIndex(-1);
      setIsModified(true); // Mark modified when done editing
    } else if (newCustomerFAQ.question.trim() && newCustomerFAQ.answer.trim()) {
      // Add new FAQ
      dispatch(addCustomerFAQ(newCustomerFAQ));
      setNewCustomerFAQ({ question: '', answer: '' });
      setIsModified(true); // Mark modified when adding
    }
  };

  const handleEditCustomerFAQ = (index: number) => {
    setEditingCustomerFAQIndex(index);
  };

  const handleDeleteCustomerFAQ = (index: number) => {
    dispatch(removeCustomerFAQ(index));
    setIsModified(true); // Mark modified when deleting
    
    // If we're editing this FAQ, reset the editing state
    if (editingCustomerFAQIndex === index) {
      setEditingCustomerFAQIndex(-1);
    }
  };

  const handleCustomerFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerFaqComment(event.target.value);
  };

  const handleUpdateCustomerFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    dispatch(updateCustomerFAQ({ 
      index, 
      [field]: value 
    }));
    setIsModified(true); // Mark modified when updating
  };

  // Stakeholder FAQ handlers
  const handleNewStakeholderFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewStakeholderFAQ(prev => ({ ...prev, question: event.target.value }));
  };

  const handleNewStakeholderFAQAnswerChange = (value: string) => {
    setNewStakeholderFAQ(prev => ({ ...prev, answer: value }));
  };

  const handleSaveStakeholderFAQ = () => {
    if (editingStakeholderFAQIndex >= 0) {
      // We're done editing, reset the editing index
      setEditingStakeholderFAQIndex(-1);
      setIsModified(true); // Mark modified when done editing
    } else if (newStakeholderFAQ.question.trim() && newStakeholderFAQ.answer.trim()) {
      // Add new FAQ
      dispatch(addStakeholderFAQ(newStakeholderFAQ));
      setNewStakeholderFAQ({ question: '', answer: '' });
      setIsModified(true); // Mark modified when adding
    }
  };

  const handleEditStakeholderFAQ = (index: number) => {
    setEditingStakeholderFAQIndex(index);
  };

  const handleDeleteStakeholderFAQ = (index: number) => {
    dispatch(removeStakeholderFAQ(index));
    setIsModified(true); // Mark modified when deleting
    
    // If we're editing this FAQ, reset the editing state
    if (editingStakeholderFAQIndex === index) {
      setEditingStakeholderFAQIndex(-1);
    }
  };

  const handleStakeholderFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeholderFaqComment(event.target.value);
  };

  const handleUpdateStakeholderFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    dispatch(updateStakeholderFAQ({ 
      index, 
      [field]: value 
    }));
    setIsModified(true); // Mark modified when updating
  };

  return {
    // Customer FAQ state and handlers
    newCustomerFAQ,
    editingCustomerFAQIndex,
    customerFaqComment,
    handleNewCustomerFAQQuestionChange,
    handleNewCustomerFAQAnswerChange,
    handleSaveCustomerFAQ,
    handleEditCustomerFAQ,
    handleDeleteCustomerFAQ,
    handleCustomerFaqCommentChange,
    handleUpdateCustomerFAQ,
    
    // Stakeholder FAQ state and handlers
    newStakeholderFAQ,
    editingStakeholderFAQIndex,
    stakeholderFaqComment,
    handleNewStakeholderFAQQuestionChange,
    handleNewStakeholderFAQAnswerChange,
    handleSaveStakeholderFAQ,
    handleEditStakeholderFAQ,
    handleDeleteStakeholderFAQ,
    handleStakeholderFaqCommentChange,
    handleUpdateStakeholderFAQ,
  };
};

export default useFAQs; 