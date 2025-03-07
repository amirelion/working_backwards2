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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowForward,
  ArrowBack,
  Save as SaveIcon,
} from '@mui/icons-material';
import { RootState } from '../store';
import { addAssumption, updateAssumption, removeAssumption } from '../store/sessionSlice';
import { Assumption } from '../types';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';
import { format } from 'date-fns';
import { backwardCompatSelectors } from '../store/compatUtils';

const AssumptionsPage: React.FC = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const location = useLocation();
  const dispatch = useDispatch();
  const { assumptions, prfaq } = useSelector((state: RootState) => ({
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
  
  const [newAssumption, setNewAssumption] = useState<Omit<Assumption, 'id'>>({
    statement: '',
    impact: 'medium',
    confidence: 'medium',
    priority: 0,
  });
  
  const [editingAssumption, setEditingAssumption] = useState<Assumption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  
  // Track if the content has been modified since last save
  const [isModified, setIsModified] = useState(false);
  
  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasPRFAQ = prfaq.title.trim() !== '' || prfaq.pressRelease.summary.trim() !== '';

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

  // Get impact color
  const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: 'high' | 'medium' | 'low') => {
    switch (confidence) {
      case 'high':
        return 'success';
      case 'medium':
        return 'warning';
      case 'low':
        return 'error';
      default:
        return 'default';
    }
  };

  // Handle new assumption statement change
  const handleStatementChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (dialogMode === 'add') {
      setNewAssumption({ ...newAssumption, statement: event.target.value });
    } else {
      setEditingAssumption({ ...editingAssumption!, statement: event.target.value });
    }
  };

  // Handle impact change
  const handleImpactChange = (event: any) => {
    if (dialogMode === 'add') {
      setNewAssumption({ ...newAssumption, impact: event.target.value });
    } else {
      setEditingAssumption({ ...editingAssumption!, impact: event.target.value });
    }
  };

  // Handle confidence change
  const handleConfidenceChange = (event: any) => {
    if (dialogMode === 'add') {
      setNewAssumption({ ...newAssumption, confidence: event.target.value });
    } else {
      setEditingAssumption({ ...editingAssumption!, confidence: event.target.value });
    }
  };

  // Open add dialog
  const openAddDialog = () => {
    setDialogMode('add');
    setNewAssumption({
      statement: '',
      impact: 'medium',
      confidence: 'medium',
      priority: assumptions.length,
    });
    setIsDialogOpen(true);
  };

  // Open edit dialog
  const openEditDialog = (assumption: Assumption) => {
    setDialogMode('edit');
    setEditingAssumption(assumption);
    setIsDialogOpen(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
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
        setSnackbarMessage('Assumptions saved successfully');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } catch (error) {
        console.error('Error saving process:', error);
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

  // Handle add assumption
  const handleAddAssumption = () => {
    if (newAssumption.statement.trim()) {
      dispatch(addAssumption(newAssumption));
      setNewAssumption({
        statement: '',
        impact: 'medium',
        confidence: 'medium',
        priority: assumptions.length + 1,
      });
      setIsDialogOpen(false);
      setIsModified(true);
    }
  };

  // Handle update assumption
  const handleUpdateAssumption = () => {
    if (editingAssumption && editingAssumption.statement.trim()) {
      dispatch(updateAssumption({
        id: editingAssumption.id,
        updates: {
          statement: editingAssumption.statement,
          impact: editingAssumption.impact,
          confidence: editingAssumption.confidence,
        },
      }));
      setIsDialogOpen(false);
      setIsModified(true);
    }
  };

  // Handle delete assumption
  const handleDeleteAssumption = (id: string) => {
    if (window.confirm('Are you sure you want to delete this assumption?')) {
      dispatch(removeAssumption(id));
      setIsModified(true);
    }
  };

  // Handle move assumption up
  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const currentAssumption = assumptions[index];
      const prevAssumption = assumptions[index - 1];
      
      dispatch(updateAssumption({
        id: currentAssumption.id,
        updates: { priority: currentAssumption.priority - 1 },
      }));
      
      dispatch(updateAssumption({
        id: prevAssumption.id,
        updates: { priority: prevAssumption.priority + 1 },
      }));
      
      setIsModified(true);
    }
  };

  // Handle move assumption down
  const handleMoveDown = (index: number) => {
    if (index < assumptions.length - 1) {
      const currentAssumption = assumptions[index];
      const nextAssumption = assumptions[index + 1];
      
      dispatch(updateAssumption({
        id: currentAssumption.id,
        updates: { priority: currentAssumption.priority + 1 },
      }));
      
      dispatch(updateAssumption({
        id: nextAssumption.id,
        updates: { priority: nextAssumption.priority - 1 },
      }));
      
      setIsModified(true);
    }
  };

  // Handle continue to experiments
  const handleContinueToExperiments = () => {
    // Save before navigating
    if (isModified && currentProcessId) {
      saveCurrentProcess()
        .then(() => navigate('/experiments'))
        .catch(error => {
          console.error('Error saving before navigation:', error);
          setSnackbarMessage('Failed to save before navigating');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      navigate('/experiments');
    }
  };

  // Handle back to PRFAQ
  const handleBackToPRFAQ = () => {
    // Save before navigating
    if (isModified && currentProcessId) {
      saveCurrentProcess()
        .then(() => navigate('/prfaq'))
        .catch(error => {
          console.error('Error saving before navigation:', error);
          setSnackbarMessage('Failed to save before navigating');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        });
    } else {
      navigate('/prfaq');
    }
  };

  // Sort assumptions by priority
  const sortedAssumptions = [...assumptions].sort((a, b) => a.priority - b.priority);

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

      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">
              Assumptions List
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={openAddDialog}
            >
              Add Assumption
            </Button>
          </Box>

          {assumptions.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%">Priority</TableCell>
                    <TableCell width="55%">Assumption</TableCell>
                    <TableCell width="15%">Impact</TableCell>
                    <TableCell width="15%">Confidence</TableCell>
                    <TableCell width="10%">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedAssumptions.map((assumption, index) => (
                    <TableRow key={assumption.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {index + 1}
                          <Box sx={{ ml: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                            >
                              <ArrowUpwardIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === assumptions.length - 1}
                            >
                              <ArrowDownwardIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{assumption.statement}</TableCell>
                      <TableCell>
                        <Chip
                          label={assumption.impact.toUpperCase()}
                          color={getImpactColor(assumption.impact)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={assumption.confidence.toUpperCase()}
                          color={getConfidenceColor(assumption.confidence)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => openEditDialog(assumption)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteAssumption(assumption.id)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No assumptions added yet. Add your first assumption to get started.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            How to Identify Key Assumptions
          </Typography>
          <Typography variant="body2" paragraph>
            Key assumptions are the critical beliefs that must be true for your innovation to succeed. They often fall into these categories:
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Customer Assumptions
                </Typography>
                <Typography variant="body2">
                  • Who are the customers?<br />
                  • What problem do they have?<br />
                  • How important is this problem to them?<br />
                  • Would they pay for a solution?
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Solution Assumptions
                </Typography>
                <Typography variant="body2">
                  • Does our solution solve the problem?<br />
                  • Is it better than alternatives?<br />
                  • Can we build it with our resources?<br />
                  • Will customers understand how to use it?
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Business Model Assumptions
                </Typography>
                <Typography variant="body2">
                  • Will customers pay our price?<br />
                  • Is our cost structure sustainable?<br />
                  • Can we reach customers efficiently?<br />
                  • Is the market large enough?
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Market Assumptions
                </Typography>
                <Typography variant="body2">
                  • Is the timing right for this innovation?<br />
                  • How will competitors respond?<br />
                  • Are there regulatory concerns?<br />
                  • Are there technological dependencies?
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

      {/* Add/Edit Assumption Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New Assumption' : 'Edit Assumption'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Assumption Statement"
            variant="outlined"
            value={dialogMode === 'add' ? newAssumption.statement : editingAssumption?.statement || ''}
            onChange={handleStatementChange}
            placeholder="What must be true for your innovation to succeed?"
            sx={{ mb: 3, mt: 1 }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="impact-label">Impact if Wrong</InputLabel>
                <Select
                  labelId="impact-label"
                  value={dialogMode === 'add' ? newAssumption.impact : editingAssumption?.impact || 'medium'}
                  label="Impact if Wrong"
                  onChange={handleImpactChange}
                >
                  <MenuItem value="high">High (Fatal to the innovation)</MenuItem>
                  <MenuItem value="medium">Medium (Requires significant changes)</MenuItem>
                  <MenuItem value="low">Low (Minor adjustments needed)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="confidence-label">Confidence Level</InputLabel>
                <Select
                  labelId="confidence-label"
                  value={dialogMode === 'add' ? newAssumption.confidence : editingAssumption?.confidence || 'medium'}
                  label="Confidence Level"
                  onChange={handleConfidenceChange}
                >
                  <MenuItem value="high">High (Very confident it's true)</MenuItem>
                  <MenuItem value="medium">Medium (Somewhat confident)</MenuItem>
                  <MenuItem value="low">Low (Not confident at all)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={dialogMode === 'add' ? handleAddAssumption : handleUpdateAssumption}
            disabled={dialogMode === 'add' 
              ? !newAssumption.statement.trim() 
              : !editingAssumption?.statement.trim()}
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

export default AssumptionsPage; 