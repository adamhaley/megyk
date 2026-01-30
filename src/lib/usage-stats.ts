import { supabase } from './supabase'

export interface SignupStats {
  total_users: number
  signups_by_month: { month: string; count: number }[]
  cumulative_users: { month: string; total: number }[]
}

export interface ChatStats {
  total_chats: number
  chats_by_day: { date: string; count: number }[]
  chats_by_hour: { hour: number; count: number }[]
  custom_count: number
  prewritten_count: number
}

export interface SummaryStats {
  total_summaries: number
  by_style: { name: string; count: number }[]
  by_length: { length: string; count: number }[]
  summaries_per_book: { title: string; count: number }[]
}

export async function getSignupStats(): Promise<SignupStats> {
  const { data, error } = await supabase.rpc('get_signup_stats')
  if (error) {
    console.error('Failed to fetch signup stats:', error.message)
    return { total_users: 0, signups_by_month: [], cumulative_users: [] }
  }
  return data as SignupStats
}

export async function getChatStats(): Promise<ChatStats> {
  const { data: chats, error: chatError } = await supabase
    .from('chat_log')
    .select('id, user_question, created_at')

  if (chatError) {
    console.error('Failed to fetch chat stats:', chatError.message)
    return { total_chats: 0, chats_by_day: [], chats_by_hour: [], custom_count: 0, prewritten_count: 0 }
  }

  const { data: suggestions } = await supabase
    .from('chat_suggestions')
    .select('suggestion')

  const suggestionSet = new Set(
    (suggestions || []).map((s: { suggestion: string }) => s.suggestion.trim().toLowerCase())
  )

  let prewritten_count = 0
  let custom_count = 0
  const dayMap: Record<string, number> = {}
  const hourMap: Record<number, number> = {}

  for (const chat of chats || []) {
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

  const chats_by_day = Object.entries(dayMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }))

  const chats_by_hour = Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: hourMap[i] || 0,
  }))

  return {
    total_chats: (chats || []).length,
    chats_by_day,
    chats_by_hour,
    custom_count,
    prewritten_count,
  }
}

export async function getSummaryStats(): Promise<SummaryStats> {
  const { data, error } = await supabase
    .from('summaries_v2')
    .select('style, length')

  if (error) {
    console.error('Failed to fetch summary stats:', error.message)
    return { total_summaries: 0, by_style: [], by_length: [], summaries_per_book: [] }
  }

  const styleMap: Record<string, number> = {}
  const lengthMap: Record<string, number> = {}

  for (const row of data || []) {
    const s = row.style || 'unknown'
    const l = row.length || 'unknown'
    styleMap[s] = (styleMap[s] || 0) + 1
    lengthMap[l] = (lengthMap[l] || 0) + 1
  }

  return {
    total_summaries: (data || []).length,
    by_style: Object.entries(styleMap).map(([name, count]) => ({ name, count })),
    by_length: Object.entries(lengthMap).map(([length, count]) => ({ length, count })),
    summaries_per_book: [],
  }
}
