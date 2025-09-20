'use client';

import { useState, useMemo } from 'react';
import { GermanCompany } from '@/types/company';

type SortField = 'company' | 'email' | 'website' | 'analysis' | 'created_at';
type SortDirection = 'asc' | 'desc';

interface CompanyTableProps {
  companies: GermanCompany[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function CompanyTable({ companies, loading, hasMore, onLoadMore }: CompanyTableProps) {
  const [sortField, setSortField] = useState<SortField>('company');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCompanies = useMemo(() => {
    const sorted = [...companies].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'company':
          aValue = a.company?.toLowerCase() || '';
          bValue = b.company?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'website':
          aValue = a.website?.toLowerCase() || '';
          bValue = b.website?.toLowerCase() || '';
          break;
        case 'analysis':
          aValue = a.analysis?.toLowerCase() || '';
          bValue = b.analysis?.toLowerCase() || '';
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [companies, sortField, sortDirection]);

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th 
      className="text-left py-3 px-4 font-medium text-gray-900 cursor-pointer hover:bg-gray-50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <div className="flex flex-col">
          <svg 
            className={`w-3 h-3 ${sortField === field && sortDirection === 'asc' ? 'text-blue-600' : 'text-gray-400'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          <svg 
            className={`w-3 h-3 -mt-1 ${sortField === field && sortDirection === 'desc' ? 'text-blue-600' : 'text-gray-400'}`}
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </th>
  );
  if (loading && companies.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (companies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No companies found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <SortableHeader field="company">Company</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <SortableHeader field="website">Website</SortableHeader>
              <SortableHeader field="analysis">Analysis</SortableHeader>
              <SortableHeader field="created_at">Last Updated</SortableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map((company) => (
              <tr key={company.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900 font-medium">{company.company}</td>
                <td className="py-3 px-4 text-gray-700">
                  {company.email && (
                    <a 
                      href={`mailto:${company.email}`}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {company.email}
                    </a>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {company.website && (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {company.website}
                    </a>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700 max-w-xs">
                  <div className="truncate" title={company.analysis}>
                    {company.analysis}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-500 text-sm">
                  {new Date(company.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}