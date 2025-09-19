export interface GermanCompany {
  id: string;
  company: string;
  email: string;
  website: string;
  analysis: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyFilters {
  search: string;
  page: number;
  limit: number;
}