import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Chip,
  Snackbar, 
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Save as SaveIcon,
  Add as AddIcon,
  GridView as GridViewIcon,
  ViewList as ViewListIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import CategoryTabs from './CategoryTabs';
import AssumptionsList from './AssumptionsList';
import AssumptionForm from './AssumptionForm';
import RiskMatrix from './RiskMatrix';
import AIGenerator from './AIGenerator';
import ExperimentLinker from './ExperimentLinker';
import { useAssumptions } from '../hooks/useAssumptions';
import { useAssumptionFiltering } from '../hooks/useAssumptionFiltering';
import { useAIGeneration } from '../hooks/useAIGeneration';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AssumptionCategory } from '../types';
import { useCurrentProcess } from '../../../features/working-backwards/contexts/CurrentProcessContext';

const AssumptionsContainer: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'matrix'>('list');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Get context and hooks
  const { 
    currentProcessId, 
    saveCurrentProcess, 
    isSaving, 
    lastSaved,
    error: processError
  } = useCurrentProcess();
  
  const {
    assumptions,
    experiments,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    addAssumption,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    updateAssumption,
    deleteAssumption,
    linkExperimentsToAssumption,
    isModified,
    newAssumption,
    editingAssumption,
    resetForm,
    handleStatementChange,
    handleDescriptionChange,
    handleCategoryChange,
    handleImpactChange,
    handleConfidenceChange,
    handleAddOrUpdateAssumption,
    handleEditAssumption,
    handleCancelEdit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNewAssumption,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setEditingAssumption,
  } = useAssumptions();
  
  const {
    selectedCategory,
    setSelectedCategory,
    filteredAssumptions,
    categoryCounts,
  } = useAssumptionFiltering(assumptions);
  
  const {
    generatedAssumptions,
    isGenerating,
    generateAssumptions,
    addGeneratedAssumption,
  } = useAIGeneration();
  
  // UI state
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedAssumptionId, setSelectedAssumptionId] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'info' | 'warning'>('info');
  
  // Get the selected assumption for the link dialog
  const selectedAssumption = assumptions.find(a => a.id === selectedAssumptionId);
  
  // Handle navigation back to PRFAQ
  const handleBackToPRFAQ = async () => {
    if (isModified && currentProcessId) {
      try {
        await saveCurrentProcess();
        navigate('/prfaq');
      } catch (error) {
        console.error('Error saving before navigation:', error);
        setSnackbarMessage('Failed to save before navigating');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      navigate('/prfaq');
    }
  };
  
  // Handle navigation to experiments
  const handleContinueToExperiments = async () => {
    if (isModified && currentProcessId) {
      try {
        await saveCurrentProcess();
        navigate('/experiments');
      } catch (error) {
        console.error('Error saving before navigation:', error);
        setSnackbarMessage('Failed to save before navigating');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      navigate('/experiments');
    }
  };
  
  // Handle manual save
  const handleManualSave = async () => {
    if (currentProcessId) {
      try {
        await saveCurrentProcess();
        setSnackbarMessage('Assumptions saved successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error saving:', error);
        setSnackbarMessage('Failed to save assumptions');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage('No active process to save');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };
  
  // Open the experiment linker dialog
  const handleOpenLinkDialog = (assumptionId: string) => {
    setSelectedAssumptionId(assumptionId);
    setLinkDialogOpen(true);
  };
  
  // Close the snackbar
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };
  
  // Show process error if it exists
  useEffect(() => {
    if (processError) {
      setSnackbarMessage(`Error: ${processError}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [processError]);
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Key Assumptions
      </Typography>
      
      {/* Save status indicators */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {isSaving && (
          <Chip 
            label="Saving..." 
            color="primary" 
            size="small" 
            variant="outlined" 
          />
        )}
        {lastSaved && !isModified && (
          <Chip 
            label={`Last saved: ${format(new Date(lastSaved), 'h:mm a')}`} 
            color="success" 
            size="small" 
            variant="outlined" 
          />
        )}
        {isModified && (
          <Chip 
            label="Unsaved changes" 
            color="warning" 
            size="small" 
            variant="outlined" 
          />
        )}
      </Box>
      
      <Typography variant="body1" paragraph>
        Identify and prioritize the key assumptions in your PRFAQ. These are the things that must be true for your innovation to succeed.
      </Typography>
      
      {/* View toggle and add button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Button
            variant={viewMode === 'list' ? 'contained' : 'outlined'}
            startIcon={<ViewListIcon />}
            onClick={() => setViewMode('list')}
            sx={{ mr: 1 }}
          >
            List
          </Button>
          <Button
            variant={viewMode === 'matrix' ? 'contained' : 'outlined'}
            startIcon={<GridViewIcon />}
            onClick={() => setViewMode('matrix')}
          >
            Risk Matrix
          </Button>
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
          disabled={!!editingAssumption}
        >
          Add Assumption
        </Button>
      </Box>
      
      {/* AI Generator */}
      <AIGenerator
        onAddAssumption={addGeneratedAssumption}
        onGenerateAssumptions={generateAssumptions}
        generatedAssumptions={generatedAssumptions}
        isGenerating={isGenerating}
        disabled={!!editingAssumption}
      />
      
      {/* Add/Edit form */}
      {(showAddForm || editingAssumption) && (
        <AssumptionForm
          statement={editingAssumption ? editingAssumption.statement : newAssumption.statement}
          description={editingAssumption ? editingAssumption.description : newAssumption.description}
          category={editingAssumption ? editingAssumption.category : newAssumption.category}
          impact={editingAssumption ? editingAssumption.impact : newAssumption.impact}
          confidence={editingAssumption ? editingAssumption.confidence : newAssumption.confidence}
          onStatementChange={handleStatementChange}
          onDescriptionChange={handleDescriptionChange}
          onCategoryChange={handleCategoryChange}
          onImpactChange={handleImpactChange}
          onConfidenceChange={handleConfidenceChange}
          onSave={handleAddOrUpdateAssumption}
          onCancel={() => {
            if (editingAssumption) {
              handleCancelEdit();
            } else {
              setShowAddForm(false);
              resetForm();
            }
          }}
          loading={isSaving}
          isEdit={!!editingAssumption}
        />
      )}
      
      {/* Category tabs */}
      <CategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoryCounts={categoryCounts}
      />
      
      {/* List or Matrix view */}
      {viewMode === 'list' ? (
        <AssumptionsList
          assumptions={filteredAssumptions}
          onEdit={handleEditAssumption}
          onDelete={deleteAssumption}
          onLinkExperiments={handleOpenLinkDialog}
          disabled={!!editingAssumption || showAddForm}
        />
      ) : (
        <RiskMatrix
          assumptions={assumptions}
          onAssumptionClick={(id) => {
            handleEditAssumption(id);
            setViewMode('list');
          }}
        />
      )}
      
      {/* Experiment linker dialog */}
      {selectedAssumption && (
        <ExperimentLinker
          open={linkDialogOpen}
          onClose={() => setLinkDialogOpen(false)}
          assumptionId={selectedAssumption.id}
          assumptionStatement={selectedAssumption.statement}
          experiments={experiments}
          linkedExperimentIds={selectedAssumption.relatedExperiments || []}
          onLinkExperiments={linkExperimentsToAssumption}
        />
      )}
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBackToPRFAQ}
          startIcon={<ArrowBack />}
        >
          Back to PRFAQ
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
            onClick={handleContinueToExperiments}
            endIcon={<ArrowForward />}
            disabled={assumptions.length === 0}
          >
            Continue to Experiments
          </Button>
        </Box>
      </Box>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssumptionsContainer; 