'use client'

import { useState } from 'react'
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
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Link from '@mui/material/Link'

export default function Login() {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/books')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setResetError(error.message)
      } else {
        setResetSuccess(true)
      }
    } catch {
      setResetError('Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false)
    setResetEmail('')
    setResetSuccess(false)
    setResetError(null)
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
              Sign in to Megyk
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your credentials to access the dashboard
            </Typography>
          </Box>

          <form onSubmit={handleLogin}>
            <Stack spacing={3}>
              <TextField
                id="email"
                name="email"
                label="Email address"
                type="email"
                autoComplete="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />

              <TextField
                id="password"
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />

              {error && (
                <Alert severity="error" variant="filled">
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
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{
                    fontSize: '0.875rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Forgot password?
                </Link>
              </Box>
            </Stack>
          </form>
        </CardContent>
      </Card>

      {/* Password Reset Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Reset Password</DialogTitle>
        <form onSubmit={handlePasswordReset}>
          <DialogContent>
            {resetSuccess ? (
              <Alert severity="success">
                Password reset email sent! Check your inbox for the reset link.
              </Alert>
            ) : (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Enter your email address and we'll send you a link to reset your password.
                </Typography>
                
                <TextField
                  label="Email address"
                  type="email"
                  fullWidth
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  disabled={resetLoading}
                  autoFocus
                />

                {resetError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {resetError}
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={handleCloseResetDialog} disabled={resetLoading}>
              {resetSuccess ? 'Close' : 'Cancel'}
            </Button>
            {!resetSuccess && (
              <Button type="submit" variant="contained" disabled={resetLoading}>
                {resetLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  )
}