import { useState, useCallback } from 'react';
import { getAIResponse, getWorkingBackwardsPrompt } from '../../../services/aiService';
import { WorkingBackwardsQuestion } from '../constants/questions';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { 
  selectQuestions, 
  setAISuggestions,
  updateQuestionField 
} from '../../../store/workingBackwardsSlice';
import { WorkingBackwardsQuestionsState } from '../../../types/WorkingBackwardsQuestionsState';
import { selectInitialThoughts, selectSkipInitialThoughts } from '../../../store/initialThoughtsSlice';

/**
 * Custom hook for getting AI suggestions for working backwards questions
 */
export const useAISuggestions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingFirstSuggestion, setIsLoadingFirstSuggestion] = useState<boolean>(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);
  
  // Use Redux instead of Recoil
  const questionsState = useAppSelector(selectQuestions);
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  const dispatch = useAppDispatch();

  /**
   * Get a suggestion for a single question
   */
  const getSuggestion = useCallback(async (question: WorkingBackwardsQuestion, initialThoughtsInput: string) => {
    if (!question) return;
    
    setLoading(true);
    setIsGeneratingSuggestion(true);
    setError(null);
    
    try {
      // Set up context from existing answers
      const contextObj: Record<string, string> = {};
      Object.entries(questionsState)
        .filter(([key]) => key !== 'aiSuggestions' && key !== question.id)
        .forEach(([key, value]) => {
          if (typeof value === 'string') {
            contextObj[key] = value;
          }
        });
      
      // Generate the prompt - call with the correct separate parameters
      const prompt = getWorkingBackwardsPrompt(
        question.aiPrompt,
        contextObj,
        initialThoughtsInput
      );
      
      // Get response from AI service with correct parameters
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (!response.error) {
        // Store the AI suggestion in Redux and local state
        const updatedSuggestions = {
          ...questionsState.aiSuggestions,
          [question.id]: response.content
        };
        
        setAiSuggestion(response.content);
        dispatch(setAISuggestions(updatedSuggestions));
      } else {
        setError(response.error);
        setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
      }
    } catch (err) {
      console.error('Error getting suggestion:', err);
      setError('Failed to get AI suggestion. Please try again.');
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setLoading(false);
      setIsGeneratingSuggestion(false);
    }
  }, [questionsState, dispatch]);

  /**
   * Use a suggestion as the response to a question
   */
  const useSuggestion = useCallback((questionId: string) => {
    // Get the suggestion for this question
    const suggestion = questionsState.aiSuggestions[questionId];
    if (!suggestion) return;
    
    // Update the question field
    dispatch(updateQuestionField({
      field: questionId as keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>,
      value: suggestion
    }));
  }, [questionsState.aiSuggestions, dispatch]);

  /**
   * Generate suggestions for all questions that don't have answers yet
   */
  const generateAllSuggestions = useCallback(async (initialThoughtsInput: string, questions: WorkingBackwardsQuestion[]) => {
    if (!initialThoughtsInput.trim() || !questions.length || skipInitialThoughts) return;
    
    setLoading(true);
    setIsLoadingFirstSuggestion(true);
    setError(null);
    
    try {
      // Find questions without answers
      const unansweredQuestions = questions.filter(q => 
        !questionsState[q.id] || !questionsState[q.id].trim()
      );
      
      if (!unansweredQuestions.length) {
        setLoading(false);
        setIsLoadingFirstSuggestion(false);
        return;
      }
      
      // Generate the full context for all questions
      const contextObj: Record<string, string> = {};
      for (const q of questions) {
        if (questionsState[q.id] && questionsState[q.id].trim()) {
          contextObj[q.id] = questionsState[q.id];
        }
      }
      
      // Create a fresh empty object for suggestions to avoid the "not extensible" error
      const suggestions: Record<string, string> = {};
      
      // Process each unanswered question
      for (const question of unansweredQuestions) {
        const fullQuestionKey = question.id;
        
        // Generate the prompt - call with the correct separate parameters
        const prompt = getWorkingBackwardsPrompt(
          question.aiPrompt,
          contextObj,
          initialThoughtsInput
        );
        
        // Get response from AI service with correct parameters
        const response = await getAIResponse({
          prompt,
          model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
          provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
        });
        
        if (!response.error) {
          suggestions[fullQuestionKey] = response.content;
          // Update suggestions in Redux state
          dispatch(setAISuggestions(suggestions));
        } else {
          setError(response.error);
          break;
        }
      }
    } catch (err) {
      console.error('Error generating suggestions:', err);
      setError('Failed to generate AI suggestions. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingFirstSuggestion(false);
    }
  }, [questionsState, dispatch, skipInitialThoughts]);

  /**
   * Generate initial suggestions for all questions
   */
  const generateInitialSuggestions = useCallback(async (questionsList: WorkingBackwardsQuestion[], currentStep: number) => {
    // Don't generate suggestions if the user skipped initial thoughts or if there are no initial thoughts
    if (skipInitialThoughts || !initialThoughts.trim()) {
      return;
    }
    
    setIsLoadingFirstSuggestion(true);
    
    try {
      await generateAllSuggestions(initialThoughts, questionsList);
    } finally {
      setIsLoadingFirstSuggestion(false);
    }
  }, [skipInitialThoughts, initialThoughts, generateAllSuggestions]);

  /**
   * Load a suggestion for a specific question
   */
  const loadSuggestionForQuestion = useCallback((currentQuestion: WorkingBackwardsQuestion, currentStep: number) => {
    if (skipInitialThoughts || !initialThoughts.trim()) {
      return;
    }
    
    getSuggestion(currentQuestion, initialThoughts);
  }, [skipInitialThoughts, initialThoughts, getSuggestion]);

  return {
    loading,
    error,
    aiSuggestion,
    isLoadingFirstSuggestion,
    isGeneratingSuggestion,
    getSuggestion,
    useSuggestion,
    generateAllSuggestions,
    generateInitialSuggestions,
    loadSuggestionForQuestion
  };
}; 