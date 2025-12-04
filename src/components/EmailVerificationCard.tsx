'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Link from '@mui/material/Link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EmailStatusData {
  status: string;
  count: number;
  color: string;
}

interface EmailVerificationCardProps {
  data: EmailStatusData[];
  lastRunTime?: Date | null;
  loading?: boolean;
}

export default function EmailVerificationCard({ data, lastRunTime, loading }: EmailVerificationCardProps) {
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

  // Count only verified emails (exclude unknown)
  const totalEmails = data
    .filter(item => item.status !== 'unknown')
    .reduce((sum, item) => sum + item.count, 0);

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ pb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1.5 }}>
          Email Verification
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {totalEmails.toLocaleString()} verified
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, alignItems: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Verifying via{' '}
              <Link 
                href="https://truelist.io" 
                target="_blank" 
                rel="noopener noreferrer"
                sx={{ 
                  color: 'primary.main',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                truelist.io
              </Link>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
              Last verification ran {lastRunTime 
                ? lastRunTime.toLocaleString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true 
                  })
                : 'pending...'}
            </Typography>
          </Box>
        </Box>

        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.05)" vertical={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 11, fill: 'rgba(0, 0, 0, 0.6)' }}
                axisLine={{ stroke: 'rgba(0, 0, 0, 0.1)' }}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis
                type="category"
                dataKey="status"
                tick={{ fontSize: 11, fill: 'rgba(0, 0, 0, 0.7)' }}
                axisLine={false}
                tickLine={false}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: 4,
                  fontSize: 11,
                  padding: '6px 10px'
                }}
                formatter={(value: number | string) => [typeof value === 'number' ? value.toLocaleString() : value, 'Count']}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} minPointSize={3}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No email verification data available
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

