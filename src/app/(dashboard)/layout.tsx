import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
import DashboardHeader from '@/components/DashboardHeader'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'

// Helper to safely redirect without header conflicts
function safeRedirect(path: string) {
  try {
    redirect(path)
  } catch (error) {
    // redirect() throws internally - this is expected
    // Re-throw to let Next.js handle it
    throw error
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await createServerComponentClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      safeRedirect('/login')
    }

    // TypeScript assertion: session is guaranteed to be non-null here
    // because redirect() throws and never returns
    const userSession = session!

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
          <Sidebar userEmail={userSession.user.email} />
        </Box>

        {/* Main content area - offset by sidebar width on desktop */}
        <Box
          sx={{
            flex: 1,
            ml: { xs: 0, md: '280px' },
            width: '100%',
            overflowX: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Mobile header with hamburger */}
          <MobileNav userEmail={userSession.user.email} />

          {/* Desktop header with logout */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: 3,
              py: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <DashboardHeader userEmail={userSession.user.email} />
          </Box>

          {/* Page content */}
          <Container
            component="main"
            maxWidth="lg"
            sx={{ py: 3, px: { xs: 2, sm: 3 }, flex: 1 }}
          >
            {children}
          </Container>
        </Box>
      </Box>
    )
  } catch (error: unknown) {
    // If redirect was called, it throws - this is expected behavior
    // Re-throw to let Next.js handle the redirect properly
    if (error && typeof error === 'object' && 'digest' in error && typeof error.digest === 'string' && error.digest.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    // For other errors, log and redirect safely
    console.error('Auth check error in dashboard layout:', error)
    safeRedirect('/login')
  }
}
