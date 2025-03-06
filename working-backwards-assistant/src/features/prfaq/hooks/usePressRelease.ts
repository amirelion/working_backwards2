import { useDispatch } from 'react-redux';
import { 
  updatePRFAQTitle, 
  updatePRFAQPressRelease,
  PRFAQState
} from '../../../store/prfaqSlice';

/**
 * Custom hook for managing press release state and operations
 */
export const usePressRelease = () => {
  const dispatch = useDispatch();

  /**
   * Handle changes to the PRFAQ title
   */
  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    dispatch(updatePRFAQTitle(event.target.value));
  };

  /**
   * Handle changes to any press release field
   */
  const handlePressReleaseChange = (field: keyof PRFAQState['pressRelease'], value: string) => {
    dispatch(updatePRFAQPressRelease({ field, value }));
  };

  /**
   * Maps a section name to the corresponding field name in the pressRelease state
   */
  const mapSectionToFieldName = (section: string): keyof PRFAQState['pressRelease'] | null => {
    switch (section) {
      case 'introduction':
        return 'introduction';
      case 'problemStatement':
        return 'problemStatement';
      case 'solution':
        return 'solution';
      case 'stakeholderQuote':
        return 'stakeholderQuote';
      case 'customerJourney':
        return 'customerJourney';
      case 'customerQuote':
        return 'customerQuote';
      case 'callToAction':
        return 'callToAction';
      case 'headline':
        return 'headline';
      default:
        return null;
    }
  };

  /**
   * Check if the PRFAQ is empty (no title or press release content)
   */
  const isPRFAQEmpty = (prfaq: PRFAQState): boolean => {
    const { title, pressRelease } = prfaq;
    
    // Check if title is empty
    if (title.trim().length > 0) return false;
    
    // Check if any press release field has content
    return !Object.values(pressRelease).some(value => 
      typeof value === 'string' && value.trim().length > 0 && 
      value !== pressRelease.date && 
      value !== pressRelease.location &&
      value !== pressRelease.aboutCompany
    );
  };

  return {
    handleTitleChange,
    handlePressReleaseChange,
    mapSectionToFieldName,
    isPRFAQEmpty,
  };
};

export default usePressRelease; 