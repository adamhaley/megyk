import { NextRequest, NextResponse } from 'next/server'

const N8N_BASE_URL = process.env.N8N_BASE_URL
const N8N_WEBHOOK_URL = `${N8N_BASE_URL}/webhook/get_summary_html`

const allowedStyles = new Set(['narrative', 'bullet_points', 'workbook'])
const allowedLengths = new Set(['short', 'medium', 'long'])

export async function POST(request: NextRequest) {
  if (!N8N_BASE_URL) {
    return NextResponse.json(
      { error: 'N8N_BASE_URL environment variable is not configured' },
      { status: 500 }
    )
  }

  try {
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

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ book_id, preferences: { style, length } }),
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

    if (contentType.includes('application/json')) {
      if (rawBody.trim()) {
        const data = JSON.parse(rawBody)
        html = data?.html ?? data?.data?.html ?? ''
        if (!html) {
          html = JSON.stringify(data)
        }
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
