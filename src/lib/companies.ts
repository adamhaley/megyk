import { supabase } from './supabase';
import { GermanCompany, CompanyFilters } from '@/types/company';

export async function getCompanies(filters: Partial<CompanyFilters> = {}) {
  const { search = '', page = 1, limit = 20 } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('german_companies')
    .select('*')
    .order('updated_at', { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`company.ilike.%${search}%,email.ilike.%${search}%,website.ilike.%${search}%`);
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