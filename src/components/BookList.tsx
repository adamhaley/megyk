'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Book } from '@/types/book'

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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!loading && books.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No books found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">by {book.author}</p>

              {book.summary && (
                <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                  {book.summary}
                </p>
              )}

              <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                <span>
                  {new Date(book.created_at).toLocaleDateString()}
                </span>
                {book.isbn && (
                  <span>ISBN: {book.isbn}</span>
                )}
                {book.publication_year && (
                  <span>Published: {book.publication_year}</span>
                )}
                {book.page_count && (
                  <span>{book.page_count} pages</span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 ml-4">
              {/* Status Badge */}
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap
                  ${
                    book.status === 'ingestion_complete'
                      ? 'bg-green-100 text-green-800'
                      : book.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }
                `}
              >
                {book.status}
              </span>

              {/* Live Badge */}
              {book.live && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                  Live
                </span>
              )}

              {/* Enrich Book Button */}
              <button
                onClick={(e) => handleEnrichBook(book.id, e)}
                disabled={enrichingState[book.id] === 'loading'}
                className={`
                  px-4 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap
                  ${
                    enrichingState[book.id] === 'loading'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : enrichingState[book.id] === 'success'
                      ? 'bg-green-600 text-white'
                      : enrichingState[book.id] === 'error'
                      ? 'bg-red-600 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }
                `}
              >
                {enrichingState[book.id] === 'loading'
                  ? 'Enriching...'
                  : enrichingState[book.id] === 'success'
                  ? '✓ Enriched'
                  : enrichingState[book.id] === 'error'
                  ? '✗ Failed'
                  : 'Enrich Book'}
              </button>
            </div>
          </div>
        </Link>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  )
}
