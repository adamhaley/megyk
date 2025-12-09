'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import BookList from '@/components/BookList'
import BookSearch from '@/components/BookSearch'
import BookDropzone from '@/components/BookDropzone'
import { getBooks } from '@/lib/books'
import { Book } from '@/types/book'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const prevSearchTermRef = useRef('')

  useEffect(() => {
    let cancelled = false
    
    const fetchBooks = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await getBooks({
          search: searchTerm,
          page: paginationModel.page + 1,
          limit: paginationModel.pageSize,
        })

        if (!cancelled) {
          setBooks(result.data)
          setTotalCount(result.count)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to fetch books')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchBooks()
    
    return () => {
      cancelled = true
    }
  }, [paginationModel.page, paginationModel.pageSize, searchTerm])

  const handleSearch = useCallback((search: string) => {
    // Only reset pagination if search term actually changed
    if (prevSearchTermRef.current !== search) {
      prevSearchTermRef.current = search
      setSearchTerm(search)
      setPaginationModel(prev => ({ ...prev, page: 0 }))
    } else {
      // Search term hasn't changed, just update the state without resetting pagination
      setSearchTerm(search)
    }
  }, [])

  const handlePaginationModelChange = (model: { page: number; pageSize: number }) => {
    // Ensure we create a new object reference to trigger re-render
    setPaginationModel({ page: model.page, pageSize: model.pageSize })
  }

  const handleBookEnriched = (enrichedBook: Book) => {
    // Update the specific book in the list with enriched data
    // Preserve summary_count from the existing book since enriched data doesn't include it
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === enrichedBook.id
          ? { ...enrichedBook, summary_count: book.summary_count }
          : book
      )
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Book Summaries
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your book collection
        </Typography>
      </Box>

      {/* Book Ingestion Dropzone */}
      <BookDropzone onUploadSuccess={() => {
        setPaginationModel({ page: 0, pageSize: paginationModel.pageSize })
      }} />

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <BookSearch onSearch={handleSearch} initialValue={searchTerm} />
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Book List */}
      <BookList
        books={books}
        loading={loading}
        totalCount={totalCount}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationModelChange}
        onBookEnriched={handleBookEnriched}
      />
    </Box>
  )
}
