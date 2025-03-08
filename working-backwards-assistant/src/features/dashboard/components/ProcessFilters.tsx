import React from 'react';
import {
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Sort as SortIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { ProcessFiltersProps } from '../types';

/**
 * Component for filtering, sorting, and searching processes
 */
const ProcessFilters: React.FC<ProcessFiltersProps> = ({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  sortOrder,
  onSortChange,
  canCreateProcess,
  onNewProcess
}) => {
  const getSortLabel = () => {
    switch (sortOrder) {
      case 'newest':
        return 'Newest First';
      case 'oldest':
        return 'Oldest First';
      case 'alphabetical':
        return 'A-Z';
      case 'lastUpdated':
      default:
        return 'Last Updated';
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1, maxWidth: '70%' }}>
        <TextField
          size="small"
          placeholder="Search processes..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onSearchChange('')}
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
            onChange={onFilterChange}
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
            onClick={onSortChange}
            variant="outlined"
          >
            {getSortLabel()}
          </Button>
        </Tooltip>
      </Box>
      
      <Button
        variant="contained"
        color="secondary"
        startIcon={<AddIcon />}
        onClick={onNewProcess}
        disabled={!canCreateProcess}
      >
        New Process
      </Button>
    </Paper>
  );
};

export default ProcessFilters; 