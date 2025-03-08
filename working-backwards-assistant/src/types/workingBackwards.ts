import { WorkingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import { Assumption } from '.';

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
      introduction: string;
      problemStatement: string;
      solution: string;
      stakeholderQuote: string;
      customerJourney: string;
      customerQuote: string;
      callToAction: string;
    };
    customerFaqs: Array<{
      question: string;
      answer: string;
    }>;
    stakeholderFaqs: Array<{
      question: string;
      answer: string;
    }>;
  };
  assumptions?: Assumption[];
  experiments?: Array<{
    id: string;
    name: string;
    hypothesis: string;
    methodology: string;
    successCriteria: string;
    status: 'planned' | 'in-progress' | 'completed';
    results?: string;
    relatedAssumptions: string[]; // Array of assumption IDs
  }>;
}

// Type for the list of processes shown on the dashboard
export interface WorkingBackwardsProcessSummary {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
} 