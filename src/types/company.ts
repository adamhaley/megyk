export interface GermanCompany {
  id: string;
  company: string;
  industry: string;
  ceo_name: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  district: string;
  city: string;
  state: string;
  created_at: string;
  analysis: string;
}

export interface CompanyFilters {
  search: string;
  page: number;
  limit: number;
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