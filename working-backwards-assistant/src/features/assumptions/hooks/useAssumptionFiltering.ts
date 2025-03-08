import { useState, useMemo } from 'react';
import { AssumptionCategory, EnhancedAssumption } from '../types';

export const useAssumptionFiltering = (assumptions: EnhancedAssumption[]) => {
  const [selectedCategory, setSelectedCategory] = useState<AssumptionCategory | 'all'>('all');
  
  // Filter assumptions by selected category
  const filteredAssumptions = useMemo(() => {
    if (selectedCategory === 'all') {
      return assumptions;
    }
    return assumptions.filter(a => a.category === selectedCategory);
  }, [assumptions, selectedCategory]);
  
  // Calculate counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<AssumptionCategory | 'all', number> = {
      all: assumptions.length,
      customer: 0,
      solution: 0,
      business: 0,
      market: 0
    };
    
    assumptions.forEach(assumption => {
      counts[assumption.category]++;
    });
    
    return counts;
  }, [assumptions]);
  
  return {
    selectedCategory,
    setSelectedCategory,
    filteredAssumptions,
    categoryCounts
  };
}; 