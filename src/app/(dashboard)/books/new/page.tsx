'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BookForm from '@/components/BookForm'
import { createBook } from '@/lib/books'
import { BookFormData } from '@/types/book'

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
    <div>
      {/* Header */}
      <header className="mb-8">
        <Link
          href="/books"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors mb-4 inline-block"
        >
          ← Back to Books
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Add New Book</h1>
        <p className="text-gray-600 mt-2">
          Create a new book entry in your collection
        </p>
      </header>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <BookForm onSubmit={handleSubmit} onCancel={handleCancel} isLoading={isLoading} />
      </div>
    </div>
  )
}
