'use client';

import { useState, useEffect, useCallback } from 'react';
import { GermanCompany, CompanyFilters } from '@/types/company';
import { getCompanies } from '@/lib/companies';
import CompanyTable from './CompanyTable';
import SearchBar from './SearchBar';
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
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    page: 1,
    limit: 20
  });

const fetchCompanies = useCallback(async (resetData = false) => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await getCompanies(filters);

    if (resetData || filters.page === 1) {
      setCompanies(result.data);
    } else {
      setCompanies(prev => {
        const existingIds = new Set(prev.map(c => c.id));
        return [...prev, ...result.data.filter(c => !existingIds.has(c.id))];
      });
    }

    setTotalCount(result.count);
    setHasMore(result.hasMore);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to fetch companies');
  } finally {
    setLoading(false);
  }
}, [filters]);


  useEffect(() => {
    fetchCompanies(true);
  }, [filters.search, fetchCompanies]);

  useEffect(() => {
    if (filters.page > 1) {
      fetchCompanies(false);
    }
  }, [filters.page, fetchCompanies]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <Button 
            color="inherit" 
            size="small" 
            onClick={() => fetchCompanies(true)}
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
        
        <CompanyTable 
          companies={companies} 
          loading={loading} 
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </Paper>
    </Stack>
  );
}