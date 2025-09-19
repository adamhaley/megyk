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

export async function getAnalyticsData(): Promise<AnalyticsData> {
  // Get total zip codes count
  const { count: totalZipCodes, error: zipError } = await supabase
    .from('german_zip_codes')
    .select('*', { count: 'exact', head: true });

  if (zipError) {
    throw new Error(`Failed to fetch zip codes: ${zipError.message}`);
  }

  // Get companies data and unique postal codes coverage
  const { data: companies, error: companiesError } = await supabase
    .from('german_companies')
    .select('email, website, exported_to_instantly');

  if (companiesError) {
    throw new Error(`Failed to fetch companies: ${companiesError.message}`);
  }

  // Get finder felix executions to see postal code coverage
  const { data: executions, error: executionsError } = await supabase
    .from('finder_felix_executions')
    .select('postal_code')
    .not('postal_code', 'is', null);

  if (executionsError) {
    throw new Error(`Failed to fetch executions: ${executionsError.message}`);
  }

  // Count unique postal codes that have been scraped
  const uniquePostalCodes = new Set(executions?.map(e => e.postal_code) || []);
  const coveredPostalCodes = uniquePostalCodes.size;

  const companiesWithWebsite = companies?.filter(c => c.website && c.website.trim() !== '').length || 0;
  const companiesWithEmail = companies?.filter(c => c.email && c.email.trim() !== '').length || 0;
  
// total companies
const { count: totalCompanies } = await supabase
  .from('german_companies')
  .select('*', { count: 'exact', head: true });

// exported companies
const { count: exportedCompanies } = await supabase
  .from('german_companies')
  .select('*', { count: 'exact', head: true })
  .eq('exported_to_instantly', true);


  // Finder Felix data (postal codes coverage)
  const finderFelix = {
    totalPostalCodes: totalZipCodes || 0,
    coveredPostalCodes,
    coveragePercentage: totalZipCodes && totalZipCodes > 0 ? Math.round((coveredPostalCodes / totalZipCodes) * 100) : 0
  };

  // Analysis Anna data (websites/emails populated)
  const analysisAnna = {
    totalCompanies,
    companiesWithWebsite,
    companiesWithEmail,
    websitePercentage: totalCompanies > 0 ? Math.round((companiesWithWebsite / totalCompanies) * 100) : 0,
    emailPercentage: totalCompanies > 0 ? Math.round((companiesWithEmail / totalCompanies) * 100) : 0
  };

  // Pitch Paul data (exported to instantly)
const pitchPaul = {
  totalCompanies: totalCompanies || 0,
  exportedCompanies: exportedCompanies || 0,
  exportPercentage: totalCompanies > 0
  ? Math.max(1, Math.round((exportedCompanies / totalCompanies) * 100))
  : 0

};



  return {
    finderFelix,
    analysisAnna,
    pitchPaul
  };
}