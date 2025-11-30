'use client'

import { useState, useCallback, DragEvent, ChangeEvent } from 'react'
import { ArrowUpTrayIcon, DocumentIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

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
    <div className="mb-8">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-white hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept={ACCEPTED_FILE_TYPES.join(',')}
          onChange={handleFileInput}
          disabled={isUploading}
        />

        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {uploadStatus === 'idle' && !isUploading && (
            <>
              <ArrowUpTrayIcon className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Drop book files here or click to upload
              </p>
              <p className="text-sm text-gray-500">
                Accepts EPUB, MOBI, and PDF files (max 100MB)
              </p>
            </>
          )}

          {isUploading && (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">Uploading...</p>
              <p className="text-sm text-gray-500">{statusMessage}</p>
            </>
          )}

          {uploadStatus === 'success' && !isUploading && (
            <>
              <CheckCircleIcon className="h-12 w-12 text-green-500 mb-4" />
              <p className="text-lg font-medium text-green-900 mb-2">Upload Successful!</p>
              <p className="text-sm text-green-600">{statusMessage}</p>
            </>
          )}

          {uploadStatus === 'warning' && !isUploading && (
            <>
              <ExclamationTriangleIcon className="h-12 w-12 text-amber-500 mb-4" />
              <p className="text-lg font-medium text-amber-900 mb-2">File Already Exists</p>
              <p className="text-sm text-amber-600">{statusMessage}</p>
            </>
          )}

          {uploadStatus === 'error' && !isUploading && (
            <>
              <XCircleIcon className="h-12 w-12 text-red-500 mb-4" />
              <p className="text-lg font-medium text-red-900 mb-2">Upload Failed</p>
              <p className="text-sm text-red-600">{statusMessage}</p>
            </>
          )}
        </label>
      </div>

      {/* File Type Info */}
      <div className="mt-3 flex items-center justify-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <DocumentIcon className="h-4 w-4" />
          <span>EPUB</span>
        </div>
        <div className="flex items-center gap-1">
          <DocumentIcon className="h-4 w-4" />
          <span>MOBI</span>
        </div>
        <div className="flex items-center gap-1">
          <DocumentIcon className="h-4 w-4" />
          <span>PDF</span>
        </div>
      </div>
    </div>
  )
}
