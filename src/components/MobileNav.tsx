'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import Button from '@mui/material/Button'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BarChartIcon from '@mui/icons-material/BarChart'

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
  const pathname = usePathname()

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

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
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="Open menu"
            onClick={() => setIsOpen(true)}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="h1" fontWeight="bold" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Megyk
          </Typography>
          <Box sx={{ width: 48 }} /> {/* Spacer for centering */}
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
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography variant="h5" component="h2" fontWeight="bold">
              Megyk
            </Typography>
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

          {/* User info + Sign out */}
          <Box sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography
                variant="body2"
                color="text.primary"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                title={userEmail}
              >
                {userEmail}
              </Typography>
              <form action="/auth/signout" method="post">
                <Button
                  type="submit"
                  fullWidth
                  size="small"
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'text.secondary',
                    textTransform: 'none',
                    fontWeight: 400,
                    '&:hover': {
                      color: 'text.primary',
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  Sign out
                </Button>
              </form>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </>
  )
}
