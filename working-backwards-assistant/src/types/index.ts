// Session Types
export interface Session {
  id: string;
  createdAt: string;
  updatedAt: string;
  workingBackwardsResponses: WorkingBackwardsResponses;
  prfaq: PRFAQ;
  assumptions: Assumption[];
  experiments: Experiment[];
}

// Working Backwards Response Types
export interface WorkingBackwardsResponses {
  customer: string;
  problem: string;
  benefit: string;
  validation: string;
  experience: string;
}

// PRFAQ Types
export interface PRFAQ {
  title: string;
  date: string;
  pressRelease: {
    summary: string;
    problem: string;
    solution: string;
    executiveQuote: string;
    customerJourney: string;
    customerQuote: string;
    gettingStarted: string;
  };
  faq: FAQ[];
  customerFaqs: FAQ[];
  stakeholderFaqs: FAQ[];
}

export interface FAQ {
  question: string;
  answer: string;
}

// Assumption Types
export interface Assumption {
  id: string;
  statement: string;
  description?: string;
  category?: 'customer' | 'solution' | 'business' | 'market';
  impact: 'high' | 'medium' | 'low';
  confidence: 'high' | 'medium' | 'low';
  priority: number;
  relatedExperiments?: string[];
}

// Experiment Types
export interface Experiment {
  id: string;
  name: string;
  hypothesis: string;
  methodology: string;
  successCriteria: string;
  status: 'planned' | 'in-progress' | 'completed';
  results?: string;
  relatedAssumptions: string[]; // Array of assumption IDs
}

// AI Service Types
export interface AIRequest {
  prompt: string;
  model: string;
  provider: string;
}

export interface AIResponse {
  content: string;
  error?: string;
}

// UI Component Types
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Export Format Types
export type ExportFormat = 'pdf' | 'docx' | 'txt' | 'email' | 'markdown';

// Navigation Types
export interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
} 