'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BarChartIcon from '@mui/icons-material/BarChart'
import LogoutIcon from '@mui/icons-material/Logout'

interface MobileNavProps {
  userEmail: string | undefined
}

const navigationLinks = [
  {
    name: 'Book Summaries',
    href: '/books',
    icon: MenuBookIcon,
  },
  {
    name: 'Sales Campaign',
    href: '/sales-campaign',
    icon: BarChartIcon,
  },
]

export default function MobileNav({ userEmail }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
    <>
      {/* Mobile Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar
          sx={{
            py: 1,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open menu"
            onClick={() => setIsOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
              }}
            >
              <Image
                src="/megyk.svg"
                alt="Megyk"
                width={440}
                height={120}
                style={{ maxHeight: 72, height: 'auto', width: 'auto' }}
                priority
              />
            </Link>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            aria-label="Sign out"
            onClick={handleSignOut}
            disabled={isSigningOut}
            size="small"
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Sliding Drawer Menu */}
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header with close button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Link
              href="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '2px 2px',
              }}
            >
              <Image
                src="/megyk.svg"
                alt="Megyk"
                width={240}
                height={64}
                style={{ maxHeight: 43, height: 'auto', width: 'auto' }}
                priority
              />
            </Link>
            <IconButton
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Navigation Links */}
          <Box sx={{ flex: 1, py: 3 }}>
            <List sx={{ px: 2 }}>
              {navigationLinks.map((link) => {
                const isActive = pathname.startsWith(link.href)
                const Icon = link.icon

                return (
                  <ListItem key={link.href} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      component={Link}
                      href={link.href}
                      selected={isActive}
                      sx={{
                        borderRadius: 1.5,
                        '&.Mui-selected': {
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          color: 'primary.main',
                          borderLeft: '4px solid',
                          borderColor: 'primary.main',
                          '&:hover': {
                            bgcolor: 'rgba(37, 99, 235, 0.12)',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isActive ? 'primary.main' : 'text.secondary',
                        }}
                      >
                        <Icon />
                      </ListItemIcon>
                      <ListItemText
                        primary={link.name}
                        primaryTypographyProps={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>

        </Box>
      </Drawer>
    </>
  )
}
