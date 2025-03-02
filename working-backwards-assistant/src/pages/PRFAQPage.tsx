import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TextSnippet as TxtIcon,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../store';
import {
  updatePRFAQTitle,
  updatePRFAQPressRelease,
  addFAQ,
  updateFAQ,
  removeFAQ,
} from '../store/sessionSlice';
import { getAIResponse, getPRFAQGenerationPrompt } from '../services/aiService';
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

const PRFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { prfaq, workingBackwardsResponses } = useSelector((state: RootState) => state.session);
  
  const [tabValue, setTabValue] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingFAQIndex, setEditingFAQIndex] = useState<number | null>(null);
  const [newFAQ, setNewFAQ] = useState<FAQ>({ question: '', answer: '' });
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Check if Working Backwards responses are filled
  const hasWorkingBackwardsResponses = Object.values(workingBackwardsResponses).some(value => value.trim() !== '');
  
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

  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
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

  // Handle new FAQ question change
  const handleNewFAQQuestionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewFAQ({ ...newFAQ, question: event.target.value });
  };

  // Handle new FAQ answer change
  const handleNewFAQAnswerChange = (value: string) => {
    setNewFAQ({ ...newFAQ, answer: value });
  };

  // Handle add FAQ
  const handleAddFAQ = () => {
    if (newFAQ.question.trim() && newFAQ.answer.trim()) {
      dispatch(addFAQ(newFAQ));
      setNewFAQ({ question: '', answer: '' });
    }
  };

  // Handle edit FAQ
  const handleEditFAQ = (index: number) => {
    setEditingFAQIndex(index);
  };

  // Handle update FAQ
  const handleUpdateFAQ = (index: number, field: 'question' | 'answer', value: string) => {
    if (field === 'question') {
      dispatch(updateFAQ({ index, question: value }));
    } else {
      dispatch(updateFAQ({ index, answer: value }));
    }
  };

  // Handle save FAQ edit
  const handleSaveFAQEdit = () => {
    setEditingFAQIndex(null);
  };

  // Handle delete FAQ
  const handleDeleteFAQ = (index: number) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      dispatch(removeFAQ(index));
    }
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

  // Generate PRFAQ using AI
  const generatePRFAQ = async () => {
    if (!hasWorkingBackwardsResponses) {
      alert('Please complete the Working Backwards questions first.');
      navigate('/working-backwards');
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = getPRFAQGenerationPrompt(
        workingBackwardsResponses,
        prfaq.title || 'New Innovation'
      );
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        console.error('PRFAQ generation error:', response.error);
        alert('Failed to generate PRFAQ. Please try again later.');
      } else {
        // Parse the AI response to extract sections
        const content = response.content;
        
        // Extract headline/title if not already set
        if (!prfaq.title) {
          const titleMatch = content.match(/^#\s+(.+)$/m) || 
                            content.match(/^Title:\s+(.+)$/m) || 
                            content.match(/^Headline:\s+(.+)$/m) ||
                            content.match(/^(.+)\n/);
          if (titleMatch && titleMatch[1]) {
            dispatch(updatePRFAQTitle(titleMatch[1].trim()));
          }
        }
        
        // Extract summary (first paragraph)
        const summaryMatch = content.match(/(?:First Paragraph|Summary)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Second paragraph)/i);
        if (summaryMatch && summaryMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'summary', value: summaryMatch[1].trim() }));
        } else {
          // Try to get the first paragraph after the headline
          const firstParaMatch = content.split(/\n\n/)[1];
          if (firstParaMatch) {
            dispatch(updatePRFAQPressRelease({ field: 'summary', value: firstParaMatch.trim() }));
          }
        }
        
        // Extract problem (second paragraph)
        const problemMatch = content.match(/(?:Second paragraph|The Opportunity|The Problem)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Third paragraph)/i);
        if (problemMatch && problemMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'problem', value: problemMatch[1].trim() }));
        } else {
          // Try to get the second paragraph
          const paragraphs = content.split(/\n\n/);
          if (paragraphs.length > 2) {
            dispatch(updatePRFAQPressRelease({ field: 'problem', value: paragraphs[2].trim() }));
          }
        }
        
        // Extract solution (third paragraph)
        const solutionMatch = content.match(/(?:Third paragraph|Describe What You're Launching|Solution)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Fourth paragraph)/i);
        if (solutionMatch && solutionMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'solution', value: solutionMatch[1].trim() }));
        } else {
          // Try to get the third paragraph
          const paragraphs = content.split(/\n\n/);
          if (paragraphs.length > 3) {
            dispatch(updatePRFAQPressRelease({ field: 'solution', value: paragraphs[3].trim() }));
          }
        }
        
        // Extract executive quote (fourth paragraph)
        const executiveQuoteMatch = content.match(/(?:Fourth paragraph|Executive Quote)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Fifth paragraph)/i);
        if (executiveQuoteMatch && executiveQuoteMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'executiveQuote', value: executiveQuoteMatch[1].trim() }));
        } else {
          // Try to get the fourth paragraph
          const paragraphs = content.split(/\n\n/);
          if (paragraphs.length > 4) {
            dispatch(updatePRFAQPressRelease({ field: 'executiveQuote', value: paragraphs[4].trim() }));
          }
        }
        
        // Extract customer journey (fifth paragraph)
        const customerJourneyMatch = content.match(/(?:Fifth paragraph|Customer Journey)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Sixth paragraph)/i);
        if (customerJourneyMatch && customerJourneyMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'customerJourney', value: customerJourneyMatch[1].trim() }));
        } else {
          // Try to get the fifth paragraph
          const paragraphs = content.split(/\n\n/);
          if (paragraphs.length > 5) {
            dispatch(updatePRFAQPressRelease({ field: 'customerJourney', value: paragraphs[5].trim() }));
          }
        }
        
        // Extract customer quote (sixth paragraph)
        const customerQuoteMatch = content.match(/(?:Sixth paragraph|Customer Quote)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|Last line|Call to Action)/i);
        if (customerQuoteMatch && customerQuoteMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'customerQuote', value: customerQuoteMatch[1].trim() }));
        } else {
          // Try to get the sixth paragraph
          const paragraphs = content.split(/\n\n/);
          if (paragraphs.length > 6) {
            dispatch(updatePRFAQPressRelease({ field: 'customerQuote', value: paragraphs[6].trim() }));
          }
        }
        
        // Extract getting started (last line or call to action)
        const gettingStartedMatch = content.match(/(?:Last line|Call to Action)(?:.*?):\s*([\s\S]*?)(?=\n\n|\n###|\n##|FAQ|Frequently Asked Questions|$)/i);
        if (gettingStartedMatch && gettingStartedMatch[1]) {
          dispatch(updatePRFAQPressRelease({ field: 'gettingStarted', value: gettingStartedMatch[1].trim() }));
        } else {
          // Try to get the last paragraph before FAQ section
          const beforeFAQ = content.split(/FAQ|Frequently Asked Questions/i)[0];
          if (beforeFAQ) {
            const paragraphs = beforeFAQ.split(/\n\n/);
            const lastPara = paragraphs[paragraphs.length - 1].trim();
            dispatch(updatePRFAQPressRelease({ field: 'gettingStarted', value: lastPara }));
          }
        }
        
        // FAQ parsing temporarily disabled
        /* 
        // Extract FAQs
        // Clear existing FAQs first
        prfaq.faq.forEach((_, index) => {
          dispatch(removeFAQ(0)); // Always remove the first one until all are gone
        });
        
        const faqSection = content.match(/(?:FAQ|Frequently Asked Questions)[\s\S]*?$/i);
        if (faqSection) {
          // Try to match Q: and A: format
          const faqMatches = faqSection[0].match(/Q:?\s*(.*?)\s*\n\s*A:?\s*([\s\S]*?)(?=\s*Q:?|\s*$)/gi);
          
          if (faqMatches && faqMatches.length > 0) {
            faqMatches.forEach(faqMatch => {
              const questionMatch = faqMatch.match(/Q:?\s*(.*?)(?=\s*\n\s*A:?)/i);
              const answerMatch = faqMatch.match(/A:?\s*([\s\S]*?)$/i);
              
              if (questionMatch && questionMatch[1] && answerMatch && answerMatch[1]) {
                dispatch(addFAQ({
                  question: questionMatch[1].trim(),
                  answer: answerMatch[1].trim(),
                }));
              }
            });
          } else {
            // Try alternative format with numbered questions
            const altFaqMatches = faqSection[0].match(/(?:\d+\.\s*)(.*?)\s*\n([\s\S]*?)(?=\s*\d+\.\s*|\s*$)/gi);
            
            if (altFaqMatches && altFaqMatches.length > 0) {
              altFaqMatches.forEach(faqMatch => {
                const questionMatch = faqMatch.match(/(?:\d+\.\s*)(.*?)(?=\s*\n)/i);
                const answerMatch = faqMatch.match(/(?:\d+\.\s*.*?\n)([\s\S]*?)$/i);
                
                if (questionMatch && questionMatch[1] && answerMatch && answerMatch[1]) {
                  dispatch(addFAQ({
                    question: questionMatch[1].trim(),
                    answer: answerMatch[1].trim(),
                  }));
                }
              });
            }
          }
        }
        */
        
        // Switch to the Press Release tab
        setTabValue(0);
      }
    } catch (error) {
      console.error('Error generating PRFAQ:', error);
      alert('Failed to generate PRFAQ. Please try again later.');
    } finally {
      setIsGenerating(false);
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

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Press Release & FAQ (PRFAQ)
      </Typography>
      <Typography variant="body1" paragraph>
        Create a press release and FAQ document as if your product has already launched. This forces clarity of thought and ensures you're building something customers will actually want.
      </Typography>

      {/* Title and Actions */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="PRFAQ Title"
            variant="outlined"
            value={prfaq.title}
            onChange={handleTitleChange}
            placeholder="Enter a title for your innovation"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={generatePRFAQ}
              disabled={isGenerating || !hasWorkingBackwardsResponses}
              startIcon={isGenerating ? <CircularProgress size={20} /> : null}
            >
              {isPRFAQEmpty ? 'Generate PRFAQ' : 'Regenerate PRFAQ'}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleExportMenuOpen}
              startIcon={<DownloadIcon />}
              disabled={isPRFAQEmpty}
            >
              Export
            </Button>
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
                  <DocIcon fontSize="small" />
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
          </Box>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="prfaq tabs">
          <Tab label="Press Release" id="prfaq-tab-0" aria-controls="prfaq-tabpanel-0" />
          {/* FAQ tab temporarily disabled due to ReactQuill errors */}
          {/* <Tab label="FAQ" id="prfaq-tab-1" aria-controls="prfaq-tabpanel-1" /> */}
        </Tabs>
      </Box>

      {/* Press Release Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Press Release
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Write your press release as if your product has already launched. Focus on the customer problem and how your solution addresses it.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Headline
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  variant="outlined"
                  value={prfaq.title}
                  onChange={handleTitleChange}
                  placeholder="A succinct one-liner (5-7 words) that captures the value of your solution"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  First Paragraph - Summary
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={prfaq.pressRelease.summary}
                  onChange={(e) => handlePressReleaseChange('summary', e.target.value)}
                  placeholder="Date and elevator pitch (4-5 sentences) describing what you're launching and the most important benefit"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Second Paragraph - Problem/Opportunity
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={prfaq.pressRelease.problem}
                  onChange={(e) => handlePressReleaseChange('problem', e.target.value)}
                  placeholder="Clearly explain the opportunity or problem you are solving with your product"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Third Paragraph - Solution
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={prfaq.pressRelease.solution}
                  onChange={(e) => handlePressReleaseChange('solution', e.target.value)}
                  placeholder="Explain the product or service in clear customer-friendly language"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Fourth Paragraph - Executive Quote
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={prfaq.pressRelease.executiveQuote || ''}
                  onChange={(e) => handlePressReleaseChange('executiveQuote', e.target.value)}
                  placeholder="Quote from an executive explaining how this fits into a bigger vision"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Fifth Paragraph - Customer Journey
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={prfaq.pressRelease.customerJourney || ''}
                  onChange={(e) => handlePressReleaseChange('customerJourney', e.target.value)}
                  placeholder="A typical customer journey describing the experience in simple steps"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Sixth Paragraph - Customer Testimonial
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                  value={prfaq.pressRelease.customerQuote || ''}
                  onChange={(e) => handlePressReleaseChange('customerQuote', e.target.value)}
                  placeholder="Speculative customer quote from someone who has been using your solution"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Last Line - Call to Action
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  variant="outlined"
                  value={prfaq.pressRelease.gettingStarted}
                  onChange={(e) => handlePressReleaseChange('gettingStarted', e.target.value)}
                  placeholder="Direct the reader to where they can go to get started"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* FAQ Tab - Temporarily disabled */}
      {/* <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Add questions and answers that address common concerns, objections, and details about your innovation.
            </Typography>

            {/* Existing FAQs */}
            {/* {prfaq.faq.length > 0 ? (
              <Box sx={{ mb: 4 }}>
                {prfaq.faq.map((faq, index) => (
                  <Paper key={index} sx={{ p: 2, mb: 2 }}>
                    {editingFAQIndex === index ? (
                      // Editing mode
                      <>
                        <TextField
                          fullWidth
                          label="Question"
                          variant="outlined"
                          value={faq.question}
                          onChange={(e) => handleUpdateFAQ(index, 'question', e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="subtitle2" gutterBottom>
                          Answer
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <ReactQuill
                            value={faq.answer}
                            onChange={(value) => handleUpdateFAQ(index, 'answer', value)}
                            style={{ height: '150px', marginBottom: '50px' }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSaveFAQEdit}
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
                            <IconButton size="small" onClick={() => handleEditFAQ(index)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteFAQ(index)}>
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
                  No FAQs added yet. Add your first FAQ below.
                </Typography>
              </Box>
            )} */}

            {/* Add new FAQ */}
            {/* <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Add New FAQ
              </Typography>
              <TextField
                fullWidth
                label="Question"
                variant="outlined"
                value={newFAQ.question}
                onChange={handleNewFAQQuestionChange}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle2" gutterBottom>
                Answer
              </Typography>
              <Box sx={{ mb: 2 }}>
                <ReactQuill
                  value={newFAQ.answer}
                  onChange={handleNewFAQAnswerChange}
                  style={{ height: '150px', marginBottom: '50px' }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleAddFAQ}
                  startIcon={<AddIcon />}
                  disabled={!newFAQ.question.trim() || !newFAQ.answer.trim()}
                >
                  Add FAQ
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </TabPanel> */}

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
    </Container>
  );
};

export default PRFAQPage; 