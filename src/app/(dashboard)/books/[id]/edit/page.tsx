'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import BookForm from '@/components/BookForm'
import { getBookById, updateBook } from '@/lib/books'
import { Book, BookFormData } from '@/types/book'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import MuiLink from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function EditBookPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const data = await getBookById(id)
        setBook(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch book')
      } finally {
        setLoading(false)
      }
    }

    fetchBook()
  }, [id])

  const handleSubmit = async (formData: BookFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      await updateBook(id, formData)
      router.push(`/books/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update book')
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    router.push(`/books/${id}`)
  }

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: 256 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error && !book) {
    return (
      <Alert severity="error">{error}</Alert>
    )
  }

  if (!book) {
    return (
      <Alert severity="warning">Book not found</Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <MuiLink
          component={Link}
          href={`/books/${id}`}
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            mb: 2,
            textDecoration: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
          Back to Book
        </MuiLink>
        <Typography variant="h3" component="h1" gutterBottom>
          Edit Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {book.title}
        </Typography>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper sx={{ p: 4 }}>
        <BookForm
          initialData={book}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </Paper>
    </Box>
  )
}
