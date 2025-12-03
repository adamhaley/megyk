'use client'

import { useState, useCallback, DragEvent, ChangeEvent } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import DescriptionIcon from '@mui/icons-material/Description'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import WarningIcon from '@mui/icons-material/Warning'

const ACCEPTED_FILE_TYPES = ['.epub', '.mobi', '.pdf']
const UPLOAD_API_URL = '/api/ingest-book'

interface BookDropzoneProps {
  onUploadSuccess?: () => void
}

export default function BookDropzone({ onUploadSuccess }: BookDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error' | 'warning'>('idle')
  const [statusMessage, setStatusMessage] = useState('')

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()

    if (!ACCEPTED_FILE_TYPES.includes(fileExtension)) {
      return {
        valid: false,
        error: `Invalid file type. Please upload ${ACCEPTED_FILE_TYPES.join(', ')} files only.`
      }
    }

    // Check file size (limit to 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return {
        valid: false,
        error: 'File size must be less than 100MB.'
      }
    }

    return { valid: true }
  }

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    setUploadStatus('idle')
    setStatusMessage(`Uploading ${file.name}...`)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('filename', file.name)
      formData.append('filetype', file.type)

      const response = await fetch(UPLOAD_API_URL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`)
      }

      // Parse the response to check if file already exists
      const result = await response.json()

      // Check if webhook returned "file already exists" response
      const fileExists = result.data?.message?.includes('File already exists')

      if (fileExists) {
        setUploadStatus('warning')
        setStatusMessage(`File "${file.name}" already exists on the server`)

        // Clear warning message after 5 seconds
        setTimeout(() => {
          setUploadStatus('idle')
          setStatusMessage('')
        }, 5000)
      } else {
        // File uploaded successfully (new file)
        setUploadStatus('success')
        setStatusMessage(`Successfully uploaded ${file.name}`)

        if (onUploadSuccess) {
          onUploadSuccess()
        }

        // Clear success message after 5 seconds
        setTimeout(() => {
          setUploadStatus('idle')
          setStatusMessage('')
        }, 5000)
      }
    } catch (error) {
      setUploadStatus('error')
      setStatusMessage(
        error instanceof Error ? error.message : 'Failed to upload file'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    const validation = validateFile(file)

    if (!validation.valid) {
      setUploadStatus('error')
      setStatusMessage(validation.error || 'Invalid file')
      setTimeout(() => {
        setUploadStatus('idle')
        setStatusMessage('')
      }, 5000)
      return
    }

    uploadFile(file)
  }

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Paper
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        variant="outlined"
        sx={{
          position: 'relative',
          border: '2px dashed',
          borderColor: isDragging ? 'primary.main' : 'divider',
          bgcolor: isDragging ? 'rgba(37, 99, 235, 0.08)' : 'background.paper',
          p: 6,
          textAlign: 'center',
          transition: 'all 0.2s',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          opacity: isUploading ? 0.5 : 1,
          '&:hover': isUploading ? {} : {
            borderColor: 'primary.light',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input
          type="file"
          id="file-upload"
          style={{ display: 'none' }}
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <Box
          component="label"
          htmlFor="file-upload"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
          }}
        >
          {uploadStatus === 'idle' && !isUploading && (
            <>
              <UploadFileIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop book files here or click to upload
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accepts EPUB, MOBI, and PDF files (max 100MB)
              </Typography>
            </>
          )}

          {isUploading && (
            <>
              <CircularProgress size={48} sx={{ mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Uploading...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {statusMessage}
              </Typography>
            </>
          )}

          {uploadStatus === 'success' && !isUploading && (
            <>
              <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.dark" gutterBottom>
                Upload Successful!
              </Typography>
              <Typography variant="body2" color="success.main">
                {statusMessage}
              </Typography>
            </>
          )}

          {uploadStatus === 'warning' && !isUploading && (
            <>
              <WarningIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" color="warning.dark" gutterBottom>
                File Already Exists
              </Typography>
              <Typography variant="body2" color="warning.main">
                {statusMessage}
              </Typography>
            </>
          )}

          {uploadStatus === 'error' && !isUploading && (
            <>
              <ErrorIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
              <Typography variant="h6" color="error.dark" gutterBottom>
                Upload Failed
              </Typography>
              <Typography variant="body2" color="error.main">
                {statusMessage}
              </Typography>
            </>
          )}
        </Box>
      </Paper>

      {/* File Type Info */}
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        sx={{ mt: 2 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            EPUB
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            MOBI
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <DescriptionIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            PDF
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
