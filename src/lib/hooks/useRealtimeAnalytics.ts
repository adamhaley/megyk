'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { AnalyticsData, getAnalyticsData } from '@/lib/analytics';

export function useRealtimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setError(null);
      const data = await getAnalyticsData();
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    
    // Initial fetch
    fetchAnalytics();

    // Set up realtime subscriptions for all tables that affect analytics
    const companiesSubscription = supabase
      .channel('german_companies_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'german_companies'
        },
        () => {
          // Refetch analytics when companies data changes
          fetchAnalytics();
        }
      )
      .subscribe();

    const executionsSubscription = supabase
      .channel('finder_felix_executions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'finder_felix_executions'
        },
        () => {
          // Refetch analytics when executions data changes
          fetchAnalytics();
        }
      )
      .subscribe();

    const zipCodesSubscription = supabase
      .channel('german_zip_codes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'german_zip_codes'
        },
        () => {
          // Refetch analytics when zip codes data changes
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      companiesSubscription.unsubscribe();
      executionsSubscription.unsubscribe();
      zipCodesSubscription.unsubscribe();
    };
  }, [fetchAnalytics]);

  return {
    analyticsData,
    loading,
    error,
    refetch: fetchAnalytics
  };
}