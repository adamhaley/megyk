'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import BookForm from '@/components/BookForm'
import { getBookById, updateBook } from '@/lib/books'
import { Book, BookFormData } from '@/types/book'

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error && !book) {
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

  return (
    <div>
      {/* Header */}
      <header className="mb-8">
        <Link
          href={`/books/${id}`}
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 inline-block"
        >
          ← Back to Book
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
        <p className="text-gray-600 mt-2">{book.title}</p>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <BookForm
          initialData={book}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  )
}
