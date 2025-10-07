import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Analytics,
  People,
  TrendingUp,
  LocationOn,
  Devices,
  CalendarToday,
  Close,
  Refresh,
  Download,
} from '@mui/icons-material';
import { analyticsService, DashboardMetrics } from '../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error loading metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!metrics) return;
    
    const dataStr = JSON.stringify(metrics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `river-poultry-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading analytics data...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={loadMetrics}>
            Retry
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!metrics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No analytics data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', p: isMobile ? 2 : 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: '#286844', fontWeight: 'bold', mb: 1 }}>
              📊 River Poultry Analytics Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor tool usage, user engagement, and geographic distribution
            </Typography>
            <Chip 
              label="Developer Access Only" 
              color="warning" 
              variant="outlined"
              size="small"
              sx={{ mt: 1 }}
            />
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={loadMetrics}
              size="small"
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setExportDialogOpen(true)}
              size="small"
            >
              Export Data
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Key Metrics Cards */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        <Card sx={{ height: '100%', bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <People sx={{ fontSize: 40, color: '#1976d2' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {metrics.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Users
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', bgcolor: '#e8f5e8' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Analytics sx={{ fontSize: 40, color: '#2e7d32' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {metrics.totalSessions}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Sessions
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', bgcolor: '#fff3e0' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <TrendingUp sx={{ fontSize: 40, color: '#f57c00' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                  {Object.values(metrics.toolUsage).reduce((sum, count) => sum + count, 0)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Tool Uses
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ height: '100%', bgcolor: '#fce4ec' }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <CalendarToday sx={{ fontSize: 40, color: '#c2185b' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#c2185b' }}>
                  {metrics.toolUsage.calendarIntegration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Calendar Integrations
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Row */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        {/* Tool Usage Chart */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                Tool Usage Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(metrics.toolUsage).map(([tool, count]) => ({
                      name: tool.charAt(0).toUpperCase() + tool.slice(1),
                      value: count
                    }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {Object.entries(metrics.toolUsage).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Monthly Usage Trend */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                Monthly Usage Trend
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.monthlyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="usage" stroke="#8884d8" strokeWidth={2} />
                  <Line type="monotone" dataKey="calendarAdds" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Location and Device Stats */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
        gap: 3, 
        mb: 4 
      }}>
        {/* Location Distribution */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                User Locations
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Country</TableCell>
                      <TableCell align="right">Users</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {metrics.locationStats.slice(0, 5).map((location, index) => (
                      <TableRow key={index}>
                        <TableCell>{location.country}</TableCell>
                        <TableCell align="right">{location.count}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${location.percentage}%`} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>

        {/* Device Distribution */}
        <Box>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
                <Devices sx={{ mr: 1, verticalAlign: 'middle' }} />
                Device Types
              </Typography>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={metrics.deviceStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Activity */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
            Recent Activity
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tool</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {metrics.recentActivity.slice(0, 10).map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip 
                        label={activity.toolName} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{activity.action}</TableCell>
                    <TableCell>{activity.location}</TableCell>
                    <TableCell>
                      {new Date(activity.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Popular Poultry Types */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#286844', fontWeight: 'bold' }}>
            Popular Poultry Types
          </Typography>
          <Stack spacing={2}>
            {metrics.popularPoultryTypes.map((type, index) => (
              <Box key={index}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" sx={{ textTransform: 'capitalize' }}>
                    {type.type}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      {type.count} uses
                    </Typography>
                    <Chip 
                      label={`${Math.round((type.count / metrics.popularPoultryTypes.reduce((sum, t) => sum + t.count, 0)) * 100)}%`}
                      size="small"
                      color="secondary"
                    />
                  </Stack>
                </Stack>
                <LinearProgress 
                  variant="determinate" 
                  value={(type.count / Math.max(...metrics.popularPoultryTypes.map(t => t.count))) * 100}
                  sx={{ mt: 1 }}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Export Analytics Data</Typography>
            <IconButton onClick={() => setExportDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Export all analytics data as a JSON file for further analysis or backup.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This will include user metrics, tool usage statistics, location data, and device information.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Cancel</Button>
          <Button onClick={exportData} variant="contained" startIcon={<Download />}>
            Export Data
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
