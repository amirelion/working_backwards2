import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useRecoilValue } from 'recoil';
import {
  Box,
  Button,
  Container,
  Paper,
  Tabs,
  Tab,
  Typography,
  CircularProgress,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  AutoFixHigh as AutoFixHighIcon,
  ArrowForward,
  ArrowBack,
} from '@mui/icons-material';
import 'react-quill/dist/quill.snow.css';
import { RootState } from '../../store';
import { useWorkingBackwards } from '../../contexts/WorkingBackwardsContext';
import { format } from 'date-fns';
import { workingBackwardsQuestionsState } from '../../atoms/workingBackwardsQuestionsState';
import { useAuth } from '../../contexts/AuthContext';
import { ExportFormat } from '../../types';

// Custom hooks
import useAIGeneration from './hooks/useAIGeneration';
import useFAQs from './hooks/useFAQs';
import usePressRelease from './hooks/usePressRelease';

// Components
import PressReleaseForm from './components/PressReleaseTab/PressReleaseForm';
import CustomerFAQTab from './components/FAQTabs/CustomerFAQTab';
import StakeholderFAQTab from './components/FAQTabs/StakeholderFAQTab';
import PRFAQTabPanel from './components/PRFAQTabPanel';
import { ExportMenu, ExportMenuButton } from './components/ExportMenu';

// Utils
import { handleExport as exportUtils } from './utils/exportUtils';

// Lazy-loaded ReactQuill component
const LazyReactQuill = lazy(() => import('react-quill'));

// React Quill wrapper component
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
  const location = useLocation();
  const { currentUser } = useAuth();
  const { currentProcessId, saveCurrentProcess, isSaving: isContextSaving, lastSaved: contextLastSaved, isModified: contextIsModified, setIsModified } = useWorkingBackwards();
  const workingBackwardsResponses = useRecoilValue(workingBackwardsQuestionsState);
  
  // Get PRFAQ state from Redux
  const prfaq = useSelector((state: RootState) => state.prfaq);
  
  // State for UI
  const [tabValue, setTabValue] = useState<number>(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('success');
  
  // Custom hooks
  const { 
    handleTitleChange, 
    handlePressReleaseChange, 
    isPRFAQEmpty: checkIsPRFAQEmpty 
  } = usePressRelease();
  
  const {
    isGeneratingPRFAQ,
    isGeneratingCustomerFAQ,
    isGeneratingStakeholderFAQ,
    generatingSection,
    generationStep,
    hasWorkingBackwardsResponses,
    generateSection,
    generateFullPRFAQ,
    generateCustomerFAQs,
    generateSingleCustomerFAQ,
    generateStakeholderFAQs,
    generateSingleStakeholderFAQ,
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
  
  // Check if PRFAQ is empty
  const isPRFAQEmpty = checkIsPRFAQEmpty(prfaq);
  
  // Auto-save when PRFAQ state changes
  useEffect(() => {
    setIsModified(true);
    const autoSaveTimeout = setTimeout(() => {
      if (currentProcessId) {
        handleManualSave();
      }
    }, 5000);
    
    return () => clearTimeout(autoSaveTimeout);
  }, [prfaq]);
  
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
  
  // Handle manual save
  const handleManualSave = async () => {
    if (!currentProcessId) return;
    
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
            {isContextSaving && (
              <Chip 
                icon={<CircularProgress size={16} color="inherit" />} 
                label="Saving..." 
                size="small" 
                color="default"
              />
            )}
            
            {!isContextSaving && contextLastSaved && (
              <Tooltip title={`Last saved: ${format(contextLastSaved, 'MMM d, yyyy h:mm a')}`}>
                <Chip 
                  label={`Saved ${format(contextLastSaved, 'h:mm a')}`} 
                  size="small" 
                  color="success"
                  variant="outlined"
                />
              </Tooltip>
            )}
            
            {contextIsModified && !isContextSaving && (
              <Chip 
                label="Unsaved changes" 
                size="small" 
                color="warning"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
        
        {/* Main controls */}
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
              disabled={isContextSaving || !contextIsModified || !currentProcessId}
            >
              Save
            </Button>
            <ExportMenuButton onClick={handleExportMenuOpen} />
            <Button
              variant="contained"
              color="primary"
              onClick={generateFullPRFAQ}
              disabled={isGeneratingPRFAQ || !hasWorkingBackwardsResponses}
              startIcon={isGeneratingPRFAQ ? <CircularProgress size={20} /> : <AutoFixHighIcon />}
            >
              {isGeneratingPRFAQ ? `${generationStep}` : 'Generate Complete PRFAQ'}
            </Button>
          </Box>
        </Box>
        
        {/* Export Menu */}
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
          <PRFAQTabPanel value={tabValue} index={0}>
            <PressReleaseForm
              prfaq={prfaq}
              onTitleChange={handleTitleChange}
              onPressReleaseChange={handlePressReleaseChange}
              onGenerateSection={generateSection}
              isGenerating={isGeneratingPRFAQ}
              generatingSection={generatingSection}
            />
          </PRFAQTabPanel>

          {/* Customer FAQs Tab */}
          <PRFAQTabPanel value={tabValue} index={1}>
            <CustomerFAQTab 
              isPRFAQEmpty={isPRFAQEmpty}
              customerFaqs={prfaq.customerFaqs}
              editingCustomerFAQIndex={editingCustomerFAQIndex}
              newCustomerFAQ={newCustomerFAQ}
              customerFaqComment={customerFaqComment}
              tabValue={tabValue}
              onEditCustomerFAQ={handleEditCustomerFAQ}
              onDeleteCustomerFAQ={handleDeleteCustomerFAQ}
              onUpdateCustomerFAQ={handleUpdateCustomerFAQ}
              onSaveCustomerFAQ={handleSaveCustomerFAQ}
              onCustomerFAQQuestionChange={handleNewCustomerFAQQuestionChange}
              onCustomerFAQAnswerChange={handleNewCustomerFAQAnswerChange}
              onCustomerFaqCommentChange={handleCustomerFaqCommentChange}
              onGenerateCustomerFAQs={generateCustomerFAQs}
              onGenerateSingleCustomerFAQ={generateSingleCustomerFAQ}
              isGeneratingCustomerFAQ={isGeneratingCustomerFAQ}
              hasWorkingBackwardsResponses={hasWorkingBackwardsResponses}
              reactQuillComponent={QuillWrapper}
            />
          </PRFAQTabPanel>

          {/* Stakeholder FAQs Tab */}
          <PRFAQTabPanel value={tabValue} index={2}>
            <StakeholderFAQTab 
              isPRFAQEmpty={isPRFAQEmpty}
              stakeholderFaqs={prfaq.stakeholderFaqs}
              editingStakeholderFAQIndex={editingStakeholderFAQIndex}
              newStakeholderFAQ={newStakeholderFAQ}
              stakeholderFaqComment={stakeholderFaqComment}
              tabValue={tabValue}
              onEditStakeholderFAQ={handleEditStakeholderFAQ}
              onDeleteStakeholderFAQ={handleDeleteStakeholderFAQ}
              onUpdateStakeholderFAQ={handleUpdateStakeholderFAQ}
              onSaveStakeholderFAQ={handleSaveStakeholderFAQ}
              onStakeholderFAQQuestionChange={handleNewStakeholderFAQQuestionChange}
              onStakeholderFAQAnswerChange={handleNewStakeholderFAQAnswerChange}
              onStakeholderFaqCommentChange={handleStakeholderFaqCommentChange}
              onGenerateStakeholderFAQs={generateStakeholderFAQs}
              onGenerateSingleStakeholderFAQ={generateSingleStakeholderFAQ}
              isGeneratingStakeholderFAQ={isGeneratingStakeholderFAQ}
              hasWorkingBackwardsResponses={hasWorkingBackwardsResponses}
              reactQuillComponent={QuillWrapper}
            />
          </PRFAQTabPanel>
        </Paper>
        
        {/* Navigation buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
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