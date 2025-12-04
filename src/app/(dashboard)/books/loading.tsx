import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'

export default function BooksLoading() {
  return (
    <Box>
      {/* Header Skeleton */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Skeleton variant="text" width={250} height={48} />
          <Skeleton variant="text" width={200} height={24} />
        </Box>
        <Skeleton variant="rectangular" width={160} height={42} sx={{ borderRadius: 1 }} />
      </Stack>

      {/* Dropzone Skeleton */}
      <Paper
        variant="outlined"
        sx={{
          p: 6,
          mb: 4,
          textAlign: 'center',
          borderStyle: 'dashed',
          borderWidth: 2,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="circular" width={48} height={48} />
          <Skeleton variant="text" width={280} height={28} />
          <Skeleton variant="text" width={240} height={20} />
        </Stack>
      </Paper>

      {/* Search Skeleton */}
      <Skeleton variant="rectangular" height={40} sx={{ mb: 3, borderRadius: 1 }} />

      {/* Book List Skeleton */}
      <Stack spacing={2}>
        {[...Array(3)].map((_, i) => (
          <Paper key={i} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={32} />
                <Skeleton variant="text" width="40%" height={24} />
                <Skeleton variant="text" width="90%" height={20} sx={{ mt: 2 }} />
                <Skeleton variant="text" width="85%" height={20} />
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Skeleton variant="text" width={80} height={16} />
                  <Skeleton variant="text" width={120} height={16} />
                  <Skeleton variant="text" width={100} height={16} />
                </Stack>
              </Box>
              <Stack spacing={1} alignItems="flex-end" sx={{ minWidth: 140 }}>
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="text" width={80} height={20} />
                <Skeleton variant="circular" width={32} height={32} />
              </Stack>
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}

