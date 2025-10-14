import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Link,
} from '@mui/material';
import { authService, User, RegisterData } from '../services/authService';
import PasswordResetRequest from './PasswordResetRequest';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onContinueAsGuest?: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onContinueAsGuest }) => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
  });

  // Register form state
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    farm_name: '',
    country: '',
    region: '',
    experience_level: 'beginner',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
    setSuccess(null);
  };

  if (showPasswordReset) {
    return (
      <PasswordResetRequest
        onBack={() => setShowPasswordReset(false)}
        onSuccess={() => setShowPasswordReset(false)}
      />
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(loginData.username, loginData.password);
      setSuccess('Login successful!');
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.register(registerData);
      setSuccess('Registration successful! You are now logged in.');
      onLoginSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (tabValue === 0) {
      setLoginData(prev => ({ ...prev, [field]: value }));
    } else {
      setRegisterData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          linear-gradient(135deg, 
            rgba(248, 250, 252, 0.95) 0%, 
            rgba(241, 245, 249, 0.9) 25%, 
            rgba(226, 232, 240, 0.85) 50%, 
            rgba(203, 213, 225, 0.9) 75%, 
            rgba(148, 163, 184, 0.95) 100%
          ),
          radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
        `,
        position: 'relative',
        padding: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(100, 116, 139, 0.08) 2px, transparent 2px),
            radial-gradient(circle at 75% 75%, rgba(100, 116, 139, 0.08) 2px, transparent 2px),
            radial-gradient(circle at 50% 10%, rgba(100, 116, 139, 0.04) 1px, transparent 1px),
            radial-gradient(circle at 10% 60%, rgba(100, 116, 139, 0.04) 1px, transparent 1px),
            radial-gradient(circle at 90% 40%, rgba(100, 116, 139, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 150px 150px, 200px 200px, 250px 250px, 300px 300px',
          backgroundPosition: '0 0, 50px 50px, 100px 100px, 150px 150px, 200px 200px',
          animation: 'float 20s ease-in-out infinite',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            linear-gradient(45deg, transparent 30%, rgba(100, 116, 139, 0.01) 50%, transparent 70%),
            linear-gradient(-45deg, transparent 30%, rgba(100, 116, 139, 0.01) 50%, transparent 70%)
          `,
          backgroundSize: '60px 60px',
          animation: 'shimmer 15s linear infinite',
          zIndex: 0,
        },
        '@keyframes float': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(0deg)',
          },
          '33%': {
            transform: 'translateY(-10px) rotate(1deg)',
          },
          '66%': {
            transform: 'translateY(5px) rotate(-1deg)',
          },
        },
        '@keyframes shimmer': {
          '0%': {
            backgroundPosition: '0 0, 0 0',
          },
          '100%': {
            backgroundPosition: '60px 60px, -60px -60px',
          },
        },
      }}
    >
      <Card sx={{ 
        maxWidth: 500, 
        width: '100%',
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Login" />
              <Tab label="Register" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ m: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ m: 2 }}>
              {success}
            </Alert>
          )}

          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom align="center">
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Sign in to access your farm management tools
            </Typography>

            <form onSubmit={handleLogin}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Username"
                  value={loginData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={loginData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={loading}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Sign In'}
                </Button>
                
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link
                    component="button"
                    variant="body2"
                    onClick={() => setShowPasswordReset(true)}
                    sx={{
                      color: '#2E7D32',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot your password?
                  </Link>
                </Box>
                
                {onContinueAsGuest && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={onContinueAsGuest}
                    sx={{ mt: 1 }}
                  >
                    Continue as Guest
                  </Button>
                )}
              </Box>
            </form>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom align="center">
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
              Join River Poultry Tools to manage your farm operations
            </Typography>

            <form onSubmit={handleRegister}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={registerData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    required
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={registerData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    required
                    disabled={loading}
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Username"
                  value={registerData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={registerData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={registerData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  disabled={loading}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    fullWidth
                    label="Farm Name"
                    value={registerData.farm_name}
                    onChange={(e) => handleInputChange('farm_name', e.target.value)}
                    disabled={loading}
                  />
                  <TextField
                    fullWidth
                    label="Country"
                    value={registerData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    disabled={loading}
                  />
                </Box>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Create Account'}
                </Button>
                {onContinueAsGuest && (
                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={onContinueAsGuest}
                    sx={{ mt: 1 }}
                  >
                    Continue as Guest
                  </Button>
                )}
              </Box>
            </form>
          </TabPanel>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
