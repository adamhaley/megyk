'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import type { SignupStats, ChatStats, SummaryStats } from '@/lib/usage-stats'
import AnalyticsChart from '@/components/AnalyticsChart'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={600}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

export default function UsagePage() {
  const [signupStats, setSignupStats] = useState<SignupStats | null>(null)
  const [chatStats, setChatStats] = useState<ChatStats | null>(null)
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/usage-stats')
        const data = await res.json()
        setSignupStats(data.signupStats)
        setChatStats(data.chatStats)
        setSummaryStats(data.summaryStats)
      } catch (err) {
        console.error('Failed to load usage stats:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: 256 }}>
        <CircularProgress />
      </Stack>
    )
  }

  // Doughnut data for summaries by style
  const styleDoughnutData = summaryStats?.by_style.map((s, i) => ({
    name: s.name,
    value: s.count,
    color: COLORS[i % COLORS.length],
  })) || []

  // Doughnut data for summaries by length
  const lengthDoughnutData = summaryStats?.by_length.map((l, i) => ({
    name: l.length,
    value: l.count,
    color: COLORS[(i + 2) % COLORS.length],
  })) || []

  // Engagement funnel data
  const funnelData = [
    { name: 'Users', count: signupStats?.total_users ?? 0 },
    { name: 'Chats', count: chatStats?.total_chats ?? 0 },
    { name: 'Summaries', count: summaryStats?.total_summaries ?? 0 },
  ]

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Usage &amp; Stats
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time engagement metrics across users, chats, and book summaries.
        </Typography>
      </Box>

      {/* Row 1: Stat Cards + Chat Doughnut */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Users" value={signupStats?.total_users ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Chats" value={chatStats?.total_chats ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Summaries Generated" value={summaryStats?.total_summaries ?? 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Custom Chats" value={chatStats?.custom_count ?? 0} />
        </Grid>
      </Grid>

      {/* Row 2: Cumulative User Growth AreaChart (full width) */}
      {signupStats && signupStats.cumulative_users && signupStats.cumulative_users.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Cumulative User Growth</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={signupStats.cumulative_users}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', year: '2-digit' })} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'long', year: 'numeric' })} />
                <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2} fill="url(#userGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Row 3: Chat Activity AreaChart (half) + Chat by Hour BarChart (half) */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {chatStats && chatStats.chats_by_day.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Chat Activity (Daily)</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chatStats.chats_by_day}>
                    <defs>
                      <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })} />
                    <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#chatGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {chatStats && chatStats.chats_by_hour && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>Chat by Hour of Day</Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chatStats.chats_by_hour}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" tickFormatter={(v) => `${v}:00`} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={(v) => `${v}:00 - ${v}:59`} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Row 4: Style doughnut + Length doughnut + Engagement Funnel */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {styleDoughnutData.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsChart
              title="Summaries by Style"
              data={styleDoughnutData}
            />
          </Grid>
        )}

        {lengthDoughnutData.length > 0 && (
          <Grid size={{ xs: 12, md: 4 }}>
            <AnalyticsChart
              title="Summaries by Length"
              data={lengthDoughnutData}
            />
          </Grid>
        )}

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Engagement Funnel</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={funnelData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Row 5: Summaries per Book horizontal bar (full width) */}
      {summaryStats && summaryStats.summaries_per_book && summaryStats.summaries_per_book.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Summaries per Book (Top 10)</Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={summaryStats.summaries_per_book} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="title" width={200} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
