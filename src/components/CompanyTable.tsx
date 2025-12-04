'use client';

import { useMemo } from 'react';
import { GermanCompany } from '@/types/company';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import CustomPagination from './CustomPagination';
import CustomToolbar from './CustomToolbar';

interface CompanyTableProps {
  companies: GermanCompany[];
  loading: boolean;
  totalCount: number;
  paginationModel: {
    page: number;
    pageSize: number;
  };
  onPaginationModelChange: (model: { page: number; pageSize: number }) => void;
}

export default function CompanyTable({ 
  companies, 
  loading, 
  totalCount,
  paginationModel,
  onPaginationModelChange 
}: CompanyTableProps) {
  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'company',
      headerName: 'Company',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'first_contact_sent',
      headerName: 'Contact Status',
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const contacted = params.value as boolean;
        return (
          <Chip
            label={contacted ? 'Contacted' : 'Not Contacted'}
            size="small"
            variant="outlined"
            sx={{ 
              borderColor: contacted ? 'rgba(76, 175, 80, 0.4)' : 'divider',
              color: contacted ? 'rgba(46, 125, 50, 0.9)' : 'text.secondary',
              fontWeight: 500,
              bgcolor: contacted ? 'rgba(76, 175, 80, 0.08)' : 'transparent'
            }}
          />
        );
      },
    },
    {
      field: 'email_status',
      headerName: 'Email Status',
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as string | null;
        
        const getStatusStyle = (s: string | null) => {
          if (!s) {
            return {
              borderColor: 'divider',
              color: 'text.disabled',
              bgcolor: 'transparent'
            };
          }
          
          const lower = s.toLowerCase();
          
          // Green for ok:email_ok
          if (lower === 'ok:email_ok' || lower === 'email_ok') {
            return {
              borderColor: 'rgba(76, 175, 80, 0.4)',
              color: 'rgba(46, 125, 50, 0.9)',
              bgcolor: 'rgba(76, 175, 80, 0.08)'
            };
          }
          
          // Amber for risky statuses
          if (lower.includes('risky:is_role') || lower.includes('risky:accept_all')) {
            return {
              borderColor: 'rgba(255, 152, 0, 0.4)',
              color: 'rgba(230, 126, 0, 0.9)',
              bgcolor: 'rgba(255, 152, 0, 0.08)'
            };
          }
          
          // Invalid or other risky
          if (lower.includes('invalid') || lower.includes('risky')) {
            return {
              borderColor: 'rgba(0, 0, 0, 0.15)',
              color: 'text.disabled',
              bgcolor: 'transparent'
            };
          }
          
          // Default for other statuses
          return {
            borderColor: 'divider',
            color: 'text.secondary',
            bgcolor: 'transparent'
          };
        };

        return (
          <Chip
            label={status || 'Unknown'}
            size="small"
            variant="outlined"
            sx={{ 
              fontWeight: 500,
              ...getStatusStyle(status)
            }}
          />
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              No email
            </Typography>
          );
        }
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
      field: 'address',
      headerName: 'Address',
      flex: 1,
      minWidth: 220,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              No address
            </Typography>
          );
        }
        return (
          <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {params.value as string}
          </Typography>
        );
      },
    },
    {
      field: 'website',
      headerName: 'Website',
      flex: 1,
      minWidth: 180,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              No website
            </Typography>
          );
        }
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
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => {
        if (!params.value) {
          return (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              Not analyzed
            </Typography>
          );
        }
        const text = params.value as string;
        return (
          <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {text}
          </Typography>
        );
      },
    },
    {
      field: 'updated_at',
      headerName: 'Last Updated',
      width: 120,
      valueFormatter: (value) => {
        return new Date(value as string).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: '2-digit',
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
    <DataGrid
      rows={companies}
      columns={columns}
      rowCount={totalCount}
      loading={loading}
      paginationMode="server"
      paginationModel={paginationModel}
      onPaginationModelChange={onPaginationModelChange}
      pageSizeOptions={[10, 25, 50, 100]}
      disableRowSelectionOnClick
      autoHeight
      slots={{
        toolbar: CustomToolbar,
        pagination: CustomPagination,
      }}
      slotProps={{
        toolbar: {
          showQuickFilter: false,
        },
      }}
      sx={{
        border: 'none',
        '& .MuiDataGrid-cell:focus': {
          outline: 'none',
        },
        '& .MuiDataGrid-row:hover': {
          bgcolor: 'action.hover',
        },
        '& .MuiDataGrid-footerContainer': {
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 2,
        },
      }}
    />
  );
}