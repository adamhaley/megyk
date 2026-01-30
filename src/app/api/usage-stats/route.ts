import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    const [signupResult, chatResult, suggestionsResult, summaryResult] = await Promise.all([
      supabase.rpc('get_signup_stats'),
      supabase.from('chat_log').select('id, user_question, created_at'),
      supabase.from('chat_suggestions').select('suggestion'),
      supabase.from('summaries_v2').select('style, length'),
    ])

    // Signup stats
    const signupStats = signupResult.error
      ? { total_users: 0, signups_by_month: [] }
      : signupResult.data

    // Chat stats
    const chats = chatResult.data || []
    const suggestions = suggestionsResult.data || []

    const suggestionSet = new Set(
      suggestions.map((s: { suggestion: string }) => s.suggestion.trim().toLowerCase())
    )

    let prewritten_count = 0
    let custom_count = 0
    const dayMap: Record<string, number> = {}

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
    }

    const chatStats = {
      total_chats: chats.length,
      chats_by_day: Object.entries(dayMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count })),
      custom_count,
      prewritten_count,
    }

    // Summary stats
    const summaries = summaryResult.data || []
    const styleMap: Record<string, number> = {}
    const lengthMap: Record<string, number> = {}

    for (const row of summaries) {
      const s = row.style || 'unknown'
      const l = row.length || 'unknown'
      styleMap[s] = (styleMap[s] || 0) + 1
      lengthMap[l] = (lengthMap[l] || 0) + 1
    }

    const summaryStats = {
      total_summaries: summaries.length,
      by_style: Object.entries(styleMap).map(([name, count]) => ({ name, count })),
      by_length: Object.entries(lengthMap).map(([length, count]) => ({ length, count })),
    }

    return NextResponse.json({ signupStats, chatStats, summaryStats })
  } catch (error) {
    console.error('Usage stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 })
  }
}
