'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import EmailIcon from '@mui/icons-material/Email';

export interface FilterState {
  hasEmail: boolean | null;
  contactSent: boolean | null;
  hasAnalysis: boolean | null;
}

interface CompanyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function CompanyFilters({ onFilterChange }: CompanyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    hasEmail: null,
    contactSent: null,
    hasAnalysis: null,
  });

  const handleFilterToggle = (filterKey: keyof FilterState) => {
    setFilters(prev => {
      const currentValue = prev[filterKey];
      let newValue: boolean | null;
      
      // Cycle through: null -> true -> false -> null
      if (currentValue === null) {
        newValue = true;
      } else if (currentValue === true) {
        newValue = false;
      } else {
        newValue = null;
      }

      const newFilters = { ...prev, [filterKey]: newValue };
      onFilterChange(newFilters);
      return newFilters;
    });
  };

  const getChipProps = (value: boolean | null) => {
    if (value === null) {
      return {
        variant: 'outlined' as const,
        sx: { 
          borderColor: 'divider',
          color: 'text.secondary',
          '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' }
        }
      };
    }
    return {
      variant: 'filled' as const,
      sx: { 
        bgcolor: value ? 'rgba(0, 0, 0, 0.08)' : 'rgba(0, 0, 0, 0.04)',
        color: 'text.primary',
        fontWeight: 500,
        '&:hover': { bgcolor: value ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.08)' }
      }
    };
  };

  const activeFilterCount = Object.values(filters).filter(v => v !== null).length;

  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      hasEmail: null,
      contactSent: null,
      hasAnalysis: null,
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          Quick Filters:
        </Typography>

        <Chip
          label={filters.hasEmail === null ? 'Email' : filters.hasEmail ? 'Has Email' : 'No Email'}
          icon={<EmailIcon sx={{ fontSize: '18px !important' }} />}
          onClick={() => handleFilterToggle('hasEmail')}
          {...getChipProps(filters.hasEmail)}
          clickable
        />

        <Chip
          label={filters.contactSent === null ? 'Contact Status' : filters.contactSent ? 'Contacted' : 'Not Contacted'}
          onClick={() => handleFilterToggle('contactSent')}
          {...getChipProps(filters.contactSent)}
          clickable
        />

        <Chip
          label={filters.hasAnalysis === null ? 'Analysis' : filters.hasAnalysis ? 'Analyzed' : 'Not Analyzed'}
          onClick={() => handleFilterToggle('hasAnalysis')}
          {...getChipProps(filters.hasAnalysis)}
          clickable
        />

        {activeFilterCount > 0 && (
          <Chip
            label={`Clear All (${activeFilterCount})`}
            onClick={handleClearAll}
            size="small"
            variant="outlined"
            sx={{ 
              ml: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' }
            }}
          />
        )}
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Click filters to toggle: All → Yes → No → All
      </Typography>
    </Box>
  );
}

