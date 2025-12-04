'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';

interface DomainHealth {
  domain: string;
  spf: { exists: boolean; record?: string };
  dmarc: { exists: boolean; record?: string };
  mx: { exists: boolean; count: number };
  status: 'healthy' | 'warning' | 'error';
}

interface EmailWarmupCardProps {
  domains: DomainHealth[];
  loading?: boolean;
  workflowActive?: boolean;
  lastRunTime?: Date | null;
}

const StatusIcon = ({ status }: { status: 'healthy' | 'warning' | 'error' }) => {
  if (status === 'healthy') {
    return <CheckCircleIcon sx={{ fontSize: 16, color: 'rgba(76, 175, 80, 0.8)' }} />;
  }
  if (status === 'warning') {
    return <WarningIcon sx={{ fontSize: 16, color: 'rgba(255, 152, 0, 0.8)' }} />;
  }
  return <ErrorIcon sx={{ fontSize: 16, color: 'rgba(244, 67, 54, 0.8)' }} />;
};

export default function EmailWarmupCard({ domains, loading, workflowActive, lastRunTime }: EmailWarmupCardProps) {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton variant="text" width="60%" height={32} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
            Email Warm-up & Health
          </Typography>
          {workflowActive !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: workflowActive ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 193, 7, 1)',
                  boxShadow: workflowActive 
                    ? '0 0 8px rgba(76, 175, 80, 0.6)' 
                    : '0 0 8px rgba(255, 193, 7, 0.6)',
                  animation: workflowActive ? 'pulse 2s ease-in-out infinite' : 'none',
                  '@keyframes pulse': {
                    '0%, 100%': { opacity: 1 },
                    '50%': { opacity: 0.6 },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', fontWeight: 500 }}>
                {workflowActive ? 'Active' : 'Paused'}
              </Typography>
            </Box>
          )}
        </Box>

        <Stack spacing={2}>
          {domains.map((domain) => (
            <Box key={domain.domain}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <StatusIcon status={domain.status} />
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {domain.domain}
                </Typography>
              </Box>
              
              <Stack spacing={0.75} sx={{ pl: 3 }}>
                {/* SPF */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: domain.spf.exists ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                      SPF
                    </Typography>
                  </Box>
                  {domain.spf.record && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.65rem', 
                        color: 'text.disabled',
                        fontFamily: 'monospace',
                        pl: 2,
                        display: 'block',
                        opacity: 0.7
                      }}
                    >
                      {domain.spf.record}
                    </Typography>
                  )}
                </Box>

                {/* DMARC */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: domain.dmarc.exists ? 'rgba(76, 175, 80, 0.8)' : 'rgba(255, 152, 0, 0.8)'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary', fontWeight: 500 }}>
                      DMARC
                    </Typography>
                  </Box>
                  {domain.dmarc.record && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        fontSize: '0.65rem', 
                        color: 'text.disabled',
                        fontFamily: 'monospace',
                        pl: 2,
                        display: 'block',
                        opacity: 0.7
                      }}
                    >
                      {domain.dmarc.record}
                    </Typography>
                  )}
                </Box>

                {/* MX */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: domain.mx.exists ? 'rgba(76, 175, 80, 0.8)' : 'rgba(244, 67, 54, 0.8)'
                    }}
                  />
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    MX ({domain.mx.count} servers)
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>

        {lastRunTime && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontSize: '0.7rem' }}>
            Last warm-up: {lastRunTime.toLocaleString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true 
            })}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

