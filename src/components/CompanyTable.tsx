'use client';

import { useMemo } from 'react';
import { GermanCompany } from '@/types/company';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface CompanyTableProps {
  companies: GermanCompany[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export default function CompanyTable({ companies, loading, hasMore, onLoadMore }: CompanyTableProps) {
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'company',
      headerName: 'Company',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return null;
        return (
          <Link
            href={`mailto:${params.value}`}
            onClick={(e) => e.stopPropagation()}
            sx={{ color: 'primary.main' }}
          >
            {params.value as string}
          </Link>
        );
      },
    },
    {
      field: 'website',
      headerName: 'Website',
      flex: 1,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) return null;
        const url = (params.value as string).startsWith('http')
          ? params.value as string
          : `https://${params.value}`;
        return (
          <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            sx={{ color: 'primary.main' }}
          >
            {params.value as string}
          </Link>
        );
      },
    },
    {
      field: 'analysis',
      headerName: 'Analysis',
      flex: 1.5,
      minWidth: 250,
    },
    {
      field: 'created_at',
      headerName: 'Last Updated',
      width: 140,
      valueFormatter: (value) => {
        return new Date(value as string).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      },
    },
  ], []);

  if (loading && companies.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (companies.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 12 }}>
        <Typography variant="h6" color="text.secondary">
          No companies found
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ width: '100%' }}>
        <DataGrid
          rows={companies}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25, page: 0 },
            },
            sorting: {
              sortModel: [{ field: 'company', sort: 'asc' }],
            },
          }}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
          autoHeight
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />
      </Box>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button
            onClick={onLoadMore}
            disabled={loading}
            variant="contained"
            size="large"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
}