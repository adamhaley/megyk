'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Book } from '@/types/book'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'

interface BookListProps {
  books: Book[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
  onBookEnriched: (enrichedBook: Book) => void
}

interface EnrichingState {
  [bookId: string]: 'idle' | 'loading' | 'success' | 'error'
}

export default function BookList({ books, loading, hasMore, onLoadMore, onBookEnriched }: BookListProps) {
  const [enrichingState, setEnrichingState] = useState<EnrichingState>({})

  const handleEnrichBook = async (bookId: string, e: React.MouseEvent) => {
    // Prevent navigation when clicking the button
    e.preventDefault()
    e.stopPropagation()

    setEnrichingState((prev) => ({ ...prev, [bookId]: 'loading' }))

    try {
      const response = await fetch('/api/enrich-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      })

      if (!response.ok) {
        throw new Error('Failed to enrich book')
      }

      const result = await response.json()

      // Update the book with enriched data from n8n webhook response
      if (result.success && result.data) {
        onBookEnriched(result.data)
      }

      setEnrichingState((prev) => ({ ...prev, [bookId]: 'success' }))

      // Reset success state after 3 seconds
      setTimeout(() => {
        setEnrichingState((prev) => ({ ...prev, [bookId]: 'idle' }))
      }, 3000)
    } catch (error) {
      console.error('Error enriching book:', error)
      setEnrichingState((prev) => ({ ...prev, [bookId]: 'error' }))

      // Reset error state after 3 seconds
      setTimeout(() => {
        setEnrichingState((prev) => ({ ...prev, [bookId]: 'idle' }))
      }, 3000)
    }
  }

  if (loading && books.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 256 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!loading && books.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h6" color="text.secondary">
          No books found
        </Typography>
      </Box>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ingestion_complete':
        return 'success'
      case 'processing':
        return 'warning'
      default:
        return 'default'
    }
  }

  const getEnrichButtonProps = (state: 'idle' | 'loading' | 'success' | 'error') => {
    switch (state) {
      case 'loading':
        return { color: 'inherit' as const, variant: 'contained' as const, disabled: true }
      case 'success':
        return { color: 'success' as const, variant: 'contained' as const }
      case 'error':
        return { color: 'error' as const, variant: 'contained' as const }
      default:
        return { color: 'secondary' as const, variant: 'contained' as const }
    }
  }

  return (
    <Stack spacing={2}>
      {books.map((book) => (
        <Card
          key={book.id}
          component={Link}
          href={`/books/${book.id}`}
          sx={{
            textDecoration: 'none',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: 'action.hover',
              transform: 'translateY(-2px)',
              boxShadow: 2,
            },
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
              <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
                <Typography variant="h6" component="h3" noWrap gutterBottom>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {book.author}
                </Typography>

                {book.summary && (
                  <Typography
                    variant="body2"
                    color="text.primary"
                    sx={{
                      mt: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {book.summary}
                  </Typography>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(book.created_at).toLocaleDateString()}
                  </Typography>
                  {book.isbn && (
                    <Typography variant="caption" color="text.secondary">
                      ISBN: {book.isbn}
                    </Typography>
                  )}
                  {book.publication_year && (
                    <Typography variant="caption" color="text.secondary">
                      Published: {book.publication_year}
                    </Typography>
                  )}
                  {book.page_count && (
                    <Typography variant="caption" color="text.secondary">
                      {book.page_count} pages
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 'fit-content' }}>
                {/* Status Badge */}
                <Chip
                  label={book.status}
                  color={getStatusColor(book.status)}
                  size="small"
                />

                {/* Live Badge */}
                {book.live && (
                  <Chip
                    label="Live"
                    color="primary"
                    size="small"
                  />
                )}

                {/* Enrich Book Button */}
                <Button
                  onClick={(e) => handleEnrichBook(book.id, e)}
                  disabled={enrichingState[book.id] === 'loading'}
                  size="small"
                  {...getEnrichButtonProps(enrichingState[book.id] || 'idle')}
                  sx={{ minWidth: 120 }}
                >
                  {enrichingState[book.id] === 'loading'
                    ? 'Enriching...'
                    : enrichingState[book.id] === 'success'
                    ? '✓ Enriched'
                    : enrichingState[book.id] === 'error'
                    ? '✗ Failed'
                    : 'Enrich Book'}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3 }}>
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="outlined"
            size="large"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Stack>
  )
}
