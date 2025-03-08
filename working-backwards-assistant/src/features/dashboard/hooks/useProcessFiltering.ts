import { useState, useMemo } from 'react';
import { WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';
import { FilterType, SortOrder } from '../types';
import { SelectChangeEvent } from '@mui/material';

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