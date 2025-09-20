'use client';

import { useState, useEffect } from 'react';
import { getAnalyticsData, AnalyticsData } from '@/lib/analytics';
import AnalyticsChart from './AnalyticsChart';

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border p-6 h-80">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
        <h3 className="text-red-800 font-semibold">Error loading analytics</h3>
        <p className="text-red-600">{error}</p>
      </div>
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
      name: 'Has Website',
      value: analyticsData.analysisAnna.websitePercentage,
      color: '#3B82F6'
    },
    {
      name: 'Enriched',
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <AnalyticsChart
        title="Finder Felix"
        subtitle="Postal Code Coverage"
        data={finderFelixData}
        centerText={{
          main: `${analyticsData.finderFelix.coveragePercentage}%`,
          sub: `${analyticsData.finderFelix.coveredPostalCodes.toLocaleString()} / ${analyticsData.finderFelix.totalPostalCodes.toLocaleString()}`
        }}
      />
      
      <AnalyticsChart
        title="Analysis Anna"
        subtitle="Enriched Data"
        data={analysisAnnaData}
        centerText={{
          main: `${analyticsData.analysisAnna.emailPercentage}%`,
          sub: `(${analyticsData.analysisAnna.companiesWithEmail.toLocaleString()} enriched)`
        }}
      />
      
      <AnalyticsChart
        title="Pitch Paul"
        subtitle="Outreach Status"
        data={pitchPaulData}
        centerText={{
          main: `${analyticsData.pitchPaul.exportPercentage}%`,
          sub: `${analyticsData.pitchPaul.exportedCompanies.toLocaleString()} exported`
        }}
      />
    </div>
  );
}