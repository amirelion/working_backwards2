import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateWorkingBackwardsResponse } from '../../../features/session/sessionSlice';
import { WorkingBackwardsResponses } from '../../../types';
import { WorkingBackwardsQuestion, questionsList } from '../constants/questions';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { 
  selectInitialThoughts, 
  selectSkipInitialThoughts
} from '../../../store/initialThoughtsSlice';
import {
  selectQuestions,
  selectShowSummary,
  selectCurrentStep,
  updateQuestionField,
  setShowSummary,
  setCurrentStep
} from '../../../store/workingBackwardsSlice';
import { useCurrentProcess } from '../../../hooks/useCurrentProcess';

/**
 * Custom hook for managing form state in the Working Backwards process
 */
export const useFormState = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  
  // Get state from Redux
  const questions = useAppSelector(selectQuestions);
  const showSummary = useAppSelector(selectShowSummary);
  // We're not using this value directly, but keeping it for future reference
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reduxCurrentStep = useAppSelector(selectCurrentStep);
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  
  // Get process functions
  const { saveCurrentProcess, setIsModified } = useCurrentProcess();
  
  const [currentStep, setCurrentStepLocal] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(questionsList[0]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  // Auto-save timer
  const [lastChangeTime, setLastChangeTime] = useState<number>(0);

  // Reset summary view on mount to ensure users start with the questions
  useEffect(() => {
    // Always start with the question form rather than summary when the component mounts
    appDispatch(setShowSummary(false));
  }, [appDispatch]);

  // Initialize current response from state when active step changes
  useEffect(() => {
    if (!showSummary) {
      const question = questionsList[currentStep];
      setCurrentQuestion(question);
      const questionId = question.id;
      
      // Read from Redux
      setCurrentResponse(questions[questionId] || '');
      
      // Sync current step to Redux
      appDispatch(setCurrentStep(currentStep));
      
      // Check if we're coming directly to the Working Backwards page 
      // and need to load AI suggestions
      if (isFirstLoad && !skipInitialThoughts && initialThoughts.trim()) {
        setIsFirstLoad(false);
        console.log('First load with initial thoughts - preparing for AI suggestions');
      }
    }
  }, [currentStep, questions, showSummary, isFirstLoad, skipInitialThoughts, initialThoughts, setIsFirstLoad, appDispatch]);
  
  // Auto-save effect
  useEffect(() => {
    if (lastChangeTime === 0) return;
    
    // Auto-save after 3 seconds of inactivity
    const AUTOSAVE_DELAY = 3000;
    
    const timerId = setTimeout(async () => {
      console.log('Auto-saving working backwards data...');
      try {
        await saveCurrentProcess();
        console.log('Auto-save completed successfully');
      } catch (error) {
        console.error('Error in auto-save:', error);
      }
    }, AUTOSAVE_DELAY);
    
    // Clean up timer
    return () => clearTimeout(timerId);
  }, [lastChangeTime, saveCurrentProcess]);

  /**
   * Handle moving to the next step or to the summary
   */
  const handleNext = useCallback(async () => {
    // Update Redux store
    appDispatch(updateQuestionField({
      field: currentQuestion.id,
      value: currentResponse
    }));

    // Also update session slice for backward compatibility
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
      value: currentResponse
    }));
    
    // Mark as modified
    setIsModified(true);
    
    // Save current process
    try {
      await saveCurrentProcess();
    } catch (error) {
      console.error('Error saving during next step:', error);
    }

    // Move to next step or show summary
    if (currentStep === questionsList.length - 1) {
      console.log('Setting showSummary to true');
      appDispatch(setShowSummary(true));
    } else {
      setCurrentStepLocal(currentStep + 1);
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, appDispatch, setIsModified, saveCurrentProcess]);

  /**
   * Handle moving to the previous step or back from summary
   */
  const handleBack = useCallback(async () => {
    // Update Redux store
    appDispatch(updateQuestionField({
      field: currentQuestion.id,
      value: currentResponse
    }));

    // Also update session slice for backward compatibility
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
      value: currentResponse
    }));
    
    // Mark as modified
    setIsModified(true);
    
    // Save current process
    try {
      await saveCurrentProcess();
    } catch (error) {
      console.error('Error saving during back step:', error);
    }

    // Move to previous step or hide summary
    if (showSummary) {
      appDispatch(setShowSummary(false));
    } else if (currentStep > 0) {
      setCurrentStepLocal(currentStep - 1);
    } else {
      // If at first step, go back to initial thoughts
      navigate('/initial-thoughts');
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, appDispatch, showSummary, navigate, setIsModified, saveCurrentProcess]);

  /**
   * Handle text input changes
   */
  const handleResponseChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentResponse(event.target.value);
    
    // Update last change time to trigger auto-save
    setLastChangeTime(Date.now());
    
    // Mark as modified
    setIsModified(true);
  }, [setIsModified]);

  /**
   * Navigate to the PR/FAQ page after saving all responses
   */
  const handleContinueToPRFAQ = useCallback(async () => {
    // Make sure all responses are saved to Redux before navigating
    Object.entries(questions).forEach(([key, value]) => {
      // Skip aiSuggestions
      if (key !== 'aiSuggestions' && typeof value === 'string') {
        dispatch(updateWorkingBackwardsResponse({
          field: key as keyof WorkingBackwardsResponses,
          value: value
        }));
        
        // Also update the Redux working backwards slice
        if (key !== 'aiSuggestions') {
          // Only use allowed field keys
          if (key === 'customer' || key === 'problem' || key === 'benefit' || 
              key === 'validation' || key === 'experience') {
            appDispatch(updateQuestionField({
              field: key,
              value: value
            }));
          }
        }
      }
    });
    
    // Mark as modified
    setIsModified(true);
    
    // Save all responses to Firestore
    try {
      await saveCurrentProcess();
      console.log('Successfully saved before navigating to PRFAQ');
    } catch (error) {
      console.error('Error saving before navigating to PRFAQ:', error);
    }
    
    navigate('/prfaq');
  }, [dispatch, appDispatch, navigate, questions, setIsModified, saveCurrentProcess]);

  /**
   * Handle going back to the initial thoughts page
   */
  const handleBackToInitialThoughts = useCallback(async () => {
    // Save before navigating
    try {
      await saveCurrentProcess();
      console.log('Successfully saved before returning to initial thoughts');
    } catch (error) {
      console.error('Error saving before returning to initial thoughts:', error);
    }
    
    navigate('/initial-thoughts');
  }, [navigate, saveCurrentProcess]);

  /**
   * Use an AI suggestion as the response
   */
  const handleUseSuggestion = useCallback((suggestion: string) => {
    if (suggestion) {
      // Update the current response
      setCurrentResponse(suggestion);
      
      // Update Redux
      appDispatch(updateQuestionField({
        field: currentQuestion.id,
        value: suggestion
      }));
      
      // Mark as modified
      setIsModified(true);
      
      // Update last change time to trigger auto-save
      setLastChangeTime(Date.now());
    }
  }, [currentQuestion.id, appDispatch, setIsModified]);

  /**
   * Navigate to a specific route
   */
  const handleNavigateToRoute = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  return {
    currentStep,
    currentQuestion,
    currentResponse,
    isFirstLoad,
    showSummary,
    questions, // Now using Redux version
    setIsFirstLoad,
    handleResponseChange,
    handleNext,
    handleBack,
    handleContinueToPRFAQ,
    handleBackToInitialThoughts,
    handleUseSuggestion,
    handleNavigateToRoute
  };
};

export default useFormState; 