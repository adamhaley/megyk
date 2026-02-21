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

  // Fetch summary counts for all books in parallel
  const books = data as Book[]
  if (books.length > 0) {
    const bookIds = books.map((book) => book.id)
    
    // Get summary counts for all books
    const { data: summaryCounts, error: summaryError } = await supabase
      .from('summaries_v2')
      .select('book_id')
      .in('book_id', bookIds)

    if (!summaryError && summaryCounts) {
      // Count summaries per book
      const countsByBookId = summaryCounts.reduce((acc: Record<string, number>, item: { book_id: string }) => {
        acc[item.book_id] = (acc[item.book_id] || 0) + 1
        return acc
      }, {})

      // Add summary_count to each book
      books.forEach((book) => {
        book.summary_count = countsByBookId[book.id] || 0
      })
    }
  }

  return {
    data: books,
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

  const book = data as Book

  // Fetch count of all summaries
  const { count: totalCount, error: summaryError } = await supabase
    .from('summaries_v2')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', id)

  if (!summaryError && totalCount !== null) {
    book.summary_count = totalCount
  } else {
    book.summary_count = 0
  }

  // Also fetch count of completed summaries (status = 'ingestion_complete')
  const { count: completedCount, error: completedError } = await supabase
    .from('summaries_v2')
    .select('*', { count: 'exact', head: true })
    .eq('book_id', id)
    .eq('status', 'ingestion_complete')

  if (!completedError && completedCount !== null) {
    book.completed_summary_count = completedCount
  } else {
    book.completed_summary_count = 0
  }

  return book
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
  // Delete related chat_log records first (foreign key constraint)
  const { error: chatLogError } = await supabase
    .from('chat_log')
    .delete()
    .eq('book_id', id)

  if (chatLogError) {
    throw new Error(`Failed to delete related chat logs: ${chatLogError.message}`)
  }

  // Delete related summaries_v2 records (foreign key constraint)
  const { error: summariesError } = await supabase
    .from('summaries_v2')
    .delete()
    .eq('book_id', id)

  if (summariesError) {
    throw new Error(`Failed to delete related summaries: ${summariesError.message}`)
  }

  // Now delete the book
  const { error } = await supabase.from('books').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete book: ${error.message}`)
  }

  return { success: true }
}
