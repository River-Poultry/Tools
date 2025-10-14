import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Notifications,
  NotificationsOff,
  Settings,
  CheckCircle,
  Error,
  Info,
} from '@mui/icons-material';
import { notificationService, NotificationPayload } from '../services/notificationService';

interface NotificationSettingsProps {
  userId?: number;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ userId }) => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkNotificationStatus();
  }, []);

  const checkNotificationStatus = async () => {
    setIsSupported(notificationService.isSupported());
    setPermission(notificationService.getPermission());
    
    // Check if user is subscribed (you might want to check with backend)
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration && registration.pushManager) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error checking subscription status:', error);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (enabled) {
        // Enable notifications
        const success = await notificationService.setupNotifications(userId);
        if (success) {
          setIsSubscribed(true);
          setPermission('granted');
          setSuccess('Notifications enabled successfully!');
        } else {
          setError('Failed to enable notifications. Please check your browser settings.');
        }
      } else {
        // Disable notifications
        await notificationService.unsubscribeFromNotifications();
        await notificationService.removeSubscription();
        setIsSubscribed(false);
        setSuccess('Notifications disabled successfully!');
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError(null);

    try {
      const testPayload: NotificationPayload = {
        title: 'Test Notification',
        body: 'This is a test notification from River Poultry Tools!',
        icon: '/river-poultry-logo.png',
        tag: 'test-notification',
        data: { url: '/' }
      };

      await notificationService.showLocalNotification(testPayload);
      setSuccess('Test notification sent!');
    } catch (error: any) {
      setError(error.message || 'Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'success', text: 'Granted', icon: <CheckCircle /> };
      case 'denied':
        return { color: 'error', text: 'Denied', icon: <Error /> };
      default:
        return { color: 'warning', text: 'Not Requested', icon: <Info /> };
    }
  };

  const permissionStatus = getPermissionStatus();

  if (!isSupported) {
    return (
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <NotificationsOff sx={{ color: '#f44336', mr: 2, fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              Push Notifications
            </Typography>
          </Box>
          <Alert severity="warning">
            Push notifications are not supported in your browser. Please use a modern browser like Chrome, Firefox, or Safari.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Settings sx={{ color: '#2E7D32', mr: 2, fontSize: 28 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            Notification Settings
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isSubscribed && permission === 'granted'}
                onChange={(e) => handleToggleNotifications(e.target.checked)}
                disabled={loading || permission === 'denied'}
                color="success"
              />
            }
            label={
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  Enable Push Notifications
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Receive important updates about your poultry farm management
                </Typography>
              </Box>
            }
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
          Status Information
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              {permissionStatus.icon}
            </ListItemIcon>
            <ListItemText
              primary="Browser Permission"
              secondary="Permission to show notifications"
            />
            <Chip
              label={permissionStatus.text}
              color={permissionStatus.color as any}
              size="small"
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              {isSubscribed ? <CheckCircle color="success" /> : <Error color="error" />}
            </ListItemIcon>
            <ListItemText
              primary="Push Subscription"
              secondary="Registered for push notifications"
            />
            <Chip
              label={isSubscribed ? 'Active' : 'Inactive'}
              color={isSubscribed ? 'success' : 'error'}
              size="small"
            />
          </ListItem>
        </List>

        {permission === 'granted' && isSubscribed && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={handleTestNotification}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Notifications />}
                sx={{ color: '#2E7D32', borderColor: '#2E7D32' }}
              >
                Send Test Notification
              </Button>
            </Box>
          </>
        )}

        {permission === 'denied' && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Notifications are blocked. Please enable them in your browser settings to receive push notifications.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;

