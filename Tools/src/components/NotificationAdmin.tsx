import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Send,
  Visibility,
  Delete,
  Add,
  Notifications,
  BarChart,
  List,
} from '@mui/icons-material';
import NotificationComposer from './NotificationComposer';

interface NotificationMessage {
  id: number;
  title: string;
  body: string;
  message_type: string;
  status: string;
  target_all_users: boolean;
  target_users_count: number;
  deliveries_count: number;
  created_at: string;
  sent_at?: string;
  created_by_username: string;
}

interface NotificationStats {
  total_notifications: number;
  total_deliveries: number;
  successful_deliveries: number;
  failed_deliveries: number;
  click_rate: number;
  delivery_rate: number;
}

const NotificationAdmin: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/messages/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSendNotification = async (notificationId: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/messages/${notificationId}/send/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      setSuccess(result.message || 'Notification sent successfully!');
      fetchNotifications();
      fetchStats();
    } catch (error: any) {
      setError(error.message || 'Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/notifications/messages/${notificationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification');
      }

      setSuccess('Notification deleted successfully!');
      fetchNotifications();
    } catch (error: any) {
      setError(error.message || 'Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationSent = () => {
    setComposeOpen(false);
    fetchNotifications();
    fetchStats();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'failed': return 'error';
      case 'scheduled': return 'warning';
      default: return 'default';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Notifications sx={{ color: '#2E7D32', mr: 2, fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
          Notification Management
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab icon={<List />} label="Notifications" />
        <Tab icon={<BarChart />} label="Statistics" />
      </Tabs>

      {selectedTab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">All Notifications</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setComposeOpen(true)}
              sx={{
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
                },
              }}
            >
              Compose New
            </Button>
          </Box>

          <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell>Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Deliveries</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        by {notification.created_by_username}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.message_type}
                        color={getMessageTypeColor(notification.message_type)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {notification.target_all_users ? 'All Users' : `${notification.target_users_count} users`}
                    </TableCell>
                    <TableCell>
                      {notification.deliveries_count}
                    </TableCell>
                    <TableCell>
                      {formatDate(notification.created_at)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedNotification(notification);
                            setDetailsOpen(true);
                          }}
                          sx={{ color: '#2E7D32' }}
                        >
                          <Visibility />
                        </IconButton>
                        {notification.status === 'draft' && (
                          <IconButton
                            size="small"
                            onClick={() => handleSendNotification(notification.id)}
                            disabled={loading}
                            sx={{ color: '#2E7D32' }}
                          >
                            <Send />
                          </IconButton>
                        )}
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={loading}
                          sx={{ color: '#f44336' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {selectedTab === 1 && stats && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                  {stats.total_notifications}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Notifications
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {stats.total_deliveries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Deliveries
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                  {stats.successful_deliveries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Successful
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                  {stats.delivery_rate}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Delivery Rate
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Compose Dialog */}
      <Dialog
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0 }}>
          <NotificationComposer onNotificationSent={handleNotificationSent} />
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notification Details</DialogTitle>
        <DialogContent>
          {selectedNotification && (
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {selectedNotification.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {selectedNotification.body}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Chip
                  label={selectedNotification.message_type}
                  color={getMessageTypeColor(selectedNotification.message_type)}
                  size="small"
                />
                <Chip
                  label={selectedNotification.status}
                  color={getStatusColor(selectedNotification.status)}
                  size="small"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Created: {formatDate(selectedNotification.created_at)}
                {selectedNotification.sent_at && (
                  <> | Sent: {formatDate(selectedNotification.sent_at)}</>
                )}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationAdmin;
