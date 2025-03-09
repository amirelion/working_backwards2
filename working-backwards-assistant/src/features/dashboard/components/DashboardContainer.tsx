import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, CircularProgress, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useProcessList } from '../../../hooks/useProcessList';

import ProcessFilters from './ProcessFilters';
import ProcessGrid from './ProcessGrid';
import ProcessDialogs from './ProcessDialogs';
import ProcessMenu from './ProcessMenu';
import useProcessFiltering from '../hooks/useProcessFiltering';
import useProcessDialogs from '../hooks/useProcessDialogs';
import CustomSnackbar from '../../../components/CustomSnackbar';

/**
 * Main container component for the dashboard page
 */
const DashboardContainer: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile, loading: authLoading } = useAuth();
  const { processes, loading: loadingProcesses, error: processListError } = useProcessList();
  
  // Use custom hooks for business logic
  const {
    searchQuery,
    sortOrder,
    filterType,
    filteredProcesses,
    handleSearchChange,
    handleFilterChange,
    handleSortChange
  } = useProcessFiltering(processes);
  
  const {
    openNewDialog,
    setOpenNewDialog,
    newProcessTitle,
    setNewProcessTitle,
    isCreating,
    deleteDialogOpen,
    setDeleteDialogOpen,
    processToDelete,
    isDeleting,
    renameDialogOpen,
    setRenameDialogOpen,
    newName,
    setNewName,
    menuAnchorEl,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    handleCloseSnackbar,
    handleCreateProcess,
    handleOpenProcess,
    handleConfirmDelete,
    handleRenameProcess,
    handleMenuOpen,
    handleMenuClose,
    handleMenuAction
  } = useProcessDialogs();
  
  // Check if the user can create a new process
  const canCreateProcess = userProfile?.role === 'premium' || userProfile?.role === 'admin' || 
    (userProfile?.sessionCount || 0) < (userProfile?.maxSessions || 3);

  // If still loading auth state, show loading spinner
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // If not logged in, prompt user to sign in
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
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/')}
            >
              Go to Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Success/Error Snackbar */}
      <CustomSnackbar
        open={snackbarOpen}
        message={snackbarMessage}
        severity={snackbarSeverity}
        onClose={handleCloseSnackbar}
        autoHideDuration={snackbarSeverity === 'success' ? 3000 : null}
      />
      
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Your Working Backwards Processes
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create, manage, and continue your Working Backwards documents.
        </Typography>
      </Box>
      
      {/* Search, filter, and controls */}
      <ProcessFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        canCreateProcess={canCreateProcess}
        onNewProcess={() => setOpenNewDialog(true)}
      />
      
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
      
      {/* Process Grid */}
      <ProcessGrid
        processes={filteredProcesses}
        loading={loadingProcesses}
        onOpenProcess={handleOpenProcess}
        onMenuOpen={handleMenuOpen}
        searchQuery={searchQuery}
        processDeletingId={isDeleting ? processToDelete : null}
      />
      
      {/* Dialogs */}
      <ProcessDialogs
        openNewDialog={openNewDialog}
        setOpenNewDialog={setOpenNewDialog}
        newProcessTitle={newProcessTitle}
        setNewProcessTitle={setNewProcessTitle}
        isCreating={isCreating}
        handleCreateProcess={handleCreateProcess}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
        renameDialogOpen={renameDialogOpen}
        setRenameDialogOpen={setRenameDialogOpen}
        newName={newName}
        setNewName={setNewName}
        handleRenameProcess={handleRenameProcess}
      />
      
      {/* Process Menu */}
      <ProcessMenu
        menuAnchorEl={menuAnchorEl}
        onMenuClose={handleMenuClose}
        onMenuAction={handleMenuAction}
      />
    </Container>
  );
};

export default DashboardContainer; 