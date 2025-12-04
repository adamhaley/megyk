export interface GermanCompany {
  id: string;
  company: string;
  industry: string;
  ceo_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string;
  district: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
  analysis: string | null;
  email_status: string | null;
  first_contact_sent: boolean;
  exported_to_instantly: boolean;
  is_duplicate: boolean;
  location_link: string | null;
  populated_by: number | null;
}

export interface CompanyFilters {
  search: string;
  page: number;
  limit: number;
  hasEmail?: boolean;
  hasWebsite?: boolean;
  contactSent?: boolean;
  hasAnalysis?: boolean;
  emailStatus?: string;
}

export interface GermanZipCode {
  id: string;
  created_at: string;
  Name: string;
  PLZ: string;
  'Kreis code': string;
  'Land name': string;
  'Land code': string;
  'Kreis name': string;
}

export interface FinderFelixExecution {
  id: string;
  created_at: string;
  execution: string;
  postal_code: string;
  num_results: number;
}