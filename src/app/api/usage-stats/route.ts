import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [signupResult, chatResult, suggestionsResult, summaryResult, booksResult] = await Promise.all([
      supabase.rpc('get_signup_stats'),
      supabase.from('chat_log').select('id, user_question, created_at'),
      supabase.from('chat_suggestions').select('suggestion'),
      supabase.from('summaries').select('style, length, book_id, user_id, created_at'),
      supabase.from('books').select('id, title'),
    ])

    // Signup stats + cumulative users
    const signupStats = signupResult.error
      ? { total_users: 0, signups_by_month: [], cumulative_users: [] }
      : signupResult.data

    // Compute cumulative users from signups_by_month, padded to current month
    const signupsByMonth = signupStats.signups_by_month || []
    let runningTotal = 0
    const cumulative_users = signupsByMonth.map((m: { month: string; count: number }) => {
      runningTotal += m.count
      return { month: m.month, total: runningTotal }
    })

    // Pad forward to the current month if data stops before now
    if (cumulative_users.length > 0) {
      const last = cumulative_users[cumulative_users.length - 1]
      const lastDate = new Date(last.month + '-01')
      const now = new Date()
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      let cursor = new Date(lastDate.getFullYear(), lastDate.getMonth() + 1, 1)
      while (cursor <= currentMonth) {
        cumulative_users.push({
          month: cursor.toISOString().slice(0, 7),
          total: last.total,
        })
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
      }
    }
    signupStats.cumulative_users = cumulative_users

    // Chat stats
    const chats = chatResult.data || []
    const suggestions = suggestionsResult.data || []

    const suggestionSet = new Set(
      suggestions.map((s: { suggestion: string }) => s.suggestion.trim().toLowerCase())
    )

    let prewritten_count = 0
    let custom_count = 0
    const dayMap: Record<string, number> = {}
    const hourMap: Record<number, number> = {}

    for (const chat of chats) {
      const question = (chat.user_question || '').trim().toLowerCase()
      if (suggestionSet.has(question)) {
        prewritten_count++
      } else {
        custom_count++
      }
      const day = chat.created_at?.slice(0, 10)
      if (day) {
        dayMap[day] = (dayMap[day] || 0) + 1
      }
      if (chat.created_at) {
        const hour = new Date(chat.created_at).getHours()
        hourMap[hour] = (hourMap[hour] || 0) + 1
      }
    }

    const chats_by_hour = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: hourMap[i] || 0,
    }))

    const chatStats = {
      total_chats: chats.length,
      chats_by_day: Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      chats_by_hour,
      custom_count,
      prewritten_count,
    }

    // Summary stats
    const summaries = summaryResult.data || []
    const books = booksResult.data || []
    const bookMap = new Map(books.map((b: { id: string; title: string }) => [b.id, b.title]))

    const styleMap: Record<string, number> = {}
    const lengthMap: Record<string, number> = {}
    const bookCountMap: Record<string, number> = {}

    for (const row of summaries) {
      const s = row.style || 'unknown'
      const l = row.length || 'unknown'
      styleMap[s] = (styleMap[s] || 0) + 1
      lengthMap[l] = (lengthMap[l] || 0) + 1

      if (row.book_id) {
        const title = bookMap.get(row.book_id) || `Book ${row.book_id}`
        bookCountMap[title] = (bookCountMap[title] || 0) + 1
      }
    }

    const summaries_per_book = Object.entries(bookCountMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([title, count]) => ({ title, count }))

    const summaryStats = {
      total_summaries: summaries.length,
      by_style: Object.entries(styleMap).map(([name, count]) => ({ name, count })),
      by_length: Object.entries(lengthMap).map(([length, count]) => ({ length, count })),
      summaries_per_book,
    }

    return NextResponse.json({ signupStats, chatStats, summaryStats })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}
