import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  Person,
  Agriculture,
  Vaccines,
  Logout,
  TrendingUp,
  Schedule,
  CheckCircle,
} from '@mui/icons-material';
import { authService, User, UserDashboard as UserDashboardData } from '../services/authService';

interface UserDashboardProps {
  user: User;
  onLogout: () => void;
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
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const UserDashboard: React.FC<UserDashboardProps> = ({ user, onLogout }) => {
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await authService.getUserDashboard();
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      onLogout();
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout locally even if server request fails
      onLogout();
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <Person />
          </Avatar>
          <Box>
            <Typography variant="h5">
              Welcome, {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.farm_name && `${user.farm_name} • `}
              {user.country && user.region ? `${user.region}, ${user.country}` : user.country}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Logout />}
          onClick={handleLogout}
          color="error"
        >
          Logout
        </Button>
      </Box>

      {/* Stats Cards */}
      {dashboardData && (
        <Box sx={{ display: 'flex', gap: 3, mb: 3, flexWrap: 'wrap' }}>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Agriculture color="primary" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{dashboardData.stats.total_operations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Operations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp color="success" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{dashboardData.stats.active_operations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Operations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Vaccines color="info" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{dashboardData.stats.total_vaccinations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Vaccinations
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ flex: '1 1 200px', minWidth: '200px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule color="warning" sx={{ mr: 2 }} />
                <Box>
                  <Typography variant="h6">{dashboardData.stats.upcoming_vaccinations}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Tabs */}
      <Paper sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Profile" />
            <Tab label="Operations" />
            <Tab label="Vaccinations" />
            <Tab label="Analytics" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Name"
                    secondary={`${user.first_name} ${user.last_name}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Username"
                    secondary={user.username}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Person />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Agriculture />
                  </ListItemIcon>
                  <ListItemText
                    primary="Farm Name"
                    secondary={user.farm_name || 'Not specified'}
                  />
                </ListItem>
              </List>
            </Box>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="h6" gutterBottom>
                Farm Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Agriculture />
                  </ListItemIcon>
                  <ListItemText
                    primary="Country"
                    secondary={user.country || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Agriculture />
                  </ListItemIcon>
                  <ListItemText
                    primary="Region"
                    secondary={user.region || 'Not specified'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <TrendingUp />
                  </ListItemIcon>
                  <ListItemText
                    primary="Experience Level"
                    secondary={
                      <Chip
                        label={user.experience_level}
                        color="primary"
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircle />
                  </ListItemIcon>
                  <ListItemText
                    primary="Subscription"
                    secondary={
                      <Chip
                        label={user.subscription_plan}
                        color="success"
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Your Operations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage your poultry operations here.
          </Typography>
          {/* Operations content will be loaded here */}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Vaccination History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track your vaccination schedules and history.
          </Typography>
          {/* Vaccinations content will be loaded here */}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" gutterBottom>
            Usage Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View your tool usage statistics and insights.
          </Typography>
          {/* Analytics content will be loaded here */}
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default UserDashboard;
