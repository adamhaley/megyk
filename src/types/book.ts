export interface Book {
  id: string
  title: string
  author: string
  status: string
  created_at: string
  updated_at: string
  book_genre_id: string | null
  summary: string | null
  isbn: string | null
  cover_image_url: string | null
  publication_year: number | null
  page_count: number | null
  default_summary_pdf_url: string | null
  live: boolean
  summary_count?: number
}

export interface BookFilters {
  search?: string
  status?: string
  live?: boolean
  page?: number
  limit?: number
}

export interface BookFormData {
  title: string
  author: string
  status: string
  summary?: string
  isbn?: string
  cover_image_url?: string
  publication_year?: number
  page_count?: number
  default_summary_pdf_url?: string
  live?: boolean
  book_genre_id?: string | null
}
