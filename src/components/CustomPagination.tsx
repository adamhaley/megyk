'use client';

import {
  gridPageCountSelector,
  gridPageSelector,
  useGridApiContext,
  useGridSelector,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import PaginationItem from '@mui/material/PaginationItem';

export default function CustomPagination() {
  const apiRef = useGridApiContext();
  const page = useGridSelector(apiRef, gridPageSelector);
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
      <Pagination
        color="primary"
        variant="outlined"
        shape="rounded"
        page={page + 1}
        count={pageCount}
        showFirstButton
        showLastButton
        renderItem={(props) => <PaginationItem {...props} />}
        onChange={(event, value) => apiRef.current.setPage(value - 1)}
        sx={{
          '& .MuiPaginationItem-root': {
            color: 'text.secondary',
            borderColor: 'divider',
            '&.Mui-selected': {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
              color: 'text.primary',
              borderColor: 'rgba(0, 0, 0, 0.23)',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.12)',
              }
            },
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }
        }}
      />
    </Box>
  );
}

