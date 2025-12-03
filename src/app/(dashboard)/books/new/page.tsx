'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BookForm from '@/components/BookForm'
import { createBook } from '@/lib/books'
import { BookFormData } from '@/types/book'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Alert from '@mui/material/Alert'
import Paper from '@mui/material/Paper'
import MuiLink from '@mui/material/Link'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

export default function NewBookPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: BookFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const newBook = await createBook(formData)
      router.push(`/books/${newBook.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create book')
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/books')
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <MuiLink
          component={Link}
          href="/books"
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
          Back to Books
        </MuiLink>
        <Typography variant="h3" component="h1" gutterBottom>
          Add New Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create a new book entry in your collection
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
        <BookForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </Paper>
    </Box>
  )
}
