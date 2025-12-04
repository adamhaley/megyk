import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'

export default function DashboardLoading() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Stack spacing={1} sx={{ mb: 4 }}>
        <Skeleton variant="text" width="40%" height={48} />
        <Skeleton variant="text" width="60%" height={24} />
      </Stack>

      {/* Content Skeleton */}
      <Stack spacing={2}>
        {[...Array(3)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Stack>
    </Box>
  )
}

