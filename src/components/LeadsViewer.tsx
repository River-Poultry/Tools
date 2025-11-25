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
    TableHead,
    TableRow,
    Paper,
    Chip,
    Stack,
    Grid,
} from '@mui/material';
import { Download, Refresh } from '@mui/icons-material';
import { userTrackingService } from '../services/userTrackingService';

const LeadsViewer: React.FC = () => {
    const [stats, setStats] = useState(userTrackingService.getLeadStats());
    const [leads, setLeads] = useState(userTrackingService.getStoredLeads());

    const refreshData = () => {
        setStats(userTrackingService.getLeadStats());
        setLeads(userTrackingService.getStoredLeads());
    };

    useEffect(() => {
        refreshData();
    }, []);

    const handleDownloadCSV = () => {
        userTrackingService.downloadLeadsCSV();
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <Box sx={{ p: 3, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
            <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold" color="#2E7D32">
                        User Leads Dashboard
                    </Typography>
                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<Refresh />}
                            onClick={refreshData}
                        >
                            Refresh
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<Download />}
                            onClick={handleDownloadCSV}
                        >
                            Export CSV
                        </Button>
                    </Stack>
                </Box>

                {/* Statistics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Leads
                                </Typography>
                                <Typography variant="h3" color="#2E7D32">
                                    {stats.total}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    With Email
                                </Typography>
                                <Typography variant="h3" color="#2E7D32">
                                    {stats.withEmail}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    With Phone
                                </Typography>
                                <Typography variant="h3" color="#2E7D32">
                                    {stats.withPhone}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Last 24 Hours
                                </Typography>
                                <Typography variant="h3" color="#2E7D32">
                                    {stats.last24Hours}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Tool Usage */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Leads by Tool
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <Chip
                                label={`Vaccination: ${stats.byTool.vaccination}`}
                                color="primary"
                                variant="outlined"
                            />
                            <Chip
                                label={`Room Measurement: ${stats.byTool.roomMeasurement}`}
                                color="secondary"
                                variant="outlined"
                            />
                            <Chip
                                label={`Budget Calculator: ${stats.byTool.budgetCalculator}`}
                                color="success"
                                variant="outlined"
                            />
                        </Stack>
                    </CardContent>
                </Card>

                {/* Leads Table */}
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, bgcolor: '#f1f2b0' }}>
                        <Typography variant="h6" color="#286844">
                            Recent Leads ({leads.length})
                        </Typography>
                    </Box>
                    <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell><strong>Date</strong></TableCell>
                                    <TableCell><strong>Tool</strong></TableCell>
                                    <TableCell><strong>Action</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Phone</strong></TableCell>
                                    <TableCell><strong>Details</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center">
                                            <Typography color="textSecondary" sx={{ py: 4 }}>
                                                No leads captured yet. Leads will appear here when users download PDFs or request emails.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads
                                        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                        .map((lead) => (
                                            <TableRow key={lead.id} hover>
                                                <TableCell>{formatDate(lead.timestamp)}</TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={lead.toolName}
                                                        size="small"
                                                        color={
                                                            lead.toolName === 'vaccination'
                                                                ? 'primary'
                                                                : lead.toolName === 'roomMeasurement'
                                                                    ? 'secondary'
                                                                    : 'success'
                                                        }
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={lead.action.replace('_', ' ')}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                                <TableCell>{lead.contactInfo.email || '-'}</TableCell>
                                                <TableCell>
                                                    {lead.contactInfo.phone
                                                        ? `${lead.contactInfo.countryCode}${lead.contactInfo.phone}`
                                                        : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="caption" component="div">
                                                        {lead.toolData.poultryType && `Type: ${lead.toolData.poultryType}`}
                                                        {lead.toolData.birdType && `Type: ${lead.toolData.birdType}`}
                                                        {lead.toolData.numBirds && ` | Birds: ${lead.toolData.numBirds}`}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Paper>

                {/* Instructions */}
                <Card sx={{ mt: 3, bgcolor: '#e8f5e9' }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="#2E7D32">
                            📊 How to Access Leads
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Option 1: Browser Console</strong>
                            <br />
                            Open browser DevTools (F12) and run: <code>localStorage.getItem('user_leads')</code>
                        </Typography>
                        <Typography variant="body2" paragraph>
                            <strong>Option 2: Export CSV</strong>
                            <br />
                            Click the "Export CSV" button above to download all leads as a spreadsheet
                        </Typography>
                        <Typography variant="body2">
                            <strong>Option 3: Backend Integration</strong>
                            <br />
                            Set up a backend API endpoint and configure <code>REACT_APP_TRACKING_API</code> in your environment variables
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default LeadsViewer;
