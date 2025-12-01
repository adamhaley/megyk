'use client'

import { useState, useEffect, FormEvent } from 'react'

interface BookSearchProps {
  onSearch: (searchTerm: string) => void
  initialValue?: string
}

export default function BookSearch({ onSearch, initialValue = '' }: BookSearchProps) {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  // Debounced live search - triggers search 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Search is already triggered by useEffect, but submit also works
    onSearch(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    // No need to call onSearch('') - useEffect will handle it
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title or author..."
        className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      {searchTerm && (
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear
        </button>
      )}
    </form>
  )
}
