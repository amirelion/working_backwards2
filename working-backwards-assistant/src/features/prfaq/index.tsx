import React, { useState, lazy, Suspense, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Save as SaveIcon,
  AutoFixHigh as AutoFixHighIcon,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
// Disable source maps for this CSS import to avoid webpack warnings
/* eslint-disable-next-line import/no-unresolved */
import 'react-quill-new/dist/quill.snow.css';
import { RootState } from '../../store';
import { useCurrentProcess } from '../../hooks/useCurrentProcess';
import { format } from 'date-fns';
import { useAuth } from '../../hooks/useAuth';
import { ExportFormat } from '../../types';
import { useAppSelector } from '../../store/hooks';
import { selectQuestions } from '../../store/workingBackwardsSlice';

// Custom hooks
import { useAIGeneration } from './hooks/useAIGeneration';
import { useFAQs } from './hooks/useFAQs';
import { usePressRelease } from './hooks/usePressRelease';
import { useProcessSync } from '../../hooks/useProcessSync';

// Components
import PressReleaseForm from './components/PressReleaseTab/PressReleaseForm';
import CustomerFAQTab from './components/FAQTabs/CustomerFAQTab';
import StakeholderFAQTab from './components/FAQTabs/StakeholderFAQTab';
import PRFAQTabPanel from './components/PRFAQTabPanel';
import { ExportMenu } from './components/ExportMenu';
import ExportMenuButton from './components/ExportMenuButton';

// Utils
import { handleExport as exportUtils } from './utils/exportUtils';

// Lazy-loaded ReactQuill component
const LazyReactQuill = lazy(() => import('react-quill-new'));

// Remove unused QuillWrapper or just comment out
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const QuillWrapper = ({ value, onChange, style, visible = true }: { 
  value: string, 
  onChange: (value: string) => void, 
  style?: React.CSSProperties,
  visible?: boolean
}) => {
  return (
    <div style={{ display: visible ? 'block' : 'none' }}>
      <Suspense fallback={<div style={{ height: style?.height || '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </div>}>
        <LazyReactQuill 
          value={value} 
          onChange={onChange} 
          style={style} 
          modules={{
            toolbar: [
              [{ 'header': [1, 2, 3, false] }],
              ['bold', 'italic', 'underline', 'strike'],
              [{ 'list': 'ordered'}, { 'list': 'bullet' }],
              ['link'],
              ['clean']
            ],
          }}
        />
      </Suspense>
    </div>
  );
};

/**
 * Main PRFAQ Page component
 */
const PRFAQPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { currentProcessId, lastSaved: contextLastSaved } = useCurrentProcess();
  
  // Get working backwards questions from Redux instead of Recoil
  const workingBackwardsResponses = useAppSelector(selectQuestions);
  
  // Get PRFAQ state from Redux
  const prfaq = useSelector((state: RootState) => state.prfaq);
  
  // State for UI
  const [tabValue, setTabValue] = useState<number>(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // AI generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingSection, setGeneratingSection] = useState<string>('');
  
  // Use our custom hooks
  const { 
    handleTitleChange, 
    handlePressReleaseChange,
    isPRFAQEmpty: checkIfPRFAQEmpty 
  } = usePressRelease();
  
  // Use our new auto-save hook
  const { setIsModified, isModified } = useProcessSync();
  const { saveCurrentProcess, isSaving } = useCurrentProcess();
  
  // Derived state
  const hasUnsavedChanges = useCallback(() => {
    // Use the isModified flag from ProcessSync
    return isModified;
  }, [isModified]);
  const prfaqIsEmpty = checkIfPRFAQEmpty(prfaq);
  
  const {
    isGeneratingPRFAQ,
    isGeneratingCustomerFAQ,
    isGeneratingStakeholderFAQ,
    generationStep,
    hasWorkingBackwardsResponses,
    generateSection,
    generateFullPRFAQ,
    generateSequentialPRFAQ,
    generateCustomerFAQs,
    generateSingleCustomerFAQ,
    generateStakeholderFAQs,
    generateSingleStakeholderFAQ
  } = useAIGeneration(prfaq, workingBackwardsResponses);
  
  const {
    newCustomerFAQ,
    editingCustomerFAQIndex,
    customerFaqComment,
    handleNewCustomerFAQQuestionChange,
    handleNewCustomerFAQAnswerChange,
    handleSaveCustomerFAQ,
    handleEditCustomerFAQ,
    handleDeleteCustomerFAQ,
    handleCustomerFaqCommentChange,
    handleUpdateCustomerFAQ,
    
    newStakeholderFAQ,
    editingStakeholderFAQIndex,
    stakeholderFaqComment,
    handleNewStakeholderFAQQuestionChange,
    handleNewStakeholderFAQAnswerChange,
    handleSaveStakeholderFAQ,
    handleEditStakeholderFAQ,
    handleDeleteStakeholderFAQ,
    handleStakeholderFaqCommentChange,
    handleUpdateStakeholderFAQ,
  } = useFAQs();
  
  // Update the handleSaveClick function
  const handleSaveClick = useCallback(async () => {
    if (!currentProcessId) {
      setSnackbarMessage('No active process to save');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }
    
    try {
      await saveCurrentProcess();
      
      setSnackbarMessage('PRFAQ saved successfully');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error saving PRFAQ:', error);
      setSnackbarMessage('Failed to save PRFAQ');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [currentProcessId, saveCurrentProcess, setSnackbarMessage, setSnackbarSeverity, setSnackbarOpen]);
  
  // Handle tab change
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle export menu
  const handleExportMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };
  
  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };
  
  const handleExport = (format: ExportFormat) => {
    handleExportMenuClose();
    exportUtils(prfaq, format);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Navigation handlers
  const handleContinueToAssumptions = () => {
    navigate('/assumptions', { state: { from: 'prfaq' } });
  };
  
  const handleBackToWorkingBackwards = () => {
    navigate('/working-backwards', { state: { from: 'prfaq' } });
  };

  // Wrap the AI generation functions to track generation state
  const handleGenerateSection = async (section: string) => {
    setIsGenerating(true);
    setGeneratingSection(section);
    
    try {
      await generateSection(section);
    } catch (error) {
      console.error(`Error generating ${section}:`, error);
      setSnackbarMessage(`Failed to generate ${section}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
      setGeneratingSection('');
    }
  };
  
  const handleGenerateFullPRFAQ = async () => {
    setIsGenerating(true);
    setGeneratingSection('fullPRFAQ');
    
    try {
      await generateFullPRFAQ();
    } catch (error) {
      console.error('Error generating full PRFAQ:', error);
      setSnackbarMessage('Failed to generate full PRFAQ');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
      setGeneratingSection('');
    }
  };

  const handleGenerateSequentialPRFAQ = async () => {
    setIsGenerating(true);
    setGeneratingSection('sequentialPRFAQ');
    
    try {
      await generateSequentialPRFAQ();
    } catch (error) {
      console.error('Error generating sequential PRFAQ:', error);
      setSnackbarMessage('Failed to generate sequential PRFAQ');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsGenerating(false);
      setGeneratingSection('');
    }
  };

  const [sequentialProgress, setSequentialProgress] = useState(0);

  useEffect(() => {
    if (generatingSection === 'sequentialPRFAQ' && generationStep) {
      const stepMatch = generationStep.match(/\((\d+)\/8\)/);
      if (stepMatch && stepMatch[1]) {
        const step = parseInt(stepMatch[1]);
        setSequentialProgress((step / 8) * 100);
      }
    } else {
      setSequentialProgress(0);
    }
  }, [generatingSection, generationStep]);

  // Add an effect to watch for changes in the PRFAQ state
  useEffect(() => {
    // Mark as modified whenever PRFAQ state changes
    setIsModified(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prfaq]);

  // Add auto-save effect similar to Working Backwards
  useEffect(() => {
    const AUTOSAVE_DELAY = 3000; // 3 seconds
    
    // Only setup auto-save if we have a process ID
    if (!currentProcessId) return;
    
    const autoSaveInterval = setInterval(async () => {
      // Only save if modified and not currently generating content
      if (isModified && !isGenerating) {
        try {
          await saveCurrentProcess();
          console.log('Auto-saved PRFAQ data');
        } catch (error) {
          console.error('Failed to auto-save PRFAQ:', error);
        }
      }
    }, AUTOSAVE_DELAY);
    
    // Clean up on unmount
    return () => clearInterval(autoSaveInterval);
  }, [currentProcessId, isModified, isGenerating, saveCurrentProcess]);

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
                sx={{ bgcolor: 'primary.main', color: 'white' }}
              />
            )}
            
            {!isSaving && contextLastSaved && !hasUnsavedChanges() && (
              <Chip 
                label={`Saved at ${format(new Date(contextLastSaved), 'h:mm a')}`} 
                size="small" 
                sx={{ bgcolor: 'success.main', color: 'white' }}
              />
            )}
            
            {!isSaving && hasUnsavedChanges() && (
              <Tooltip title="Save your work">
                <Button 
                  size="small" 
                  variant="contained" 
                  color="success" 
                  startIcon={<SaveIcon />} 
                  onClick={handleSaveClick}
                >
                  Save
                </Button>
              </Tooltip>
            )}
          </Box>
        </Box>
        
        {/* Export menu button */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <ExportMenuButton 
            onClick={handleExportMenuOpen} 
            disabled={prfaqIsEmpty} 
          />
          
          {tabValue === 0 && (
            <>
              <Button
                variant="contained"
                color="primary"
                startIcon={isGeneratingPRFAQ && generatingSection === 'fullPRFAQ' ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerateFullPRFAQ}
                disabled={isGeneratingPRFAQ || !hasWorkingBackwardsResponses}
                sx={{ mr: 1 }}
              >
                {isGeneratingPRFAQ && generatingSection === 'fullPRFAQ' ? `Generating...` : "Generate All (Basic)"}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={isGeneratingPRFAQ && generatingSection === 'sequentialPRFAQ' ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerateSequentialPRFAQ}
                disabled={isGeneratingPRFAQ || !hasWorkingBackwardsResponses}
              >
                {isGeneratingPRFAQ && generatingSection === 'sequentialPRFAQ' ? `${generationStep}` : "Generate Sequentially"}
              </Button>
            </>
          )}
        </Box>
        
        {/* Export menu */}
        <ExportMenu 
          anchorEl={exportMenuAnchor} 
          open={Boolean(exportMenuAnchor)} 
          onClose={handleExportMenuClose} 
          onExport={handleExport} 
        />
        
        {/* Tabs and content */}
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="prfaq tabs">
              <Tab label="Press Release" id="prfaq-tab-0" aria-controls="prfaq-tabpanel-0" />
              <Tab 
                label="Customer FAQs" 
                id="prfaq-tab-1" 
                aria-controls="prfaq-tabpanel-1" 
                disabled={prfaqIsEmpty}
              />
              <Tab 
                label="Stakeholder FAQs" 
                id="prfaq-tab-2" 
                aria-controls="prfaq-tabpanel-2" 
                disabled={prfaqIsEmpty}
              />
            </Tabs>
          </Box>

          {/* Press Release Tab */}
          <PRFAQTabPanel value={tabValue} index={0}>
            <PressReleaseForm
              prfaq={prfaq}
              onTitleChange={handleTitleChange}
              onPressReleaseChange={handlePressReleaseChange}
              onGenerateSection={handleGenerateSection}
              isGenerating={isGenerating}
              generatingSection={generatingSection}
              disabled={isGenerating}
            />
          </PRFAQTabPanel>

          {/* Customer FAQs Tab */}
          <PRFAQTabPanel value={tabValue} index={1}>
            <CustomerFAQTab
              prfaq={prfaq}
              newCustomerFAQ={newCustomerFAQ}
              editingCustomerFAQIndex={editingCustomerFAQIndex}
              customerFaqComment={customerFaqComment}
              onQuestionChange={handleNewCustomerFAQQuestionChange}
              onAnswerChange={handleNewCustomerFAQAnswerChange}
              onSaveFAQ={handleSaveCustomerFAQ}
              onEditFAQ={handleEditCustomerFAQ}
              onDeleteFAQ={handleDeleteCustomerFAQ}
              onCommentChange={handleCustomerFaqCommentChange}
              onUpdateFAQ={handleUpdateCustomerFAQ}
              onGenerateFAQs={generateCustomerFAQs}
              onGenerateSingleFAQ={generateSingleCustomerFAQ}
              isGenerating={isGeneratingCustomerFAQ}
              disabled={isGeneratingPRFAQ || isGeneratingCustomerFAQ}
            />
          </PRFAQTabPanel>

          {/* Stakeholder FAQs Tab */}
          <PRFAQTabPanel value={tabValue} index={2}>
            <StakeholderFAQTab
              prfaq={prfaq}
              newStakeholderFAQ={newStakeholderFAQ}
              editingStakeholderFAQIndex={editingStakeholderFAQIndex}
              stakeholderFaqComment={stakeholderFaqComment}
              onQuestionChange={handleNewStakeholderFAQQuestionChange}
              onAnswerChange={handleNewStakeholderFAQAnswerChange}
              onSaveFAQ={handleSaveStakeholderFAQ}
              onEditFAQ={handleEditStakeholderFAQ}
              onDeleteFAQ={handleDeleteStakeholderFAQ}
              onCommentChange={handleStakeholderFaqCommentChange}
              onUpdateFAQ={handleUpdateStakeholderFAQ}
              onGenerateFAQs={generateStakeholderFAQs}
              onGenerateSingleFAQ={generateSingleStakeholderFAQ}
              isGenerating={isGeneratingStakeholderFAQ}
              disabled={isGeneratingPRFAQ || isGeneratingStakeholderFAQ}
            />
          </PRFAQTabPanel>
        </Paper>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handleBackToWorkingBackwards}
          >
            Back to Working Backwards
          </Button>
          
          <Button
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleContinueToAssumptions}
            disabled={prfaqIsEmpty}
          >
            Continue to Assumptions
          </Button>
        </Box>

        {isGeneratingPRFAQ && generatingSection === 'sequentialPRFAQ' && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress variant="determinate" value={sequentialProgress} />
            <Typography variant="caption" display="block" textAlign="center" sx={{ mt: 1 }}>
              {generationStep}
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PRFAQPage; 