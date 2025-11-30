'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Book } from '@/types/book'
import { deleteBook } from '@/lib/books'

interface BookDetailProps {
  book: Book
}

export default function BookDetail({ book }: BookDetailProps) {
  const router = useRouter()
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  return (
    <div>
      {/* Header with Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/books"
          className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          ← Back to Books
        </Link>
        <div className="flex gap-3">
          <Link
            href={`/books/${book.id}/edit`}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Book Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Title and Author */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-lg text-gray-600 mt-2">by {book.author}</p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-3">
            <span
              className={`
                px-3 py-1 rounded-full text-sm font-medium
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
            {book.live && (
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Live
              </span>
            )}
          </div>

          {/* Summary */}
          {book.summary && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{book.summary}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
            {book.isbn && (
              <div>
                <dt className="text-sm font-medium text-gray-500">ISBN</dt>
                <dd className="text-base text-gray-900 mt-1">{book.isbn}</dd>
              </div>
            )}

            {book.publication_year && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Publication Year</dt>
                <dd className="text-base text-gray-900 mt-1">{book.publication_year}</dd>
              </div>
            )}

            {book.page_count && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Page Count</dt>
                <dd className="text-base text-gray-900 mt-1">{book.page_count} pages</dd>
              </div>
            )}

            {book.cover_image_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Cover Image</dt>
                <dd className="text-base text-gray-900 mt-1">
                  <a
                    href={book.cover_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Cover
                  </a>
                </dd>
              </div>
            )}

            {book.default_summary_pdf_url && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Summary PDF</dt>
                <dd className="text-base text-gray-900 mt-1">
                  <a
                    href={book.default_summary_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Download PDF
                  </a>
                </dd>
              </div>
            )}

            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-base text-gray-900 mt-1">
                {new Date(book.created_at).toLocaleString()}
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-base text-gray-900 mt-1">
                {new Date(book.updated_at).toLocaleString()}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Delete Book
            </h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete &ldquo;{book.title}&rdquo;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
