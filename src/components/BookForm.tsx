'use client'

import { useState, FormEvent } from 'react'
import { Book, BookFormData } from '@/types/book'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'

interface BookFormProps {
  initialData?: Partial<Book>
  onSubmit: (data: BookFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export default function BookForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: BookFormProps) {
  const [formData, setFormData] = useState<BookFormData>({
    title: initialData?.title || '',
    author: initialData?.author || '',
    status: initialData?.status || 'draft',
    summary: initialData?.summary || '',
    isbn: initialData?.isbn || '',
    cover_image_url: initialData?.cover_image_url || '',
    publication_year: initialData?.publication_year || undefined,
    page_count: initialData?.page_count || undefined,
    default_summary_pdf_url: initialData?.default_summary_pdf_url || '',
    live: initialData?.live || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        {/* Title */}
        <TextField
          id="title"
          label="Title"
          required
          fullWidth
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={Boolean(errors.title)}
          helperText={errors.title}
          disabled={isLoading}
        />

        {/* Author */}
        <TextField
          id="author"
          label="Author"
          required
          fullWidth
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          error={Boolean(errors.author)}
          helperText={errors.author}
          disabled={isLoading}
        />

        {/* Status */}
        <TextField
          id="status"
          label="Status"
          select
          fullWidth
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          disabled={isLoading}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="processing">Processing</MenuItem>
          <MenuItem value="ingestion_complete">Ingestion Complete</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </TextField>

        {/* Summary */}
        <TextField
          id="summary"
          label="Summary"
          multiline
          rows={6}
          fullWidth
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          disabled={isLoading}
        />

        {/* ISBN */}
        <TextField
          id="isbn"
          label="ISBN"
          fullWidth
          value={formData.isbn}
          onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
          disabled={isLoading}
        />

        {/* Row: Publication Year and Page Count */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <TextField
            id="publication_year"
            label="Publication Year"
            type="number"
            fullWidth
            value={formData.publication_year || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                publication_year: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={isLoading}
          />

          <TextField
            id="page_count"
            label="Page Count"
            type="number"
            fullWidth
            value={formData.page_count || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                page_count: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            disabled={isLoading}
          />
        </Stack>

        {/* Cover Image URL */}
        <TextField
          id="cover_image_url"
          label="Cover Image URL"
          type="url"
          fullWidth
          value={formData.cover_image_url}
          onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
          disabled={isLoading}
        />

        {/* Summary PDF URL */}
        <TextField
          id="default_summary_pdf_url"
          label="Summary PDF URL"
          type="url"
          fullWidth
          value={formData.default_summary_pdf_url}
          onChange={(e) => setFormData({ ...formData, default_summary_pdf_url: e.target.value })}
          disabled={isLoading}
        />

        {/* Live Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              id="live"
              checked={formData.live}
              onChange={(e) => setFormData({ ...formData, live: e.target.checked })}
              disabled={isLoading}
            />
          }
          label="Mark as Live"
        />

        {/* Form Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            pt: 3,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isLoading}
            size="large"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            size="large"
          >
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Stack>
    </Box>
  )
}
