import React from 'react';
import { Tabs, Tab, Box, Badge } from '@mui/material';
import { AssumptionCategory } from '../types';

interface CategoryTabsProps {
  selectedCategory: AssumptionCategory | 'all';
  onCategoryChange: (category: AssumptionCategory | 'all') => void;
  categoryCounts: Record<AssumptionCategory | 'all', number>;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}) => {
  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Tabs
        value={selectedCategory}
        onChange={(_, newValue) => onCategoryChange(newValue)}
        aria-label="assumption categories"
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab 
          value="all" 
          label={
            <Badge badgeContent={categoryCounts.all} color="primary">
              All Assumptions
            </Badge>
          } 
        />
        <Tab 
          value="customer" 
          label={
            <Badge badgeContent={categoryCounts.customer} color="secondary">
              Customer
            </Badge>
          } 
        />
        <Tab 
          value="solution" 
          label={
            <Badge badgeContent={categoryCounts.solution} color="error">
              Solution
            </Badge>
          } 
        />
        <Tab 
          value="business" 
          label={
            <Badge badgeContent={categoryCounts.business} color="info">
              Business Model
            </Badge>
          } 
        />
        <Tab 
          value="market" 
          label={
            <Badge badgeContent={categoryCounts.market} color="success">
              Market
            </Badge>
          } 
        />
      </Tabs>
    </Box>
  );
};

export default CategoryTabs; 