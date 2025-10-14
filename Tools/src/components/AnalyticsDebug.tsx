import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Paper, 
  Card, 
  CardContent, 
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { 
  Refresh, 
  Build, 
  TrendingUp, 
  People, 
  CalendarToday, 
  Download,
  ExpandMore,
  CheckCircle,
  Error,
  Warning
} from '@mui/icons-material';
import { analyticsService } from '../services/analyticsService';

const DebugContent: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getDashboardMetrics();
      setAnalytics(data);
      
      // Collect debug information
      const debug = {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        localStorage: {
          toolUsageEvents: localStorage.getItem('tool_usage_events'),
          sessionId: localStorage.getItem('session_id'),
          userToken: localStorage.getItem('user_token') ? 'Present' : 'Not present'
        },
        environment: {
          baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8001/api',
          nodeEnv: process.env.NODE_ENV,
          hostname: window.location.hostname,
          protocol: window.location.protocol
        },
        dataSource: data ? 'Backend API' : 'Fallback Data'
      };
      setDebugInfo(debug);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.removeItem('tool_usage_events');
    localStorage.removeItem('session_id');
    localStorage.removeItem('user_token');
    alert('Local storage cleared!');
    loadAnalytics();
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:8001/api'}/analytics/dashboard-metrics/`);
      if (response.ok) {
        alert('Backend connection successful!');
      } else {
        alert(`Backend connection failed: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      alert(`Backend connection error: ${err}`);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', mx: 'auto' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Build sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1">
          Debug Dashboard
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Control Panel */}
        <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Debug Controls
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  startIcon={<Refresh />}
                  onClick={loadAnalytics} 
                  disabled={loading}
                  fullWidth
                >
                  {loading ? 'Loading...' : 'Reload Analytics'}
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={testBackendConnection}
                  fullWidth
                >
                  Test Backend Connection
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="warning"
                  onClick={clearLocalStorage}
                  fullWidth
                >
                  Clear Local Storage
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Status Indicators */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Status
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {analytics ? <CheckCircle color="success" /> : <Error color="error" />}
                  <Typography variant="body2">
                    Analytics Data: {analytics ? 'Loaded' : 'Failed'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CheckCircle color="success" />
                  <Typography variant="body2">
                    Frontend: Running
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Warning color="warning" />
                  <Typography variant="body2">
                    Backend: Testing Required
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Analytics Summary */}
        <Box sx={{ flex: { xs: '1', md: '0 0 67%' } }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">Error:</Typography>
              {error}
            </Alert>
          )}

          {analytics && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Analytics Summary
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center', minWidth: '150px' }}>
                    <People color="primary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="primary">
                      {analytics.totalUsers?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2">Total Users</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center', minWidth: '150px' }}>
                    <TrendingUp color="success" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="success.main">
                      {analytics.totalSessions?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2">Total Sessions</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center', minWidth: '150px' }}>
                    <CalendarToday color="info" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="info.main">
                      {analytics.toolUsage?.vaccination?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2">Vaccination Plans</Typography>
                  </Box>
                  <Box sx={{ flex: '1 1 200px', textAlign: 'center', minWidth: '150px' }}>
                    <Download color="secondary" sx={{ fontSize: 40 }} />
                    <Typography variant="h4" color="secondary.main">
                      {analytics.toolUsage?.pdfDownloader?.toLocaleString() || 0}
                    </Typography>
                    <Typography variant="body2">PDF Downloads</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Detailed Data */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Raw Analytics Data</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(analytics, null, 2)}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>

          {/* Debug Information */}
          <Accordion sx={{ mt: 1 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Debug Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '400px' }}>
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </Paper>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

const AnalyticsDebug: React.FC = () => {
  // Only allow access in development mode
  if (process.env.NODE_ENV !== 'development') {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" color="error">
          Access Denied
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Debug tools are only available in development mode.
        </Typography>
      </Box>
    );
  }

  return <DebugContent />;
};

export default AnalyticsDebug;