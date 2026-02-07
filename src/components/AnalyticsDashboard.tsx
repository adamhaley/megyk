'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsData, AnalyticsData } from '@/lib/analytics';
import { getAdvisorAnalyticsData, AdvisorAnalyticsData } from '@/lib/advisor-analytics';
import { CampaignType } from './CompanyDashboard';
import AnalyticsChart from './AnalyticsChart';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

interface AnalyticsDashboardProps {
  campaign: CampaignType;
}

export default function AnalyticsDashboard({ campaign }: AnalyticsDashboardProps) {
  const [germanData, setGermanData] = useState<AnalyticsData | null>(null);
  const [usData, setUsData] = useState<AdvisorAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        if (campaign === 'german-dentists') {
          const data = await getAnalyticsData();
          setGermanData(data);
        } else {
          const data = await getAdvisorAnalyticsData();
          setUsData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [campaign]);

  const numCharts = campaign === 'german-dentists' ? 3 : 2;

  if (loading) {
    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {[...Array(numCharts)].map((_, i) => (
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

  // German Dentists Campaign
  if (campaign === 'german-dentists' && germanData) {
    const finderFelixData = [
      {
        name: 'Covered',
        value: germanData.finderFelix.coveragePercentage,
        color: '#10B981'
      },
      {
        name: 'Not Covered',
        value: 100 - germanData.finderFelix.coveragePercentage,
        color: '#F3F4F6'
      }
    ];

    const analysisAnnaData = [
      {
        name: 'Website Found',
        value: germanData.analysisAnna.websitePercentage,
        color: '#3B82F6'
      },
      {
        name: 'Emails / Enriched',
        value: germanData.analysisAnna.emailPercentage,
        color: '#8B5CF6'
      },
      {
        name: 'Missing Data',
        value: Math.max(0, 100 - Math.max(germanData.analysisAnna.websitePercentage, germanData.analysisAnna.emailPercentage)),
        color: '#F3F4F6'
      }
    ].filter(item => item.value > 0);

    const pitchPaulData = [
      {
        name: 'First Contact Sent',
        value: germanData.pitchPaul.exportPercentage,
        color: '#F59E0B'
      },
      {
        name: 'Not Contacted',
        value: 100 - germanData.pitchPaul.exportPercentage,
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
                main: `${germanData.finderFelix.coveragePercentage}%`,
                sub: `${germanData.finderFelix.coveredPostalCodes.toLocaleString()} / ${germanData.finderFelix.totalPostalCodes.toLocaleString()}`
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AnalyticsChart
              title="Analysis Anna"
              subtitle="Enriched Data"
              data={analysisAnnaData}
              centerText={{
                main: `${germanData.analysisAnna.emailPercentage}%`,
                sub: `(${germanData.analysisAnna.companiesWithEmail.toLocaleString()} w/ emails)`
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AnalyticsChart
              title="Pitch Paul"
              subtitle="Outreach Status"
              data={pitchPaulData}
              centerText={{
                main: `${germanData.pitchPaul.exportPercentage}%`,
                sub: `${germanData.pitchPaul.exportedCompanies.toLocaleString()} contacted`
              }}
            />
          </Box>
        </Stack>
      </Box>
    );
  }

  // US Financial Advisors Campaign
  if (campaign === 'us-financial-advisors' && usData) {
    const enrichmentData = [
      {
        name: 'Website Found',
        value: usData.enrichment.websitePercentage,
        color: '#3B82F6'
      },
      {
        name: 'Emails / Enriched',
        value: usData.enrichment.emailPercentage,
        color: '#8B5CF6'
      },
      {
        name: 'Missing Data',
        value: Math.max(0, 100 - Math.max(usData.enrichment.websitePercentage, usData.enrichment.emailPercentage)),
        color: '#F3F4F6'
      }
    ].filter(item => item.value > 0);

    const outreachData = [
      {
        name: 'First Contact Sent',
        value: usData.outreach.contactPercentage,
        color: '#F59E0B'
      },
      {
        name: 'Not Contacted',
        value: 100 - usData.outreach.contactPercentage,
        color: '#F3F4F6'
      }
    ];

    return (
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <AnalyticsChart
              title="Enrichment"
              subtitle="Data Quality"
              data={enrichmentData}
              centerText={{
                main: `${usData.enrichment.emailPercentage}%`,
                sub: `(${usData.enrichment.advisorsWithEmail.toLocaleString()} w/ emails)`
              }}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            <AnalyticsChart
              title="Outreach"
              subtitle="Contact Status"
              data={outreachData}
              centerText={{
                main: `${usData.outreach.contactPercentage}%`,
                sub: `${usData.outreach.contactedAdvisors.toLocaleString()} contacted`
              }}
            />
          </Box>
        </Stack>
      </Box>
    );
  }

  return null;
}
