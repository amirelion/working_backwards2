import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRecoilValue } from 'recoil';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Typography,
  TextField,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Chip,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  Description as DescriptionIcon,
  TextSnippet as TxtIcon,
  ArrowForward,
  ArrowBack,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AutoFixHigh as AutoFixHighIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../store';
import {
  updatePRFAQTitle,
  updatePRFAQPressRelease,
  addCustomerFAQ,
  updateCustomerFAQ,
  removeCustomerFAQ,
  addStakeholderFAQ,
  updateStakeholderFAQ,
  removeStakeholderFAQ,
  PRFAQState
} from '../store/prfaqSlice';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';
import { format } from 'date-fns';
import {
  getAIResponse, 
  getFirstParagraphPrompt,
  getSecondParagraphPrompt,
  getThirdParagraphPrompt,
  getFourthParagraphPrompt,
  getFifthParagraphPrompt,
  getSixthParagraphPrompt,
  getCallToActionPrompt,
  getHeadlinePrompt,
  getCustomerFAQPrompt,
  getStakeholderFAQPrompt,
  getSingleCustomerFAQPrompt,
  getSingleStakeholderFAQPrompt,
} from '../services/aiService';
import { exportPRFAQ } from '../utils/exportUtils';
import { ExportFormat, FAQ, PRFAQ as BackendPRFAQ, WorkingBackwardsResponses } from '../types';
import { workingBackwardsQuestionsState } from '../atoms/workingBackwardsQuestionsState';
import { useAuth } from '../contexts/AuthContext';

// Define a mapping interface to convert between UI and backend fields
interface PRFAQMapping {
  uiToBackend: {
    [key: string]: keyof BackendPRFAQ['pressRelease'];
  };
  backendToUi: {
    [K in keyof BackendPRFAQ['pressRelease']]: string;
  };
}

// Mapping between UI fields and backend fields
const prfaqMapping: PRFAQMapping = {
  uiToBackend: {
    'introduction': 'summary',
    'problemStatement': 'problem',
    'solution': 'solution',
    'stakeholderQuote': 'executiveQuote',
    'customerJourney': 'customerJourney',
    'customerQuote': 'customerQuote',
    'callToAction': 'gettingStarted'
  },
  backendToUi: {
    'summary': 'introduction',
    'problem': 'problemStatement',
    'solution': 'solution',
    'executiveQuote': 'stakeholderQuote',
    'customerJourney': 'customerJourney',
    'customerQuote': 'customerQuote',
    'gettingStarted': 'callToAction'
  }
};

// Define the PRFAQ type to match the one in workingBackwards.ts
export interface PRFAQ {
  title: string;
  date: string;
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
    // Additional fields used in the UI but not in the backend type
    summary: string;
    problem: string;
    executiveQuote: string;
    customerJourney: string;
    gettingStarted: string;
  };
  faq: Array<{
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
}

// Interface for tab panel props
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Tab Panel component
const TabPanel: React.FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`prfaq-tabpanel-${index}`}
      aria-labelledby={`prfaq-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

// Lazy load ReactQuill to prevent it from mounting until needed
const ReactQuillEditor = lazy(() => import('react-quill-new'));

// Create a wrapper component for ReactQuill that only renders when visible
const LazyReactQuill = ({ value, onChange, style, visible = true }: { 
  value: string, 
  onChange: (value: string) => void, 
  style?: React.CSSProperties,
  visible?: boolean
}) => {
  // Use a ref to track the editor instance
  const editorRef = React.useRef<any>(null);
  
  // Clean up when unmounting
  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          // Attempt to clean up any resources
          editorRef.current = null;
        } catch (e) {
          console.error('Error cleaning up editor:', e);
        }
      }
    };
  }, []);
  
  // Don't render anything if not visible
  if (!visible) {
    return null;
  }
  
  return (
    <Suspense fallback={<div style={{ height: '150px', border: '1px solid #ccc', borderRadius: '4px', padding: '10px' }}>Loading editor...</div>}>
      <div className="quill-container" style={{ position: 'relative' }}>
        <ReactQuillEditor
          ref={editorRef}
          value={value}
          onChange={onChange}
          style={style}
          modules={{
            toolbar: [
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ]
          }}
        />
      </div>
    </Suspense>
  );
};

const PRFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const prfaq = useSelector((state: RootState) => state.prfaq);
  
  // Auth context
  const { currentUser, loading: authLoading } = useAuth();
  
  // Working Backwards context
  const { 
    currentProcessId, 
    saveCurrentProcess, 
    isSaving, 
    lastSaved,
    error: processError
  } = useWorkingBackwards();
  
  // Get the working backwards responses from recoil state
  const workingBackwardsResponses = useRecoilValue(workingBackwardsQuestionsState);
  
  // Get process ID from URL query params
  const queryParams = new URLSearchParams(location.search);
  const processId = queryParams.get('process');
  
  // Track if the content has been modified since last save
  const [isModified, setIsModified] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for press release and FAQs
  const hasWorkingBackwardsResponses = Object.entries(workingBackwardsResponses)
    .filter(([key]) => key !== 'aiSuggestions')
    .every(([_, value]) => typeof value === 'string' && value.trim() !== '');
  
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  // State for generation
  const [isGeneratingPRFAQ, setIsGeneratingPRFAQ] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  
  // New Customer FAQ state
  const [editingCustomerFAQIndex, setEditingCustomerFAQIndex] = useState<number | null>(null);
  const [newCustomerFAQ, setNewCustomerFAQ] = useState<FAQ>({ question: '', answer: '' });
  const [isGeneratingCustomerFAQ, setIsGeneratingCustomerFAQ] = useState(false);
  const [customerFaqComment, setCustomerFaqComment] = useState('');
  
  // New Stakeholder FAQ state
  const [editingStakeholderFAQIndex, setEditingStakeholderFAQIndex] = useState<number | null>(null);
  const [newStakeholderFAQ, setNewStakeholderFAQ] = useState<FAQ>({ question: '', answer: '' });
  const [isGeneratingStakeholderFAQ, setIsGeneratingStakeholderFAQ] = useState(false);
  const [stakeholderFaqComment, setStakeholderFaqComment] = useState('');
  
  // Check if PRFAQ is empty
  const isPRFAQEmpty = !prfaq.title && 
    !prfaq.pressRelease.introduction && 
    !prfaq.pressRelease.problemStatement && 
    !prfaq.pressRelease.solution && 
    !prfaq.pressRelease.stakeholderQuote && 
    !prfaq.pressRelease.customerQuote && 
    !prfaq.pressRelease.callToAction;
    // FAQs temporarily disabled
    // && prfaq.faq.length === 0;

  // Check if any sections have content
  const hasSomeContent = prfaq.title || 
    prfaq.pressRelease.introduction || 
    prfaq.pressRelease.problemStatement || 
    prfaq.pressRelease.solution || 
    prfaq.pressRelease.stakeholderQuote || 
    prfaq.pressRelease.customerQuote || 
    prfaq.pressRelease.callToAction;

  // Reset modified flag when saving completes
  useEffect(() => {
    if (lastSaved) {
      setIsModified(false);
    }
  }, [lastSaved]);
  
  // Show error message if process error occurs
  useEffect(() => {
    if (processError) {
      setSnackbarMessage(processError);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [processError]);

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Prevent switching to FAQ tabs if press release is empty
    if (isPRFAQEmpty && (newValue === 1 || newValue === 2)) {
      return;
    }
    setTabValue(newValue);
  };

  // Handle title change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(updatePRFAQTitle(event.target.value));
    setIsModified(true);
  };

  // Handle press release section change
  const handlePressReleaseChange = (field: keyof typeof prfaq.pressRelease, value: string) => {
    dispatch(updatePRFAQPressRelease({ field, value }));
    setIsModified(true);
  };

  // Handle export menu open
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  // Handle export menu close
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // Fix the mapSectionToFieldName function to return the correct type
  const mapSectionToFieldName = (section: string): keyof PRFAQState['pressRelease'] => {
    // For sections that directly match Redux state field names
    if (section === 'headline' || 
        section === 'introduction' || 
        section === 'problemStatement' || 
        section === 'solution' || 
        section === 'stakeholderQuote' || 
        section === 'customerJourney' || 
        section === 'customerQuote' || 
        section === 'callToAction') {
      return section as keyof PRFAQState['pressRelease'];
    }
    // Map other section names
    switch (section) {
      case 'summary':
        return 'introduction';
      case 'problem':
        return 'problemStatement';
      case 'solution':
        return 'solution';
      case 'executiveQuote':
        return 'stakeholderQuote';
      case 'gettingStarted':
        return 'callToAction';
      default:
        throw new Error(`Unknown section name: ${section}`);
    }
  };

  // Fix the handleExport function
  const handleExport = (format: ExportFormat) => {
    console.log('handleExport called with format:', format);
    
    try {
      // Convert PRFAQState to PRFAQ for export
      const exportablePRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      console.log('Exporting PRFAQ:', {
        title: exportablePRFAQ.title,
        format,
        hasContent: !!exportablePRFAQ.pressRelease.summary
      });
      
      exportPRFAQ(exportablePRFAQ, format);
      handleExportMenuClose();
    } catch (error) {
      console.error('Error in handleExport:', error);
      setSnackbarMessage('Failed to export PRFAQ');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Handle new customer FAQ answer change
  const handleNewCustomerFAQAnswerChange = (value: string) => {
    setNewCustomerFAQ(prev => ({ ...prev, answer: value }));
    setIsModified(true);
  };

  // Handle new customer FAQ question change
  const handleNewCustomerFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomerFAQ(prev => ({ ...prev, question: event.target.value }));
    setIsModified(true);
  };

  // Customer FAQ handlers
  const handleSaveCustomerFAQ = () => {
    if (editingCustomerFAQIndex !== null) {
      // Update existing FAQ
      dispatch(updateCustomerFAQ({
        index: editingCustomerFAQIndex,
        question: newCustomerFAQ.question,
        answer: newCustomerFAQ.answer
      }));
      setEditingCustomerFAQIndex(null);
      setNewCustomerFAQ({ question: '', answer: '' });
    } else {
      // Add new FAQ
      dispatch(addCustomerFAQ(newCustomerFAQ));
      setNewCustomerFAQ({ question: '', answer: '' });
    }
  };

  const handleEditCustomerFAQ = (index: number) => {
    setEditingCustomerFAQIndex(index);
    setNewCustomerFAQ({ ...prfaq.customerFaqs[index] });
  };

  const handleDeleteCustomerFAQ = (index: number) => {
    dispatch(removeCustomerFAQ(index));
    setIsModified(true);
  };

  // Handle customer FAQ comment change
  const handleCustomerFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerFaqComment(event.target.value);
  };

  // Stakeholder FAQ handlers
  const handleNewStakeholderFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewStakeholderFAQ(prev => ({ ...prev, question: event.target.value }));
    setIsModified(true);
  };

  const handleNewStakeholderFAQAnswerChange = (value: string) => {
    setNewStakeholderFAQ(prev => ({ ...prev, answer: value }));
    setIsModified(true);
  };

  const handleSaveStakeholderFAQ = () => {
    if (editingStakeholderFAQIndex !== null) {
      // Update existing FAQ
      dispatch(updateStakeholderFAQ({
        index: editingStakeholderFAQIndex,
        question: newStakeholderFAQ.question,
        answer: newStakeholderFAQ.answer
      }));
      setEditingStakeholderFAQIndex(null);
      setNewStakeholderFAQ({ question: '', answer: '' });
    } else {
      // Add new FAQ
      dispatch(addStakeholderFAQ(newStakeholderFAQ));
      setNewStakeholderFAQ({ question: '', answer: '' });
    }
  };

  const handleDeleteStakeholderFAQ = (index: number) => {
    dispatch(removeStakeholderFAQ(index));
    setIsModified(true);
  };

  // Handle stakeholder FAQ comment change
  const handleStakeholderFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeholderFaqComment(event.target.value);
  };

  // Fix the handleGenerateCustomerFAQs function
  const handleGenerateCustomerFAQs = async () => {
    try {
      setIsGeneratingCustomerFAQ(true);
      
      // Create a copy of the current PRFAQ for the prompt
      const currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      const prompt = getCustomerFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ, 
        customerFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        throw new Error(`Failed to generate customer FAQs: ${response.error}`);
      }
      
      // Parse the response to extract FAQs
      const content = response.content.trim();
      const faqRegex = /\d+\.\s*Q:\s*(.*?)\s*A:\s*([\s\S]*?)(?=\d+\.\s*Q:|$)/g;
      
      let match;
      let newFaqs: FAQ[] = [];
      
      while ((match = faqRegex.exec(content)) !== null) {
        if (match[1] && match[2]) {
          newFaqs.push({
            question: match[1].trim(),
            answer: match[2].trim()
          });
        }
      }
      
      // If we couldn't parse FAQs with the regex, try a simpler approach
      if (newFaqs.length === 0) {
        const lines = content.split('\n');
        let currentQuestion = '';
        let currentAnswer = '';
        let isInQuestion = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('Q:')) {
            // If we have a previous Q&A pair, save it
            if (currentQuestion && currentAnswer) {
              newFaqs.push({
                question: currentQuestion,
                answer: currentAnswer
              });
            }
            // Start a new question
            currentQuestion = trimmedLine.substring(2).trim();
            currentAnswer = '';
            isInQuestion = false;
          } else if (trimmedLine.startsWith('A:')) {
            currentAnswer = trimmedLine.substring(2).trim();
            isInQuestion = true;
          } else if (isInQuestion && trimmedLine) {
            // Continue adding to the answer
            currentAnswer += ' ' + trimmedLine;
          }
        }
        
        // Add the last Q&A pair if it exists
        if (currentQuestion && currentAnswer) {
          newFaqs.push({
            question: currentQuestion,
            answer: currentAnswer
          });
        }
      }
      
      // Add the new FAQs to the store
      newFaqs.forEach(faq => {
        dispatch(addCustomerFAQ(faq));
      });
      
      // Clear the comment
      setCustomerFaqComment('');
      
    } catch (error) {
      console.error('Error generating customer FAQs:', error);
      alert(`Failed to generate customer FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingCustomerFAQ(false);
    }
  };

  // Fix the handleGenerateSingleCustomerFAQ function
  const handleGenerateSingleCustomerFAQ = async () => {
    try {
      setIsGeneratingCustomerFAQ(true);
      
      // Create a copy of the current PRFAQ for the prompt
      const currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      const prompt = getSingleCustomerFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ,
        prfaq.customerFaqs,
        customerFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        throw new Error(`Failed to generate customer FAQ: ${response.error}`);
      }
      
      // Parse the response to extract the FAQ
      const content = response.content.trim();
      const questionMatch = content.match(/Q:\s*([\s\S]*?)(?=\s*A:|$)/);
      const answerMatch = content.match(/A:\s*([\s\S]*?)$/);
      
      if (questionMatch && questionMatch[1] && answerMatch && answerMatch[1]) {
        const newFaq: FAQ = {
          question: questionMatch[1].trim(),
          answer: answerMatch[1].trim()
        };
        
        dispatch(addCustomerFAQ(newFaq));
      } else {
        throw new Error('Failed to parse the generated FAQ');
      }
      
      // Clear the comment
      setCustomerFaqComment('');
      
    } catch (error) {
      console.error('Error generating customer FAQ:', error);
      alert(`Failed to generate customer FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingCustomerFAQ(false);
    }
  };

  // Fix the handleGenerateStakeholderFAQs function
  const handleGenerateStakeholderFAQs = async () => {
    try {
      setIsGeneratingStakeholderFAQ(true);
      
      // Create a copy of the current PRFAQ for the prompt
      const currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      const prompt = getStakeholderFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ, 
        stakeholderFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        throw new Error(`Failed to generate stakeholder FAQs: ${response.error}`);
      }
      
      // Parse the response to extract FAQs
      const content = response.content.trim();
      const faqRegex = /\d+\.\s*Q:\s*(.*?)\s*A:\s*([\s\S]*?)(?=\d+\.\s*Q:|$)/g;
      
      let match;
      let newFaqs: FAQ[] = [];
      
      while ((match = faqRegex.exec(content)) !== null) {
        if (match[1] && match[2]) {
          newFaqs.push({
            question: match[1].trim(),
            answer: match[2].trim()
          });
        }
      }
      
      // If we couldn't parse FAQs with the regex, try a simpler approach
      if (newFaqs.length === 0) {
        const lines = content.split('\n');
        let currentQuestion = '';
        let currentAnswer = '';
        let isInQuestion = false;
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('Q:')) {
            // If we have a previous Q&A pair, save it
            if (currentQuestion && currentAnswer) {
              newFaqs.push({
                question: currentQuestion,
                answer: currentAnswer
              });
            }
            // Start a new question
            currentQuestion = trimmedLine.substring(2).trim();
            currentAnswer = '';
            isInQuestion = false;
          } else if (trimmedLine.startsWith('A:')) {
            currentAnswer = trimmedLine.substring(2).trim();
            isInQuestion = true;
          } else if (isInQuestion && trimmedLine) {
            // Continue adding to the answer
            currentAnswer += ' ' + trimmedLine;
          }
        }
        
        // Add the last Q&A pair if it exists
        if (currentQuestion && currentAnswer) {
          newFaqs.push({
            question: currentQuestion,
            answer: currentAnswer
          });
        }
      }
      
      // Add the new FAQs to the store
      newFaqs.forEach(faq => {
        dispatch(addStakeholderFAQ(faq));
      });
      
      // Clear the comment
      setStakeholderFaqComment('');
      
    } catch (error) {
      console.error('Error generating stakeholder FAQs:', error);
      alert(`Failed to generate stakeholder FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingStakeholderFAQ(false);
    }
  };

  // Fix the handleGenerateSingleStakeholderFAQ function
  const handleGenerateSingleStakeholderFAQ = async () => {
    try {
      setIsGeneratingStakeholderFAQ(true);
      
      // Create a copy of the current PRFAQ for the prompt
      const currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      const prompt = getSingleStakeholderFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ,
        prfaq.stakeholderFaqs,
        stakeholderFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        throw new Error(`Failed to generate stakeholder FAQ: ${response.error}`);
      }
      
      // Parse the response to extract the FAQ
      const content = response.content.trim();
      const questionMatch = content.match(/Q:\s*([\s\S]*?)(?=\s*A:|$)/);
      const answerMatch = content.match(/A:\s*([\s\S]*?)$/);
      
      if (questionMatch && questionMatch[1] && answerMatch && answerMatch[1]) {
        const newFaq: FAQ = {
          question: questionMatch[1].trim(),
          answer: answerMatch[1].trim()
        };
        
        dispatch(addStakeholderFAQ(newFaq));
      } else {
        throw new Error('Failed to parse the generated FAQ');
      }
      
      // Clear the comment
      setStakeholderFaqComment('');
      
    } catch (error) {
      console.error('Error generating stakeholder FAQ:', error);
      alert(`Failed to generate stakeholder FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingStakeholderFAQ(false);
    }
  };

  // Fix the handleGenerateSection function
  const handleGenerateSection = async (section: string) => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingPRFAQ(true);
    
    try {
      // Create a copy of the current PRFAQ for the prompt
      const currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      let sectionName = '';
      let prompt = '';
      
      // Map UI section names to appropriate prompt generators
      switch (section) {
        case 'title':
          sectionName = 'headline';
          prompt = getHeadlinePrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'introduction':
          sectionName = 'first paragraph (summary)';
          prompt = getFirstParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'problemStatement':
          sectionName = 'second paragraph (problem/opportunity)';
          prompt = getSecondParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'solution':
          sectionName = 'third paragraph (solution)';
          prompt = getThirdParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'stakeholderQuote':
          sectionName = 'fourth paragraph (executive quote)';
          prompt = getFourthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'customerJourney':
          sectionName = 'fifth paragraph (customer journey)';
          prompt = getFifthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'customerQuote':
          sectionName = 'sixth paragraph (customer quote)';
          prompt = getSixthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'callToAction':
          sectionName = 'call to action';
          prompt = getCallToActionPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      setGenerationStep(`Generating ${sectionName}...`);
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        throw new Error(`Failed to generate ${sectionName}: ${response.error}`);
      }
      
      if (response) {
        if (section === 'title') {
          dispatch(updatePRFAQTitle(response.content));
        } else {
          // Map the response to the correct field in the Redux state
          const field = mapSectionToFieldName(section);
          dispatch(updatePRFAQPressRelease({ field, value: response.content }));
        }
      }
      
      setSnackbarMessage(`${sectionName} generated successfully!`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
      setSnackbarMessage(`Failed to generate section: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingPRFAQ(false);
      setGenerationStep('');
    }
  };

  // Fix the handleGenerateFullPRFAQ function
  const handleGenerateFullPRFAQ = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }
    
    setIsGeneratingPRFAQ(true);
    
    try {
      // Generate each section sequentially
      const sections = [
        'summary',
        'problem',
        'solution',
        'executiveQuote',
        'customerJourney',
        'customerQuote',
        'gettingStarted',
        'title', // Generate title last as requested
      ];
      
      // Create a copy of the current PRFAQ for the prompt
      let currentPRFAQ: BackendPRFAQ = {
        title: prfaq.title,
        date: prfaq.pressRelease.date || new Date().toISOString().split('T')[0],
        pressRelease: {
          summary: prfaq.pressRelease.introduction || '',
          problem: prfaq.pressRelease.problemStatement || '',
          solution: prfaq.pressRelease.solution || '',
          executiveQuote: prfaq.pressRelease.stakeholderQuote || '',
          customerJourney: prfaq.pressRelease.customerJourney || '',
          customerQuote: prfaq.pressRelease.customerQuote || '',
          gettingStarted: prfaq.pressRelease.callToAction || ''
        },
        faq: prfaq.faqs,
        customerFaqs: prfaq.customerFaqs,
        stakeholderFaqs: prfaq.stakeholderFaqs
      };
      
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        
        // Update generation step
        let sectionName = '';
        switch (section) {
          case 'title':
            sectionName = 'headline';
            break;
          case 'summary':
            sectionName = 'first paragraph (summary)';
            break;
          case 'problem':
            sectionName = 'second paragraph (problem/opportunity)';
            break;
          case 'solution':
            sectionName = 'third paragraph (solution)';
            break;
          case 'executiveQuote':
            sectionName = 'fourth paragraph (executive quote)';
            break;
          case 'customerJourney':
            sectionName = 'fifth paragraph (customer journey)';
            break;
          case 'customerQuote':
            sectionName = 'sixth paragraph (customer quote)';
            break;
          case 'gettingStarted':
            sectionName = 'call to action';
            break;
          default:
            sectionName = section;
        }
        
        setGenerationStep(`Generating ${sectionName} (${i + 1}/${sections.length})...`);
        
        // Generate the section
        let prompt: string;
        if (section === 'title') {
          prompt = getHeadlinePrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'summary') {
          prompt = getFirstParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'problem') {
          prompt = getSecondParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'solution') {
          prompt = getThirdParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'executiveQuote') {
          prompt = getFourthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'customerJourney') {
          prompt = getFifthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'customerQuote') {
          prompt = getSixthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else if (section === 'gettingStarted') {
          prompt = getCallToActionPrompt(workingBackwardsResponses, currentPRFAQ, '');
        } else {
          throw new Error(`Unknown section: ${section}`);
        }
        
        const response = await getAIResponse({
          prompt,
          model: process.env.REACT_APP_AI_MODEL || '',
          provider: process.env.REACT_APP_AI_PROVIDER || '',
        });
        
        if (response.error) {
          throw new Error(`Failed to generate ${sectionName}: ${response.error}`);
        }
        
        if (response) {
          if (section === 'title') {
            dispatch(updatePRFAQTitle(response.content));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.title = response.content;
          } else if (section === 'summary') {
            dispatch(updatePRFAQPressRelease({ field: 'introduction', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.summary = response.content;
          } else if (section === 'problem') {
            dispatch(updatePRFAQPressRelease({ field: 'problemStatement', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.problem = response.content;
          } else if (section === 'solution') {
            dispatch(updatePRFAQPressRelease({ field: 'solution', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.solution = response.content;
          } else if (section === 'executiveQuote') {
            dispatch(updatePRFAQPressRelease({ field: 'stakeholderQuote', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.executiveQuote = response.content;
          } else if (section === 'customerJourney') {
            dispatch(updatePRFAQPressRelease({ field: 'customerJourney', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.customerJourney = response.content;
          } else if (section === 'customerQuote') {
            dispatch(updatePRFAQPressRelease({ field: 'customerQuote', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.customerQuote = response.content;
          } else if (section === 'gettingStarted') {
            dispatch(updatePRFAQPressRelease({ field: 'callToAction', value: response.content }));
            // Update the current PRFAQ for next prompts
            currentPRFAQ.pressRelease.gettingStarted = response.content;
          }
        }
      }
      
      setSnackbarMessage('PRFAQ generated successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
      setIsModified(true);
    } catch (error) {
      console.error('Error generating PRFAQ:', error);
      setSnackbarMessage('Failed to generate PRFAQ. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGeneratingPRFAQ(false);
      setGenerationStep('');
    }
  };

  // Handle continue to assumptions
  const handleContinueToAssumptions = () => {
    // Save the current process before navigating
    if (currentProcessId) {
      saveCurrentProcess()
        .then(() => {
          navigate('/assumptions');
        })
        .catch((error) => {
          console.error('Error saving process:', error);
          setSnackbarMessage('Failed to save process, but continuing to Assumptions');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          navigate('/assumptions');
        });
    } else {
      navigate('/assumptions');
    }
  };

  // Handle back to Working Backwards
  const handleBackToWorkingBackwards = () => {
    // Save the current process before navigating
    if (currentProcessId) {
      saveCurrentProcess()
        .then(() => {
          navigate('/working-backwards');
        })
        .catch((error) => {
          console.error('Error saving process:', error);
          setSnackbarMessage('Failed to save process, but continuing to Working Backwards');
          setSnackbarSeverity('warning');
          setSnackbarOpen(true);
          navigate('/working-backwards');
        });
    } else {
      navigate('/working-backwards');
    }
  };

  // Create a simplified component for section with regenerate button
  const SectionWithRegenerateButton = ({
    section,
    label,
    value,
    onChange,
    rows = 3,
    placeholder 
  }: {
    section: string;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void;
    rows?: number;
    placeholder?: string;
  }) => {
    const hasContent = value && value.trim().length > 0;
    
    return (
      <Grid item xs={12}>
        <Typography variant="subtitle1" gutterBottom>
          {label}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, flexDirection: 'column', width: '100%' }}>
          <TextField
            fullWidth
            multiline
            rows={rows}
            variant="outlined"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleGenerateSection(section)}
              disabled={isGeneratingPRFAQ}
              sx={{ minWidth: '120px' }}
            >
              {hasContent ? 'Revise' : 'Generate'}
            </Button>
          </Box>
        </Box>
      </Grid>
    );
  };

  const handleManualSave = async () => {
    if (!currentProcessId) {
      setSnackbarMessage('No active process to save');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      await saveCurrentProcess();
      setSnackbarMessage('Process saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving process:', error);
      setSnackbarMessage('Failed to save process');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle edit stakeholder FAQ
  const handleEditStakeholderFAQ = (index: number) => {
    setEditingStakeholderFAQIndex(index);
    setNewStakeholderFAQ({ ...prfaq.stakeholderFaqs[index] });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{
          content: {
            sx: { width: '100%' }
          }
        }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      <Paper elevation={2} sx={{ p: 3 }}>
        {!currentUser && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'warning.light' }}>
            <Typography variant="body1">
              You are not logged in. Please sign in to save your work and access all features.
            </Typography>
          </Paper>
        )}
        
        {/* Process title and save status */}
        <Box sx={{ 
          p: 2, 
          mb: 3,
          bgcolor: 'primary.light', 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderRadius: 1
        }}>
          <Typography variant="subtitle1">
            Working on: {prfaq.title || 'Untitled Process'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isSaving && (
              <Chip 
                icon={<CircularProgress size={16} color="inherit" />} 
                label="Saving..." 
                size="small" 
                color="default"
              />
            )}
            
            {!isSaving && lastSaved && (
              <Tooltip title={`Last saved: ${format(lastSaved, 'MMM d, yyyy h:mm a')}`}>
                <Chip 
                  label={`Saved ${format(lastSaved, 'h:mm a')}`} 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
            )}
            
            {isModified && !isSaving && (
              <Chip 
                label="Unsaved changes" 
                size="small" 
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        
        {/* Rest of the existing UI */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            Press Release & FAQ
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleManualSave}
              startIcon={<SaveIcon />}
              disabled={isSaving || !isModified || !currentProcessId}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportMenuOpen}
              startIcon={<DownloadIcon />}
            >
              Export
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGenerateFullPRFAQ}
              disabled={isGeneratingPRFAQ || !hasWorkingBackwardsResponses}
              startIcon={isGeneratingPRFAQ ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
            >
              {isGeneratingPRFAQ ? `${generationStep}` : 'Generate Complete PRFAQ'}
            </Button>
          </Box>
        </Box>
        
        {/* Export Menu */}
        <Menu
          anchorEl={exportMenuAnchor}
          open={Boolean(exportMenuAnchor)}
          onClose={handleExportMenuClose}
        >
          <MenuItem onClick={() => handleExport('pdf')}>
            <ListItemIcon>
              <PdfIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as PDF</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('docx')}>
            <ListItemIcon>
              <DescriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Word</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('txt')}>
            <ListItemIcon>
              <TxtIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Export as Text</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleExport('email')}>
            <ListItemIcon>
              <EmailIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Send via Email</ListItemText>
          </MenuItem>
        </Menu>
        
        {/* Existing tabs and content */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="prfaq tabs">
              <Tab label="Press Release" id="prfaq-tab-0" aria-controls="prfaq-tabpanel-0" />
              <Tab 
                label="Customer FAQs" 
                id="prfaq-tab-1" 
                aria-controls="prfaq-tabpanel-1" 
                disabled={isPRFAQEmpty}
              />
              <Tab 
                label="Stakeholder FAQs" 
                id="prfaq-tab-2" 
                aria-controls="prfaq-tabpanel-2" 
                disabled={isPRFAQEmpty}
              />
            </Tabs>
          </Box>

          {/* Press Release Tab */}
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <SectionWithRegenerateButton
                section="title"
                label="Title"
                value={prfaq.title}
                onChange={(e) => handleTitleChange(e)}
                placeholder="Enter a title for your PRFAQ..."
              />
              
              <SectionWithRegenerateButton
                section="introduction"
                label="First Paragraph - Summary"
                value={prfaq.pressRelease.introduction}
                onChange={(e) => handlePressReleaseChange('introduction', e.target.value)}
                placeholder="Introduce your product or feature with a compelling summary..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="problemStatement"
                label="Second Paragraph - Problem"
                value={prfaq.pressRelease.problemStatement}
                onChange={(e) => handlePressReleaseChange('problemStatement', e.target.value)}
                placeholder="Describe the problem your product or feature solves..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="solution"
                label="Third Paragraph - Solution"
                value={prfaq.pressRelease.solution}
                onChange={(e) => handlePressReleaseChange('solution', e.target.value)}
                placeholder="Explain how your product or feature solves the problem..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="stakeholderQuote"
                label="Fourth Paragraph - Executive Quote"
                value={prfaq.pressRelease.stakeholderQuote}
                onChange={(e) => handlePressReleaseChange('stakeholderQuote', e.target.value)}
                placeholder="Include a quote from a company executive..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="customerJourney"
                label="Fifth Paragraph - Customer Journey"
                value={prfaq.pressRelease.customerJourney}
                onChange={(e) => handlePressReleaseChange('customerJourney', e.target.value)}
                placeholder="Describe the customer journey and experience..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="customerQuote"
                label="Sixth Paragraph - Customer Quote"
                value={prfaq.pressRelease.customerQuote}
                onChange={(e) => handlePressReleaseChange('customerQuote', e.target.value)}
                placeholder="Include a quote from a customer..."
                rows={4}
              />
              
              <SectionWithRegenerateButton
                section="callToAction"
                label="Call to Action"
                value={prfaq.pressRelease.callToAction}
                onChange={(e) => handlePressReleaseChange('callToAction', e.target.value)}
                placeholder="End with a call to action..."
                rows={2}
              />
            </Grid>
          </TabPanel>

          {/* Customer FAQs Tab */}
          <TabPanel value={tabValue} index={1}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Customer Frequently Asked Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add questions and answers that address common concerns, objections, and details that potential customers might have about your innovation.
                </Typography>

                {isPRFAQEmpty ? (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body1" color="info.contrastText">
                      Please fill out the Press Release tab first before adding FAQs.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Existing Customer FAQs */}
                    {prfaq.customerFaqs.length > 0 ? (
                      <Box sx={{ mb: 4 }}>
                        {prfaq.customerFaqs.map((faq, index) => (
                          <Paper key={index} sx={{ p: 2, mb: 2 }}>
                            {editingCustomerFAQIndex === index ? (
                              // Editing mode
                              <>
                                <TextField
                                  fullWidth
                                  label="Question"
                                  variant="outlined"
                                  value={faq.question}
                                  onChange={(e) => dispatch(updateCustomerFAQ({
                                    index: editingCustomerFAQIndex,
                                    question: e.target.value
                                  }))}
                                  sx={{ mb: 2 }}
                                />
                                <Typography variant="subtitle2" gutterBottom>
                                  Answer
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                  <LazyReactQuill
                                    key={`customer-faq-editor-${index}`}
                                    value={faq.answer}
                                    onChange={(value) => dispatch(updateCustomerFAQ({
                                      index: editingCustomerFAQIndex,
                                      answer: value
                                    }))}
                                    style={{ height: '150px', marginBottom: '50px' }}
                                    visible={tabValue === 1 && editingCustomerFAQIndex === index}
                                  />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveCustomerFAQ}
                                    startIcon={<SaveIcon />}
                                  >
                                    Save
                                  </Button>
                                </Box>
                              </>
                            ) : (
                              // Display mode
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Q: {faq.question}
                                  </Typography>
                                  <Box>
                                    <IconButton size="small" onClick={() => handleEditCustomerFAQ(index)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteCustomerFAQ(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  A: <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                </Typography>
                              </>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No customer FAQs added yet. Generate FAQs or add your first FAQ below.
                        </Typography>
                      </Box>
                    )}

                    {/* Generate Customer FAQs */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Generate Customer FAQs
                      </Typography>
                      <TextField
                        fullWidth
                        label="Instructions (optional)"
                        variant="outlined"
                        value={customerFaqComment || ''}
                        onChange={handleCustomerFaqCommentChange}
                        placeholder="Add specific instructions for generating FAQs (e.g., 'Focus on pricing and support questions')"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleGenerateCustomerFAQs}
                          disabled={isGeneratingCustomerFAQ || !hasWorkingBackwardsResponses}
                          startIcon={isGeneratingCustomerFAQ ? <CircularProgress size={20} /> : null}
                        >
                          Generate Multiple FAQs
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleGenerateSingleCustomerFAQ}
                          disabled={isGeneratingCustomerFAQ || !hasWorkingBackwardsResponses}
                          startIcon={isGeneratingCustomerFAQ ? <CircularProgress size={20} /> : null}
                        >
                          Generate Single FAQ
                        </Button>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Add new Customer FAQ */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Add New Customer FAQ
                      </Typography>
                      <TextField
                        fullWidth
                        label="Question"
                        variant="outlined"
                        value={newCustomerFAQ.question}
                        onChange={handleNewCustomerFAQQuestionChange}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle2" gutterBottom>
                        Answer
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <LazyReactQuill
                          key="new-customer-faq-editor"
                          value={newCustomerFAQ.answer}
                          onChange={handleNewCustomerFAQAnswerChange}
                          style={{ height: '150px', marginBottom: '50px' }}
                          visible={tabValue === 1}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveCustomerFAQ}
                          startIcon={<SaveIcon />}
                          disabled={!newCustomerFAQ.question.trim() || !newCustomerFAQ.answer.trim()}
                        >
                          Add FAQ
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </TabPanel>

          {/* Stakeholder FAQs Tab */}
          <TabPanel value={tabValue} index={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Stakeholder Frequently Asked Questions
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add questions and answers that address strategic concerns, risks, and implementation details that internal stakeholders (investors, executives, team members) might have.
                </Typography>

                {isPRFAQEmpty ? (
                  <Box sx={{ textAlign: 'center', py: 4, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
                    <Typography variant="body1" color="info.contrastText">
                      Please fill out the Press Release tab first before adding FAQs.
                    </Typography>
                  </Box>
                ) : (
                  <>
                    {/* Existing Stakeholder FAQs */}
                    {prfaq.stakeholderFaqs.length > 0 ? (
                      <Box sx={{ mb: 4 }}>
                        {prfaq.stakeholderFaqs.map((faq, index) => (
                          <Paper key={index} sx={{ p: 2, mb: 2 }}>
                            {editingStakeholderFAQIndex === index ? (
                              // Editing mode
                              <>
                                <TextField
                                  fullWidth
                                  label="Question"
                                  variant="outlined"
                                  value={faq.question}
                                  onChange={(e) => dispatch(updateStakeholderFAQ({
                                    index: editingStakeholderFAQIndex,
                                    question: e.target.value
                                  }))}
                                  sx={{ mb: 2 }}
                                />
                                <Typography variant="subtitle2" gutterBottom>
                                  Answer
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                  <LazyReactQuill
                                    key={`stakeholder-faq-editor-${index}`}
                                    value={faq.answer}
                                    onChange={(value) => dispatch(updateStakeholderFAQ({
                                      index: editingStakeholderFAQIndex,
                                      answer: value
                                    }))}
                                    style={{ height: '150px', marginBottom: '50px' }}
                                    visible={tabValue === 2 && editingStakeholderFAQIndex === index}
                                  />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleSaveStakeholderFAQ}
                                    startIcon={<SaveIcon />}
                                  >
                                    Save
                                  </Button>
                                </Box>
                              </>
                            ) : (
                              // Display mode
                              <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <Typography variant="subtitle1" fontWeight="bold">
                                    Q: {faq.question}
                                  </Typography>
                                  <Box>
                                    <IconButton size="small" onClick={() => handleEditStakeholderFAQ(index)}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" onClick={() => handleDeleteStakeholderFAQ(index)}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </Box>
                                <Typography variant="body1" sx={{ mt: 1 }}>
                                  A: <span dangerouslySetInnerHTML={{ __html: faq.answer }} />
                                </Typography>
                              </>
                            )}
                          </Paper>
                        ))}
                      </Box>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body1" color="text.secondary">
                          No stakeholder FAQs added yet. Generate FAQs or add your first FAQ below.
                        </Typography>
                      </Box>
                    )}

                    {/* Generate Stakeholder FAQs */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Generate Stakeholder FAQs
                      </Typography>
                      <TextField
                        fullWidth
                        label="Instructions (optional)"
                        variant="outlined"
                        value={stakeholderFaqComment || ''}
                        onChange={handleStakeholderFaqCommentChange}
                        placeholder="Add specific instructions for generating FAQs (e.g., 'Focus on scaling and risk mitigation questions')"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleGenerateStakeholderFAQs}
                          disabled={isGeneratingStakeholderFAQ || !hasWorkingBackwardsResponses}
                          startIcon={isGeneratingStakeholderFAQ ? <CircularProgress size={20} /> : null}
                        >
                          Generate Multiple FAQs
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleGenerateSingleStakeholderFAQ}
                          disabled={isGeneratingStakeholderFAQ || !hasWorkingBackwardsResponses}
                          startIcon={isGeneratingStakeholderFAQ ? <CircularProgress size={20} /> : null}
                        >
                          Generate Single FAQ
                        </Button>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Add new Stakeholder FAQ */}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Add New Stakeholder FAQ
                      </Typography>
                      <TextField
                        fullWidth
                        label="Question"
                        variant="outlined"
                        value={newStakeholderFAQ.question}
                        onChange={handleNewStakeholderFAQQuestionChange}
                        sx={{ mb: 2 }}
                      />
                      <Typography variant="subtitle2" gutterBottom>
                        Answer
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <LazyReactQuill
                          key="new-stakeholder-faq-editor"
                          value={newStakeholderFAQ.answer}
                          onChange={handleNewStakeholderFAQAnswerChange}
                          style={{ height: '150px', marginBottom: '50px' }}
                          visible={tabValue === 2}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={handleSaveStakeholderFAQ}
                          startIcon={<SaveIcon />}
                          disabled={!newStakeholderFAQ.question.trim() || !newStakeholderFAQ.answer.trim()}
                        >
                          Add FAQ
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </Paper>

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBackToWorkingBackwards}
            startIcon={<ArrowBack />}
          >
            Back to Working Backwards
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleManualSave}
              startIcon={<SaveIcon />}
              disabled={isSaving || !isModified || !currentProcessId}
            >
              Save
            </Button>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleContinueToAssumptions}
              endIcon={<ArrowForward />}
              disabled={isPRFAQEmpty}
            >
              Continue to Assumptions
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default PRFAQPage;