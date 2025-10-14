import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  EmojiNature,
  TrendingUp,
  LocalHospital,
} from '@mui/icons-material';

interface WelcomePopupProps {
  open: boolean;
  onClose: () => void;
}

const WelcomePopup: React.FC<WelcomePopupProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        },
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
          color: 'white',
          p: 2,
          textAlign: 'center',
          position: 'relative',
        }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
          
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
            Welcome to River Poultry Tools!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Your journey to optimized poultry farming starts here
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 2, maxHeight: '60vh', overflow: 'hidden' }}>
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="subtitle1" sx={{ color: '#2E7D32', fontWeight: 'bold', mb: 1.5 }}>
            🌟 What You Can Do Here:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: 'rgba(46, 125, 50, 0.05)', borderRadius: 1.5 }}>
              <TrendingUp sx={{ color: '#2E7D32', fontSize: 20 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  Track Your Operations
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Monitor costs, performance, and profitability
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: 'rgba(46, 125, 50, 0.05)', borderRadius: 1.5 }}>
              <LocalHospital sx={{ color: '#2E7D32', fontSize: 20 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  Expert Veterinary Support
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Get personalized advice from our poultry health experts
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, background: 'rgba(46, 125, 50, 0.05)', borderRadius: 1.5 }}>
              <EmojiNature sx={{ color: '#2E7D32', fontSize: 20 }} />
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  Join Successful Farmers
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Connect with thousands who've optimized their farms
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)', 
            borderRadius: 1.5, 
            p: 2, 
            mb: 2,
            border: '1px solid #c8e6c9'
          }}>
            <Typography variant="body2" sx={{ mb: 1, color: '#2E7D32', fontWeight: 'bold' }}>
              💡 Ready to get started?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Use all tools right away, or sign up to save progress and get personalized support.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', mb: 1.5 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                // Navigate to signup/login page
                window.location.href = '/login';
              }}
              sx={{
                flex: 1,
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                },
              }}
            >
              📝 Sign Up to Save Progress
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              onClick={onClose}
              sx={{
                flex: 1,
                py: 0.75,
                fontSize: '0.8rem',
                borderColor: '#2E7D32',
                color: '#2E7D32',
                '&:hover': {
                  borderColor: '#1B5E20',
                  backgroundColor: 'rgba(46, 125, 50, 0.04)',
                },
              }}
            >
              Skip for Now
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            💚 Welcome to our community of successful poultry farmers!
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomePopup;
