import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  TextField
} from '@mui/material';
import {
  BugReport,
  CheckCircle,
  Error,
  ExpandMore,
  Refresh,
  Email,
  LockReset,
  Api
} from '@mui/icons-material';
import { frontendDebugger } from '../utils/frontendDebugger';

interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

const DebugPage: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{ [key: string]: TestResult } | null>(null);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [individualTest, setIndividualTest] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults(null);
    
    try {
      const testResults = await frontendDebugger.runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('Debug tests failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testName: string) => {
    setIndividualTest(testName);
    
    try {
      let result: TestResult;
      
      switch (testName) {
        case 'apiConnectivity':
          result = await frontendDebugger.testAPIConnectivity();
          break;
        case 'authentication':
          result = await frontendDebugger.testAuthentication();
          break;
        case 'passwordReset':
          result = await frontendDebugger.testPasswordReset(testEmail);
          break;
        case 'emailService':
          result = await frontendDebugger.testEmailService(testEmail);
          break;
        default:
          result = { success: false, message: 'Unknown test' };
      }
      
      setResults(prev => ({
        ...prev,
        [testName]: result
      }));
    } catch (error: unknown) {
      console.error(`${testName} test failed:`, error);
      const errorMessage = error instanceof Error ? (error as Error).message : 'Unknown error';
      setResults(prev => ({
        ...prev,
        [testName]: {
          success: false,
          message: `Test failed: ${errorMessage}`
        }
      }));
    } finally {
      setIndividualTest(null);
    }
  };

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="error" />
    );
  };

  const getStatusChip = (success: boolean) => {
    return (
      <Chip
        icon={getStatusIcon(success)}
        label={success ? 'PASS' : 'FAIL'}
        color={success ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const copyDebugReport = () => {
    if (results) {
      const report = frontendDebugger.generateDebugReport(results);
      navigator.clipboard.writeText(report);
      alert('Debug report copied to clipboard!');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BugReport sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1">
              Frontend Debug Console
            </Typography>
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            This debug console helps test all frontend functionality including API connectivity, 
            authentication, password reset, and email services.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Test Email Address"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                helperText="Email address for testing password reset and email services"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={runAllTests}
                disabled={isRunning}
                size="large"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </Button>
              {results && (
                <Button
                  variant="outlined"
                  onClick={copyDebugReport}
                  size="large"
                >
                  Copy Report
                </Button>
              )}
            </Box>
          </Box>

          {isRunning && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CircularProgress size={24} sx={{ mr: 2 }} />
              <Typography>Running debug tests...</Typography>
            </Box>
          )}

          {results && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Test Results
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Api sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">API Connectivity</Typography>
                    {getStatusChip(results.apiConnectivity?.success || false)}
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LockReset sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Authentication</Typography>
                    {getStatusChip(results.authentication?.success || false)}
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <LockReset sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Password Reset</Typography>
                    {getStatusChip(results.passwordReset?.success || false)}
                  </CardContent>
                </Card>
                
                <Card variant="outlined" sx={{ minWidth: 200 }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Email sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6">Email Service</Typography>
                    {getStatusChip(results.emailService?.success || false)}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Individual Tests
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
            <Button
              variant="outlined"
              startIcon={<Api />}
              onClick={() => runIndividualTest('apiConnectivity')}
              disabled={individualTest === 'apiConnectivity'}
            >
              Test API Connectivity
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<LockReset />}
              onClick={() => runIndividualTest('authentication')}
              disabled={individualTest === 'authentication'}
            >
              Test Authentication
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<LockReset />}
              onClick={() => runIndividualTest('passwordReset')}
              disabled={individualTest === 'passwordReset'}
            >
              Test Password Reset
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Email />}
              onClick={() => runIndividualTest('emailService')}
              disabled={individualTest === 'emailService'}
            >
              Test Email Service
            </Button>
          </Box>

          {results && (
            <Box>
              {Object.entries(results).map(([testName, result]) => (
                <Accordion key={testName} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {getStatusIcon(result.success)}
                      <Typography sx={{ ml: 2, flexGrow: 1 }}>
                        {testName.charAt(0).toUpperCase() + testName.slice(1).replace(/([A-Z])/g, ' $1')}
                      </Typography>
                      {getStatusChip(result.success)}
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Alert 
                      severity={result.success ? 'success' : 'error'} 
                      sx={{ mb: 2 }}
                    >
                      {result.message}
                    </Alert>
                    
                    {result.details && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Details:
                        </Typography>
                        <Box 
                          component="pre" 
                          sx={{ 
                            backgroundColor: 'grey.100', 
                            p: 2, 
                            borderRadius: 1,
                            overflow: 'auto',
                            fontSize: '0.875rem'
                          }}
                        >
                          {JSON.stringify(result.details, null, 2)}
                        </Box>
                      </Box>
                    )}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 2 }}>
            Environment Information
          </Typography>
          
          <Box sx={{ backgroundColor: 'grey.100', p: 2, borderRadius: 1 }}>
            <Typography variant="body2" component="pre" sx={{ fontFamily: 'monospace' }}>
              {`Base URL: ${process.env.REACT_APP_API_URL || 'http://localhost:8000/api'}
Environment: ${process.env.NODE_ENV || 'development'}
Timestamp: ${new Date().toISOString()}`}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DebugPage;