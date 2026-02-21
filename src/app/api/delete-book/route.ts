import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS for cascade deletes
const getAdminClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('id')

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // Delete related chat_log records first (foreign key constraint)
    const { error: chatLogError } = await supabase
      .from('chat_log')
      .delete()
      .eq('book_id', bookId)

    if (chatLogError) {
      console.error('Failed to delete chat logs:', chatLogError)
      return NextResponse.json(
        { error: `Failed to delete related chat logs: ${chatLogError.message}` },
        { status: 500 }
      )
    }

    // Delete related summaries_v2 records (foreign key constraint)
    const { error: summariesError } = await supabase
      .from('summaries_v2')
      .delete()
      .eq('book_id', bookId)

    if (summariesError) {
      console.error('Failed to delete summaries:', summariesError)
      return NextResponse.json(
        { error: `Failed to delete related summaries: ${summariesError.message}` },
        { status: 500 }
      )
    }

    // Delete related chat_suggestions records (foreign key constraint)
    const { error: suggestionsError } = await supabase
      .from('chat_suggestions')
      .delete()
      .eq('book_id', bookId)

    if (suggestionsError) {
      console.error('Failed to delete chat suggestions:', suggestionsError)
      return NextResponse.json(
        { error: `Failed to delete related chat suggestions: ${suggestionsError.message}` },
        { status: 500 }
      )
    }

    // Now delete the book
    const { error: bookError } = await supabase
      .from('books')
      .delete()
      .eq('id', bookId)

    if (bookError) {
      console.error('Failed to delete book:', bookError)
      return NextResponse.json(
        { error: `Failed to delete book: ${bookError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete book error:', error)
    return NextResponse.json({ error: 'Failed to delete book' }, { status: 500 })
  }
}
