'use client';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

interface AnalysisDialogProps {
  open: boolean;
  onClose: () => void;
  companyName: string;
  analysis: string | null;
}

export default function AnalysisDialog({ open, onClose, companyName, analysis }: AnalysisDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '80vh',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1,
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            Company Analysis
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {companyName}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ 
            color: 'text.secondary',
            '&:hover': { bgcolor: 'action.hover' }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        {analysis ? (
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-wrap',
              lineHeight: 1.7,
              color: 'text.primary',
              '& strong': {
                fontWeight: 600,
                display: 'block',
                mt: 2,
                mb: 1,
              },
            }}
          >
            {analysis}
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            No analysis available for this company.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}

