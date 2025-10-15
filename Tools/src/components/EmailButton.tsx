import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import { Email, Close, Send } from '@mui/icons-material';
import { emailService, ReportEmailData } from '../services/emailService';

interface EmailButtonProps {
  reportType: 'budget' | 'vaccination' | 'house-design' | 'nutrition';
  reportData: any;
  pdfBlob: Blob;
  fileName: string;
  farmerName?: string;
  farmerPhone?: string;
  disabled?: boolean;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  sx?: any;
}

const EmailButton: React.FC<EmailButtonProps> = ({
  reportType,
  reportData,
  pdfBlob,
  fileName,
  farmerName,
  farmerPhone,
  disabled = false,
  variant = 'contained',
  size = 'medium',
  sx = {}
}) => {
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const handleEmailClick = () => {
    setEmailDialogOpen(true);
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setSnackbarMessage('Please enter an email address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setSnackbarMessage('Please enter a valid email address');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    setIsLoading(true);

    try {
      const emailData: ReportEmailData = {
        reportType,
        farmerName,
        farmerEmail: email,
        farmerPhone,
        reportData,
        pdfBlob,
        fileName
      };

      const result = await emailService.sendReportEmail(emailData);

      setSnackbarMessage(result.message);
      setSnackbarSeverity(result.success ? 'success' : 'error');
      setSnackbarOpen(true);

      if (result.success) {
        setEmailDialogOpen(false);
        setEmail('');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      setSnackbarMessage('An unexpected error occurred. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    if (!isLoading) {
      setEmailDialogOpen(false);
      setEmail('');
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        startIcon={<Email />}
        onClick={handleEmailClick}
        disabled={disabled}
        sx={{
          bgcolor: variant === 'contained' ? '#286844' : undefined,
          color: variant === 'contained' ? 'white' : '#286844',
          borderColor: variant === 'outlined' ? '#286844' : undefined,
          '&:hover': {
            bgcolor: variant === 'contained' ? '#1e4d2e' : '#f1f2b0',
            borderColor: variant === 'outlined' ? '#1e4d2e' : undefined,
          },
          ...sx
        }}
      >
        Email Report
      </Button>

      <Dialog
        open={emailDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e9ecef'
        }}>
          <Typography variant="h6" sx={{ color: '#286844', fontWeight: 'bold' }}>
            Email Report
          </Typography>
          <IconButton
            onClick={handleCloseDialog}
            disabled={isLoading}
            sx={{ color: '#666' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Enter your email address to receive the {fileName} directly in your inbox.
            </Alert>
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            placeholder="Enter your email address"
            sx={{
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#286844',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#286844',
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#286844',
              },
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleEmailSubmit();
              }
            }}
          />

          {farmerName && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Report will be sent to: {farmerName}
            </Typography>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={isLoading}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEmailSubmit}
            disabled={isLoading || !email.trim()}
            variant="contained"
            startIcon={isLoading ? <CircularProgress size={16} /> : <Send />}
            sx={{
              bgcolor: '#286844',
              '&:hover': { bgcolor: '#1e4d2e' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {isLoading ? 'Sending...' : 'Send Report'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default EmailButton;
