import { useState, useMemo } from 'react';
import { WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';
import { FilterType, SortOrder } from '../types';
import { SelectChangeEvent } from '@mui/material';

/**
 * Helper function to convert a Date or string to a timestamp
 */
const getTimestamp = (dateOrString: Date | string | null): number => {
  if (!dateOrString) {
    return 0; // Return 0 for null or undefined values
  }
  
  if (dateOrString instanceof Date) {
    return isNaN(dateOrString.getTime()) ? 0 : dateOrString.getTime();
  }
  
  try {
    const date = new Date(dateOrString);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  } catch (e) {
    console.error('Invalid date value:', dateOrString);
    return 0; // Return a default timestamp for invalid dates
  }
};

/**
 * Custom hook to handle process filtering, sorting, and searching
 */
const useProcessFiltering = (processes: WorkingBackwardsProcessSummary[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('lastUpdated');
  const [filterType, setFilterType] = useState<FilterType>('all');

  /**
   * Handle search input change
   */
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  /**
   * Handle filter type change
   */
  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    setFilterType(event.target.value as FilterType);
  };

  /**
   * Handle sort order change - rotates through available sort options
   */
  const handleSortChange = () => {
    const sortOrders: SortOrder[] = ['lastUpdated', 'newest', 'oldest', 'alphabetical'];
    const currentIndex = sortOrders.indexOf(sortOrder);
    const nextIndex = (currentIndex + 1) % sortOrders.length;
    setSortOrder(sortOrders[nextIndex]);
  };

  /**
   * Filtered and sorted processes based on current criteria
   */
  const filteredProcesses = useMemo(() => {
    return processes
      .filter((process) => {
        // Apply search filter
        const matchesSearch = process.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Apply type filter
        if (filterType === 'all') return matchesSearch;
        if (filterType === 'recent') {
          const isRecent = new Date().getTime() - getTimestamp(process.updatedAt) < 7 * 24 * 60 * 60 * 1000; // 7 days
          return matchesSearch && isRecent;
        }
        // For 'completed' we would need to add a completion status to the process type
        // For now, we'll just return all processes
        return matchesSearch;
      })
      .sort((a, b) => {
        if (sortOrder === 'newest') {
          return getTimestamp(b.createdAt) - getTimestamp(a.createdAt);
        } else if (sortOrder === 'oldest') {
          return getTimestamp(a.createdAt) - getTimestamp(b.createdAt);
        } else if (sortOrder === 'lastUpdated') {
          return getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
        } else {
          return a.title.localeCompare(b.title);
        }
      });
  }, [processes, searchQuery, filterType, sortOrder]);

  return {
    searchQuery,
    sortOrder,
    filterType,
    filteredProcesses,
    handleSearchChange,
    handleFilterChange,
    handleSortChange
  };
};

export default useProcessFiltering; 