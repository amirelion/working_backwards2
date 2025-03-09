import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRecoilState, atom } from 'recoil';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
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
  setShowSummary as setReduxShowSummary,
  setCurrentStep as setReduxCurrentStep
} from '../../../store/workingBackwardsSlice';

// Creating a shared Recoil atom for the showSummary state - will be removed after migration
export const showSummaryState = atom({
  key: 'workingBackwardsShowSummaryState',
  default: false
});

/**
 * Custom hook for managing form state in the Working Backwards process
 */
export const useFormState = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const appDispatch = useAppDispatch();
  
  // Get state from Redux
  // These variables aren't fully used yet as we maintain backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reduxQuestions = useAppSelector(selectQuestions);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reduxShowSummary = useAppSelector(selectShowSummary);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const reduxCurrentStep = useAppSelector(selectCurrentStep);
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  
  // Keep using Recoil for now - will be removed after migration is complete
  const [questionsState, setQuestionsState] = useRecoilState(workingBackwardsQuestionsState);
  const [showSummary, setShowSummaryRecoil] = useRecoilState(showSummaryState);
  
  const [currentStep, setCurrentStepLocal] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(questionsList[0]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Reset summary view on mount to ensure users start with the questions
  useEffect(() => {
    // Always start with the question form rather than summary when the component mounts
    setShowSummaryRecoil(false);
    appDispatch(setReduxShowSummary(false));
  }, [setShowSummaryRecoil, appDispatch]);

  // Initialize current response from state when active step changes
  useEffect(() => {
    if (!showSummary) {
      const question = questionsList[currentStep];
      setCurrentQuestion(question);
      const questionId = question.id;
      
      // During transition period, read from Recoil
      setCurrentResponse(questionsState[questionId] || '');
      
      // Sync current step to Redux
      appDispatch(setReduxCurrentStep(currentStep));
      
      // Check if we're coming directly to the Working Backwards page 
      // and need to load AI suggestions
      if (isFirstLoad && !skipInitialThoughts && initialThoughts.trim()) {
        setIsFirstLoad(false);
        console.log('First load with initial thoughts - preparing for AI suggestions');
      }
    }
  }, [currentStep, questionsState, showSummary, isFirstLoad, skipInitialThoughts, initialThoughts, setIsFirstLoad, appDispatch]);

  /**
   * Handle moving to the next step or to the summary
   */
  const handleNext = useCallback(() => {
    // Save current response to both Recoil and Redux
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));
    
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

    // Move to next step or show summary
    if (currentStep === questionsList.length - 1) {
      console.log('Setting showSummary to true');
      setShowSummaryRecoil(true);
      appDispatch(setReduxShowSummary(true));
    } else {
      setCurrentStepLocal(currentStep + 1);
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, appDispatch, setQuestionsState, setShowSummaryRecoil]);

  /**
   * Handle moving to the previous step or back from summary
   */
  const handleBack = useCallback(() => {
    // Save current response to both Recoil and Redux
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));
    
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

    // Move to previous step or hide summary
    if (showSummary) {
      setShowSummaryRecoil(false);
      appDispatch(setReduxShowSummary(false));
    } else if (currentStep > 0) {
      setCurrentStepLocal(currentStep - 1);
    } else {
      // If at first step, go back to initial thoughts
      navigate('/initial-thoughts');
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, appDispatch, setQuestionsState, showSummary, setShowSummaryRecoil, navigate]);

  /**
   * Handle text input changes
   */
  const handleResponseChange = useCallback((value: string) => {
    setCurrentResponse(value);
  }, []);

  /**
   * Navigate to the PR/FAQ page after saving all responses
   */
  const handleContinueToPRFAQ = useCallback(() => {
    // Make sure all responses are saved to Redux before navigating
    Object.entries(questionsState).forEach(([key, value]) => {
      // Skip aiSuggestions
      if (key !== 'aiSuggestions' && typeof value === 'string') {
        dispatch(updateWorkingBackwardsResponse({
          field: key as keyof WorkingBackwardsResponses,
          value: value
        }));
        
        // Also update the Redux working backwards slice
        if (key !== 'aiSuggestions') {
          appDispatch(updateQuestionField({
            field: key as keyof Omit<typeof questionsState, 'aiSuggestions'>,
            value: value
          }));
        }
      }
    });
    
    navigate('/pr-faq');
  }, [dispatch, appDispatch, navigate, questionsState]);

  /**
   * Handle going back to the initial thoughts page
   */
  const handleBackToInitialThoughts = useCallback(() => {
    navigate('/initial-thoughts');
  }, [navigate]);

  /**
   * Use an AI suggestion as the response
   */
  const handleUseSuggestion = useCallback((suggestion: string) => {
    if (suggestion) {
      // Update the current response
      setCurrentResponse(suggestion);
      
      // Update both Recoil and Redux
      setQuestionsState(prev => ({
        ...prev,
        [currentQuestion.id]: suggestion
      }));
      
      appDispatch(updateQuestionField({
        field: currentQuestion.id,
        value: suggestion
      }));
    }
  }, [currentQuestion.id, setQuestionsState, appDispatch]);

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
    questions: questionsState, // Still using Recoil version
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