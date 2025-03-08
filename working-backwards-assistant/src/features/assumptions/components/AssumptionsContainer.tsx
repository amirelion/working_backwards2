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
import { DeleteAssumptionDialog } from './AssumptionDialogs';
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
    handleStatusChange,
    handleAddOrUpdateAssumption,
    handleEditAssumption,
    handleCancelEdit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setNewAssumption,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setEditingAssumption,
    // Delete dialog state and handlers
    deleteDialogOpen,
    isDeleting,
    closeDeleteDialog,
    confirmDeleteAssumption,
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
    if (!currentProcessId) {
      setSnackbarMessage('No active process to save');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
      return;
    }
    
    if (!isModified) {
      setSnackbarMessage('No changes to save');
      setSnackbarSeverity('info');
      setSnackbarOpen(true);
      return;
    }
    
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
  
  // Handle adding or updating an assumption
  const handleSaveAssumption = async () => {
    try {
      // First, update the assumption in Redux
      const success = await handleAddOrUpdateAssumption();
      
      if (success && currentProcessId) {
        // If update was successful, immediately save to Firebase
        console.log('[AssumptionsContainer] Saving updated assumption to Firebase');
        await saveCurrentProcess();
        
        // Explicitly force update the lastSaved value
        setSnackbarMessage(editingAssumption ? 'Assumption updated and saved' : 'Assumption added and saved');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Reset form and close edit form if needed
        if (!editingAssumption) {
          setShowAddForm(false);
        }
      }
    } catch (error) {
      console.error('Error saving assumption:', error);
      setSnackbarMessage('Failed to save assumption');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };
  
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Key Assumptions
      </Typography>
      
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
          status={editingAssumption ? editingAssumption.status : 'unvalidated'}
          onStatementChange={handleStatementChange}
          onDescriptionChange={handleDescriptionChange}
          onCategoryChange={handleCategoryChange}
          onImpactChange={handleImpactChange}
          onConfidenceChange={handleConfidenceChange}
          onStatusChange={handleStatusChange}
          onSave={handleSaveAssumption}
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
      
      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBackToPRFAQ}
          startIcon={<ArrowBack />}
        >
          Back to PRFAQ
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Save status indicators - moved here */}
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
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleManualSave}
            startIcon={<SaveIcon />}
            disabled={isSaving || (!isModified && lastSaved !== null) || !currentProcessId}
          >
            {isSaving ? 'Saving...' : 'Save'}
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
      
      {/* Delete confirmation dialog */}
      <DeleteAssumptionDialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDeleteAssumption}
        isDeleting={isDeleting}
      />
      
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
      
      {/* Success/Error snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default AssumptionsContainer; 