import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Notifications,
  Schedule,
  Send,
  CheckCircle,
  Error,
  Warning,
  CalendarToday,
  LocalHospital,
  WaterDrop,
} from '@mui/icons-material';
import { authService } from '../services/authService';

interface VaccinationPlan {
  id: number;
  vaccine_name: string;
  scheduled_date: string;
  status: string;
  operation: {
    id: number;
    operation_name: string;
  };
}

interface Reminder {
  id: number;
  reminder_type: string;
  days_before: number;
  status: string;
  message: string;
  sent_at?: string;
  vaccination_plan: VaccinationPlan;
}

interface ReminderStats {
  total: number;
  pending: number;
  sent: number;
  failed: number;
}

const VaccinationReminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [stats, setStats] = useState<ReminderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedVaccination, setSelectedVaccination] = useState<VaccinationPlan | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    fetchReminderData();
  }, []);

  const fetchReminderData = async () => {
    try {
      setLoading(true);
      const [remindersResponse, statsResponse] = await Promise.all([
        fetch('/api/vaccinations/reminders/upcoming/', {
          headers: {
            'Authorization': `Token ${authService.getToken()}`,
          },
        }),
        fetch('/api/vaccinations/reminders/stats/', {
          headers: {
            'Authorization': `Token ${authService.getToken()}`,
          },
        }),
      ]);

      if (remindersResponse.ok && statsResponse.ok) {
        const remindersData = await remindersResponse.json();
        const statsData = await statsResponse.json();
        
        setReminders(remindersData.reminders);
        setStats(statsData.reminder_stats);
      } else {
        setError('Failed to fetch reminder data');
      }
    } catch (err) {
      setError('Error fetching reminder data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendTestReminder = async (vaccinationId: number) => {
    try {
      setSendingTest(true);
      const response = await fetch(`/api/vaccinations/plans/${vaccinationId}/reminders/test/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert('Test reminder sent successfully!');
        fetchReminderData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to send test reminder: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error sending test reminder');
      console.error('Error:', err);
    } finally {
      setSendingTest(false);
      setTestDialogOpen(false);
    }
  };

  const createReminderSchedule = async (vaccinationId: number) => {
    try {
      const response = await fetch(`/api/vaccinations/plans/${vaccinationId}/reminders/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Created ${data.reminders.length} reminder schedules!`);
        fetchReminderData(); // Refresh data
      } else {
        const errorData = await response.json();
        alert(`Failed to create reminder schedule: ${errorData.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert('Error creating reminder schedule');
      console.error('Error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle />;
      case 'pending': return <Schedule />;
      case 'failed': return <Error />;
      default: return <Warning />;
    }
  };

  const getReminderTypeInfo = (daysBefore: number) => {
    if (daysBefore === 1) {
      return { type: 'Day Before', icon: <CalendarToday />, color: '#1976d2' };
    } else if (daysBefore === 0) {
      return { type: 'Day Of', icon: <LocalHospital />, color: '#d32f2f' };
    } else if (daysBefore === -1) {
      return { type: 'Day After', icon: <WaterDrop />, color: '#388e3c' };
    }
    return { type: 'Custom', icon: <Schedule />, color: '#666' };
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Notifications sx={{ color: '#2E7D32' }} />
        Vaccination Reminders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {stats && (
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Reminders
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#f57c00', fontWeight: 'bold' }}>
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#388e3c', fontWeight: 'bold' }}>
                  {stats.sent}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sent
                </Typography>
              </CardContent>
            </Card>
          </Box>
          <Box sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  {stats.failed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Failed
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* Reminders List */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Upcoming Reminders (Next 7 Days)
          </Typography>
          
          {reminders.length === 0 ? (
            <Alert severity="info">
              No upcoming reminders found. Create vaccination plans to set up automated reminders.
            </Alert>
          ) : (
            <List>
              {reminders.map((reminder, index) => {
                const reminderInfo = getReminderTypeInfo(reminder.days_before);
                const vaccinationDate = new Date(reminder.vaccination_plan.scheduled_date);
                
                return (
                  <React.Fragment key={reminder.id}>
                    <ListItem>
                      <ListItemIcon sx={{ color: reminderInfo.color }}>
                        {reminderInfo.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="subtitle1">
                              {reminder.vaccination_plan.vaccine_name}
                            </Typography>
                            <Chip
                              label={reminderInfo.type}
                              size="small"
                              sx={{ backgroundColor: reminderInfo.color, color: 'white' }}
                            />
                            <Chip
                              label={reminder.status}
                              size="small"
                              color={getStatusColor(reminder.status) as any}
                              icon={getStatusIcon(reminder.status)}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Operation: {reminder.vaccination_plan.operation.operation_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Vaccination Date: {vaccinationDate.toLocaleDateString()}
                            </Typography>
                            {reminder.sent_at && (
                              <Typography variant="body2" color="text.secondary">
                                Sent: {new Date(reminder.sent_at).toLocaleString()}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedVaccination(reminder.vaccination_plan);
                            setTestDialogOpen(true);
                          }}
                          disabled={sendingTest}
                        >
                          Test
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => createReminderSchedule(reminder.vaccination_plan.id)}
                        >
                          Create Schedule
                        </Button>
                      </Box>
                    </ListItem>
                    {index < reminders.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Test Reminder Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)}>
        <DialogTitle>Send Test Reminder</DialogTitle>
        <DialogContent>
          {selectedVaccination && (
            <Typography>
              Send a test reminder for <strong>{selectedVaccination.vaccine_name}</strong>?
              <br />
              This will send a push notification to your device.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedVaccination && sendTestReminder(selectedVaccination.id)}
            variant="contained"
            disabled={sendingTest}
            startIcon={sendingTest ? <CircularProgress size={20} /> : <Send />}
          >
            {sendingTest ? 'Sending...' : 'Send Test'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VaccinationReminders;
