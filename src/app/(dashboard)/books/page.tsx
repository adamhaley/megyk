'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BookList from '@/components/BookList'
import BookSearch from '@/components/BookSearch'
import BookDropzone from '@/components/BookDropzone'
import { getBooks } from '@/lib/books'
import { Book } from '@/types/book'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async (currentPage: number, search: string, append = false) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getBooks({
        search,
        page: currentPage,
        limit: 20,
      })

      if (append) {
        setBooks((prev) => [...prev, ...result.data])
      } else {
        setBooks(result.data)
      }

      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks(1, searchTerm)
  }, [searchTerm])

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setPage(1)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBooks(nextPage, searchTerm, true)
  }

  const handleBookEnriched = (enrichedBook: Book) => {
    // Update the specific book in the list with enriched data
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === enrichedBook.id ? enrichedBook : book
      )
    )
  }

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Book Summaries
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your book collection
          </Typography>
        </Box>
        <Button
          component={Link}
          href="/books/new"
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
        >
          Add New Book
        </Button>
      </Stack>

      {/* Book Ingestion Dropzone */}
      <BookDropzone onUploadSuccess={() => fetchBooks(1, searchTerm)} />

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
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onBookEnriched={handleBookEnriched}
      />
    </Box>
  )
}
