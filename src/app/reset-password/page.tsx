'use client'

import { useState, useEffect } from 'react'
import { useSupabase } from '@/components/supabase-provider'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'

export default function ResetPassword() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Check if user came from a valid reset link
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // No valid session from reset link, redirect to login
        router.push('/login')
      }
    })
  }, [supabase, router])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/books')
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: { xs: 6, sm: 12 },
        px: { xs: 2, sm: 3 },
      }}
    >
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your new password below
            </Typography>
          </Box>

          {success ? (
            <Alert severity="success">
              Password updated successfully! Redirecting to dashboard...
            </Alert>
          ) : (
            <form onSubmit={handleResetPassword}>
              <Stack spacing={3}>
                <TextField
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />

                <TextField
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  required
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />

                {error && (
                  <Alert severity="error">
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Link
                    href="/login"
                    sx={{
                      fontSize: '0.875rem',
                      color: 'text.secondary',
                      textDecoration: 'none',
                      '&:hover': {
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Back to login
                  </Link>
                </Box>
              </Stack>
            </form>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

