import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  TextField,
  Stack,
  IconButton,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Close,
  LocalHospital,
  Support,
  TrendingUp,
  CheckCircle,
} from '@mui/icons-material';
import { authService, RegisterData } from '../services/authService';

interface AspirationalSignupProps {
  open: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

const AspirationalSignup: React.FC<AspirationalSignupProps> = ({
  open,
  onClose,
  onLoginSuccess,
}) => {
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    farm_name: '',
    country: '',
    region: '',
    experience_level: 'beginner',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleInputChange = (field: keyof RegisterData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(formData);
      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(response.user);
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Store that user has seen the signup modal
    localStorage.setItem('hasSeenSignupModal', 'true');
    onClose();
  };

  if (success) {
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
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
              🎉 Welcome to Your Optimization Journey!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              You're now ready to transform your poultry operations
            </Typography>
          </Box>
          
          <Box sx={{ 
            background: 'rgba(76, 175, 80, 0.1)', 
            borderRadius: 2, 
            p: 3, 
            mb: 3 
          }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              🚀 You're now part of thousands of farmers who've optimized their operations!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our expert team will connect with you soon to help you stop struggling and start optimizing your farm's profitability.
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
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
          p: 3,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <IconButton
            onClick={handleSkip}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            <Close />
          </IconButton>
          
          <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
            Ready to Optimize Your Poultry Operations?
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Join thousands of poultry farmers who trust our tools for their daily operations
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Benefits Section */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                💡 Stop Struggling - Start Optimizing!
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <TrendingUp sx={{ color: '#2E7D32' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Know Your True Costs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Still not sure what you spent to run your farm? Get precise cost tracking and profit analysis
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocalHospital sx={{ color: '#2E7D32' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Expert Veterinary Guidance
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Access our team of poultry health experts for personalized optimization strategies
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Support sx={{ color: '#2E7D32' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      Join Successful Farmers
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connect with thousands of farmers who've optimized their operations and increased profits
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* Call to Action Section */}
          <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)', border: '2px solid #ff9800' }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="h5" sx={{ color: '#e65100', fontWeight: 'bold', mb: 2 }}>
                🎯 Why Keep Struggling When Success is Within Reach?
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, color: '#bf360c' }}>
                <strong>Still not sure what you spent to run your farm?</strong> Join thousands of successful farmers who've transformed their operations with our proven tools.
              </Typography>
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                Try Poultry Manager Now - Your Optimization Journey Starts Here!
              </Typography>
            </CardContent>
          </Card>

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Typography variant="h6" sx={{ color: '#2E7D32', fontWeight: 'bold' }}>
                Ready to Transform Your Farm? (Optional)
              </Typography>
              
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={handleInputChange('username')}
                required
                variant="outlined"
                helperText="Choose a unique username for your account"
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={formData.first_name}
                  onChange={handleInputChange('first_name')}
                  required
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={formData.last_name}
                  onChange={handleInputChange('last_name')}
                  required
                  variant="outlined"
                />
              </Box>

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                required
                variant="outlined"
                helperText="We'll use this to connect you with our veterinary team"
              />

              <TextField
                fullWidth
                label="Farm Name (Optional)"
                value={formData.farm_name || ''}
                onChange={handleInputChange('farm_name')}
                variant="outlined"
                helperText="Your farm or business name"
              />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <TextField
                  fullWidth
                  label="Country (Optional)"
                  value={formData.country || ''}
                  onChange={handleInputChange('country')}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Region (Optional)"
                  value={formData.region || ''}
                  onChange={handleInputChange('region')}
                  variant="outlined"
                />
              </Box>

              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
                variant="outlined"
              />

              {error && (
                <Box sx={{ 
                  background: '#ffebee', 
                  color: '#c62828', 
                  p: 2, 
                  borderRadius: 1,
                  border: '1px solid #ffcdd2'
                }}>
                  {error}
                </Box>
              )}

              <Box sx={{ display: 'flex', gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                    },
                  }}
                >
                  {loading ? 'Optimizing Your Access...' : 'Try Poultry Manager Now'}
                </Button>
                
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleSkip}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    fontSize: '1.1rem',
                    borderColor: '#2E7D32',
                    color: '#2E7D32',
                    '&:hover': {
                      borderColor: '#1B5E20',
                      backgroundColor: 'rgba(46, 125, 50, 0.04)',
                    },
                  }}
                >
                  Continue as Guest
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
                💡 <strong>Remember:</strong> You can always optimize your operations later - but why wait when success is just one click away?
              </Typography>
            </Stack>
          </form>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AspirationalSignup;
