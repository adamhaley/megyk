'use client';

import { 
  GridToolbarContainer,
} from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CustomPagination from './CustomPagination';

export default function CustomToolbar() {
  return (
    <Box>
      <GridToolbarContainer 
        sx={{ 
          justifyContent: 'space-between', 
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Quick Navigation
        </Typography>
        <CustomPagination />
      </GridToolbarContainer>
    </Box>
  );
}

