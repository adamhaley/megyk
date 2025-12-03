'use client'

import { useState, useEffect, FormEvent } from 'react'
import TextField from '@mui/material/TextField'
import Stack from '@mui/material/Stack'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'

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
    <Stack component="form" onSubmit={handleSubmit} direction="row" spacing={2}>
      <TextField
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search by title or author..."
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={handleClear} edge="end" size="small">
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Stack>
  )
}
