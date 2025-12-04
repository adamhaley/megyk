'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { GermanCompany, CompanyFilters } from '@/types/company';
import { getCompanies } from '@/lib/companies';

export function useRealtimeCompanies(filters: CompanyFilters) {
  const [companies, setCompanies] = useState<GermanCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

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
    const supabase = createClient();
    
    // Initial fetch
    fetchCompanies(true);

    // Set up realtime subscription for companies table
    const companiesSubscription = supabase
      .channel('companies_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'german_companies'
        },
        () => {
          // On any change to companies table, refetch the current page data
          // This ensures consistency with filters and pagination
          fetchCompanies(true);
        }
      )
      .subscribe();

    return () => {
      companiesSubscription.unsubscribe();
    };
  }, [fetchCompanies]);

  // Also refetch when search or pagination changes (non-realtime updates)
  useEffect(() => {
    fetchCompanies(true);
  }, [filters.search, fetchCompanies]);

  useEffect(() => {
    if (filters.page > 1) {
      fetchCompanies(false);
    }
  }, [filters.page, fetchCompanies]);

  return {
    companies,
    loading,
    error,
    totalCount,
    hasMore,
    refetch: () => fetchCompanies(true)
  };
}