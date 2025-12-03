'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsData, AnalyticsData } from '@/lib/analytics';
import AnalyticsChart from './AnalyticsChart';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

export default function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = await getAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="75%" height={32} />
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={288} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mb: 4 }}>
        <Alert severity="error" variant="filled">
          <strong>Error loading analytics</strong>
          <br />
          {error}
        </Alert>
      </Box>
    );
  }

  if (!analyticsData) return null;

  const finderFelixData = [
    {
      name: 'Covered',
      value: analyticsData.finderFelix.coveragePercentage,
      color: '#10B981'
    },
    {
      name: 'Not Covered',
      value: 100 - analyticsData.finderFelix.coveragePercentage,
      color: '#F3F4F6'
    }
  ];

  const analysisAnnaData = [
    {
      name: 'Website Found',
      value: analyticsData.analysisAnna.websitePercentage,
      color: '#3B82F6'
    },
    {
      name: 'Emails / Enriched',
      value: analyticsData.analysisAnna.emailPercentage,
      color: '#8B5CF6'
    },
    {
      name: 'Missing Data',
      value: Math.max(0, 100 - Math.max(analyticsData.analysisAnna.websitePercentage, analyticsData.analysisAnna.emailPercentage)),
      color: '#F3F4F6'
    }
  ].filter(item => item.value > 0);

  const pitchPaulData = [
    {
      name: 'Exported to Instantly',
      value: analyticsData.pitchPaul.exportPercentage,
      color: '#F59E0B'
    },
    {
      name: 'Not Exported',
      value: 100 - analyticsData.pitchPaul.exportPercentage,
      color: '#F3F4F6'
    }
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box sx={{ flex: 1 }}>
          <AnalyticsChart
            title="Finder Felix"
            subtitle="Postal Code Coverage"
            data={finderFelixData}
            centerText={{
              main: `${analyticsData.finderFelix.coveragePercentage}%`,
              sub: `${analyticsData.finderFelix.coveredPostalCodes.toLocaleString()} / ${analyticsData.finderFelix.totalPostalCodes.toLocaleString()}`
            }}
          />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <AnalyticsChart
            title="Analysis Anna"
            subtitle="Enriched Data"
            data={analysisAnnaData}
            centerText={{
              main: `${analyticsData.analysisAnna.emailPercentage}%`,
              sub: `(${analyticsData.analysisAnna.companiesWithEmail.toLocaleString()} w/ emails)`
            }}
          />
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <AnalyticsChart
            title="Pitch Paul"
            subtitle="Outreach Status"
            data={pitchPaulData}
            centerText={{
              main: `${analyticsData.pitchPaul.exportPercentage}%`,
              sub: `${analyticsData.pitchPaul.exportedCompanies.toLocaleString()} exported`
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}