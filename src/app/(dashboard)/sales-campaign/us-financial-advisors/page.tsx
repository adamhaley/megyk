import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ConstructionIcon from '@mui/icons-material/Construction';

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

      <Paper sx={{ p: 6 }}>
        <Stack alignItems="center" spacing={2}>
          <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
          <Typography variant="h5" color="text.secondary">
            Coming Soon
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            The US Financial Advisors campaign is being set up.<br />
            Data source and models will be configured shortly.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  )
}
