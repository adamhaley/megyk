import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'

export default function BookDetailLoading() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 4 }}
      >
        <Skeleton variant="text" width={120} height={24} />
        <Stack direction="row" spacing={1}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </Stack>

      {/* Book Details Card Skeleton */}
      <Paper sx={{ p: 4 }}>
        <Stack spacing={3}>
          {/* Title and Author */}
          <Box>
            <Skeleton variant="text" width="70%" height={48} />
            <Skeleton variant="text" width="40%" height={32} />
          </Box>

          {/* Status Badges */}
          <Stack direction="row" spacing={2}>
            <Skeleton variant="text" width={80} height={20} />
            <Skeleton variant="text" width={60} height={20} />
          </Stack>

          {/* Summary */}
          <Box>
            <Skeleton variant="text" width={100} height={28} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
            <Skeleton variant="text" width="95%" height={20} />
            <Skeleton variant="text" width="90%" height={20} />
          </Box>

          <Divider />

          {/* Details Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 3,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Box key={i}>
                <Skeleton variant="text" width={120} height={16} />
                <Skeleton variant="text" width="80%" height={24} sx={{ mt: 0.5 }} />
              </Box>
            ))}
          </Box>
        </Stack>
      </Paper>
    </Box>
  )
}

