'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Book } from '@/types/book'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'

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

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ingestion_complete':
        return '#10b981' // green
      case 'processing':
        return '#f59e0b' // amber
      default:
        return '#9ca3af' // gray
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'ingestion_complete':
        return 'Complete'
      case 'processing':
        return 'Processing'
      case 'draft':
        return 'Draft'
      default:
        return status
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

              <Stack spacing={1.5} alignItems="flex-end" sx={{ minWidth: 140 }}>
                {/* Status Indicators - Minimalist */}
                <Stack direction="row" spacing={1} alignItems="center">
                  <FiberManualRecordIcon 
                    sx={{ 
                      fontSize: 8, 
                      color: getStatusColor(book.status)
                    }} 
                  />
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}
                  >
                    {getStatusLabel(book.status)}
                  </Typography>
                </Stack>

                {/* Live Indicator - Subtle */}
                {book.live && (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <FiberManualRecordIcon 
                      sx={{ 
                        fontSize: 8, 
                        color: 'primary.main'
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: 'primary.main',
                        fontSize: '0.75rem',
                        fontWeight: 500
                      }}
                    >
                      Live
                    </Typography>
                  </Stack>
                )}

                {/* Enrich Button - Minimalist Icon */}
                <Tooltip 
                  title={
                    enrichingState[book.id] === 'loading'
                      ? 'Enriching...'
                      : enrichingState[book.id] === 'success'
                      ? 'Successfully enriched'
                      : enrichingState[book.id] === 'error'
                      ? 'Enrichment failed'
                      : 'Enrich book metadata'
                  }
                  arrow
                >
                  <span>
                    <IconButton
                      onClick={(e) => handleEnrichBook(book.id, e)}
                      disabled={enrichingState[book.id] === 'loading'}
                      size="small"
                      sx={{
                        mt: 0.5,
                        color: enrichingState[book.id] === 'success'
                          ? 'success.main'
                          : enrichingState[book.id] === 'error'
                          ? 'error.main'
                          : 'text.secondary',
                        '&:hover': {
                          color: enrichingState[book.id] === 'success'
                            ? 'success.dark'
                            : enrichingState[book.id] === 'error'
                            ? 'error.dark'
                            : 'primary.main',
                          bgcolor: 'action.hover',
                        },
                      }}
                    >
                      {enrichingState[book.id] === 'loading' ? (
                        <CircularProgress size={20} />
                      ) : enrichingState[book.id] === 'success' ? (
                        <CheckCircleOutlineIcon fontSize="small" />
                      ) : enrichingState[book.id] === 'error' ? (
                        <ErrorOutlineIcon fontSize="small" />
                      ) : (
                        <AutoFixHighIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
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
