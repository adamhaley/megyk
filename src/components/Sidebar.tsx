'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import BarChartIcon from '@mui/icons-material/BarChart'

interface SidebarProps {
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

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2.5,
            py: 2,
            height: '64px',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Link
            href="/"
            style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 2,
                py: 0,
                cursor: 'pointer',
                transition: 'opacity 0.2s',
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              <Image
                src="/megyk-logo-no-book.png"
                alt="Megyk"
                width={480}
                height={128}
                style={{ maxHeight: 86, height: 'auto', width: 'auto', maxWidth: '100%', objectFit: 'contain' }}
                priority
              />
            </Box>
          </Link>
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
                        bgcolor: 'rgba(37, 99, 235, 0.08)', // primary with opacity
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
  )
}
