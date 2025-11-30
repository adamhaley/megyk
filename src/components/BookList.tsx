'use client'

import Link from 'next/link'
import { Book } from '@/types/book'

interface BookListProps {
  books: Book[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export default function BookList({ books, loading, hasMore, onLoadMore }: BookListProps) {
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
