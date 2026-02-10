'use client'

import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell,
} from 'recharts'
import type { SignupStats, ChatStats, SummaryStats } from '@/lib/usage-stats'
import AnalyticsChart from '@/components/AnalyticsChart'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

interface TooltipPayloadItem {
  value: number
  color: string
  name: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string | number
  labelFormatter?: (label: string | number) => string
}

const CustomTooltip = ({ active, payload, label, labelFormatter }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1.5,
        px: 1.5,
        py: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {labelFormatter && label !== undefined ? labelFormatter(label) : label}
      </Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="body2" fontWeight={600} sx={{ color: entry.color }}>
          {entry.value.toLocaleString()}
        </Typography>
      ))}
    </Box>
  )
}

function SectionHeader({ title, expanded, onToggle }: { title: string; expanded: boolean; onToggle: () => void }) {
  return (
    <Box
      onClick={onToggle}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        mb: expanded ? 2 : 0,
        py: 1,
        px: 0.5,
        borderRadius: 1,
        userSelect: 'none',
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
        {title}
      </Typography>
      <IconButton size="small" sx={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
        <ExpandMoreIcon fontSize="small" />
      </IconButton>
    </Box>
  )
}

const STAT_COLORS = [
  { bg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', text: '#fff' },
  { bg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', text: '#fff' },
]

function StatCard({ title, value, colorIndex = 0 }: { title: string; value: string | number; colorIndex?: number }) {
  const color = STAT_COLORS[colorIndex % STAT_COLORS.length]
  return (
    <Card
      sx={{
        background: color.bg,
        color: color.text,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent>
        <Typography variant="body2" sx={{ opacity: 0.9 }} gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={700}>
          {typeof value === 'number' ? value.toLocaleString() : value}
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
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('month')
  const [viewMode, setViewMode] = useState<'cumulative' | 'per_period'>('cumulative')
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    chats: false,
    summaries: false,
    perBook: true,
  })

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/usage-stats?granularity=${granularity}`)
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
  }, [granularity])

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
          <StatCard title="Total Users" value={signupStats?.total_users ?? 0} colorIndex={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Chats" value={chatStats?.total_chats ?? 0} colorIndex={1} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Summaries Generated" value={summaryStats?.total_summaries ?? 0} colorIndex={2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Custom Chats" value={chatStats?.custom_count ?? 0} colorIndex={3} />
        </Grid>
      </Grid>

      {/* Row 2: User Growth Chart (full width) */}
      {signupStats && ((viewMode === 'cumulative' && signupStats.cumulative_users?.length > 0) || (viewMode === 'per_period' && signupStats.signups_per_period?.length > 0)) && (
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Typography variant="h6">
                {viewMode === 'cumulative'
                  ? 'Cumulative User Growth'
                  : `New Signups per ${granularity.charAt(0).toUpperCase() + granularity.slice(1)}`}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(_, value) => value && setViewMode(value)}
                  size="small"
                >
                  <ToggleButton value="cumulative">Cumulative</ToggleButton>
                  <ToggleButton value="per_period">Per Period</ToggleButton>
                </ToggleButtonGroup>
                <ToggleButtonGroup
                  value={granularity}
                  exclusive
                  onChange={(_, value) => value && setGranularity(value)}
                  size="small"
                >
                  <ToggleButton value="day">Day</ToggleButton>
                  <ToggleButton value="week">Week</ToggleButton>
                  <ToggleButton value="month">Month</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              {viewMode === 'cumulative' ? (
                <AreaChart data={signupStats.cumulative_users}>
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      const parts = v.split('-')
                      if (parts.length === 2) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' })
                      } else if (parts.length >= 3) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                      }
                      return v
                    }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={<CustomTooltip labelFormatter={(v) => {
                      const parts = String(v).split('-')
                      if (parts.length === 2) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })
                      } else if (parts.length >= 3) {
                        const dateStr = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
                        return granularity === 'week' ? `Week of ${dateStr}` : dateStr
                      }
                      return String(v)
                    }} />}
                  />
                  <Area type="monotone" dataKey="total" stroke="#2563eb" strokeWidth={2.5} fill="url(#userGradient)" animationDuration={1000} dot={false} activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                </AreaChart>
              ) : (
                <BarChart data={signupStats.signups_per_period}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="period"
                    interval="preserveStartEnd"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => {
                      const parts = v.split('-')
                      if (parts.length === 2) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1).toLocaleDateString('en', { month: 'short', year: '2-digit' })
                      } else if (parts.length >= 3) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('en', { month: 'short', day: 'numeric' })
                      }
                      return v
                    }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={<CustomTooltip labelFormatter={(v) => {
                      const parts = String(v).split('-')
                      if (parts.length === 2) {
                        return new Date(Number(parts[0]), Number(parts[1]) - 1).toLocaleDateString('en', { month: 'long', year: 'numeric' })
                      } else if (parts.length >= 3) {
                        const dateStr = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })
                        return granularity === 'week' ? `Week of ${dateStr}` : dateStr
                      }
                      return String(v)
                    }} />}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationDuration={800} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Summaries per Book horizontal bar (full width) */}
      {summaryStats && summaryStats.summaries_per_book && summaryStats.summaries_per_book.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <SectionHeader title="Summaries per Book" expanded={expandedSections.perBook} onToggle={() => toggleSection('perBook')} />
          <Collapse in={expandedSections.perBook}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>Top 10</Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={summaryStats.summaries_per_book} layout="vertical" margin={{ left: 40 }}>
                    <defs>
                      <linearGradient id="bookGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#f97316" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey="title" width={200} tick={{ fontSize: 12 }} tickFormatter={(v: string) => v.length > 30 ? v.replace(/:.*$/, '').slice(0, 30) + '...' : v.replace(/:.*$/, '')} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill="url(#bookGradient)" radius={[0, 6, 6, 0]} animationDuration={800}>
                      {summaryStats.summaries_per_book.map((_, index) => (
                        <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.07)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Collapse>
        </Box>
      )}

      {/* Chat Activity AreaChart (half) + Chat by Hour BarChart (half) */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader title="Chat Analytics" expanded={expandedSections.chats} onToggle={() => toggleSection('chats')} />
        <Collapse in={expandedSections.chats}>
          <Grid container spacing={3}>
            {chatStats && chatStats.chats_by_day.length > 0 && (
              <Grid size={{ xs: 12, md: 6 }}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Chat Activity (Daily)</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chatStats.chats_by_day}>
                        <defs>
                          <linearGradient id="chatGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v) => new Date(v).toLocaleDateString('en', { month: 'short', day: 'numeric' })} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip labelFormatter={(v) => new Date(String(v)).toLocaleDateString('en', { month: 'long', day: 'numeric', year: 'numeric' })} />} />
                        <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} fill="url(#chatGradient)" animationDuration={1000} dot={false} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
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
                        <defs>
                          <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" />
                            <stop offset="100%" stopColor="#6d28d9" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="hour" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}h`} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip labelFormatter={(v) => `${v}:00 - ${v}:59`} />} />
                        <Bar dataKey="count" fill="url(#hourGradient)" radius={[4, 4, 0, 0]} animationDuration={800} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Collapse>
      </Box>

      {/* Row 4: Style doughnut + Length doughnut + Engagement Funnel */}
      <Box sx={{ mb: 3 }}>
        <SectionHeader title="Summary & Engagement Breakdown" expanded={expandedSections.summaries} onToggle={() => toggleSection('summaries')} />
        <Collapse in={expandedSections.summaries}>
          <Grid container spacing={3}>
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
                      <defs>
                        <linearGradient id="funnelGradient1" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#1d4ed8" />
                        </linearGradient>
                        <linearGradient id="funnelGradient2" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="funnelGradient3" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fontWeight: 500 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" radius={[0, 6, 6, 0]} animationDuration={800}>
                        <Cell fill="url(#funnelGradient1)" />
                        <Cell fill="url(#funnelGradient2)" />
                        <Cell fill="url(#funnelGradient3)" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Collapse>
      </Box>

    </Box>
  )
}
