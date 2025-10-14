import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormGroup,
  Autocomplete,
  Switch,
} from '@mui/material';
import {
  Send,
  Save,
  Preview,
  People,
  Notifications,
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { User } from '../services/authService';

interface NotificationMessage {
  id?: number;
  title: string;
  body: string;
  message_type: 'general' | 'reminder' | 'alert' | 'update' | 'promotion';
  target_all_users: boolean;
  target_users: number[];
  target_experience_level?: 'beginner' | 'intermediate' | 'expert';
  scheduled_for?: string;
  icon_url?: string;
  action_url?: string;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  created_at?: string;
  updated_at?: string;
}

interface NotificationComposerProps {
  onNotificationSent?: () => void;
}

const NotificationComposer: React.FC<NotificationComposerProps> = ({ onNotificationSent }) => {
  const [formData, setFormData] = useState<Partial<NotificationMessage>>({
    title: '',
    body: '',
    message_type: 'general',
    target_all_users: false,
    target_users: [],
    target_experience_level: undefined,
    scheduled_for: undefined,
    icon_url: '',
    action_url: '',
    status: 'draft'
  });

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // You might want to create an endpoint to fetch users for admin
      // For now, we'll use a placeholder
      setUsers([]);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleInputChange = (field: string) => (event: any) => {
    const value = event.target ? event.target.value : event;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUserSelection = (event: any, selectedUsers: User[]) => {
    setFormData(prev => ({ 
      ...prev, 
      target_users: selectedUsers.map(user => user.id) 
    }));
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/notifications/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      setSuccess('Draft saved successfully!');
    } catch (error: any) {
      setError(error.message || 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNow = async () => {
    setLoading(true);
    setError(null);

    try {
      // First save the notification
      const saveResponse = await fetch('/api/notifications/messages/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!saveResponse.ok) {
        throw new Error('Failed to create notification');
      }

      const notification = await saveResponse.json();

      // Then send it
      const sendResponse = await fetch(`/api/notifications/messages/${notification.id}/send/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!sendResponse.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await sendResponse.json();
      setSuccess(`Notification sent successfully! ${result.message}`);
      
      // Reset form
      setFormData({
        title: '',
        body: '',
        message_type: 'general',
        target_all_users: false,
        target_users: [],
        target_experience_level: undefined,
        scheduled_for: undefined,
        icon_url: '',
        action_url: '',
        status: 'draft'
      });

      if (onNotificationSent) {
        onNotificationSent();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'alert': return 'error';
      case 'reminder': return 'warning';
      case 'update': return 'info';
      case 'promotion': return 'secondary';
      default: return 'default';
    }
  };

  const getTargetingSummary = () => {
    if (formData.target_all_users) {
      return 'All users';
    }
    
    const parts = [];
    if (formData.target_users && formData.target_users.length > 0) {
      parts.push(`${formData.target_users.length} specific users`);
    }
    if (formData.target_experience_level) {
      parts.push(`${formData.target_experience_level} users`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'No targeting selected';
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Notifications sx={{ color: '#2E7D32', mr: 2, fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              Compose Notification
            </Typography>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Basic Information */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32' }}>
                Message Details
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: { xs: '1', md: '2' } }}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={formData.title || ''}
                    onChange={handleInputChange('title')}
                    placeholder="Enter notification title"
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ flex: { xs: '1', md: '1' } }}>
                  <FormControl fullWidth>
                    <InputLabel>Message Type</InputLabel>
                    <Select
                      value={formData.message_type || 'general'}
                      onChange={handleInputChange('message_type')}
                      label="Message Type"
                    >
                      <MenuItem value="general">General</MenuItem>
                      <MenuItem value="reminder">Reminder</MenuItem>
                      <MenuItem value="alert">Alert</MenuItem>
                      <MenuItem value="update">Update</MenuItem>
                      <MenuItem value="promotion">Promotion</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Message Body"
                  value={formData.body || ''}
                  onChange={handleInputChange('body')}
                  placeholder="Enter your notification message"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Targeting */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32' }}>
                Target Audience
              </Typography>

              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.target_all_users || false}
                      onChange={(e) => handleInputChange('target_all_users')(e.target.checked)}
                    />
                  }
                  label="Send to all users"
                />
              </FormGroup>

              {!formData.target_all_users && (
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 1 }}>
                  <Box sx={{ flex: 1 }}>
                    <Autocomplete
                      multiple
                      options={users}
                      getOptionLabel={(user) => `${user.first_name} ${user.last_name} (${user.username})`}
                      value={users.filter(user => formData.target_users?.includes(user.id))}
                      onChange={handleUserSelection}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Specific Users"
                          placeholder="Select users"
                        />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option.username}
                            {...getTagProps({ index })}
                            key={option.id}
                          />
                        ))
                      }
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        value={formData.target_experience_level || ''}
                        onChange={handleInputChange('target_experience_level')}
                        label="Experience Level"
                      >
                        <MenuItem value="">All levels</MenuItem>
                        <MenuItem value="beginner">Beginner</MenuItem>
                        <MenuItem value="intermediate">Intermediate</MenuItem>
                        <MenuItem value="expert">Expert</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Chip
                  icon={<People />}
                  label={`Target: ${getTargetingSummary()}`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Advanced Options */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32' }}>
                Advanced Options
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <DateTimePicker
                    label="Schedule for later"
                    value={formData.scheduled_for ? new Date(formData.scheduled_for) : null}
                    onChange={(date) => handleInputChange('scheduled_for')(date?.toISOString())}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    label="Action URL"
                    value={formData.action_url || ''}
                    onChange={handleInputChange('action_url')}
                    placeholder="https://example.com"
                    helperText="URL to open when notification is clicked"
                  />
                </Box>
              </Box>
            </Box>

            {/* Preview */}
            {previewMode && (
              <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ mb: 2, color: '#2E7D32' }}>
                  Preview
                </Typography>
                <Card variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={formData.message_type}
                      color={getMessageTypeColor(formData.message_type || 'general')}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {getTargetingSummary()}
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {formData.title || 'Notification Title'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formData.body || 'Notification message content...'}
                  </Typography>
                </Card>
              </Box>
            )}

            {/* Actions */}
            <Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<Preview />}
                  onClick={() => setPreviewMode(!previewMode)}
                  sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
                >
                  {previewMode ? 'Hide Preview' : 'Preview'}
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Save />}
                  onClick={handleSaveDraft}
                  disabled={loading || !formData.title || !formData.body}
                  sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
                >
                  Save Draft
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  onClick={handleSendNow}
                  disabled={loading || !formData.title || !formData.body}
                  sx={{
                    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                    },
                  }}
                >
                  {loading ? 'Sending...' : 'Send Now'}
                </Button>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
};

export default NotificationComposer;
