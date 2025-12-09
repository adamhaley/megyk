import Link from 'next/link'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

export default function NotFound() {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="h1" component="h1" sx={{ fontSize: '4rem', fontWeight: 'bold', mb: 2 }}>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </Typography>
        <Button
          component={Link}
          href="/login"
          variant="contained"
          size="large"
        >
          Go to Login
        </Button>
      </Container>
    </Box>
  )
}


