import { NextRequest, NextResponse } from 'next/server'
import { getN8nWebhookConfig } from '@/lib/n8n-webhooks'

const allowedStyles = new Set(['narrative', 'bullet_points', 'workbook'])
const allowedLengths = new Set(['short', 'medium', 'long'])

export async function POST(request: NextRequest) {
  try {
    const { url, headers } = getN8nWebhookConfig('get_summary_html')

    const body = await request.json()
    const { book_id } = body ?? {}
    const style = body?.preferences?.style ?? body?.style
    const length = body?.preferences?.length ?? body?.length

    if (!book_id || !allowedStyles.has(style) || !allowedLengths.has(length)) {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 }
      )
    }

    const payload = {
      book_id,
      style,
      length,
      preferences: { style, length },
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `n8n webhook failed: ${errorText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || ''
    const rawBody = await response.text()
    let html = ''

    if (!rawBody.trim()) {
      return NextResponse.json(
        { error: 'n8n webhook returned an empty response body' },
        { status: 502 }
      )
    }

    if (contentType.includes('application/json')) {
      const data = JSON.parse(rawBody) as {
        html?: string
        body?: { html?: string }
        data?: { html?: string }
        output?: string
      }
      html = data?.html ?? data?.body?.html ?? data?.data?.html ?? data?.output ?? ''
      if (!html) {
        return NextResponse.json(
          { error: `n8n webhook JSON response did not include html. Keys: ${Object.keys(data).join(', ') || '(none)'}` },
          { status: 502 }
        )
      }
    } else {
      html = rawBody
    }

    return NextResponse.json({ html })
  } catch (error) {
    console.error('Summary preview error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to fetch summary preview',
      },
      { status: 500 }
    )
  }
}
