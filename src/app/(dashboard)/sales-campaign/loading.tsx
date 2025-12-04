import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export default function SalesCampaignLoading() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Skeleton variant="text" width={300} height={48} />
        <Skeleton variant="text" width={450} height={24} />
      </Box>

      {/* Analytics Charts Skeleton */}
      <Box sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {[...Array(3)].map((_, i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Card>
                <CardContent>
                  <Skeleton variant="text" width="75%" height={32} />
                  <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
                  <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto' }} />
                </CardContent>
              </Card>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Search Bar Skeleton */}
      <Skeleton variant="rectangular" height={40} sx={{ mb: 3, borderRadius: 1 }} />

      {/* DataGrid Skeleton */}
      <Card>
        <CardContent>
          {/* Header row */}
          <Stack direction="row" spacing={2} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="text" width="20%" height={24} />
            <Skeleton variant="text" width="15%" height={24} />
          </Stack>

          {/* Data rows */}
          {[...Array(5)].map((_, i) => (
            <Stack key={i} direction="row" spacing={2} sx={{ mb: 2 }}>
              <Skeleton variant="text" width="20%" height={32} />
              <Skeleton variant="text" width="20%" height={32} />
              <Skeleton variant="text" width="20%" height={32} />
              <Skeleton variant="text" width="20%" height={32} />
              <Skeleton variant="text" width="15%" height={32} />
            </Stack>
          ))}
        </CardContent>
      </Card>
    </Box>
  )
}

