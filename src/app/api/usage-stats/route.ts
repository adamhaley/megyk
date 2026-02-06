import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type Granularity = 'day' | 'week' | 'month'

function getWeekKey(dateStr: string): string {
  const date = new Date(dateStr)
  // Get Monday of the week
  const day = date.getUTCDay()
  const diff = date.getUTCDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(date.setUTCDate(diff))
  return monday.toISOString().slice(0, 10)
}

export async function GET(request: NextRequest) {
  try {
    const granularity = (request.nextUrl.searchParams.get('granularity') || 'month') as Granularity

    // Fetch user list via admin API for day/week granularity
    let allUsers: { created_at: string }[] = []
    if (granularity !== 'month') {
      // Paginate through all users
      let page = 1
      const perPage = 1000
      while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
        if (error || !data.users.length) break
        allUsers.push(...data.users.map(u => ({ created_at: u.created_at || '' })))
        if (data.users.length < perPage) break
        page++
      }
    }

    const [signupRpcResult, chatResult, suggestionsResult, summaryResult, booksResult] = await Promise.all([
      supabase.rpc('get_signup_stats'),
      supabase.from('chat_log').select('id, user_question, created_at'),
      supabase.from('chat_suggestions').select('suggestion'),
      supabase.from('summaries').select('style, length, book_id, user_id, created_at'),
      supabase.from('books').select('id, title'),
    ])

    // Signup stats from RPC (for total count and month fallback)
    const rpcData = signupRpcResult.error ? { total_users: 0, signups_by_month: [] } : signupRpcResult.data
    const total_users = rpcData.total_users || 0

    let cumulative_users: { period: string; total: number }[] = []

    if (granularity === 'month' || allUsers.length === 0) {
      // Use RPC data for month view
      const signupsByMonth: { month: string; count: number }[] = rpcData.signups_by_month || []
      let runningTotal = 0
      cumulative_users = signupsByMonth.map((m) => {
        runningTotal += m.count
        const period = m.month.slice(0, 7)
        return { period, total: runningTotal }
      })

      // Pad forward to current month
      if (cumulative_users.length > 0) {
        const last = cumulative_users[cumulative_users.length - 1]
        const [lastYear, lastMonth] = last.period.split('-').map(Number)
        const now = new Date()
        const nowYear = now.getFullYear()
        const nowMonth = now.getMonth() + 1
        let curYear = lastYear
        let curMonth = lastMonth + 1
        if (curMonth > 12) { curMonth = 1; curYear++ }
        while (curYear < nowYear || (curYear === nowYear && curMonth <= nowMonth)) {
          cumulative_users.push({
            period: `${curYear}-${String(curMonth).padStart(2, '0')}`,
            total: last.total,
          })
          curMonth++
          if (curMonth > 12) { curMonth = 1; curYear++ }
        }
      }
    } else {
      // Use admin user data for day/week view
      const signupMap: Record<string, number> = {}
      for (const user of allUsers) {
        if (!user.created_at) continue
        let key: string
        if (granularity === 'day') {
          key = user.created_at.slice(0, 10)
        } else {
          key = getWeekKey(user.created_at)
        }
        signupMap[key] = (signupMap[key] || 0) + 1
      }

      const sortedPeriods = Object.entries(signupMap).sort(([a], [b]) => a.localeCompare(b))
      let runningTotal = 0
      cumulative_users = sortedPeriods.map(([period, count]) => {
        runningTotal += count
        return { period, total: runningTotal }
      })

      // Pad forward
      if (cumulative_users.length > 0) {
        const last = cumulative_users[cumulative_users.length - 1]
        const now = new Date()

        if (granularity === 'week') {
          const lastDate = new Date(last.period)
          const nowWeekKey = getWeekKey(now.toISOString())
          let cursor = new Date(lastDate)
          cursor.setDate(cursor.getDate() + 7)
          while (cursor.toISOString().slice(0, 10) <= nowWeekKey) {
            cumulative_users.push({
              period: cursor.toISOString().slice(0, 10),
              total: last.total,
            })
            cursor.setDate(cursor.getDate() + 7)
          }
        } else {
          const lastDate = new Date(last.period)
          const today = now.toISOString().slice(0, 10)
          let cursor = new Date(lastDate)
          cursor.setDate(cursor.getDate() + 1)
          while (cursor.toISOString().slice(0, 10) <= today) {
            cumulative_users.push({
              period: cursor.toISOString().slice(0, 10),
              total: last.total,
            })
            cursor.setDate(cursor.getDate() + 1)
          }
        }
      }
    }

    const signupStats = {
      total_users,
      cumulative_users,
      granularity,
    }

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
