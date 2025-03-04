import { WorkingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';

// Define structure for a saved Working Backwards process
export interface WorkingBackwardsProcess {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  initialThoughts: string;
  workingBackwardsQuestions: WorkingBackwardsQuestionsState;
  prfaq?: {
    title: string;
    pressRelease: {
      date: string;
      location: string;
      headline: string;
      subheadline: string;
      introduction: string;
      problemStatement: string;
      solution: string;
      customerQuote: string;
      stakeholderQuote: string;
      callToAction: string;
      aboutCompany: string;
    };
    internalFaqs: Array<{
      question: string;
      answer: string;
    }>;
    customerFaqs: Array<{
      question: string;
      answer: string;
    }>;
    stakeholderFaqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  assumptions?: {
    // Will be implemented later
  };
  experiments?: {
    // Will be implemented later
  };
}

// Type for the list of processes shown on the dashboard
export interface WorkingBackwardsProcessSummary {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
} 