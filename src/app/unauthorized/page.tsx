'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import LockIcon from '@mui/icons-material/Lock'
import { useRouter } from 'next/navigation'

export default function Unauthorized() {
  const router = useRouter()
  const [signingOut, setSigningOut] = useState(false)

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      // Call the signout API route to clear the session
      const response = await fetch('/auth/signout', {
        method: 'POST',
      })
      
      if (response.ok || response.redirected) {
        // Redirect to login page
        window.location.href = '/login'
      } else {
        // If API call fails, try to clear cookies manually and redirect
        window.location.href = '/login'
      }
    } catch {
      // On error, just redirect to login
      window.location.href = '/login'
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
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Access Denied
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              You don&apos;t have permission to access this page.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This area is restricted to administrators only.
            </Typography>
          </Box>

          <Stack spacing={2} sx={{ mt: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSignOut}
              disabled={signingOut}
            >
              {signingOut ? 'Signing out...' : 'Sign Out & Login Again'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

