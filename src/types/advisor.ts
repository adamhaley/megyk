export interface USFinancialAdvisor {
  id: number;
  company: string | null;
  industry: string | null;
  ceo_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  created_at: string | null;
  updated_at: string | null;
  analysis: string | null;
  populated_by: number | null;
  location_link: string | null;
  exported_to_instantly: boolean | null;
  email_status: string | null;
  first_contact_sent: boolean | null;
  is_duplicate: boolean | null;
}

export interface AdvisorFilters {
  search: string;
  page: number;
  limit: number;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  contactSent?: boolean;
  hasAnalysis?: boolean;
  emailStatus?: string;
}

export interface USZipCode {
  id: number;
  zip: string;
  name: string | null;
  population: number;
  median_income: number;
}
