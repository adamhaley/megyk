'use client'

import { useState, useCallback, useRef, ChangeEvent, DragEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Alert from '@mui/material/Alert'
import ImageIcon from '@mui/icons-material/Image'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DeleteIcon from '@mui/icons-material/Delete'

interface CoverImageUploadProps {
  currentImageUrl?: string | null
  onImageUploaded: (url: string) => void
  onImageRemoved: () => void
  bookId?: string
  disabled?: boolean
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

export default function CoverImageUpload({
  currentImageUrl,
  onImageUploaded,
  onImageRemoved,
  bookId,
  disabled = false,
}: CoverImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.',
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: 'File size exceeds 5MB limit.',
      }
    }

    return { valid: true }
  }

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null)

      const validation = validateFile(file)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }

      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload file
      setIsUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', file)
        if (bookId) {
          formData.append('bookId', bookId)
        }

        const response = await fetch('/api/upload-cover', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        onImageUploaded(result.url)
        setPreviewUrl(null) // Clear preview after successful upload
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload image')
        setPreviewUrl(null)
      } finally {
        setIsUploading(false)
      }
    },
    [bookId, onImageUploaded]
  )

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      if (disabled) return

      const files = e.dataTransfer.files
      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    },
    [disabled, handleFileSelect]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragging(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleFileInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        handleFileSelect(files[0])
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(async () => {
    if (!currentImageUrl) return

    // Extract path from URL if it's a Supabase storage URL
    const urlObj = new URL(currentImageUrl)
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/book-covers\/(.+)/)
    
    if (pathMatch) {
      const filePath = `covers/${pathMatch[1]}`
      try {
        const response = await fetch(`/api/upload-cover?path=${encodeURIComponent(filePath)}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          throw new Error('Failed to delete image')
        }
      } catch (err) {
        console.error('Error deleting image:', err)
        // Continue anyway - we'll still remove it from the form
      }
    }

    onImageRemoved()
  }, [currentImageUrl, onImageRemoved])

  const displayImageUrl = previewUrl || currentImageUrl

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        Cover Image
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {displayImageUrl ? (
        <Box sx={{ mb: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              position: 'relative',
              width: '100%',
              maxWidth: 300,
              aspectRatio: '2/3',
              overflow: 'hidden',
              borderRadius: 1,
            }}
          >
            <Box
              component="img"
              src={displayImageUrl}
              alt="Book cover preview"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {!disabled && (
              <IconButton
                onClick={handleRemove}
                disabled={isUploading}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.7)',
                  },
                }}
                size="small"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
            {previewUrl && (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  color: 'white',
                  p: 1,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption">Preview - Uploading...</Typography>
              </Box>
            )}
          </Paper>
        </Box>
      ) : null}

      {!disabled && (
        <Paper
          variant="outlined"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            p: 3,
            textAlign: 'center',
            borderStyle: 'dashed',
            borderWidth: 2,
            borderColor: isDragging ? 'primary.main' : 'divider',
            bgcolor: isDragging ? 'action.hover' : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isUploading || disabled}
          />

          {isUploading ? (
            <Stack spacing={2} alignItems="center">
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2} alignItems="center">
              {displayImageUrl ? (
                <ImageIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              ) : (
                <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary' }} />
              )}
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {displayImageUrl ? 'Replace Cover Image' : 'Upload Cover Image'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Drag and drop or click to select
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                  JPEG, PNG, or WebP (max 5MB)
                </Typography>
              </Box>
            </Stack>
          )}
        </Paper>
      )}
    </Box>
  )
}

