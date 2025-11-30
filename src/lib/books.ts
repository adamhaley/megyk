import { supabase } from './supabase'
import { Book, BookFilters, BookFormData } from '@/types/book'

export async function getBooks(filters: Partial<BookFilters> = {}) {
  const { search = '', status, live, page = 1, limit = 20 } = filters
  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('books')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Search across title and author
  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  // Filter by status
  if (status) {
    query = query.eq('status', status)
  }

  // Filter by live status
  if (live !== undefined) {
    query = query.eq('live', live)
  }

  const { data, error, count } = await query

  if (error) {
    throw new Error(`Failed to fetch books: ${error.message}`)
  }

  return {
    data: data as Book[],
    count: count || 0,
    hasMore: count ? from + limit < count : false,
  }
}

export async function getBookById(id: string) {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw new Error(`Failed to fetch book: ${error.message}`)
  }

  return data as Book
}

export async function createBook(formData: BookFormData) {
  const { data, error } = await supabase
    .from('books')
    .insert([
      {
        ...formData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create book: ${error.message}`)
  }

  return data as Book
}

export async function updateBook(id: string, formData: Partial<BookFormData>) {
  const { data, error } = await supabase
    .from('books')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update book: ${error.message}`)
  }

  return data as Book
}

export async function deleteBook(id: string) {
  const { error } = await supabase.from('books').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete book: ${error.message}`)
  }

  return { success: true }
}
