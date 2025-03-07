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
  Menu,
  MenuItem,
  Chip,
  Badge,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
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
  CalendarToday as CalendarIcon,
  Update as UpdateIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useProcessList } from '../features/working-backwards/contexts/ProcessListContext';
import { useCurrentProcess } from '../features/working-backwards/contexts/CurrentProcessContext';
import * as workingBackwardsService from '../services/workingBackwardsService';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const {
    processes,
    loading: loadingProcesses,
    createNewProcess,
    deleteProcess,
    error: processListError
  } = useProcessList();
  
  const {
    loadProcess,
    isSaving,
    error: currentProcessError
  } = useCurrentProcess();

  // New process dialog state
  const [openNewDialog, setOpenNewDialog] = useState(false);
  const [newProcessTitle, setNewProcessTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [processToDelete, setProcessToDelete] = useState<string | null>(null);

  // Filtering and sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'alphabetical' | 'lastUpdated'>('lastUpdated');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'completed'>('all');
  
  // Process menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  
  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [processToRename, setProcessToRename] = useState<string | null>(null);

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
  
  // Handle renaming a process
  const handleRenameProcess = async () => {
    if (processToRename && newName.trim()) {
      try {
        await workingBackwardsService.renameProcess(processToRename, newName);
        setRenameDialogOpen(false);
        setProcessToRename(null);
        setNewName('');
      } catch (error) {
        console.error('Error renaming process:', error);
      }
    }
  };
  
  // Handle process menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, processId: string) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedProcessId(processId);
  };
  
  // Handle process menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedProcessId(null);
  };
  
  // Handle menu actions
  const handleMenuAction = (action: 'open' | 'rename' | 'delete') => {
    if (!selectedProcessId) return;
    
    switch (action) {
      case 'open':
        handleOpenProcess(selectedProcessId);
        break;
      case 'rename':
        const processToRename = processes.find(p => p.id === selectedProcessId);
        if (processToRename) {
          setProcessToRename(selectedProcessId);
          setNewName(processToRename.title);
          setRenameDialogOpen(true);
        }
        break;
      case 'delete':
        setProcessToDelete(selectedProcessId);
        setDeleteDialogOpen(true);
        break;
    }
    
    handleMenuClose();
  };
  
  // Handle filter change
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value as 'all' | 'recent' | 'completed');
  };
  
  // Handle sort change
  const handleSortChange = () => {
    const sortOrders: ('newest' | 'oldest' | 'alphabetical' | 'lastUpdated')[] = 
      ['lastUpdated', 'newest', 'oldest', 'alphabetical'];
    const currentIndex = sortOrders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % sortOrders.length;
    setSortOrder(sortOrders[nextIndex]);
  };

  // Filter and sort processes
  const filteredProcesses = processes
    .filter((process) => {
      // Apply search filter
      const matchesSearch = process.title.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Apply type filter
      if (filterType === 'all') return matchesSearch;
      if (filterType === 'recent') {
        const isRecent = new Date().getTime() - process.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000; // 7 days
        return matchesSearch && isRecent;
      }
      // For 'completed' we would need to add a completion status to the process type
      // For now, we'll just return all processes
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.createdAt.getTime() - a.createdAt.getTime();
      } else if (sortOrder === 'oldest') {
        return a.createdAt.getTime() - b.createdAt.getTime();
      } else if (sortOrder === 'lastUpdated') {
        return b.updatedAt.getTime() - a.updatedAt.getTime();
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, maxWidth: '70%' }}>
          <TextField
            size="small"
            placeholder="Search processes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{ width: 250 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="filter-label">Filter</InputLabel>
            <Select
              labelId="filter-label"
              value={filterType}
              label="Filter"
              onChange={handleFilterChange}
            >
              <MenuItem value="all">All Processes</MenuItem>
              <MenuItem value="recent">Recent (7 days)</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
          
          <Tooltip title={`Sort by: ${sortOrder}`}>
            <Button 
              size="small" 
              startIcon={<SortIcon />} 
              onClick={handleSortChange}
              variant="outlined"
            >
              {sortOrder === 'newest' && 'Newest First'}
              {sortOrder === 'oldest' && 'Oldest First'}
              {sortOrder === 'alphabetical' && 'A-Z'}
              {sortOrder === 'lastUpdated' && 'Last Updated'}
            </Button>
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
      {processListError && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={1}>
          <Typography color="error">{processListError}</Typography>
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
                <CardContent sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => handleOpenProcess(process.id)}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="h2" noWrap sx={{ maxWidth: '80%' }}>
                      {process.title}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, process.id)}
                      aria-label="process options"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CalendarIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Created: {format(process.createdAt, 'MMM d, yyyy')}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <UpdateIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        Updated: {formatDistanceToNow(process.updatedAt, { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  <Button
                    size="small"
                    startIcon={<LaunchIcon />}
                    onClick={() => handleOpenProcess(process.id)}
                  >
                    Open
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No processes found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchQuery ? 'Try a different search term' : 'Create your first Working Backwards process'}
          </Typography>
          {!searchQuery && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenNewDialog(true)}
              disabled={!canCreateProcess}
            >
              Create Process
            </Button>
          )}
        </Box>
      )}
      
      {/* New Process Dialog */}
      <Dialog open={openNewDialog} onClose={() => setOpenNewDialog(false)}>
        <DialogTitle>Create New Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a title for your new Working Backwards process.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Process Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newProcessTitle}
            onChange={(e) => setNewProcessTitle(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewDialog(false)}>Cancel</Button>
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
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this process? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Rename Process Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={() => setRenameDialogOpen(false)}
      >
        <DialogTitle>Rename Process</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a new name for this process.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="rename"
            label="New Process Title"
            type="text"
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRenameProcess} 
            variant="contained" 
            color="primary"
            disabled={!newName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Process Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('open')}>
          <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
          Open
        </MenuItem>
        <MenuItem onClick={() => handleMenuAction('rename')}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleMenuAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default DashboardPage; 