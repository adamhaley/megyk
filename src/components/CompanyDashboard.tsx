'use client';

import { useState, useEffect, useCallback } from 'react';
import { GermanCompany } from '@/types/company';
import { getCompanies } from '@/lib/companies';
import { getEmailStatusDistribution, EmailStatusCount } from '@/lib/analytics';
import CompanyTable from './CompanyTable';
import SearchBar from './SearchBar';
import CompanyFilters, { FilterState } from './CompanyFilters';
import AnalyticsDashboard from './AnalyticsDashboard';
import EmailVerificationCard from './EmailVerificationCard';
import EmailWarmupCard from './EmailWarmupCard';
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
  const [emailStatusData, setEmailStatusData] = useState<EmailStatusCount[]>([]);
  const [emailStatusLoading, setEmailStatusLoading] = useState(true);
  const [lastVerificationTime, setLastVerificationTime] = useState<Date | null>(null);
  const [workflowActive, setWorkflowActive] = useState<boolean>(false);
  const [emailHealth, setEmailHealth] = useState<any[]>([]);
  const [emailHealthLoading, setEmailHealthLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    contactSent: null,
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
        contactSent: filters.contactSent ?? undefined,
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

  useEffect(() => {
    const fetchEmailStatus = async () => {
      try {
        setEmailStatusLoading(true);
        const data = await getEmailStatusDistribution();
        setEmailStatusData(data);
      } catch (err) {
        console.error('Failed to fetch email status distribution:', err);
      } finally {
        setEmailStatusLoading(false);
      }
    };

    const fetchLastVerification = async () => {
      try {
        const response = await fetch('/api/verification-last-run');
        const { lastVerification, workflowActive: active } = await response.json();
        if (lastVerification) {
          setLastVerificationTime(new Date(lastVerification));
        }
        setWorkflowActive(active || false);
      } catch (err) {
        console.error('Failed to fetch last verification time:', err);
      }
    };

    const fetchEmailHealth = async () => {
      try {
        setEmailHealthLoading(true);
        const response = await fetch('/api/email-health');
        const { domains } = await response.json();
        setEmailHealth(domains || []);
      } catch (err) {
        console.error('Failed to fetch email health:', err);
      } finally {
        setEmailHealthLoading(false);
      }
    };

    fetchEmailStatus();
    fetchLastVerification();
    fetchEmailHealth();
  }, []);

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

      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, 1fr)' },
            gap: 3
          }}
        >
          <EmailVerificationCard 
            data={emailStatusData} 
            loading={emailStatusLoading}
            lastRunTime={lastVerificationTime}
            workflowActive={workflowActive}
          />
          
          <EmailWarmupCard
            domains={emailHealth}
            loading={emailHealthLoading}
            workflowActive={undefined}
            lastRunTime={null}
          />
        </Box>
      </Box>
      
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