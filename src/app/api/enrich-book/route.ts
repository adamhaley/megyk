import { NextRequest, NextResponse } from 'next/server'

const N8N_BASE_URL = process.env.N8N_BASE_URL
const N8N_WEBHOOK_URL = `${N8N_BASE_URL}/webhook/enrich_book`

export async function POST(request: NextRequest) {
  // Validate environment variable
  if (!N8N_BASE_URL) {
    return NextResponse.json(
      { error: 'N8N_BASE_URL environment variable is not configured' },
      { status: 500 }
    )
  }

  try {
    // Get the book ID from the request body
    const { bookId } = await request.json()

    if (!bookId) {
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    // Forward the request to n8n webhook
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookId }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: `n8n webhook failed: ${errorText}` },
        { status: response.status }
      )
    }

    // n8n returns the enriched book data
    const enrichedBook = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Book enriched successfully',
      data: enrichedBook,
    })
  } catch (error) {
    console.error('Enrich book error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to enrich book',
      },
      { status: 500 }
    )
  }
}

