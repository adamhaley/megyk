'use client';

import { useState, useEffect } from 'react';
import { GermanCompany, CompanyFilters } from '@/types/company';
import { getCompanies } from '@/lib/companies';
import CompanyTable from './CompanyTable';
import SearchBar from './SearchBar';

export default function CompanyDashboard() {
  const [companies, setCompanies] = useState<GermanCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<CompanyFilters>({
    search: '',
    page: 1,
    limit: 20
  });

  const fetchCompanies = async (resetData = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await getCompanies(filters);
      
      if (resetData || filters.page === 1) {
        setCompanies(result.data);
      } else {
        setCompanies(prev => [...prev, ...result.data]);
      }
      
      setTotalCount(result.count);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(true);
  }, [filters.search]);

  useEffect(() => {
    if (filters.page > 1) {
      fetchCompanies(false);
    }
  }, [filters.page]);

  const handleSearch = (search: string) => {
    setFilters(prev => ({ ...prev, search, page: 1 }));
  };

  const handleLoadMore = () => {
    setFilters(prev => ({ ...prev, page: prev.page + 1 }));
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error loading companies</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => fetchCompanies(true)}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Companies</h2>
            <p className="text-sm text-gray-500">{totalCount} total companies</p>
          </div>
          <SearchBar onSearch={handleSearch} />
        </div>
        
        <CompanyTable 
          companies={companies} 
          loading={loading} 
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}