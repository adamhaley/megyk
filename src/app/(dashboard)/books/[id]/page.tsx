'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BookDetail from '@/components/BookDetail'
import { getBookById } from '@/lib/books'
import { Book } from '@/types/book'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

export default function BookDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: 256 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>
  }

  if (!book) {
    return <Alert severity="warning">Book not found</Alert>
  }

  return <BookDetail book={book} />
}
