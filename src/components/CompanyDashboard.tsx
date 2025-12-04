'use client';

import { useState, useEffect, useCallback } from 'react';
import { GermanCompany } from '@/types/company';
import { getCompanies } from '@/lib/companies';
import CompanyTable from './CompanyTable';
import SearchBar from './SearchBar';
import CompanyFilters, { FilterState } from './CompanyFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<GermanCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    hasEmail: null,
    contactSent: null,
    hasAnalysis: null,
    emailStatus: null,
  });

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCompanies({
        search,
        page: paginationModel.page + 1, // API uses 1-based, DataGrid uses 0-based
        limit: paginationModel.pageSize,
        hasEmail: filters.hasEmail ?? undefined,
        contactSent: filters.contactSent ?? undefined,
        hasAnalysis: filters.hasAnalysis ?? undefined,
        emailStatus: filters.emailStatus ?? undefined,
      });

      setCompanies(result.data);
      setTotalCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  }, [paginationModel.page, paginationModel.pageSize, search, filters]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const handleSearch = (searchTerm: string) => {
    setSearch(searchTerm);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page on search
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPaginationModel(prev => ({ ...prev, page: 0 })); // Reset to first page on filter change
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => fetchCompanies()}
          >
            Retry
          </Button>
        }
      >
        <strong>Error loading companies</strong>
        <br />
        {error}
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <AnalyticsDashboard />
      
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h6" component="h2">
              Companies
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalCount.toLocaleString()} total companies
            </Typography>
          </Box>
          <SearchBar onSearch={handleSearch} />
        </Stack>

        <CompanyFilters onFilterChange={handleFilterChange} />
        
        <CompanyTable 
          companies={companies} 
          loading={loading}
          totalCount={totalCount}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
        />
      </Paper>
    </Stack>
  );
}