import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Launch as LaunchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useWorkingBackwards } from '../contexts/WorkingBackwardsContext';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const {
    processes,
    loadingProcesses,
    createNewProcess,
    loadProcess,
    deleteProcess,
    error
  } = useWorkingBackwards();

  // New process dialog state
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);

  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Load processes on component mount
  useEffect(() => {
    if (currentUser && !loadingProcesses) {
      // refreshProcesses();
    }
  }, [currentUser, loadingProcesses]);

  // Handle creating a new process
  const handleCreateProcess = async () => {
    if (!newProcessTitle.trim()) {
      return;
    }

    setIsCreating(true);
    try {
      const processId = await createNewProcess(newProcessTitle);
      setOpenNewDialog(false);
      setNewProcessTitle('');
      
      // Navigate to the initial thoughts page with the new process ID
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error creating process:', error);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle opening an existing process
  const handleOpenProcess = async (processId: string) => {
    try {
      await loadProcess(processId);
      navigate(`/initial-thoughts?process=${processId}`);
    } catch (error) {
      console.error('Error loading process:', error);
    }
  };

  // Handle deleting a process
  const handleConfirmDelete = async () => {
    if (processToDelete) {
      try {
        await deleteProcess(processToDelete);
        setDeleteDialogOpen(false);
        setProcessToDelete(null);
      } catch (error) {
        console.error('Error deleting process:', error);
      }
    }
  };

  // Filter and sort processes
  const filteredProcesses = processes
    .filter((process) => process.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
      } else if (sortOrder === 'oldest') {
        return a.updatedAt.getTime() - b.updatedAt.getTime();
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  // Check if the user can create a new process
  const canCreateProcess = userProfile?.role === 'premium' || userProfile?.role === 'admin' || 
    (userProfile?.sessionCount || 0) < (userProfile?.maxSessions || 3);

  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!currentUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box textAlign="center" py={8}>
          <Typography variant="h4" gutterBottom>
            Sign In Required
          </Typography>
          <Typography variant="body1" paragraph>
            Please sign in to view your Working Backwards processes.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Go to Sign In
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Working Backwards Processes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, manage, and continue your Working Backwards documents.
        </Typography>
      </Box>
      
      {/* Controls Bar */}
      <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TextField
            size="small"
            placeholder="Search processes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            }}
            sx={{ width: 250 }}
          />
          <Tooltip title="Sort processes">
            <IconButton onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : sortOrder === 'oldest' ? 'alphabetical' : 'newest')}>
              <SortIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<AddIcon />}
          onClick={() => setOpenNewDialog(true)}
          disabled={!canCreateProcess}
        >
          New Process
        </Button>
      </Paper>
      
      {/* Error Message */}
      {error && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error">{error}</Typography>
        </Box>
      )}
      
      {/* Process Limit Warning */}
      {!canCreateProcess && (
        <Box mb={3} p={2} bgcolor="warning.light" borderRadius={1}>
          <Typography variant="body1">
            You have reached your limit of {userProfile?.maxSessions} Working Backwards processes. 
            Upgrade to premium to create unlimited processes.
          </Typography>
          <Button 
            variant="outlined" 
            color="warning" 
            sx={{ mt: 1 }}
            onClick={() => navigate('/profile')}
          >
            Upgrade Account
          </Button>
        </Box>
      )}
      
      {/* Processes Grid */}
      {loadingProcesses ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : filteredProcesses.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProcesses.map((process) => (
            <Grid item xs={12} sm={6} md={4} key={process.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    <FolderIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                      {process.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    Last updated: {format(process.updatedAt, 'MMM d, yyyy')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {format(process.createdAt, 'MMM d, yyyy')}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Button
                    startIcon={<LaunchIcon />}
                    onClick={() => handleOpenProcess(process.id)}
                    size="small"
                  >
                    Open
                  </Button>
                  <IconButton 
                    color="error" 
                    size="small"
                    onClick={() => {
                      setProcessToDelete(process.id);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" gutterBottom>
            No Working Backwards processes found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchQuery 
              ? "No processes match your search query. Try a different search term."
              : "Start by creating your first Working Backwards process!"
            }
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              color="secondary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewDialog(true)}
              disabled={!canCreateProcess}
            >
              Create New Process
            </Button>
          )}
        </Box>
      )}
      
      {/* New Process Dialog */}
      <Dialog open={openNewDialog} onClose={() => !isCreating && setOpenNewDialog(false)}>
        <DialogTitle>Create New Working Backwards Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Give your new Working Backwards process a name. This will help you identify it later.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Process Title"
            type="text"
            fullWidth
            value={newProcessTitle}
            onChange={(e) => setNewProcessTitle(e.target.value)}
            disabled={isCreating}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenNewDialog(false)} 
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateProcess} 
            variant="contained" 
            color="primary"
            disabled={!newProcessTitle.trim() || isCreating}
          >
            {isCreating ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this Working Backwards process? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default DashboardPage; 