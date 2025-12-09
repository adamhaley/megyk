'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import LogoutIcon from '@mui/icons-material/Logout'

interface DashboardHeaderProps {
  userEmail: string | undefined
}

export default function DashboardHeader({ userEmail }: DashboardHeaderProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const response = await fetch('/auth/signout', {
        method: 'POST',
      })
      
      if (response.ok || response.redirected) {
        window.location.href = '/login'
      } else {
        window.location.href = '/login'
      }
    } catch {
      window.location.href = '/login'
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {userEmail && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: { xs: 'none', sm: 'block' },
            fontSize: '0.875rem',
          }}
        >
          {userEmail}
        </Typography>
      )}
      <Tooltip title="Sign out">
        <IconButton
          onClick={handleSignOut}
          disabled={isSigningOut}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              color: 'text.primary',
              bgcolor: 'action.hover',
            },
          }}
          aria-label="Sign out"
        >
          <LogoutIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  )
}

