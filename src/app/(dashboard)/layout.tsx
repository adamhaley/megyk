import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerComponentClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Desktop Sidebar - hidden on mobile */}
      <Box
        component="aside"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: 280,
          position: 'fixed',
          height: '100vh',
        }}
      >
        <Sidebar userEmail={session.user.email} />
      </Box>

      {/* Main content area - offset by sidebar width on desktop */}
      <Box
        sx={{
          flex: 1,
          ml: { xs: 0, md: '280px' },
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {/* Mobile header with hamburger */}
        <MobileNav userEmail={session.user.email} />

        {/* Page content */}
        <Container
          component="main"
          maxWidth="lg"
          sx={{ py: 3, px: { xs: 2, sm: 3 } }}
        >
          {children}
        </Container>
      </Box>
    </Box>
  )
}
