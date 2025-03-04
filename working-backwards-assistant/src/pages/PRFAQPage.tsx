import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
} from '../store/sessionSlice';
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
import { ExportFormat, FAQ } from '../types';

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
  const dispatch = useDispatch();
  const { prfaq, workingBackwardsResponses } = useSelector((state: RootState) => state.session);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // State for press release and FAQs
  const hasWorkingBackwardsResponses = Object.values(workingBackwardsResponses).every(response => response.trim() !== '');
  
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
    !prfaq.pressRelease.summary && 
    !prfaq.pressRelease.problem && 
    !prfaq.pressRelease.solution && 
    !prfaq.pressRelease.executiveQuote && 
    !prfaq.pressRelease.customerJourney && 
    !prfaq.pressRelease.customerQuote && 
    !prfaq.pressRelease.gettingStarted;
    // FAQs temporarily disabled
    // && prfaq.faq.length === 0;

  // Check if any sections have content
  const hasSomeContent = prfaq.title || 
    prfaq.pressRelease.summary || 
    prfaq.pressRelease.problem || 
    prfaq.pressRelease.solution || 
    prfaq.pressRelease.executiveQuote || 
    prfaq.pressRelease.customerJourney || 
    prfaq.pressRelease.customerQuote || 
    prfaq.pressRelease.gettingStarted;

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    // Prevent switching to FAQ tabs if press release is empty
    if (isPRFAQEmpty && (newValue === 1 || newValue === 2)) {
      return;
    }
    setTabValue(newValue);
  };

  // Handle title change
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updatePRFAQTitle(event.target.value));
  };

  // Handle press release section change
  const handlePressReleaseChange = (field: keyof typeof prfaq.pressRelease, value: string) => {
    dispatch(updatePRFAQPressRelease({ field, value }));
  };

  // Handle export menu open
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  // Handle export menu close
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // Handle export
  const handleExport = (format: ExportFormat) => {
    exportPRFAQ(prfaq, format);
    handleExportMenuClose();
  };

  // Customer FAQ handlers
  const handleNewCustomerFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewCustomerFAQ({ ...newCustomerFAQ, question: event.target.value });
  };

  const handleNewCustomerFAQAnswerChange = (value: string) => {
    setNewCustomerFAQ({ ...newCustomerFAQ, answer: value });
  };

  const handleAddCustomerFAQ = () => {
    if (newCustomerFAQ.question.trim() && newCustomerFAQ.answer.trim()) {
      dispatch(addCustomerFAQ(newCustomerFAQ));
      setNewCustomerFAQ({ question: '', answer: '' });
    }
  };

  const handleEditCustomerFAQ = (index: number) => {
    setEditingCustomerFAQIndex(index);
  };

  const handleUpdateCustomerFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (field === 'question') {
      dispatch(updateCustomerFAQ({ index, question: value }));
    } else {
      dispatch(updateCustomerFAQ({ index, answer: value }));
    }
  };

  const handleSaveCustomerFAQEdit = () => {
    setEditingCustomerFAQIndex(null);
  };

  const handleDeleteCustomerFAQ = (index: number) => {
    if (window.confirm('Are you sure you want to delete this customer FAQ?')) {
      dispatch(removeCustomerFAQ(index));
    }
  };

  const handleCustomerFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerFaqComment(event.target.value);
  };

  // Stakeholder FAQ handlers
  const handleNewStakeholderFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewStakeholderFAQ({ ...newStakeholderFAQ, question: event.target.value });
  };

  const handleNewStakeholderFAQAnswerChange = (value: string) => {
    setNewStakeholderFAQ({ ...newStakeholderFAQ, answer: value });
  };

  const handleAddStakeholderFAQ = () => {
    if (newStakeholderFAQ.question.trim() && newStakeholderFAQ.answer.trim()) {
      dispatch(addStakeholderFAQ(newStakeholderFAQ));
      setNewStakeholderFAQ({ question: '', answer: '' });
    }
  };

  const handleEditStakeholderFAQ = (index: number) => {
    setEditingStakeholderFAQIndex(index);
  };

  const handleUpdateStakeholderFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (field === 'question') {
      dispatch(updateStakeholderFAQ({ index, question: value }));
    } else {
      dispatch(updateStakeholderFAQ({ index, answer: value }));
    }
  };

  const handleSaveStakeholderFAQEdit = () => {
    setEditingStakeholderFAQIndex(null);
  };

  const handleDeleteStakeholderFAQ = (index: number) => {
    if (window.confirm('Are you sure you want to delete this stakeholder FAQ?')) {
      dispatch(removeStakeholderFAQ(index));
    }
  };

  const handleStakeholderFaqCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStakeholderFaqComment(event.target.value);
  };

  // Generate customer FAQs
  const generateCustomerFAQs = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingCustomerFAQ(true);
    
    try {
      const currentPRFAQ = { ...prfaq };
      const model = process.env.REACT_APP_AI_MODEL || '';
      const provider = process.env.REACT_APP_AI_PROVIDER || '';
      
      const prompt = getCustomerFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ, 
        customerFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model,
        provider,
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

  // Generate a single customer FAQ
  const generateSingleCustomerFAQ = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingCustomerFAQ(true);
    
    try {
      const currentPRFAQ = { ...prfaq };
      const model = process.env.REACT_APP_AI_MODEL || '';
      const provider = process.env.REACT_APP_AI_PROVIDER || '';
      
      const prompt = getSingleCustomerFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ,
        prfaq.customerFaqs,
        customerFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model,
        provider,
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

  // Generate stakeholder FAQs
  const generateStakeholderFAQs = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingStakeholderFAQ(true);
    
    try {
      const currentPRFAQ = { ...prfaq };
      const model = process.env.REACT_APP_AI_MODEL || '';
      const provider = process.env.REACT_APP_AI_PROVIDER || '';
      
      const prompt = getStakeholderFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ, 
        stakeholderFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model,
        provider,
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

  // Generate a single stakeholder FAQ
  const generateSingleStakeholderFAQ = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingStakeholderFAQ(true);
    
    try {
      const currentPRFAQ = { ...prfaq };
      const model = process.env.REACT_APP_AI_MODEL || '';
      const provider = process.env.REACT_APP_AI_PROVIDER || '';
      
      const prompt = getSingleStakeholderFAQPrompt(
        workingBackwardsResponses, 
        currentPRFAQ,
        prfaq.stakeholderFaqs,
        stakeholderFaqComment
      );
      
      const response = await getAIResponse({
        prompt,
        model,
        provider,
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

  // Generate a specific section of the PRFAQ
  const generatePRFAQSection = async (section: keyof typeof prfaq.pressRelease | 'title') => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingPRFAQ(true);
    
    try {
      // Create a copy of the current PRFAQ to build upon
      const currentPRFAQ = { ...prfaq };
      const model = process.env.REACT_APP_AI_MODEL || '';
      const provider = process.env.REACT_APP_AI_PROVIDER || '';
      
      let prompt: string;
      let sectionName: string;
      
      // Determine which prompt to use based on the section
      switch (section) {
        case 'title':
          sectionName = 'headline';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getHeadlinePrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'summary':
          sectionName = 'first paragraph (summary)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getFirstParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'problem':
          sectionName = 'second paragraph (problem/opportunity)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getSecondParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'solution':
          sectionName = 'third paragraph (solution)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getThirdParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'executiveQuote':
          sectionName = 'fourth paragraph (executive quote)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getFourthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'customerJourney':
          sectionName = 'fifth paragraph (customer journey)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getFifthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'customerQuote':
          sectionName = 'sixth paragraph (customer quote)';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getSixthParagraphPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        case 'gettingStarted':
          sectionName = 'call to action';
          setGenerationStep(`Generating ${sectionName}...`);
          prompt = getCallToActionPrompt(workingBackwardsResponses, currentPRFAQ, '');
          break;
        default:
          throw new Error(`Unknown section: ${section}`);
      }
      
      const response = await getAIResponse({
        prompt,
        model,
        provider,
      });
      
      if (response.error) {
        throw new Error(`Failed to generate ${sectionName}: ${response.error}`);
      }
      
      // Update the appropriate section
      if (section === 'title') {
        dispatch(updatePRFAQTitle(response.content.trim()));
      } else {
        dispatch(updatePRFAQPressRelease({ 
          field: section, 
          value: response.content.trim() 
        }));
      }
      
      setGenerationStep('');
    } catch (error) {
      console.error(`Error generating PRFAQ section ${section}:`, error);
      alert(`Failed to generate section: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setGenerationStep('');
    } finally {
      setIsGeneratingPRFAQ(false);
    }
  };

  // Generate complete PRFAQ using AI with sequential prompts
  const generatePRFAQ = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGeneratingPRFAQ(true);
    
    try {
      // Generate each section sequentially
      const sections: (keyof typeof prfaq.pressRelease | 'title')[] = [
        'summary',
        'problem',
        'solution',
        'executiveQuote',
        'customerJourney',
        'customerQuote',
        'gettingStarted',
        'title', // Generate title last as requested
      ];
      
      // Create a copy of the current PRFAQ to build upon
      let currentPRFAQ = { ...prfaq };
      
      // Generate each section one by one
      for (const section of sections) {
        try {
          // Determine section name for progress indicator
          let sectionName: string;
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
          
          setGenerationStep(`Generating ${sectionName}...`);
          
          // Get the appropriate prompt for this section
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
          
          // Generate content for this section
          const response = await getAIResponse({
            prompt,
            model: process.env.REACT_APP_AI_MODEL || '',
            provider: process.env.REACT_APP_AI_PROVIDER || '',
          });
          
          if (response.error) {
            throw new Error(`Failed to generate ${sectionName}: ${response.error}`);
          }
          
          // Update the appropriate section in Redux and our local copy
          if (section === 'title') {
            dispatch(updatePRFAQTitle(response.content.trim()));
            currentPRFAQ.title = response.content.trim();
          } else {
            dispatch(updatePRFAQPressRelease({ 
              field: section, 
              value: response.content.trim() 
            }));
            currentPRFAQ.pressRelease = {
              ...currentPRFAQ.pressRelease,
              [section]: response.content.trim()
            };
          }
        } catch (error) {
          console.error(`Error generating ${section}:`, error);
          // Continue with the next section even if this one failed
        }
      }
      
      setGenerationStep('');
      
      // Switch to the Press Release tab
      setTabValue(0);
    } catch (error) {
      console.error('Error generating PRFAQ:', error);
      alert(`Failed to generate PRFAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setGenerationStep('');
    } finally {
      setIsGeneratingPRFAQ(false);
    }
  };

  // Handle continue to assumptions
  const handleContinueToAssumptions = () => {
    navigate('/assumptions');
  };

  // Handle back to Working Backwards
  const handleBackToWorkingBackwards = () => {
    navigate('/working-backwards');
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
    section: keyof typeof prfaq.pressRelease | 'title', 
    label: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => void, 
    rows?: number,
    placeholder: string 
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
              onClick={() => generatePRFAQSection(section)}
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h1">
            Press Release & FAQ
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={generatePRFAQ}
              disabled={isGeneratingPRFAQ}
              startIcon={<AutoFixHighIcon />}
              sx={{ minWidth: '250px' }}
            >
              Generate Complete Press Release
            </Button>
            {generationStep && (
              <Typography variant="body2" sx={{ ml: 2, alignSelf: 'center', color: 'text.secondary' }}>
                {generationStep}
              </Typography>
            )}
            <Button
              variant="outlined"
              onClick={handleExportMenuOpen}
              aria-controls="export-menu"
              aria-haspopup="true"
            >
              Export
            </Button>
            <Menu
              id="export-menu"
              anchorEl={exportMenuAnchor}
              keepMounted
              open={Boolean(exportMenuAnchor)}
              onClose={handleExportMenuClose}
            >
              <MenuItem onClick={() => handleExport('markdown')}>
                <ListItemIcon>
                  <DescriptionIcon fontSize="small" />
                </ListItemIcon>
                Export as Markdown
              </MenuItem>
              <MenuItem onClick={() => handleExport('pdf')}>
                <ListItemIcon>
                  <PdfIcon fontSize="small" />
                </ListItemIcon>
                Export as PDF
              </MenuItem>
              <MenuItem onClick={() => handleExport('docx')}>
                <ListItemIcon>
                  <ArticleIcon fontSize="small" />
                </ListItemIcon>
                Export as Word
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Tabs */}
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
            {/* Title */}
            <SectionWithRegenerateButton
              section="title"
              label="Headline"
              value={prfaq.title}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQTitle(e.target.value))
              }
              placeholder="Enter a headline for your press release..."
            />
            
            {/* First Paragraph - Summary */}
            <SectionWithRegenerateButton
              section="summary"
              label="First Paragraph (Summary)"
              value={prfaq.pressRelease.summary}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'summary', value: e.target.value }))
              }
              placeholder="Enter a summary of your product or feature..."
            />
            
            {/* Second Paragraph - Problem */}
            <SectionWithRegenerateButton
              section="problem"
              label="Second Paragraph (Problem/Opportunity)"
              value={prfaq.pressRelease.problem}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'problem', value: e.target.value }))
              }
              placeholder="Describe the problem or opportunity your product addresses..."
            />
            
            {/* Third Paragraph - Solution */}
            <SectionWithRegenerateButton
              section="solution"
              label="Third Paragraph (Solution)"
              value={prfaq.pressRelease.solution}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'solution', value: e.target.value }))
              }
              placeholder="Explain how your product solves the problem..."
            />
            
            {/* Fourth Paragraph - Executive Quote */}
            <SectionWithRegenerateButton
              section="executiveQuote"
              label="Fourth Paragraph (Executive Quote)"
              value={prfaq.pressRelease.executiveQuote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'executiveQuote', value: e.target.value }))
              }
              placeholder="Add a quote from an executive about the product..."
            />
            
            {/* Fifth Paragraph - Customer Journey */}
            <SectionWithRegenerateButton
              section="customerJourney"
              label="Fifth Paragraph (Customer Journey)"
              value={prfaq.pressRelease.customerJourney}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'customerJourney', value: e.target.value }))
              }
              placeholder="Describe how customers will use and benefit from your product..."
            />
            
            {/* Sixth Paragraph - Customer Quote */}
            <SectionWithRegenerateButton
              section="customerQuote"
              label="Sixth Paragraph (Customer Quote)"
              value={prfaq.pressRelease.customerQuote}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'customerQuote', value: e.target.value }))
              }
              placeholder="Add a quote from a customer about the product..."
            />
            
            {/* Call to Action */}
            <SectionWithRegenerateButton
              section="gettingStarted"
              label="Call to Action"
              value={prfaq.pressRelease.gettingStarted}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => 
                dispatch(updatePRFAQPressRelease({ field: 'gettingStarted', value: e.target.value }))
              }
              placeholder="Explain how customers can get started with your product..."
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
                                onChange={(e) => handleUpdateCustomerFAQ(index, 'question', e.target.value)}
                            sx={{ mb: 2 }}
                          />
                          <Typography variant="subtitle2" gutterBottom>
                            Answer
                          </Typography>
                          <Box sx={{ mb: 2 }}>
                                <LazyReactQuill
                                  key={`customer-faq-editor-${index}`}
                              value={faq.answer}
                                  onChange={(value) => handleUpdateCustomerFAQ(index, 'answer', value)}
                              style={{ height: '150px', marginBottom: '50px' }}
                                  visible={tabValue === 1 && editingCustomerFAQIndex === index}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="primary"
                                  onClick={handleSaveCustomerFAQEdit}
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
                        onClick={generateCustomerFAQs}
                        disabled={isGeneratingCustomerFAQ || !hasWorkingBackwardsResponses}
                        startIcon={isGeneratingCustomerFAQ ? <CircularProgress size={20} /> : null}
                      >
                        Generate Multiple FAQs
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={generateSingleCustomerFAQ}
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
                        onClick={handleAddCustomerFAQ}
                    startIcon={<AddIcon />}
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
                                onChange={(e) => handleUpdateStakeholderFAQ(index, 'question', e.target.value)}
                                sx={{ mb: 2 }}
                              />
                              <Typography variant="subtitle2" gutterBottom>
                                Answer
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                <LazyReactQuill
                                  key={`stakeholder-faq-editor-${index}`}
                                  value={faq.answer}
                                  onChange={(value) => handleUpdateStakeholderFAQ(index, 'answer', value)}
                                  style={{ height: '150px', marginBottom: '50px' }}
                                  visible={tabValue === 2 && editingStakeholderFAQIndex === index}
                                />
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                  variant="contained"
                                  color="primary"
                                  onClick={handleSaveStakeholderFAQEdit}
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
                        onClick={generateStakeholderFAQs}
                        disabled={isGeneratingStakeholderFAQ || !hasWorkingBackwardsResponses}
                        startIcon={isGeneratingStakeholderFAQ ? <CircularProgress size={20} /> : null}
                      >
                        Generate Multiple FAQs
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={generateSingleStakeholderFAQ}
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
                        onClick={handleAddStakeholderFAQ}
                        startIcon={<AddIcon />}
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

        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBackToWorkingBackwards}
            startIcon={<ArrowBack />}
          >
            Back to Working Backwards
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
      </Paper>
    </Container>
  );
};

export default PRFAQPage; 