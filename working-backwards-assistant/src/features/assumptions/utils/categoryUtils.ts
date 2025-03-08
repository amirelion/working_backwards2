import { 
  Person as PersonIcon,
  Build as BuildIcon,
  BusinessCenter as BusinessIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { AssumptionCategory } from '../types';
import { SvgIconComponent } from '@mui/icons-material';

// Get color associated with each category
export const getCategoryColor = (category: AssumptionCategory): 'secondary' | 'error' | 'info' | 'success' => {
  switch (category) {
    case 'customer':
      return 'secondary';
    case 'solution':
      return 'error';
    case 'business':
      return 'info';
    case 'market':
      return 'success';
    default:
      return 'secondary';
  }
};

// Get icon component for each category
export const getCategoryIcon = (category: AssumptionCategory): SvgIconComponent => {
  switch (category) {
    case 'customer':
      return PersonIcon;
    case 'solution':
      return BuildIcon;
    case 'business':
      return BusinessIcon;
    case 'market':
      return PublicIcon;
    default:
      return PersonIcon;
  }
};

// Get human-readable title for each category
export const getCategoryTitle = (category: AssumptionCategory): string => {
  switch (category) {
    case 'customer':
      return 'Customer Assumptions';
    case 'solution':
      return 'Solution Assumptions';
    case 'business':
      return 'Business Model Assumptions';
    case 'market':
      return 'Market Assumptions';
    default:
      return 'Unknown Category';
  }
};

// Get category description for each category
export const getCategoryDescription = (category: AssumptionCategory): string => {
  switch (category) {
    case 'customer':
      return 'Assumptions about who your customers are, what problem they have, and how important it is to them.';
    case 'solution':
      return 'Assumptions about how your solution addresses the customer problem and how it compares to alternatives.';
    case 'business':
      return 'Assumptions about your business model, pricing, cost structure, and go-to-market strategy.';
    case 'market':
      return 'Assumptions about market conditions, competition, regulations, and timing.';
    default:
      return '';
  }
}; 