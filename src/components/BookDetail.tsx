'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Book } from '@/types/book'
import { deleteBook } from '@/lib/books'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import MuiLink from '@mui/material/Link'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord'
import { createClient } from '@/lib/supabase'

interface BookDetailProps {
  book: Book
}

type SummaryStyle = 'narrative' | 'bullet_points' | 'workbook'
type SummaryLength = 'short' | 'medium' | 'long'

export default function BookDetail({ book }: BookDetailProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle | null>(null)
  const [summaryLength, setSummaryLength] = useState<SummaryLength | null>(null)
  const [summaryHtml, setSummaryHtml] = useState<string | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [summaryRequested, setSummaryRequested] = useState(false)
  const [availableSummaryKeys, setAvailableSummaryKeys] = useState<Set<string>>(new Set())
  const [availabilityLoading, setAvailabilityLoading] = useState(false)
  const [availabilityError, setAvailabilityError] = useState<string | null>(null)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteBook(book.id)
      router.push('/books')
      router.refresh()
    } catch (error) {
      console.error('Failed to delete book:', error)
      alert('Failed to delete book. Please try again.')
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ingestion_complete':
        return '#10b981'
      case 'pending_ingest':
        return '#f59e0b'
      default:
        return '#9ca3af'
    }
  }

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'ingestion_complete':
        return 'Ingestion complete'
      case 'pending_ingest':
        return 'Pending ingest'
      default:
        return status
    }
  }

  const summaryStyles: SummaryStyle[] = ['narrative', 'bullet_points', 'workbook']
  const summaryLengths: SummaryLength[] = ['short', 'medium', 'long']
  const summaryKey = (style: SummaryStyle, length: SummaryLength) => `${style}:${length}`

  useEffect(() => {
    let cancelled = false

    const fetchAvailability = async () => {
      setAvailabilityLoading(true)
      setAvailabilityError(null)

      const { data, error } = await createClient()
        .from('summaries_v2')
        .select('style, length')
        .eq('book_id', book.id)

      if (cancelled) {
        return
      }

      if (error) {
        setAvailabilityError('Failed to load summary availability.')
        setAvailableSummaryKeys(new Set())
      } else {
        const keys = new Set(
          (data ?? []).map((row) => summaryKey(row.style as SummaryStyle, row.length as SummaryLength))
        )
        setAvailableSummaryKeys(keys)
      }

      setAvailabilityLoading(false)
    }

    fetchAvailability()

    return () => {
      cancelled = true
    }
  }, [book.id])

  const handlePreviewSummary = async (style: SummaryStyle, length: SummaryLength) => {
    setSummaryStyle(style)
    setSummaryLength(length)
    setSummaryLoading(true)
    setSummaryError(null)
    setSummaryRequested(true)

    try {
      const response = await fetch('/api/get-summary-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          book_id: book.id,
          style,
          length,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to fetch summary preview')
      }

      const data = (await response.json()) as { html?: string }
      setSummaryHtml(data.html ?? '')
    } catch (error) {
      setSummaryError(error instanceof Error ? error.message : 'Failed to fetch summary preview')
      setSummaryHtml(null)
    } finally {
      setSummaryLoading(false)
    }
  }

  return (
    <Box>
      {/* Header with Actions */}
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 4 }}
      >
        <MuiLink
          component={Link}
          href="/books"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
          Back to Books
        </MuiLink>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Edit book">
            <IconButton
              component={Link}
              href={`/books/${book.id}/edit`}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete book">
            <IconButton
              onClick={() => setShowDeleteModal(true)}
              size="small"
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  color: 'error.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Book Details Card */}
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Title and Author */}
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              {book.title}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              by {book.author}
            </Typography>
          </Box>

          {/* Status Badges - Minimalist */}
          <Stack direction="row" spacing={2} alignItems="center">
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
                  color: book.status === 'ingestion_complete' ? '#10b981' : 'text.secondary',
                  fontWeight: 500
                }}
              >
                {getStatusLabel(book.status)}
              </Typography>
            </Stack>
            {book.live && (
              <Stack direction="row" spacing={1} alignItems="center">
                <FiberManualRecordIcon 
                  sx={{ 
                    fontSize: 8, 
                    color: 'primary.main'
                  }} 
                />
                <Typography variant="caption" color="primary.main" fontWeight={500}>
                  Live
                </Typography>
              </Stack>
            )}
          </Stack>

          {/* Summary */}
          {book.summary && (
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Summary
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {book.summary}
              </Typography>
            </Box>
          )}

          <Divider />

          {/* Details Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            {book.isbn && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  ISBN
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {book.isbn}
                </Typography>
              </Box>
            )}

            {book.publication_year && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Publication Year
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {book.publication_year}
                </Typography>
              </Box>
            )}

            {book.page_count && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Page Count
                </Typography>
                <Typography variant="body1" sx={{ mt: 0.5 }}>
                  {book.page_count} pages
                </Typography>
              </Box>
            )}

            {book.cover_image_url && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Cover Image
                </Typography>
                <MuiLink
                  href={book.cover_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    display: 'inline-block',
                    '&:hover': {
                      opacity: 0.9,
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={book.cover_image_url}
                    alt={`${book.title} cover`}
                    sx={{
                      maxWidth: 200,
                      width: '100%',
                      height: 'auto',
                      aspectRatio: '2/3',
                      objectFit: 'cover',
                      borderRadius: 1,
                      boxShadow: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </MuiLink>
              </Box>
            )}

            {book.default_summary_pdf_url && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Summary PDF
                </Typography>
                <MuiLink
                  href={book.default_summary_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mt: 0.5, display: 'inline-block' }}
                >
                  Download PDF
                </MuiLink>
              </Box>
            )}

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Created
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {new Date(book.created_at).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Last Updated
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {new Date(book.updated_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <Box sx={{ mt: 4 }}>
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={3}>
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Summary Preview
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {availableSummaryKeys.size < 9
                    ? 'Summaries generating... '
                    : ''}
                  {availableSummaryKeys.size} of 9 summaries available.
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Select a style and length to generate an HTML preview from n8n.
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 1.5,
              }}
            >
              {summaryStyles.map((style) =>
                summaryLengths.map((length) => {
                  const isActive = summaryStyle === style && summaryLength === length
                  const isAvailable = availableSummaryKeys.has(summaryKey(style, length))
                  const isDisabled = availabilityLoading || !isAvailable
                  return (
                    <Button
                      key={`${style}-${length}`}
                      onClick={() => handlePreviewSummary(style, length)}
                      variant="outlined"
                      disabled={isDisabled}
                      sx={{
                        borderColor: isActive ? 'primary.main' : 'divider',
                        color: isActive ? 'primary.main' : 'text.secondary',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        fontFamily: 'inherit',
                        bgcolor: isActive ? 'action.hover' : 'transparent',
                        boxShadow: 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'action.hover',
                        },
                        '&.Mui-disabled': {
                          borderColor: 'divider',
                          color: 'text.disabled',
                        },
                      }}
                    >
                      {style.replace('_', ' ')} · {length}
                    </Button>
                  )
                })
              )}
            </Box>

            {availabilityLoading && (
              <Typography variant="body2" color="text.secondary">
                Checking summary availability...
              </Typography>
            )}

            {availabilityError && (
              <Alert severity="warning">
                {availabilityError}
              </Alert>
            )}

            {summaryLoading && (
              <Typography variant="body2" color="text.secondary">
                Fetching summary preview...
              </Typography>
            )}

            {summaryError && (
              <Alert severity="error">
                {summaryError}
              </Alert>
            )}
          </Stack>
        </Paper>
      </Box>

      <Box sx={{ mt: 3 }}>
        {summaryLoading ? (
          <Box
            sx={{
              width: '100%',
              minHeight: 180,
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              color: 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CircularProgress size={28} />
          </Box>
        ) : summaryHtml ? (
          <Box
            sx={{
              width: '100%',
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
            dangerouslySetInnerHTML={{ __html: summaryHtml }}
          />
        ) : (
          <Box
            sx={{
              width: '100%',
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              border: '1px dashed',
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              {summaryRequested && !summaryError
                ? 'No preview returned for that selection. Check the n8n execution output.'
                : 'Select a style and length to generate a preview.'}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Book</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete &ldquo;{book.title}&rdquo;? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'text.primary',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            sx={{
              color: 'error.main',
              '&:hover': {
                bgcolor: 'error.main',
                color: 'error.contrastText',
              },
            }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
