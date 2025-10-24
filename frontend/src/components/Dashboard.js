import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
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
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Business,
  People,
  School,
  Support,
  Add,
  Search,
  FilterList,
  Download,
  Upload,
  Visibility,
  Edit,
  Delete,
  Assessment,
  Group,
  LocationOn,
  Email,
  Phone,
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState(0);
  const [msmes, setMsmes] = useState([]);
  const [experts, setExperts] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSector, setFilterSector] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [msmesRes, expertsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.MSMES}?search=${searchTerm}&business_type=${filterType}&sector=${filterSector}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(API_ENDPOINTS.EXPERTS, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.MSMES}/analytics/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMsmes(msmesRes.data);
      setExperts(expertsRes.data);
      setAnalytics(analyticsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchData();
  };

  const handleFileUpload = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = type === 'msme' ? API_ENDPOINTS.UPLOAD_MSMES : API_ENDPOINTS.UPLOAD_EXPERTS;
      await axios.post(endpoint, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess(`${type.toUpperCase()} data uploaded successfully!`);
      fetchData();
    } catch (err) {
      setError(`Failed to upload ${type} data`);
    }
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedItem(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);
  };

  const renderMSMETab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          label="Search MSMEs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          sx={{ minWidth: 300 }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            label="Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="MICRO">Micro</MenuItem>
            <MenuItem value="SMALL">Small</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Sector</InputLabel>
          <Select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            label="Sector"
          >
            <MenuItem value="all">All Sectors</MenuItem>
            <MenuItem value="MANUFACTURING">Manufacturing</MenuItem>
            <MenuItem value="SERVICES">Services</MenuItem>
            <MenuItem value="TRADE">Trade</MenuItem>
            <MenuItem value="AGRICULTURE">Agriculture</MenuItem>
            <MenuItem value="TECHNOLOGY">Technology</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={handleSearch}
          startIcon={<Search />}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          Upload Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => handleFileUpload(e, 'msme')}
          />
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Business Name</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Sector</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Investment Needed</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {msmes.map((msme) => (
              <TableRow key={msme.id}>
                <TableCell>
                  <Chip label={msme.msme_code} size="small" />
                </TableCell>
                <TableCell>{msme.business_name}</TableCell>
                <TableCell>{msme.owner_name}</TableCell>
                <TableCell>
                  <Chip
                    label={msme.business_type}
                    size="small"
                    color="primary"
                  />
                </TableCell>
                <TableCell>{msme.sector}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    {msme.city}, {msme.state}
                  </Box>
                </TableCell>
                <TableCell>{formatCurrency(msme.investment_needed)}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(msme)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderExpertsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<Upload />}
        >
          Upload Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            hidden
            onChange={(e) => handleFileUpload(e, 'expert')}
          />
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Top Skills</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experts.map((expert) => (
              <TableRow key={expert.id}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {expert.name.charAt(0)}
                    </Avatar>
                    {expert.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" />
                    {expert.location}
                  </Box>
                </TableCell>
                <TableCell>{expert.years_of_experience} years</TableCell>
                <TableCell>{expert.top_skills}</TableCell>
                <TableCell>
                  <Chip
                    label={expert.status}
                    color={getStatusColor(expert.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleViewDetails(expert)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Business color="primary" />
                <Box>
                  <Typography variant="h4">{analytics.total_msmes || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total MSMEs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People color="primary" />
                <Box>
                  <Typography variant="h4">{analytics.total_employees || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Employees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="primary" />
                <Box>
                  <Typography variant="h4">
                    {formatCurrency(analytics.total_annual_revenue || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Support color="primary" />
                <Box>
                  <Typography variant="h4">{experts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Business Experts
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Business Type Distribution
              </Typography>
              {analytics.business_type_stats?.map((stat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{stat.business_type}</Typography>
                    <Typography variant="body2">{stat.count}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stat.count / analytics.total_msmes) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Sector Distribution
              </Typography>
              {analytics.sector_stats?.map((stat, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{stat.sector}</Typography>
                    <Typography variant="body2">{stat.count}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(stat.count / analytics.total_msmes) * 100}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Container maxWidth="xl">
      <AppBar position="static" sx={{ mb: 3 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Portfolio Manager Dashboard
          </Typography>
          <Button color="inherit" onClick={onLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="MSMEs" icon={<Business />} />
          <Tab label="Experts" icon={<People />} />
          <Tab label="Analytics" icon={<Assessment />} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderMSMETab()}
      {activeTab === 1 && renderExpertsTab()}
      {activeTab === 2 && renderAnalyticsTab()}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.business_name || selectedItem?.name} Details
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <List>
              {selectedItem.business_name && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Business Name"
                      secondary={selectedItem.business_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Owner"
                      secondary={selectedItem.owner_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Business Type"
                      secondary={selectedItem.business_type}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Sector"
                      secondary={selectedItem.sector}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Location"
                      secondary={`${selectedItem.city}, ${selectedItem.state}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Investment Needed"
                      secondary={formatCurrency(selectedItem.investment_needed)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Annual Revenue"
                      secondary={formatCurrency(selectedItem.annual_revenue)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Employees"
                      secondary={selectedItem.employee_count}
                    />
                  </ListItem>
                </>
              )}
              {selectedItem.name && !selectedItem.business_name && (
                <>
                  <ListItem>
                    <ListItemText
                      primary="Name"
                      secondary={selectedItem.name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Location"
                      secondary={selectedItem.location}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Experience"
                      secondary={`${selectedItem.years_of_experience} years`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Top Skills"
                      secondary={selectedItem.top_skills}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={selectedItem.status}
                          color={getStatusColor(selectedItem.status)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                </>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard; 