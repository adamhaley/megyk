'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BookList from '@/components/BookList'
import BookSearch from '@/components/BookSearch'
import BookDropzone from '@/components/BookDropzone'
import { getBooks } from '@/lib/books'
import { Book } from '@/types/book'

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState<string | null>(null)

  const fetchBooks = async (currentPage: number, search: string, append = false) => {
    setLoading(true)
    setError(null)

    try {
      const result = await getBooks({
        search,
        page: currentPage,
        limit: 20,
      })

      if (append) {
        setBooks((prev) => [...prev, ...result.data])
      } else {
        setBooks(result.data)
      }

      setHasMore(result.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks(1, searchTerm)
  }, [searchTerm])

  const handleSearch = (search: string) => {
    setSearchTerm(search)
    setPage(1)
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchBooks(nextPage, searchTerm, true)
  }

  const handleBookEnriched = (enrichedBook: Book) => {
    // Update the specific book in the list with enriched data
    setBooks((prevBooks) =>
      prevBooks.map((book) =>
        book.id === enrichedBook.id ? enrichedBook : book
      )
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Book Summaries</h1>
          <p className="text-gray-600 mt-2">
            Manage your book collection
          </p>
        </div>
        <Link
          href="/books/new"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center"
        >
          Add New Book
        </Link>
      </header>

      {/* Book Ingestion Dropzone */}
      <BookDropzone onUploadSuccess={() => fetchBooks(1, searchTerm)} />

      {/* Search */}
      <div className="mb-6">
        <BookSearch onSearch={handleSearch} initialValue={searchTerm} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Book List */}
      <BookList
        books={books}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onBookEnriched={handleBookEnriched}
      />
    </div>
  )
}
