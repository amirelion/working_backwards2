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
  const getSuggestion = useCallback(async (question: WorkingBackwardsQuestion, currentStep: number, initialThoughtsInput: string) => {
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
      
      // Generate the prompt with context
      const prompt = getWorkingBackwardsPrompt(
        question.aiPrompt,
        contextObj,
        initialThoughtsInput
      );
      
      // Get response from AI service
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
        provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
      });
      
      if (!response.error) {
        // Format the key like in the main branch for consistency
        const fullQuestionKey = `${currentStep + 1}. ${question.label}`;
        
        // Store the AI suggestion in Redux and local state
        const updatedSuggestions = {
          ...questionsState.aiSuggestions,
          [fullQuestionKey]: response.content
        };
        
        setAiSuggestion(response.content);
        dispatch(setAISuggestions(updatedSuggestions));
      } else {
        console.error('AI suggestion error:', response.error);
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
  const useSuggestion = useCallback((questionId: string, step: number, questionLabel: string) => {
    // Format key like in main branch
    const fullQuestionKey = `${step + 1}. ${questionLabel}`;
    
    // Get the suggestion for this question
    const suggestion = questionsState.aiSuggestions[fullQuestionKey];
    if (!suggestion) return;
    
    // Update the question field
    dispatch(updateQuestionField({
      field: questionId as keyof Omit<WorkingBackwardsQuestionsState, 'aiSuggestions'>,
      value: suggestion
    }));
  }, [questionsState.aiSuggestions, dispatch]);

  /**
   * Generate suggestions for all questions sequentially with context building
   */
  const generateAllSuggestions = useCallback(async (initialThoughtsInput: string, questions: WorkingBackwardsQuestion[]) => {
    if (!initialThoughtsInput.trim() || !questions.length || skipInitialThoughts) return;
    
    setLoading(true);
    setIsLoadingFirstSuggestion(true);
    setError(null);
    
    try {
      // Create context object from existing responses
      const contextObj: Record<string, string> = {};
      
      // Important: Get existing answers to build initial context
      for (const q of questions) {
        if (questionsState[q.id] && questionsState[q.id].trim()) {
          contextObj[q.id] = questionsState[q.id];
        }
      }
      
      // Create a fresh empty object for all suggestions
      const allSuggestions: Record<string, string> = { ...questionsState.aiSuggestions };
      
      // Process each question sequentially to build context
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        const questionNumber = i + 1;
        const fullQuestionKey = `${questionNumber}. ${question.label}`;
        
        // Skip questions that already have answers
        if (questionsState[question.id] && questionsState[question.id].trim()) {
          continue;
        }
        
        try {
          console.log(`Generating suggestion for question: ${question.label}`);
          
          // Generate the prompt using accumulated context
          const prompt = getWorkingBackwardsPrompt(
            question.aiPrompt,
            contextObj,
            initialThoughtsInput
          );
          
          // Get response from AI service
          const response = await getAIResponse({
            prompt,
            model: process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini',
            provider: process.env.REACT_APP_AI_PROVIDER || 'openai'
          });
          
          if (!response.error) {
            // Store suggestion in our local object
            allSuggestions[fullQuestionKey] = response.content;
            
            // Key aspect: Add this suggestion to context for next questions
            contextObj[question.id] = response.content;
            
            // Update Redux state with all suggestions so far
            dispatch(setAISuggestions({...allSuggestions}));
            
            // Show the suggestion for the current active question
            if (i === 0) {
              setAiSuggestion(response.content);
            }
          } else {
            console.error('Error generating suggestion:', response.error);
            setError(`Error generating suggestions: ${response.error}`);
            break;
          }
        } catch (err) {
          console.error('Error in suggestion generation loop:', err);
          setError(`Error generating suggestions: ${err instanceof Error ? err.message : String(err)}`);
          break;
        }
      }
    } catch (err) {
      console.error('Error in generateAllSuggestions:', err);
      setError(`Error generating suggestions: ${err instanceof Error ? err.message : String(err)}`);
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
    
    // Format key like in main branch
    const fullQuestionKey = `${currentStep + 1}. ${currentQuestion.label}`;
    
    // Check if we already have a suggestion for this question
    if (questionsState.aiSuggestions && questionsState.aiSuggestions[fullQuestionKey]) {
      setAiSuggestion(questionsState.aiSuggestions[fullQuestionKey]);
    } else {
      // Generate suggestion if we don't have one yet
      getSuggestion(currentQuestion, currentStep, initialThoughts);
    }
  }, [skipInitialThoughts, initialThoughts, getSuggestion, questionsState.aiSuggestions]);

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

// Add default export for backward compatibility
export default useAISuggestions; 