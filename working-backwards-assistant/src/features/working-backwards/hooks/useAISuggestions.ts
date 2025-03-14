import { useState, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { 
  selectAISuggestions, 
  addAISuggestion
} from '../../../store/workingBackwardsSlice';
import { getAIResponse, getWorkingBackwardsPrompt } from '../../../services/aiService';
import { WorkingBackwardsQuestion } from '../constants/questions';
import { 
  selectInitialThoughts, 
  selectSkipInitialThoughts
} from '../../../store/initialThoughtsSlice';
import { useCurrentProcess } from '../../../hooks/useCurrentProcess';

/**
 * Custom hook for managing AI suggestions in the Working Backwards process
 */
export const useAISuggestions = () => {
  const aiSuggestions = useAppSelector(selectAISuggestions);
  const dispatch = useAppDispatch();
  const initialThoughts = useAppSelector(selectInitialThoughts);
  const skipInitialThoughts = useAppSelector(selectSkipInitialThoughts);
  const questionsState = useAppSelector((state: any) => state.workingBackwards.questions);
  const { setIsModified, saveCurrentProcess } = useCurrentProcess();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isLoadingFirstSuggestion, setIsLoadingFirstSuggestion] = useState<boolean>(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState<boolean>(false);

  /**
   * Get a suggestion for a single question
   */
  const getSuggestion = useCallback(async (question: WorkingBackwardsQuestion, currentStep: number, initialThoughtsInput: string) => {
    if (!question) return;
    
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
      
      // Generate the prompt with context
      const prompt = getWorkingBackwardsPrompt(
        question.promptKey,
        contextObj,
        initialThoughtsInput
      );
      
      // Call the AI service
      const response = await getAIResponse({
        prompt: prompt,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (response.error) {
        console.error('AI suggestion error:', response.error);
        setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
      } else {
        setAiSuggestion(response.content);
        
        // Store the suggestion using Redux dispatch
        const questionKey = `${currentStep + 1}. ${question.label}`;
        dispatch(addAISuggestion({ 
          question: questionKey, 
          suggestion: response.content 
        }));
        
        // Mark as modified
        setIsModified(true);
        
        // Try to save the process after generating a suggestion
        try {
          await saveCurrentProcess();
        } catch (error) {
          console.error('Error saving process after generating suggestion:', error);
        }
      }
    } catch (error) {
      console.error('Error getting AI suggestion:', error);
      setAiSuggestion('Sorry, I couldn\'t generate a suggestion at this time. Please try again later.');
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [initialThoughts, dispatch, questionsState, setIsModified, saveCurrentProcess]);

  /**
   * Generate suggestions for all questions sequentially with context building
   */
  const generateAllSuggestions = useCallback(async (initialThoughtsInput: string, questions: WorkingBackwardsQuestion[]) => {
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
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionNumber = i + 1;
        const fullQuestionKey = `${questionNumber}. ${question.label}`;
        
        // Generate the prompt using accumulated context
        const prompt = getWorkingBackwardsPrompt(
          question.promptKey,
          contextObj,
          initialThoughtsInput
        );
        
        // Call the AI service
        const response = await getAIResponse({
          prompt: prompt,
          model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
          provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
        });
        
        if (!response.error) {
          suggestions[fullQuestionKey] = response.content;
          contextObj[question.id] = response.content;
          
          // Update suggestions in state using Redux dispatch
          dispatch(addAISuggestion({ 
            question: fullQuestionKey, 
            suggestion: response.content 
          }));
          
          // Mark as modified
          setIsModified(true);
          
          // If this is the first question and we're still on it, show the suggestion
          if (i === 0) {
            setAiSuggestion(response.content);
          }
        }
      }
      
      // Save after generating all suggestions
      try {
        await saveCurrentProcess();
      } catch (error) {
        console.error('Error saving process after generating initial suggestions:', error);
      }
    } catch (error) {
      console.error('Error generating initial AI suggestions:', error);
    } finally {
      setIsLoadingFirstSuggestion(false);
    }
  }, [initialThoughts, dispatch, skipInitialThoughts, setIsModified, saveCurrentProcess]);

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
  }, [skipInitialThoughts, generateAllSuggestions]);

  /**
   * Load a suggestion for the current question from state
   */
  const loadSuggestionForQuestion = useCallback((question: WorkingBackwardsQuestion, step: number) => {
    if (aiSuggestions) {
      const questionNumber = step + 1;
      const fullQuestionKey = `${questionNumber}. ${question.label}`;
      
      if (aiSuggestions[fullQuestionKey]) {
        setAiSuggestion(aiSuggestions[fullQuestionKey]);
        return true;
      }
    }
    setAiSuggestion('');
    return false;
  }, [aiSuggestions]);

  return {
    loading,
    error,
    aiSuggestion,
    isLoadingFirstSuggestion,
    isGeneratingSuggestion,
    getSuggestion,
    generateAllSuggestions,
    generateInitialSuggestions,
    loadSuggestionForQuestion
  };
}; 