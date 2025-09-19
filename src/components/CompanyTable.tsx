'use client';

import { GermanCompany } from '@/types/company';

interface CompanyTableProps {
  companies: GermanCompany[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function CompanyTable({ companies, loading, hasMore, onLoadMore }: CompanyTableProps) {
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
              <th className="text-left py-3 px-4 font-medium text-gray-900">Company</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Website</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Analysis</th>
              <th className="text-left py-3 px-4 font-medium text-gray-900">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
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
                  {new Date(company.updated_at).toLocaleDateString('en-US', {
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