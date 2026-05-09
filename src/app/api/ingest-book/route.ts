import { NextRequest, NextResponse } from 'next/server'
import { getN8nWebhookConfig } from '@/lib/n8n-webhooks'

export async function POST(request: NextRequest) {
  try {
    const { url, headers } = getN8nWebhookConfig('ingest_book')

    // Get the form data from the request
    const formData = await request.formData()

    // Forward the request to n8n webhook
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `n8n webhook failed: ${errorText}` },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({}))

    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to upload file',
      },
      { status: 500 }
    )
  }
}
