import { Suspense } from 'react';
import CompanyDashboard from '@/components/CompanyDashboard';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Megyk Campaign Dashboard</h1>
          <p className="text-gray-600 mt-2">German Dentists |  Lead Capture / Enrichment / Outreach</p>
        </header>
        
        <Suspense fallback={
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <CompanyDashboard />
        </Suspense>
      </div>
    </main>
  )
}

