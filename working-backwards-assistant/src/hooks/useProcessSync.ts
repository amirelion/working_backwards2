import { useAppDispatch, useAppSelector } from '../store/hooks';
import { 
  selectIsModified, 
  setIsModified 
} from '../store/processManagementSlice';

/**
 * Custom hook providing process sync state from Redux
 * This is a drop-in replacement for the context-based useProcessSync hook
 */
export const useProcessSync = () => {
  const dispatch = useAppDispatch();
  const isModified = useAppSelector(selectIsModified);

  return {
    isModified,
    setIsModified: (value: boolean) => dispatch(setIsModified(value))
  };
}; 