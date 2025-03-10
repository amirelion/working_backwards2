import { PRFAQState } from '../../../store/prfaqSlice';
import { ExportFormat, PRFAQ as BackendPRFAQ } from '../../../types';
import { exportPRFAQ } from '../../../utils/exportUtils';

/**
 * Handles exporting the PRFAQ in various formats
 */
export const handleExport = (prfaq: PRFAQState, format: ExportFormat): void => {
  // Convert from Redux state format to the backend format expected by exportPRFAQ
  const backendPRFAQ: BackendPRFAQ = {
    title: prfaq.title,
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
    customerFaqs: prfaq.customerFaqs.map(faq => ({
      question: faq.question,
      answer: faq.answer,
    })),
    stakeholderFaqs: prfaq.stakeholderFaqs.map(faq => ({
      question: faq.question,
      answer: faq.answer,
    })),
  };

  // Call the export utility with the formatted data
  exportPRFAQ(backendPRFAQ, format);
};

/**
 * Interface mapping between UI field names and backend field names
 */
export interface PRFAQMapping {
  uiToBackend: {
    [key: string]: keyof BackendPRFAQ['pressRelease'];
  };
  backendToUi: {
    [K in keyof BackendPRFAQ['pressRelease']]: string;
  };
}

/**
 * Mapping between UI fields and backend fields
 */
export const prfaqMapping: PRFAQMapping = {
  uiToBackend: {
    'introduction': 'summary',
    'problemStatement': 'problem',
    'solution': 'solution',
    'stakeholderQuote': 'executiveQuote',
    'customerJourney': 'customerJourney',
    'customerQuote': 'customerQuote',
    'callToAction': 'gettingStarted',
  },
  backendToUi: {
    'summary': 'introduction',
    'problem': 'problemStatement',
    'solution': 'solution',
    'executiveQuote': 'stakeholderQuote',
    'customerJourney': 'customerJourney',
    'customerQuote': 'customerQuote',
    'gettingStarted': 'callToAction',
  },
};

const exportUtils = { handleExport, prfaqMapping };
export default exportUtils; 