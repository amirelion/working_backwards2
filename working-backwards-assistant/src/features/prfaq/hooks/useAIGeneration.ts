import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { WorkingBackwardsResponses, PRFAQ as BackendPRFAQ, AIRequest } from '../../../types';
import {
  getAIResponse, 
  getHeadlinePrompt,
  getFirstParagraphPrompt,
  getSecondParagraphPrompt,
  getThirdParagraphPrompt,
  getFourthParagraphPrompt,
  getFifthParagraphPrompt,
  getSixthParagraphPrompt,
  getCallToActionPrompt,
  getCustomerFAQPrompt,
  getStakeholderFAQPrompt,
  getSingleCustomerFAQPrompt,
  getSingleStakeholderFAQPrompt,
  getExperimentSuggestionsPrompt
} from '../../../services/aiService';
import { PRFAQState, updatePRFAQTitle, updatePRFAQPressRelease, addCustomerFAQ, addStakeholderFAQ } from '../../../store/prfaqSlice';
import { formatPRFAQContext } from '../../../features/ai-services/utils/formatters';
import { store } from '../../../store';

// Get environment variables for AI model/provider
const AI_PROVIDER = process.env.REACT_APP_AI_PROVIDER || 'openai';
const AI_MODEL = process.env.REACT_APP_AI_MODEL || 'gpt-4o-mini';

/**
 * Convert PRFAQState to backend PRFAQ format for prompts
 */
const convertPRFAQStateToBackendPRFAQ = (prfaq: PRFAQState): Partial<BackendPRFAQ> => {
  return {
    title: prfaq.title,
    date: new Date().toISOString(),
    pressRelease: {
      summary: prfaq.pressRelease.introduction,
      problem: prfaq.pressRelease.problemStatement,
      solution: prfaq.pressRelease.solution,
      executiveQuote: prfaq.pressRelease.stakeholderQuote,
      customerJourney: prfaq.pressRelease.customerJourney,
      customerQuote: prfaq.pressRelease.customerQuote,
      gettingStarted: prfaq.pressRelease.callToAction,
    },
    faq: [],
    customerFaqs: prfaq.customerFaqs,
    stakeholderFaqs: prfaq.stakeholderFaqs,
  };
};

/**
 * Create standard AI request object with prompt
 */
const createAIRequest = (prompt: string): AIRequest => {
  return {
    prompt,
    model: AI_MODEL,
    provider: AI_PROVIDER
  };
};

/**
 * Custom hook for AI generation functionality related to PRFAQ
 */
export const useAIGeneration = (
  prfaq: PRFAQState,
  workingBackwardsResponses: WorkingBackwardsResponses | null
) => {
  const dispatch = useDispatch();
  const [isGeneratingPRFAQ, setIsGeneratingPRFAQ] = useState(false);
  const [isGeneratingCustomerFAQ, setIsGeneratingCustomerFAQ] = useState(false);
  const [isGeneratingStakeholderFAQ, setIsGeneratingStakeholderFAQ] = useState(false);
  const [generatingSection, setGeneratingSection] = useState<string>('');
  const [generationStep, setGenerationStep] = useState<string>('');
  
  // Helper to check if working backwards responses are available
  const hasWorkingBackwardsResponses = workingBackwardsResponses !== null && 
    Object.keys(workingBackwardsResponses).length > 0;

  // Convert PRFAQState to BackendPRFAQ for use with prompt functions
  const backendPRFAQ = convertPRFAQStateToBackendPRFAQ(prfaq);

  /**
   * Generate a specific section of the press release
   */
  const generateSection = async (section: string, comment?: string) => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingPRFAQ(true);
    setGeneratingSection(section);
    let prompt;
    let promptResponse;

    try {
      // Select the appropriate prompt based on the section
      switch (section) {
        case 'title':
          prompt = getHeadlinePrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQTitle(promptResponse.content.trim()));
          }
          break;
          
        case 'introduction':
          prompt = getFirstParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'introduction', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'problemStatement':
          prompt = getSecondParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'problemStatement', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'solution':
          prompt = getThirdParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'solution', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'stakeholderQuote':
          prompt = getFourthParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'stakeholderQuote', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'customerJourney':
          prompt = getFifthParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'customerJourney', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'customerQuote':
          prompt = getSixthParagraphPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'customerQuote', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        case 'callToAction':
          prompt = getCallToActionPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
          promptResponse = await getAIResponse(createAIRequest(prompt));
          if (promptResponse.content) {
            dispatch(updatePRFAQPressRelease({ 
              field: 'callToAction', 
              value: promptResponse.content.trim()
            }));
          }
          break;
          
        default:
          break;
      }
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
    } finally {
      setIsGeneratingPRFAQ(false);
      setGeneratingSection('');
    }
  };

  /**
   * Generate the complete PRFAQ
   */
  const generateFullPRFAQ = async () => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingPRFAQ(true);
    
    try {
      // Generate title
      setGenerationStep('Generating title...');
      await generateSection('title');
      
      // Generate introduction
      setGenerationStep('Generating introduction...');
      await generateSection('introduction');
      
      // Generate problem statement
      setGenerationStep('Generating problem statement...');
      await generateSection('problemStatement');
      
      // Generate solution
      setGenerationStep('Generating solution...');
      await generateSection('solution');
      
      // Generate stakeholder quote
      setGenerationStep('Generating executive quote...');
      await generateSection('stakeholderQuote');
      
      // Generate customer journey
      setGenerationStep('Generating customer journey...');
      await generateSection('customerJourney');
      
      // Generate customer quote
      setGenerationStep('Generating customer quote...');
      await generateSection('customerQuote');
      
      // Generate call to action
      setGenerationStep('Generating call to action...');
      await generateSection('callToAction');
      
      setGenerationStep('Complete!');
    } catch (error) {
      console.error('Error generating full PRFAQ:', error);
    } finally {
      setIsGeneratingPRFAQ(false);
      setGenerationStep('');
    }
  };

  /**
   * Generate customer FAQs
   */
  const generateCustomerFAQs = async (comment?: string) => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingCustomerFAQ(true);
    
    try {
      const prompt = getCustomerFAQPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
      const promptResponse = await getAIResponse(createAIRequest(prompt));
      
      if (promptResponse.content) {
        // Parse the response to extract FAQs
        const faqText = promptResponse.content;
        const faqRegex = /Q:(.+?)\s*A:(.+?)(?=Q:|$)/gs;
        let match;
        
        while ((match = faqRegex.exec(faqText)) !== null) {
          const question = match[1].trim();
          const answer = match[2].trim();
          
          if (question && answer) {
            dispatch(addCustomerFAQ({ question, answer }));
          }
        }
      }
    } catch (error) {
      console.error('Error generating customer FAQs:', error);
    } finally {
      setIsGeneratingCustomerFAQ(false);
    }
  };

  /**
   * Generate a single customer FAQ
   */
  const generateSingleCustomerFAQ = async (comment?: string) => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingCustomerFAQ(true);
    
    try {
      const prompt = getSingleCustomerFAQPrompt(
        workingBackwardsResponses!,
        backendPRFAQ,
        prfaq.customerFaqs,
        comment
      );
      const promptResponse = await getAIResponse(createAIRequest(prompt));
      
      if (promptResponse.content) {
        // Parse the response to extract FAQ
        const faqText = promptResponse.content;
        const questionMatch = /Q:(.+)/.exec(faqText);
        const answerMatch = /A:(.+)/s.exec(faqText);
        
        if (questionMatch && answerMatch) {
          const question = questionMatch[1].trim();
          const answer = answerMatch[1].trim();
          
          if (question && answer) {
            dispatch(addCustomerFAQ({ question, answer }));
          }
        }
      }
    } catch (error) {
      console.error('Error generating single customer FAQ:', error);
    } finally {
      setIsGeneratingCustomerFAQ(false);
    }
  };

  /**
   * Generate stakeholder FAQs
   */
  const generateStakeholderFAQs = async (comment?: string) => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingStakeholderFAQ(true);
    
    try {
      const prompt = getStakeholderFAQPrompt(workingBackwardsResponses!, backendPRFAQ, comment);
      const promptResponse = await getAIResponse(createAIRequest(prompt));
      
      if (promptResponse.content) {
        // Parse the response to extract FAQs
        const faqText = promptResponse.content;
        const faqRegex = /Q:(.+?)\s*A:(.+?)(?=Q:|$)/gs;
        let match;
        
        while ((match = faqRegex.exec(faqText)) !== null) {
          const question = match[1].trim();
          const answer = match[2].trim();
          
          if (question && answer) {
            dispatch(addStakeholderFAQ({ question, answer }));
          }
        }
      }
    } catch (error) {
      console.error('Error generating stakeholder FAQs:', error);
    } finally {
      setIsGeneratingStakeholderFAQ(false);
    }
  };

  /**
   * Generate a single stakeholder FAQ
   */
  const generateSingleStakeholderFAQ = async (comment?: string) => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingStakeholderFAQ(true);
    
    try {
      const prompt = getSingleStakeholderFAQPrompt(
        workingBackwardsResponses!,
        backendPRFAQ,
        prfaq.stakeholderFaqs,
        comment
      );
      const promptResponse = await getAIResponse(createAIRequest(prompt));
      
      if (promptResponse.content) {
        // Parse the response to extract FAQ
        const faqText = promptResponse.content;
        const questionMatch = /Q:(.+)/.exec(faqText);
        const answerMatch = /A:(.+)/s.exec(faqText);
        
        if (questionMatch && answerMatch) {
          const question = questionMatch[1].trim();
          const answer = answerMatch[1].trim();
          
          if (question && answer) {
            dispatch(addStakeholderFAQ({ question, answer }));
          }
        }
      }
    } catch (error) {
      console.error('Error generating single stakeholder FAQ:', error);
    } finally {
      setIsGeneratingStakeholderFAQ(false);
    }
  };

  /**
   * Generate the complete PRFAQ sequentially, passing context between sections
   * This approach ensures each section builds on the previous ones
   */
  const generateSequentialPRFAQ = async () => {
    if (!hasWorkingBackwardsResponses) return;
    
    setIsGeneratingPRFAQ(true);
    
    try {
      // Generate title
      setGenerationStep('Generating title (1/8)...');
      await generateSection('title');
      
      // Get updated state after title generation
      const updatedPRFAQ = store.getState().prfaq;
      
      // Generate introduction using title as context
      setGenerationStep('Generating introduction (2/8)...');
      const introContext = formatPRFAQContext(workingBackwardsResponses!, updatedPRFAQ);
      const introPrompt = getFirstParagraphPrompt(workingBackwardsResponses!, updatedPRFAQ);
      
      try {
        const introResponse = await getAIResponse(createAIRequest(introPrompt));
        if (introResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'introduction', 
            value: introResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating introduction:', error);
      }
      
      // Get updated state again
      const updatedWithIntro = store.getState().prfaq;
      
      // Generate problem statement using title and intro as context
      setGenerationStep('Generating problem statement (3/8)...');
      const problemPrompt = getSecondParagraphPrompt(workingBackwardsResponses!, updatedWithIntro);
      
      try {
        const problemResponse = await getAIResponse(createAIRequest(problemPrompt));
        if (problemResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'problemStatement', 
            value: problemResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating problem statement:', error);
      }
      
      // Get updated state again
      const updatedWithProblem = store.getState().prfaq;
      
      // Generate solution using title, intro, and problem as context
      setGenerationStep('Generating solution (4/8)...');
      const solutionPrompt = getThirdParagraphPrompt(workingBackwardsResponses!, updatedWithProblem);
      
      try {
        const solutionResponse = await getAIResponse(createAIRequest(solutionPrompt));
        if (solutionResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'solution', 
            value: solutionResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating solution:', error);
      }
      
      // Get updated state again
      const updatedWithSolution = store.getState().prfaq;
      
      // Generate stakeholder quote
      setGenerationStep('Generating executive quote (5/8)...');
      const quotePrompt = getFourthParagraphPrompt(workingBackwardsResponses!, updatedWithSolution);
      
      try {
        const quoteResponse = await getAIResponse(createAIRequest(quotePrompt));
        if (quoteResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'stakeholderQuote', 
            value: quoteResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating executive quote:', error);
      }
      
      // Get updated state again
      const updatedWithQuote = store.getState().prfaq;
      
      // Generate customer journey
      setGenerationStep('Generating customer journey (6/8)...');
      const journeyPrompt = getFifthParagraphPrompt(workingBackwardsResponses!, updatedWithQuote);
      
      try {
        const journeyResponse = await getAIResponse(createAIRequest(journeyPrompt));
        if (journeyResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'customerJourney', 
            value: journeyResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating customer journey:', error);
      }
      
      // Get updated state again
      const updatedWithJourney = store.getState().prfaq;
      
      // Generate customer quote
      setGenerationStep('Generating customer quote (7/8)...');
      const customerQuotePrompt = getSixthParagraphPrompt(workingBackwardsResponses!, updatedWithJourney);
      
      try {
        const customerResponse = await getAIResponse(createAIRequest(customerQuotePrompt));
        if (customerResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'customerQuote', 
            value: customerResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating customer quote:', error);
      }
      
      // Get updated state again
      const updatedWithCustomerQuote = store.getState().prfaq;
      
      // Generate call to action
      setGenerationStep('Generating call to action (8/8)...');
      const ctaPrompt = getCallToActionPrompt(workingBackwardsResponses!, updatedWithCustomerQuote);
      
      try {
        const ctaResponse = await getAIResponse(createAIRequest(ctaPrompt));
        if (ctaResponse.content) {
          dispatch(updatePRFAQPressRelease({ 
            field: 'callToAction', 
            value: ctaResponse.content.trim()
          }));
        }
      } catch (error) {
        console.error('Error generating call to action:', error);
      }
      
      setGenerationStep('Complete!');
    } catch (error) {
      console.error('Error generating sequential PRFAQ:', error);
    } finally {
      setIsGeneratingPRFAQ(false);
      setGenerationStep('');
    }
  };

  return {
    isGeneratingPRFAQ,
    isGeneratingCustomerFAQ,
    isGeneratingStakeholderFAQ,
    generationStep,
    generateSection,
    generateFullPRFAQ,
    generateSequentialPRFAQ,
    generateCustomerFAQs,
    generateSingleCustomerFAQ,
    generateStakeholderFAQs,
    generateSingleStakeholderFAQ,
  };
};

export default useAIGeneration; 