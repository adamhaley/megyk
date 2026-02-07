import { supabase } from './supabase';
import { USFinancialAdvisor, AdvisorFilters } from '@/types/advisor';

export async function getAdvisors(filters: Partial<AdvisorFilters> = {}) {
  const { search = '', page = 1, limit = 20, hasWebsite, contactSent, emailStatus } = filters;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('us_financial_advisors')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false, nullsFirst: false })
    .range(from, to)
    .eq('is_duplicate', false);

  // Search filter
  if (search) {
    query = query.or(`company.ilike.%${search}%,email.ilike.%${search}%,website.ilike.%${search}%,city.ilike.%${search}%,state.ilike.%${search}%`);
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

  // Email status filter
  if (emailStatus) {
    query = query.eq('email_status', emailStatus);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch advisors: ${error.message}`);
  }

  return {
    data: data as USFinancialAdvisor[],
    count: count || 0,
    hasMore: count ? (from + limit) < count : false
  };
}
