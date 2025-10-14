import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Container,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Person,
  Email,
  Business,
  LocationOn,
  Public,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { authService, User } from '../services/authService';
import NotificationSettings from './NotificationSettings';

interface UserProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onUserUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    country: user.country || '',
    region: user.region || '',
    farm_name: user.farm_name || '',
    experience_level: user.experience_level,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      country: user.country || '',
      region: user.region || '',
      farm_name: user.farm_name || '',
      experience_level: user.experience_level,
    });
  }, [user]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const updatedUser = await authService.updateUserProfile(user.id, formData);
      onUserUpdate(updatedUser);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      country: user.country || '',
      region: user.region || '',
      farm_name: user.farm_name || '',
      experience_level: user.experience_level,
    });
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'expert': return 'error';
      default: return 'default';
    }
  };

  const getSubscriptionPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'default';
      case 'premium': return 'primary';
      case 'enterprise': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1B5E20', mb: 3 }}>
        My Profile
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Profile Overview Card */}
        <Box sx={{ flex: { xs: '1', md: '0 0 300px' } }}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: '#2E7D32',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '2rem',
                }}
              >
                {user.first_name?.[0]?.toUpperCase() || user.username[0].toUpperCase()}
              </Avatar>
              
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                {user.first_name} {user.last_name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                @{user.username}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                <Chip
                  label={user.experience_level?.charAt(0).toUpperCase() + user.experience_level?.slice(1) || 'Beginner'}
                  color={getExperienceLevelColor(user.experience_level || 'beginner')}
                  size="small"
                />
                <Chip
                  label={user.subscription_plan?.charAt(0).toUpperCase() + user.subscription_plan?.slice(1) || 'Free'}
                  color={getSubscriptionPlanColor(user.subscription_plan || 'free')}
                  size="small"
                />
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Member since {new Date().toLocaleDateString()}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Profile Details Card */}
        <Box sx={{ flex: 1 }}>
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  Profile Information
                </Typography>
                {!isEditing && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => setIsEditing(true)}
                    sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
                  >
                    Edit Profile
                  </Button>
                )}
                {isEditing && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={handleCancel}
                      disabled={loading}
                      sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save />}
                      onClick={handleSave}
                      disabled={loading}
                      sx={{
                        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* First Name and Last Name */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.first_name}
                      onChange={handleInputChange('first_name')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Person sx={{ color: '#2E7D32', mr: 1 }} />,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.last_name}
                      onChange={handleInputChange('last_name')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Person sx={{ color: '#2E7D32', mr: 1 }} />,
                      }}
                    />
                  </Box>
                </Box>

                {/* Email */}
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Email sx={{ color: '#2E7D32', mr: 1 }} />,
                  }}
                />

                {/* Farm Name */}
                <TextField
                  fullWidth
                  label="Farm Name"
                  value={formData.farm_name}
                  onChange={handleInputChange('farm_name')}
                  disabled={!isEditing}
                  InputProps={{
                    startAdornment: <Business sx={{ color: '#2E7D32', mr: 1 }} />,
                  }}
                />

                {/* Country and Region */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Country"
                      value={formData.country}
                      onChange={handleInputChange('country')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <Public sx={{ color: '#2E7D32', mr: 1 }} />,
                      }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <TextField
                      fullWidth
                      label="Region"
                      value={formData.region}
                      onChange={handleInputChange('region')}
                      disabled={!isEditing}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ color: '#2E7D32', mr: 1 }} />,
                      }}
                    />
                  </Box>
                </Box>


                {/* Experience Level */}
                <TextField
                  fullWidth
                  select
                  label="Experience Level"
                  value={formData.experience_level}
                  onChange={handleInputChange('experience_level')}
                  disabled={!isEditing}
                  SelectProps={{
                    native: true,
                  }}
                  InputProps={{
                    startAdornment: <Person sx={{ color: '#2E7D32', mr: 1 }} />,
                  }}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </TextField>
              </Box>
            </CardContent>
          </Card>
                </Box>
              </Box>

              {/* Notification Settings */}
              <Box sx={{ mt: 4 }}>
                <NotificationSettings userId={user.id} />
              </Box>
            </Container>
          );
        };
        
        export default UserProfile;