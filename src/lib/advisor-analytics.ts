import { supabase } from './supabase';
import type { PostgrestError } from '@supabase/supabase-js';

export interface AdvisorEmailStatusCount {
  status: string;
  count: number;
  color: string;
}

export interface AdvisorAnalyticsData {
  enrichment: {
    totalAdvisors: number;
    advisorsWithWebsite: number;
    advisorsWithEmail: number;
    websitePercentage: number;
    emailPercentage: number;
  };
  outreach: {
    totalAdvisors: number;
    contactedAdvisors: number;
    contactPercentage: number;
  };
}

/**
 * Fetch analytics data for US Financial Advisors campaign
 */
export async function getAdvisorAnalyticsData(): Promise<AdvisorAnalyticsData> {
  // Execute all count queries in parallel for better performance
  const [
    { count: totalAdvisors, error: totalError },
    { count: advisorsWithWebsite, error: websiteError },
    { count: advisorsWithEmail, error: emailError },
    { count: contactedAdvisors, error: contactedError }
  ] = await Promise.all([
    // Total advisors (is_duplicate is null or false)
    supabase
      .from('us_financial_advisors')
      .select('*', { count: 'exact', head: true })
      .or('is_duplicate.is.null,is_duplicate.eq.false'),

    // Advisors with website (non-null and non-empty)
    supabase
      .from('us_financial_advisors')
      .select('*', { count: 'exact', head: true })
      .or('is_duplicate.is.null,is_duplicate.eq.false')
      .not('website', 'is', null)
      .neq('website', ''),

    // Advisors with email (non-null and non-empty)
    supabase
      .from('us_financial_advisors')
      .select('*', { count: 'exact', head: true })
      .or('is_duplicate.is.null,is_duplicate.eq.false')
      .not('email', 'is', null)
      .neq('email', ''),

    // Advisors with first contact sent
    supabase
      .from('us_financial_advisors')
      .select('*', { count: 'exact', head: true })
      .or('is_duplicate.is.null,is_duplicate.eq.false')
      .eq('first_contact_sent', true)
  ]) as Array<{ count: number | null; error: PostgrestError | null }>;

  // Error handling
  if (totalError) {
    throw new Error(`Failed to fetch total advisors: ${totalError.message}`);
  }
  if (websiteError) {
    throw new Error(`Failed to fetch advisors with website: ${websiteError.message}`);
  }
  if (emailError) {
    throw new Error(`Failed to fetch advisors with email: ${emailError.message}`);
  }
  if (contactedError) {
    throw new Error(`Failed to fetch contacted advisors: ${contactedError.message}`);
  }

  const totalCount = totalAdvisors || 0;
  const websiteCount = advisorsWithWebsite || 0;
  const emailCount = advisorsWithEmail || 0;
  const contactedCount = contactedAdvisors || 0;

  return {
    enrichment: {
      totalAdvisors: totalCount,
      advisorsWithWebsite: websiteCount,
      advisorsWithEmail: emailCount,
      websitePercentage: totalCount > 0
        ? Math.round((websiteCount / totalCount) * 100)
        : 0,
      emailPercentage: totalCount > 0
        ? Math.round((emailCount / totalCount) * 100)
        : 0
    },
    outreach: {
      totalAdvisors: totalCount,
      contactedAdvisors: contactedCount,
      contactPercentage: totalCount > 0 && contactedCount > 0
        ? Math.max(1, Math.round((contactedCount / totalCount) * 100))
        : 0
    }
  };
}

/**
 * Get email verification status distribution for US Financial Advisors
 */
export async function getAdvisorEmailStatusDistribution(): Promise<AdvisorEmailStatusCount[]> {
  const { data, error } = await supabase
    .from('us_financial_advisors')
    .select('email_status')
    .or('is_duplicate.is.null,is_duplicate.eq.false');

  if (error) {
    throw new Error(`Failed to fetch email status distribution: ${error.message}`);
  }

  // Define the statuses we care about
  const targetStatuses = ['ok:email_ok', 'risky:is_role', 'risky:accept_all'];

  // Count occurrences, grouping others as "unknown"
  const statusCounts = (data || []).reduce((acc: Record<string, number>, row: { email_status: string | null }) => {
    const status = row.email_status;

    if (status && targetStatuses.includes(status)) {
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
    .filter(status => statusCounts[status] > 0)
    .map(status => ({
      status,
      count: statusCounts[status],
      color: getStatusColor(status)
    }));
}
