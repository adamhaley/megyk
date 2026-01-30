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
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { SignupStats, ChatStats, SummaryStats } from '@/lib/usage-stats'

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

  const chatBreakdown = chatStats ? [
    { name: 'Custom', value: chatStats.custom_count },
    { name: 'Pre-written', value: chatStats.prewritten_count },
  ] : []

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

      {/* Stat Cards */}
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

      {/* Signups Over Time */}
      {signupStats && signupStats.signups_by_month.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Signups by Month</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={signupStats.signups_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', year: '2-digit' })} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'long', year: 'numeric' })} />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Chat Activity Over Time */}
      {chatStats && chatStats.chats_by_day.length > 0 && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Chat Activity (Daily)</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chatStats.chats_by_day}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                <YAxis allowDecimals={false} />
                <Tooltip labelFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Chat Breakdown + Summary Breakdown */}
      <Grid container spacing={3}>
        {/* Custom vs Pre-written */}
        {chatStats && chatStats.total_chats > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Custom vs Pre-written Chats</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={chatBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {chatBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summaries by Style */}
        {summaryStats && summaryStats.by_style.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Summaries by Style</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={summaryStats.by_style}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summaries by Length */}
        {summaryStats && summaryStats.by_length.length > 0 && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Summaries by Length</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={summaryStats.by_length}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="length" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
