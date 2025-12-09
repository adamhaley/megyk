import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase-server'
import Sidebar from '@/components/Sidebar'
import MobileNav from '@/components/MobileNav'
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
  } catch (error: any) {
    // If redirect was called, it throws - this is expected behavior
    // Re-throw to let Next.js handle the redirect properly
    if (error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error
    }
    // For other errors, log and redirect safely
    console.error('Auth check error in dashboard layout:', error)
    safeRedirect('/login')
  }
}
