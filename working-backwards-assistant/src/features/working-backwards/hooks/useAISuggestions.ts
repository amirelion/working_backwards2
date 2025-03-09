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

/**
 * Custom hook for getting AI suggestions for working backwards questions
 */
export const useAISuggestions = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use Redux instead of Recoil
  const questionsState = useAppSelector(selectQuestions);
  const dispatch = useAppDispatch();

  /**
   * Get a suggestion for a single question
   */
  const getSuggestion = useCallback(async (question: WorkingBackwardsQuestion, initialThoughts: string) => {
    if (!question) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Set up context from existing answers
      const context: Record<string, string> = {};
      for (const q of Object.values(question.context || [])) {
        if (questionsState[q] && questionsState[q].trim()) {
          context[q] = questionsState[q];
        }
      }
      
      // Generate the prompt
      const prompt = getWorkingBackwardsPrompt({
        question: question.prompt,
        initialThoughts,
        context
      });
      
      // Get response from AI service
      const response = await getAIResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 300
      });
      
      if (!response.error) {
        // Store the AI suggestion in Redux
        const updatedSuggestions = {
          ...questionsState.aiSuggestions,
          [question.id]: response.content
        };
        
        dispatch(setAISuggestions(updatedSuggestions));
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error getting suggestion:', err);
      setError('Failed to get AI suggestion. Please try again.');
    } finally {
      setLoading(false);
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
  const generateAllSuggestions = useCallback(async (initialThoughts: string, questions: WorkingBackwardsQuestion[]) => {
    if (!initialThoughts.trim() || !questions.length) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Find questions without answers
      const unansweredQuestions = questions.filter(q => 
        !questionsState[q.id] || !questionsState[q.id].trim()
      );
      
      if (!unansweredQuestions.length) {
        setLoading(false);
        return;
      }
      
      // Generate the full context for all questions
      const contextObj: Record<string, string> = {};
      for (const q of questions) {
        if (questionsState[q.id] && questionsState[q.id].trim()) {
          contextObj[q.id] = questionsState[q.id];
        }
      }
      
      // Create a local copy of suggestions
      const suggestions = { ...questionsState.aiSuggestions };
      
      // Process each unanswered question
      for (const question of unansweredQuestions) {
        const fullQuestionKey = question.id;
        
        // Generate the prompt
        const prompt = getWorkingBackwardsPrompt({
          question: question.prompt,
          initialThoughts,
          context: contextObj
        });
        
        // Get response from AI service
        const response = await getAIResponse({
          prompt,
          temperature: 0.7,
          maxTokens: 300
        });
        
        if (!response.error) {
          suggestions[fullQuestionKey] = response.content;
          // Use string for indexing since it's a record
          if (typeof question.id === 'string') {
            contextObj[question.id] = response.content;
          }
          
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
    }
  }, [questionsState, dispatch]);

  return {
    loading,
    error,
    getSuggestion,
    useSuggestion,
    generateAllSuggestions
  };
}; 