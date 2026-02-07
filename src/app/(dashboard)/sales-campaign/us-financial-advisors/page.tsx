import { Suspense } from 'react';
import CompanyDashboard from '@/components/CompanyDashboard';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

export default function USFinancialAdvisorsPage() {
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Campaign Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          US Financial Advisors | Lead Capture / Enrichment / Outreach
        </Typography>
      </Box>

      <Suspense fallback={
        <Stack alignItems="center" justifyContent="center" sx={{ height: 256 }}>
          <CircularProgress />
        </Stack>
      }>
        <CompanyDashboard campaign="us-financial-advisors" />
      </Suspense>
    </Box>
  )
}
