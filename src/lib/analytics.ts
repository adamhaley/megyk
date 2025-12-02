import { supabase } from './supabase';

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
        exportPercentage: companyStats?.export_percentage || 0
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
      .select('*', { count: 'exact', head: true }),
    
    // Companies with website (non-null and non-empty)
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .not('website', 'is', null)
      .neq('website', ''),
    
    // Companies with email (non-null and non-empty)
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .not('email', 'is', null)
      .neq('email', ''),
    
    // Companies exported to instantly.ai
    supabase
      .from('german_companies')
      .select('*', { count: 'exact', head: true })
      .eq('exported_to_instantly', true)
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
  ] = results.slice(0, 5) as Array<{ count: number | null; error: any }>;

  const postalCodeResult = uniquePostalCodesCount === null && results[5]
    ? results[5] as { data: any[] | null; error: any }
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
    exportPercentage: totalCompaniesCount > 0
      ? Math.max(1, Math.round((exportedCompaniesCount / totalCompaniesCount) * 100))
      : 0
  };

  return {
    finderFelix,
    analysisAnna,
    pitchPaul
  };
}