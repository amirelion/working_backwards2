import { WorkingBackwardsProcessSummary } from '../../../types/workingBackwards';
import { SelectChangeEvent } from '@mui/material';

/**
 * Sort order options for process list
 */
export type SortOrder = 'newest' | 'oldest' | 'alphabetical' | 'lastUpdated';

/**
 * Filter type options for process list
 */
export type FilterType = 'all' | 'recent' | 'completed';

/**
 * Props for the ProcessCard component
 */
export interface ProcessCardProps {
  process: WorkingBackwardsProcessSummary;
  onOpenProcess: (processId: string) => Promise<void>;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, processId: string) => void;
  isBeingDeleted?: boolean;
}

/**
 * Props for the ProcessGrid component
 */
export interface ProcessGridProps {
  processes: WorkingBackwardsProcessSummary[];
  loading: boolean;
  onOpenProcess: (processId: string) => Promise<void>;
  onMenuOpen: (event: React.MouseEvent<HTMLElement>, processId: string) => void;
  searchQuery: string;
  processDeletingId: string | null;
}

/**
 * Props for the ProcessFilters component
 */
export interface ProcessFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterType: FilterType;
  onFilterChange: (event: SelectChangeEvent<string>) => void;
  sortOrder: SortOrder;
  onSortChange: () => void;
  canCreateProcess: boolean;
  onNewProcess: () => void;
}

/**
 * Props for the dialog components
 */
export interface DialogsProps {
  openNewDialog: boolean;
  setOpenNewDialog: (open: boolean) => void;
  newProcessTitle: string;
  setNewProcessTitle: (title: string) => void;
  isCreating: boolean;
  handleCreateProcess: () => Promise<void>;
  
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  handleConfirmDelete: () => Promise<void>;
  isDeleting?: boolean;
  
  renameDialogOpen: boolean;
  setRenameDialogOpen: (open: boolean) => void;
  newName: string;
  setNewName: (name: string) => void;
  handleRenameProcess: () => Promise<void>;
}

/**
 * Props for the ProcessMenu component
 */
export interface ProcessMenuProps {
  menuAnchorEl: HTMLElement | null;
  onMenuClose: () => void;
  onMenuAction: (action: 'open' | 'rename' | 'delete') => void;
} 