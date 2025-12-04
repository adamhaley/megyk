'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

export interface FilterState {
  contactSent: boolean | null;
  emailStatus: string | null;
}

interface CompanyFiltersProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function CompanyFilters({ onFilterChange }: CompanyFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    contactSent: null,
    emailStatus: null,
  });

  const emailStatusOptions = [
    'ok:email_ok',
    'risky:is_role',
    'risky:accept_all',
  ];

  const handleFilterToggle = (filterKey: keyof FilterState) => {
    const currentValue = filters[filterKey];
    let newValue: boolean | null;
    
    // Cycle through: null -> true -> false -> null
    if (currentValue === null) {
      newValue = true;
    } else if (currentValue === true) {
      newValue = false;
    } else {
      newValue = null;
    }

    const newFilters = { ...filters, [filterKey]: newValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
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

  const handleEmailStatusChange = (value: string) => {
    const newFilters = { ...filters, emailStatus: value || null };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      contactSent: null,
      emailStatus: null,
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
          label={filters.contactSent === null ? 'Contact Status' : filters.contactSent ? 'Contacted' : 'Not Contacted'}
          onClick={() => handleFilterToggle('contactSent')}
          {...getChipProps(filters.contactSent)}
          clickable
        />

        <FormControl 
          size="small" 
          sx={{ 
            minWidth: 160,
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.paper',
              fontSize: '0.875rem',
              '& .MuiSelect-select': {
                py: 0.75,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'text.primary',
              }
            }
          }}
        >
          <InputLabel 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem',
              '&.MuiInputLabel-shrink': {
                fontSize: '0.75rem',
              }
            }}
          >
            Email Status
          </InputLabel>
          <Select
            value={filters.emailStatus || ''}
            onChange={(e) => handleEmailStatusChange(e.target.value)}
            label="Email Status"
            sx={{ 
              color: 'text.primary',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'divider',
              }
            }}
          >
            <MenuItem value="" sx={{ fontSize: '0.875rem' }}>
              <em>All</em>
            </MenuItem>
            {emailStatusOptions.map((status) => (
              <MenuItem key={status} value={status} sx={{ fontSize: '0.875rem' }}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

