'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BookDetail from '@/components/BookDetail'
import { getBookById } from '@/lib/books'
import { Book } from '@/types/book'

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="p-6 bg-gray-50 border border-gray-200 rounded-md">
        <p className="text-gray-600">Book not found</p>
      </div>
    )
  }

  return <BookDetail book={book} />
}
