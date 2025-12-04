import { supabase } from './supabase';
import { GermanCompany, CompanyFilters } from '@/types/company';

export async function getCompanies(filters: Partial<CompanyFilters> = {}) {
  const { search = '', page = 1, limit = 20, hasEmail, hasWebsite, contactSent, hasAnalysis } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('german_companies')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(from, to);

  // Search filter
  if (search) {
    query = query.or(`company.ilike.%${search}%,email.ilike.%${search}%,website.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
  }

  // Email filter
  if (hasEmail === true) {
    query = query.not('email', 'is', null).neq('email', '');
  } else if (hasEmail === false) {
    query = query.or('email.is.null,email.eq.');
  }

  // Website filter
  if (hasWebsite === true) {
    query = query.not('website', 'is', null).neq('website', '');
  } else if (hasWebsite === false) {
    query = query.or('website.is.null,website.eq.');
  }

  // Contact sent filter
  if (contactSent === true) {
    query = query.eq('first_contact_sent', true);
  } else if (contactSent === false) {
    query = query.eq('first_contact_sent', false);
  }

  // Analysis filter
  if (hasAnalysis === true) {
    query = query.not('analysis', 'is', null).neq('analysis', '');
  } else if (hasAnalysis === false) {
    query = query.or('analysis.is.null,analysis.eq.');
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  return {
    data: data as GermanCompany[],
    count: count || 0,
    hasMore: count ? (from + limit) < count : false
  };
}