import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRecoilState, atom } from 'recoil';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
import { initialThoughtsState } from '../../../atoms/initialThoughtsState';
import { skipInitialThoughtsState } from '../../../atoms/skipInitialThoughtsState';
import { updateWorkingBackwardsResponse } from '../../../features/session/sessionSlice';
import { WorkingBackwardsResponses } from '../../../types';
import { WorkingBackwardsQuestion, questionsList } from '../constants/questions';

// Creating a shared Recoil atom for the showSummary state
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
  const [questionsState, setQuestionsState] = useRecoilState(workingBackwardsQuestionsState);
  const [initialThoughts] = useRecoilState(initialThoughtsState);
  const [skipInitialThoughts, setSkipInitialThoughts] = useRecoilState(skipInitialThoughtsState);
  const [showSummary, setShowSummary] = useRecoilState(showSummaryState);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState<WorkingBackwardsQuestion>(questionsList[0]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  // Reset summary view on mount to ensure users start with the questions
  useEffect(() => {
    // Always start with the question form rather than summary when the component mounts
    setShowSummary(false);
  }, [setShowSummary]);

  // Initialize current response from Recoil state when active step changes
  useEffect(() => {
    if (!showSummary) {
      const question = questionsList[currentStep];
      setCurrentQuestion(question);
      const questionId = question.id;
      setCurrentResponse(questionsState[questionId] || '');
      
      // Check if we're coming directly to the Working Backwards page 
      // and need to load AI suggestions
      if (isFirstLoad && !skipInitialThoughts && initialThoughts.trim()) {
        setIsFirstLoad(false);
        console.log('First load with initial thoughts - preparing for AI suggestions');
      }
    }
  }, [currentStep, questionsState, showSummary, isFirstLoad, skipInitialThoughts, initialThoughts, setIsFirstLoad]);

  /**
   * Handle moving to the next step or to the summary
   */
  const handleNext = useCallback(() => {
    // Save current response to Recoil state
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));

    // Also update Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
      value: currentResponse
    }));

    // Move to next step or show summary
    if (currentStep === questionsList.length - 1) {
      console.log('Setting showSummary to true');
      setShowSummary(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, setQuestionsState, setShowSummary]);

  /**
   * Handle moving to the previous step or back from summary
   */
  const handleBack = useCallback(() => {
    // Save current response to Recoil state
    setQuestionsState(prev => ({
      ...prev,
      [currentQuestion.id]: currentResponse
    }));

    // Also update Redux store
    dispatch(updateWorkingBackwardsResponse({
      field: currentQuestion.id as keyof WorkingBackwardsResponses,
      value: currentResponse
    }));

    // Move to previous step or hide summary
    if (showSummary) {
      setShowSummary(false);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentQuestion.id, currentResponse, currentStep, dispatch, setQuestionsState, showSummary, setShowSummary]);

  /**
   * Handle changes to the response textarea
   */
  const handleResponseChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentResponse(event.target.value);
  }, []);

  /**
   * Navigate to the PR/FAQ page after saving all responses
   */
  const handleContinueToPRFAQ = useCallback(() => {
    // Make sure all responses are saved to Redux before navigating
    Object.entries(questionsState).forEach(([key, value]) => {
      // Skip aiSuggestions
      if (key !== 'aiSuggestions') {
        dispatch(updateWorkingBackwardsResponse({
          field: key as keyof WorkingBackwardsResponses,
          value: value as string
        }));
      }
    });
    
    navigate('/prfaq');
  }, [dispatch, navigate, questionsState]);

  /**
   * Handle going back to the initial thoughts page
   */
  const handleBackToInitialThoughts = useCallback(() => {
    navigate('/initial-thoughts');
  }, [navigate]);

  /**
   * Apply an AI suggestion to the current response
   */
  const handleUseSuggestion = useCallback((suggestion: string) => {
    if (suggestion) {
      // Update the current response
      setCurrentResponse(suggestion);
      
      // Update the questionsState in Recoil
      setQuestionsState(prev => ({
        ...prev,
        [currentQuestion.id]: suggestion
      }));
    }
  }, [currentQuestion.id, setQuestionsState]);

  return {
    currentStep,
    setCurrentStep,
    currentResponse,
    setCurrentResponse,
    currentQuestion,
    setCurrentQuestion,
    showSummary,
    setShowSummary,
    isFirstLoad,
    setIsFirstLoad,
    questionsState,
    initialThoughts,
    handleNext,
    handleBack,
    handleResponseChange,
    handleContinueToPRFAQ,
    handleBackToInitialThoughts,
    handleUseSuggestion
  };
};

export default useFormState; 