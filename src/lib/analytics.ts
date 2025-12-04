import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface EmailStatusCount {
  status: string;
  count: number;
  color: string;
}

export interface AnalyticsData {
  finderFelix: {
    totalPostalCodes: number;
    coveredPostalCodes: number;
    coveragePercentage: number;
  };
  analysisAnna: {
    totalCompanies: number;
    companiesWithWebsite: number;
    companiesWithEmail: number;
    websitePercentage: number;
    emailPercentage: number;
  };
  pitchPaul: {
    totalCompanies: number;
    exportedCompanies: number;
    exportPercentage: number;
  };
}

/**
 * Attempts to fetch analytics data from optimized SQL views.
 * Falls back to direct queries if views are not available.
 * 
 * To use the optimized views, run the SQL migration:
 * supabase/migrations/20240101000000_create_analytics_views.sql
 */
async function getAnalyticsFromViews(): Promise<AnalyticsData | null> {
  try {
    // Try to fetch from optimized views (these must be created in Supabase first)
    const [
      { data: companyStats, error: companyStatsError },
      { data: finderFelixData, error: finderFelixError }
    ] = await Promise.all([
      supabase.from('companies_stats').select('*').single(),
      supabase.from('finder_felix_coverage').select('*').single()
    ]);

    if (companyStatsError || finderFelixError) {
      // Views don't exist yet, fall back to direct queries
      return null;
    }

    return {
      finderFelix: {
        totalPostalCodes: finderFelixData?.total_postal_codes || 0,
        coveredPostalCodes: finderFelixData?.covered_postal_codes || 0,
        coveragePercentage: finderFelixData?.coverage_percentage || 0
      },
      analysisAnna: {
        totalCompanies: companyStats?.total_companies || 0,
        companiesWithWebsite: companyStats?.companies_with_website || 0,
        companiesWithEmail: companyStats?.companies_with_email || 0,
        websitePercentage: companyStats?.website_percentage || 0,
        emailPercentage: companyStats?.email_percentage || 0
      },
      pitchPaul: {
        totalCompanies: companyStats?.total_companies || 0,
        exportedCompanies: companyStats?.exported_companies || 0,
        exportPercentage: (companyStats?.exported_companies || 0) > 0
          ? Math.max(1, companyStats?.export_percentage || 0)
          : 0
      }
    };
  } catch {
    // Fall back to direct queries if views don't exist
    return null;
  }
}

/**
 * Optimized analytics data fetching using SQL aggregations at the database level.
 * 
 * This function:
 * 1. First attempts to use optimized SQL views (if migrations have been run)
 * 2. Falls back to efficient count queries with proper filters
 * 
 * This replaces the previous approach of fetching all rows and calculating in JavaScript.
 * 
 * To enable the optimized views, run the SQL migration:
 * supabase/migrations/20240101000000_create_analytics_views.sql
 */
export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Try to use optimized views first (if migrations have been applied)
  const viewData = await getAnalyticsFromViews();
  if (viewData) {
    return viewData;
  }

  // Fall back to optimized direct queries using count aggregations
  // Try RPC function for unique postal codes first (if migration has been run)
  let uniquePostalCodesCount: number | null = null;
  try {
    const { data: rpcResult, error: rpcError } = await supabase.rpc('get_unique_postal_codes_count');
    if (!rpcError && typeof rpcResult === 'number') {
      uniquePostalCodesCount = rpcResult;
    }
  } catch {
    // RPC function doesn't exist yet, will calculate from data
  }

  // Execute all count queries in parallel for better performance
  const queries = [
    // Total German postal codes
    supabase
      .from('german_zip_codes')
      .select('*', { count: 'exact', head: true }),
    
    // Total companies
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', false),
    
    // Companies with website (non-null and non-empty)
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', false)
      .not('website', 'is', null)
      .neq('website', ''),
    
    // Companies with email (non-null and non-empty)
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', false)
      .not('email', 'is', null)
      .neq('email', ''),
    
    // Companies with first contact sent
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .eq('is_duplicate', false)
      .eq('first_contact_sent', true)
  ];

  // Only fetch postal codes if RPC function didn't work
  if (uniquePostalCodesCount === null) {
    queries.push(
      supabase
        .from('finder_felix_executions')
        .select('postal_code')
        .not('postal_code', 'is', null)
    );
  }

  const results = await Promise.all(queries);
  
  const [
    { count: totalZipCodes, error: zipError },
    { count: totalCompanies, error: totalCompaniesError },
    { count: companiesWithWebsite, error: websiteError },
    { count: companiesWithEmail, error: emailError },
    { count: exportedCompanies, error: exportedError }
  ] = results.slice(0, 5) as Array<{ count: number | null; error: PostgrestError | null }>;

  const postalCodeResult = uniquePostalCodesCount === null && results[5]
    ? results[5] as { data: Array<{ postal_code: string | null }> | null; error: PostgrestError | null }
    : { data: null, error: null };
  
  const { data: uniquePostalCodes, error: postalCodeError } = postalCodeResult;

  // Error handling
  if (zipError) {
    throw new Error(`Failed to fetch zip codes: ${zipError.message}`);
  }
  if (totalCompaniesError) {
    throw new Error(`Failed to fetch total companies: ${totalCompaniesError.message}`);
  }
  if (websiteError) {
    throw new Error(`Failed to fetch companies with website: ${websiteError.message}`);
  }
  if (emailError) {
    throw new Error(`Failed to fetch companies with email: ${emailError.message}`);
  }
  if (exportedError) {
    throw new Error(`Failed to fetch exported companies: ${exportedError.message}`);
  }
  if (postalCodeError) {
    throw new Error(`Failed to fetch postal code executions: ${postalCodeError.message}`);
  }

  // Count unique postal codes - use RPC result if available, otherwise calculate from data
  const coveredPostalCodes = uniquePostalCodesCount !== null
    ? uniquePostalCodesCount
    : new Set(uniquePostalCodes?.map(e => e.postal_code).filter(Boolean) || []).size;

  // Calculate percentages
  const totalCompaniesCount = totalCompanies || 0;
  const totalZipCodesCount = totalZipCodes || 0;
  const companiesWithWebsiteCount = companiesWithWebsite || 0;
  const companiesWithEmailCount = companiesWithEmail || 0;
  const exportedCompaniesCount = exportedCompanies || 0;

  // Finder Felix data (postal codes coverage)
  const finderFelix = {
    totalPostalCodes: totalZipCodesCount,
    coveredPostalCodes,
    coveragePercentage: totalZipCodesCount > 0 
      ? Math.round((coveredPostalCodes / totalZipCodesCount) * 100) 
      : 0
  };

  // Analysis Anna data (websites/emails populated)
  const analysisAnna = {
    totalCompanies: totalCompaniesCount,
    companiesWithWebsite: companiesWithWebsiteCount,
    companiesWithEmail: companiesWithEmailCount,
    websitePercentage: totalCompaniesCount > 0 
      ? Math.round((companiesWithWebsiteCount / totalCompaniesCount) * 100) 
      : 0,
    emailPercentage: totalCompaniesCount > 0 
      ? Math.round((companiesWithEmailCount / totalCompaniesCount) * 100) 
      : 0
  };

  // Pitch Paul data (exported to instantly)
  const pitchPaul = {
    totalCompanies: totalCompaniesCount,
    exportedCompanies: exportedCompaniesCount,
    exportPercentage: totalCompaniesCount > 0 && exportedCompaniesCount > 0
      ? Math.max(1, Math.round((exportedCompaniesCount / totalCompaniesCount) * 100))
      : 0
  };

  return {
    finderFelix,
    analysisAnna,
    pitchPaul
  };
}

/**
 * Get email verification status distribution
 * Only returns the 4 categories the client cares about
 */
export async function getEmailStatusDistribution(): Promise<EmailStatusCount[]> {
  const { data, error } = await supabase
    .from('german_companies')
    .select('email_status')
    .eq('is_duplicate', false);

  if (error) {
    throw new Error(`Failed to fetch email status distribution: ${error.message}`);
  }

  // Define the statuses we care about
  const targetStatuses = ['ok:email_ok', 'risky:is_role', 'risky:accept_all'];
  
  // Count occurrences, grouping others as "unknown"
  const statusCounts = (data || []).reduce((acc: Record<string, number>, row) => {
    const status = row.email_status;
    
    if (targetStatuses.includes(status)) {
      acc[status] = (acc[status] || 0) + 1;
    } else {
      acc['unknown'] = (acc['unknown'] || 0) + 1;
    }
    
    return acc;
  }, {});

  // Convert to array and add colors
  const getStatusColor = (status: string) => {
    if (status === 'ok:email_ok') return 'rgba(76, 175, 80, 0.8)';
    if (status === 'risky:is_role') return 'rgba(255, 152, 0, 0.8)';
    if (status === 'risky:accept_all') return 'rgba(255, 152, 0, 0.8)';
    return 'rgba(189, 189, 189, 0.6)'; // unknown
  };

  // Return in specific order: ok first, then risky ones, then unknown
  const order = ['ok:email_ok', 'risky:is_role', 'risky:accept_all', 'unknown'];
  
  return order
    .filter(status => statusCounts[status] > 0) // Only include if count > 0
    .map(status => ({
      status,
      count: statusCounts[status],
      color: getStatusColor(status)
    }));
}