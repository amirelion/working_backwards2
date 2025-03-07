import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Paper,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Autocomplete,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ExpandMore as ExpandMoreIcon,
  Science as ScienceIcon,
  ArrowBack,
  CheckCircle,
  Psychology,
  Save as SaveIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { addExperiment, updateExperiment, removeExperiment } from '../store/sessionSlice';
import { getAIResponse, getExperimentSuggestionsPrompt } from '../services/aiService';
import { Experiment, FAQ, Assumption } from '../types';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';
import { format } from 'date-fns';
import { backwardCompatSelectors } from '../store/compatUtils';

const ExperimentsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { experiments, assumptions, prfaq } = useSelector((state: RootState) => ({
    experiments: backwardCompatSelectors.experiments(state),
    assumptions: backwardCompatSelectors.assumptions(state),
    prfaq: backwardCompatSelectors.prfaq(state)
  }));
  
  // Working Backwards context
  const { 
    currentProcessId, 
    saveCurrentProcess, 
    isSaving, 
    lastSaved,
    error: processError
  } = useWorkingBackwards();
  
  const [newExperiment, setNewExperiment] = useState<Omit<Experiment, 'id'>>({
    name: '',
    hypothesis: '',
    methodology: '',
    successCriteria: '',
    status: 'planned',
    relatedAssumptions: [],
  });
  
  const [editingExperiment, setEditingExperiment] = useState<Experiment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string>('');
  
  // Track if the content has been modified since last save
  const [isModified, setIsModified] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  
  // Reset modified flag when saving completes
  useEffect(() => {
    if (!isSaving && lastSaved) {
      setIsModified(false);
    }
  }, [isSaving, lastSaved]);

  // Show error message if process error occurs
  useEffect(() => {
    if (processError) {
      setSnackbarMessage(`Error: ${processError}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [processError]);

  // Get status color
  const getStatusColor = (status: 'planned' | 'in-progress' | 'completed') => {
    switch (status) {
      case 'planned':
        return 'default';
      case 'in-progress':
        return 'primary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  // Handle experiment field change
  const handleExperimentChange = (field: keyof Omit<Experiment, 'id' | 'relatedAssumptions'>, value: string) => {
    if (dialogMode === 'add') {
      setNewExperiment({ ...newExperiment, [field]: value });
    } else {
      setEditingExperiment({ ...editingExperiment!, [field]: value });
    }
  };

  // Handle related assumptions change
  const handleRelatedAssumptionsChange = (_event: React.SyntheticEvent, value: string[]) => {
    if (dialogMode === 'add') {
      setNewExperiment({ ...newExperiment, relatedAssumptions: value });
    } else {
      setEditingExperiment({ ...editingExperiment!, relatedAssumptions: value });
    }
  };

  // Open add dialog
  const openAddDialog = () => {
    setDialogMode('add');
    setNewExperiment({
      name: '',
      hypothesis: '',
      methodology: '',
      successCriteria: '',
      status: 'planned',
      relatedAssumptions: [],
    });
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (experiment: Experiment) => {
    setDialogMode('edit');
    setEditingExperiment(experiment);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  // Handle add experiment
  const handleAddExperiment = () => {
    if (newExperiment.name.trim() && newExperiment.hypothesis.trim()) {
      dispatch(addExperiment(newExperiment));
      setNewExperiment({
        name: '',
        hypothesis: '',
        methodology: '',
        successCriteria: '',
        status: 'planned',
        relatedAssumptions: [],
      });
      setIsDialogOpen(false);
      setIsModified(true);
    }
  };

  // Handle update experiment
  const handleUpdateExperiment = () => {
    if (editingExperiment && editingExperiment.name.trim() && editingExperiment.hypothesis.trim()) {
      dispatch(updateExperiment({
        id: editingExperiment.id,
        updates: {
          name: editingExperiment.name,
          hypothesis: editingExperiment.hypothesis,
          methodology: editingExperiment.methodology,
          successCriteria: editingExperiment.successCriteria,
          status: editingExperiment.status,
          relatedAssumptions: editingExperiment.relatedAssumptions,
        },
      }));
      setIsDialogOpen(false);
      setIsModified(true);
    }
  };

  // Handle delete experiment
  const handleDeleteExperiment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this experiment?')) {
      dispatch(removeExperiment(id));
      setIsModified(true);
    }
  };

  // Handle update experiment status
  const handleUpdateStatus = (id: string, status: 'planned' | 'in-progress' | 'completed') => {
    dispatch(updateExperiment({
      id,
      updates: { status },
    }));
    setIsModified(true);
  };

  // Handle back to assumptions
  const handleBackToAssumptions = () => {
    // Save before navigating
    if (isModified && currentProcessId) {
      saveCurrentProcess()
        .then(() => navigate('/assumptions'))
        .catch(error => {
          console.error('Error saving before navigation:', error);
          setSnackbarMessage('Failed to save before navigating');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      navigate('/assumptions');
    }
  };

  // Handle finish
  const handleFinish = () => {
    // Save before navigating
    if (isModified && currentProcessId) {
      saveCurrentProcess()
        .then(() => navigate('/'))
        .catch(error => {
          console.error('Error saving before navigation:', error);
          setSnackbarMessage('Failed to save before navigating');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      navigate('/');
    }
  };

  // Generate experiment suggestions using AI
  const generateExperimentSuggestions = async () => {
    if (assumptions.length === 0) {
      alert('Please add assumptions first before generating experiment suggestions.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a simplified PRFAQ text for the AI
      const prfaqText = `
Title: ${prfaq.title}

Summary: ${prfaq.pressRelease.summary}

Problem: ${prfaq.pressRelease.problem}

Solution: ${prfaq.pressRelease.solution}

Executive Quote: ${prfaq.pressRelease.executiveQuote}

Customer Journey: ${prfaq.pressRelease.customerJourney}

Customer Testimonial: ${prfaq.pressRelease.customerQuote}

Getting Started: ${prfaq.pressRelease.gettingStarted}

FAQs: ${prfaq.faq.map((faq: FAQ) => `Q: ${faq.question}\nA: ${faq.answer}`).join('\n\n')}
      `;
      
      // Create a list of assumption statements
      const assumptionStatements = assumptions.map((a: Assumption) => 
        `${a.statement} (Impact: ${a.impact}, Confidence: ${a.confidence})`
      );
      
      const prompt = getExperimentSuggestionsPrompt(prfaqText, assumptionStatements);
      
      const response = await getAIResponse({
        prompt,
        model: process.env.REACT_APP_AI_MODEL || '',
        provider: process.env.REACT_APP_AI_PROVIDER || '',
      });
      
      if (response.error) {
        console.error('Experiment suggestions error:', response.error);
        alert('Failed to generate experiment suggestions. Please try again later.');
      } else {
        setAiSuggestions(response.content);
      }
    } catch (error) {
      console.error('Error generating experiment suggestions:', error);
      alert('Failed to generate experiment suggestions. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Get assumption text by ID
  const getAssumptionText = (id: string) => {
    const assumption = assumptions.find((a: Assumption) => a.id === id);
    return assumption ? assumption.statement : 'Unknown assumption';
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Handle manual save
  const handleManualSave = async () => {
    if (currentProcessId) {
      try {
        await saveCurrentProcess();
        setSnackbarMessage('Experiments saved successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error saving process:', error);
        setSnackbarMessage('Failed to save experiments');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } else {
      setSnackbarMessage('No active process to save');
      setSnackbarSeverity('warning');
      setSnackbarOpen(true);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Experiments
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
        Design experiments to test your key assumptions. Good experiments are quick, low-cost, and provide clear validation of your riskiest assumptions.
      </Typography>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={generateExperimentSuggestions}
          disabled={isGenerating || assumptions.length === 0}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <ScienceIcon />}
        >
          Generate Experiment Ideas
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={openAddDialog}
        >
          Add Experiment
        </Button>
      </Box>

      {/* AI Suggestions */}
      {aiSuggestions && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">AI-Generated Experiment Suggestions</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
              {aiSuggestions}
            </Typography>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Experiments List */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {experiments.length > 0 ? (
          experiments.map((experiment: Experiment) => (
            <Grid item xs={12} key={experiment.id}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {experiment.name}
                    </Typography>
                    <Chip
                      label={experiment.status.toUpperCase().replace('-', ' ')}
                      color={getStatusColor(experiment.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                  </Box>
                  <Box>
                    <IconButton size="small" onClick={() => openEditDialog(experiment)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteExperiment(experiment.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                  Hypothesis
                </Typography>
                <Typography variant="body2" paragraph>
                  {experiment.hypothesis}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Methodology
                </Typography>
                <Typography variant="body2" paragraph>
                  {experiment.methodology}
                </Typography>

                <Typography variant="subtitle1" gutterBottom>
                  Success Criteria
                </Typography>
                <Typography variant="body2" paragraph>
                  {experiment.successCriteria}
                </Typography>

                {experiment.relatedAssumptions.length > 0 && (
                  <>
                    <Typography variant="subtitle1" gutterBottom>
                      Related Assumptions
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {experiment.relatedAssumptions.map((assumptionId: string) => (
                        <Chip
                          key={assumptionId}
                          icon={<Psychology />}
                          label={getAssumptionText(assumptionId)}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </>
                )}

                {/* Status buttons */}
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={experiment.status === 'planned' ? 'contained' : 'outlined'}
                    onClick={() => handleUpdateStatus(experiment.id, 'planned')}
                  >
                    Planned
                  </Button>
                  <Button
                    size="small"
                    variant={experiment.status === 'in-progress' ? 'contained' : 'outlined'}
                    onClick={() => handleUpdateStatus(experiment.id, 'in-progress')}
                  >
                    In Progress
                  </Button>
                  <Button
                    size="small"
                    variant={experiment.status === 'completed' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => handleUpdateStatus(experiment.id, 'completed')}
                  >
                    Completed
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No experiments added yet. Add your first experiment to get started.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Experiment Design Guide */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Experiment Design Guide
          </Typography>
          <Typography variant="body2" paragraph>
            Good experiments have these characteristics:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Focused
                </Typography>
                <Typography variant="body2">
                  Each experiment should test a single, specific assumption. Don't try to validate multiple assumptions with one experiment.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Fast
                </Typography>
                <Typography variant="body2">
                  Experiments should be quick to set up and run. Aim for days or weeks, not months. The goal is to learn rapidly.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Frugal
                </Typography>
                <Typography variant="body2">
                  Use minimal resources. The goal is to learn before investing heavily. Use mockups, prototypes, and simulations when possible.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Falsifiable
                </Typography>
                <Typography variant="body2">
                  Define clear success criteria in advance. The experiment should be able to prove your assumption wrong.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleBackToAssumptions}
          startIcon={<ArrowBack />}
        >
          Back to Assumptions
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
            endIcon={<CheckCircle />}
            onClick={handleFinish}
          >
            Finish
          </Button>
        </Box>
      </Box>

      {/* Add/Edit Experiment Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Experiment' : 'Edit Experiment'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Experiment Name"
            variant="outlined"
            value={dialogMode === 'add' ? newExperiment.name : editingExperiment?.name || ''}
            onChange={(e) => handleExperimentChange('name', e.target.value)}
            placeholder="Give your experiment a clear, descriptive name"
            sx={{ mb: 3, mt: 1 }}
          />
          
          <TextField
            fullWidth
            label="Hypothesis"
            variant="outlined"
            multiline
            rows={3}
            value={dialogMode === 'add' ? newExperiment.hypothesis : editingExperiment?.hypothesis || ''}
            onChange={(e) => handleExperimentChange('hypothesis', e.target.value)}
            placeholder="We believe that... If we... then..."
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Methodology"
            variant="outlined"
            multiline
            rows={3}
            value={dialogMode === 'add' ? newExperiment.methodology : editingExperiment?.methodology || ''}
            onChange={(e) => handleExperimentChange('methodology', e.target.value)}
            placeholder="Describe how you will conduct this experiment"
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Success Criteria"
            variant="outlined"
            multiline
            rows={2}
            value={dialogMode === 'add' ? newExperiment.successCriteria : editingExperiment?.successCriteria || ''}
            onChange={(e) => handleExperimentChange('successCriteria', e.target.value)}
            placeholder="How will you measure success? What specific metrics will you track?"
            sx={{ mb: 3 }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              value={dialogMode === 'add' ? newExperiment.status : editingExperiment?.status || 'planned'}
              label="Status"
              onChange={(e) => handleExperimentChange('status', e.target.value)}
            >
              <MenuItem value="planned">Planned</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <Autocomplete
            multiple
            options={assumptions.map((a: Assumption) => a.id)}
            getOptionLabel={(option) => getAssumptionText(option)}
            value={dialogMode === 'add' ? newExperiment.relatedAssumptions : editingExperiment?.relatedAssumptions || []}
            onChange={handleRelatedAssumptionsChange}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Related Assumptions"
                placeholder="Select assumptions this experiment will test"
              />
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={dialogMode === 'add' ? handleAddExperiment : handleUpdateExperiment}
            disabled={dialogMode === 'add' 
              ? !newExperiment.name.trim() || !newExperiment.hypothesis.trim()
              : !editingExperiment?.name.trim() || !editingExperiment?.hypothesis.trim()}
          >
            {dialogMode === 'add' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={6000} 
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
    </Container>
  );
};

export default ExperimentsPage; 