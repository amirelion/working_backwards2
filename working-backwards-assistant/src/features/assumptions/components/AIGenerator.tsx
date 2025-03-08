import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  AutoFixHigh as AutoFixHighIcon,
  Add as AddIcon,
  Lightbulb as LightbulbIcon,
} from '@mui/icons-material';
import { AssumptionCategory } from '../types';
import { getCategoryIcon, getCategoryColor } from '../utils/categoryUtils';

interface AIGeneratorProps {
  onAddAssumption: (statement: string, category: AssumptionCategory) => void;
  onGenerateAssumptions: (category: AssumptionCategory, customPrompt?: string) => Promise<void>;
  generatedAssumptions: Array<{ statement: string; category: AssumptionCategory }>;
  isGenerating: boolean;
  disabled?: boolean;
}

const AIGenerator: React.FC<AIGeneratorProps> = ({
  onAddAssumption,
  onGenerateAssumptions,
  generatedAssumptions,
  isGenerating,
  disabled = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AssumptionCategory>('customer');
  const [customPrompt, setCustomPrompt] = useState('');

  return (
    <Card sx={{ mb: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Generate Assumptions with AI
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Automatically generate key assumptions based on your PRFAQ. Select a category to focus on specific aspects of your innovation.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="assumption-category-label">Assumption Category</InputLabel>
            <Select
              labelId="assumption-category-label"
              value={selectedCategory}
              label="Assumption Category"
              onChange={(e) => setSelectedCategory(e.target.value as AssumptionCategory)}
              disabled={isGenerating || disabled}
            >
              <MenuItem value="customer">Customer Assumptions</MenuItem>
              <MenuItem value="solution">Solution Assumptions</MenuItem>
              <MenuItem value="business">Business Model Assumptions</MenuItem>
              <MenuItem value="market">Market Assumptions</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="secondary"
            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            onClick={() => onGenerateAssumptions(selectedCategory, customPrompt)}
            disabled={isGenerating || disabled}
          >
            {isGenerating ? 'Generating...' : 'Generate Assumptions'}
          </Button>
        </Box>
        
        <TextField
          fullWidth
          label="Custom Instructions (Optional)"
          variant="outlined"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Add specific instructions for AI assumption generation..."
          disabled={isGenerating || disabled}
          sx={{ mb: 3 }}
        />
        
        {generatedAssumptions.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" gutterBottom>
              Generated Assumptions
            </Typography>
            <List>
              {generatedAssumptions.map((assumption, index) => {
                const AssumptionCategoryIcon = getCategoryIcon(assumption.category);
                return (
                  <ListItem key={index} alignItems="flex-start">
                    <ListItemIcon>
                      <LightbulbIcon color={getCategoryColor(assumption.category)} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            icon={<AssumptionCategoryIcon fontSize="small" />}
                            label={assumption.category.charAt(0).toUpperCase() + assumption.category.slice(1)}
                            color={getCategoryColor(assumption.category)}
                            size="small"
                          />
                          <Typography variant="body1">{assumption.statement}</Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="Add this assumption">
                        <IconButton
                          edge="end"
                          onClick={() => onAddAssumption(assumption.statement, assumption.category)}
                          disabled={disabled}
                        >
                          <AddIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AIGenerator; 