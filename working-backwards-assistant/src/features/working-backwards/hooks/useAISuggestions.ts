import { useState, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { workingBackwardsQuestionsState } from '../../../atoms/workingBackwardsQuestionsState';
import { getAIResponse, getWorkingBackwardsPrompt } from '../../../services/aiService';
import { WorkingBackwardsQuestion } from '../constants/questions';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { 
  selectInitialThoughts, 
  selectSkipInitialThoughts
} from '../../../store/initialThoughtsSlice';
import {
  addAISuggestion
} from '../../../store/workingBackwardsSlice';

/**
 * Custom hook for managing AI suggestions in the Working Backwards process
 */
export const useAISuggestions = () => {
  const [questionsState, setQuestionsState] = useRecoilState(workingBackwardsQuestionsState);
  const appDispatch = useAppDispatch();
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isLoadingFirstSuggestion, setIsLoadingFirstSuggestion] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);

  /**
   * Get an AI suggestion for a specific question
   */
  const getAISuggestion = useCallback(async (currentQuestion: WorkingBackwardsQuestion, currentStep: number) => {
    // Don't generate suggestions if the user skipped initial thoughts
    if (skipInitialThoughts) {
      return;
    }
    
    setIsGeneratingSuggestion(true);
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      Object.entries(questionsState)
        .filter(([key]) => key !== 'aiSuggestions' && key !== currentQuestion.id)
        .forEach(([key, value]) => {
          if (typeof value === 'string') {
            contextObj[key] = value;
          }
        });
      
      const promptText = getWorkingBackwardsPrompt(currentQuestion.aiPrompt, contextObj, initialThoughts);
      
      // Call the AI service
      const response = await getAIResponse({
        prompt: promptText,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (response.error) {
        console.error('AI suggestion error:', response.error);
        setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
      } else {
        setAiSuggestion(response.content);
        
        const fullQuestionKey = `${currentStep + 1}. ${currentQuestion.label}`;
        
        // Store the suggestion in both Recoil and Redux
        setQuestionsState(prev => ({
          ...prev,
          aiSuggestions: {
            ...prev.aiSuggestions,
            [fullQuestionKey]: response.content
          }
        }));
        
        // Also update Redux store
        appDispatch(addAISuggestion({
          question: fullQuestionKey,
          suggestion: response.content
        }));
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [initialThoughts, questionsState, setQuestionsState, skipInitialThoughts, appDispatch]);

  /**
   * Generate initial AI suggestions for all questions
   */
  const generateInitialSuggestions = useCallback(async (questionsList: WorkingBackwardsQuestion[], currentStep: number) => {
    // Don't generate suggestions if the user skipped initial thoughts or if there are no initial thoughts
    if (skipInitialThoughts || !initialThoughts.trim()) {
      return;
    }
    
    setIsLoadingFirstSuggestion(true);
    
    try {
      // Create a context object from existing responses
      const contextObj: Record<string, string> = {};
      const suggestions: Record<string, string> = {};
      
      // Generate suggestions in the background without affecting UI
      for (let i = 0; i < questionsList.length; i++) {
        const question = questionsList[i];
        const questionNumber = i + 1;
        const fullQuestionKey = `${questionNumber}. ${question.label}`;
        
        // Call the AI service
        const promptText = getWorkingBackwardsPrompt(question.aiPrompt, contextObj, initialThoughts);
        
        const response = await getAIResponse({
          prompt: promptText,
          model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
          provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
        });
        
        if (!response.error) {
          suggestions[fullQuestionKey] = response.content;
          contextObj[question.id] = response.content;
          
          // Update suggestions in both Recoil and Redux state
          setQuestionsState(prev => ({
            ...prev,
            aiSuggestions: {
              ...prev.aiSuggestions,
              [fullQuestionKey]: response.content
            }
          }));
          
          // Also update Redux store
          appDispatch(addAISuggestion({
            question: fullQuestionKey,
            suggestion: response.content
          }));
          
          // If this is the first question and we're still on it, show the suggestion
          if (i === 0 && currentStep === 0) {
            setAiSuggestion(response.content);
          }
        }
      }
    } catch (error) {
      console.error('Error generating initial AI suggestions:', error);
    } finally {
      setIsLoadingFirstSuggestion(false);
    }
  }, [initialThoughts, setQuestionsState, skipInitialThoughts, appDispatch]);

  /**
   * Load a suggestion for the current question from state
   */
  const loadSuggestionForQuestion = useCallback((question: WorkingBackwardsQuestion, step: number) => {
    if (questionsState.aiSuggestions) {
      const questionNumber = step + 1;
      const fullQuestionKey = `${questionNumber}. ${question.label}`;
      
      if (questionsState.aiSuggestions[fullQuestionKey]) {
        setAiSuggestion(questionsState.aiSuggestions[fullQuestionKey]);
        return true;
      }
    }
    setAiSuggestion('');
    return false;
  }, [questionsState.aiSuggestions]);

  return {
    aiSuggestion,
    setAiSuggestion,
    isLoadingFirstSuggestion,
    isGeneratingSuggestion,
    getAISuggestion,
    generateInitialSuggestions,
    loadSuggestionForQuestion
  };
};

export default useAISuggestions; 