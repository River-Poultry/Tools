import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, Container, Grid, Snackbar, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import { API_ENDPOINTS } from './config';

function Dashboard({ token, onLogout }) {
  const [msmes, setMsmes] = useState([]);
  const [experts, setExperts] = useState([]);
  const [msmeUploadStatus, setMsmeUploadStatus] = useState('');
  const [expertUploadStatus, setExpertUploadStatus] = useState('');
  const msmeFileRef = useRef();
  const expertFileRef = useRef();
  const [fetchError, setFetchError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMsmes();
    fetchExperts();
    // eslint-disable-next-line
  }, []);

  const fetchMsmes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ENDPOINTS.MSMES, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsmes(res.data);
      setFetchError('');
    } catch (err) {
      setMsmes([]);
      setFetchError('Failed to fetch MSMEs');
    } finally {
      setLoading(false);
    }
  };

  const fetchExperts = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.EXPERTS, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExperts(res.data);
    } catch (err) {
      setExperts([]);
    }
  };

  const handleMsmeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await axios.post(API_ENDPOINTS.UPLOAD_MSMES, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMsmeUploadStatus('success');
      fetchMsmes();
    } catch (err) {
      setMsmeUploadStatus('error');
    }
    msmeFileRef.current.value = '';
  };

  const handleExpertUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('file', file);
    try {
      await axios.post(API_ENDPOINTS.UPLOAD_EXPERTS, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpertUploadStatus('success');
      fetchExperts();
    } catch (err) {
      setExpertUploadStatus('error');
    }
    expertFileRef.current.value = '';
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Portfolio Manager Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={onLogout}>Logout</Button>
      </Box>
      
      {fetchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fetchError}
        </Alert>
      )}
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">MSMEs ({msmes.length})</Typography>
            <Button variant="contained" component="label">
              Upload Excel
              <input type="file" accept=".xlsx" hidden ref={msmeFileRef} onChange={handleMsmeUpload} />
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {msmes.slice(0, 10).map((msme) => (
                  <TableRow key={msme.id}>
                    <TableCell>{msme.id}</TableCell>
                    <TableCell>{msme.business_name || msme.name}</TableCell>
                    <TableCell>{msme.city || msme.location}</TableCell>
                  </TableRow>
                ))}
                {msmes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      {loading ? 'Loading...' : 'No MSMEs found'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Experts ({experts.length})</Typography>
            <Button variant="contained" component="label">
              Upload Excel
              <input type="file" accept=".xlsx" hidden ref={expertFileRef} onChange={handleExpertUpload} />
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {experts.slice(0, 10).map((expert) => (
                  <TableRow key={expert.id}>
                    <TableCell>{expert.id}</TableCell>
                    <TableCell>{expert.name}</TableCell>
                    <TableCell>{expert.location}</TableCell>
                  </TableRow>
                ))}
                {experts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      No experts found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      
      <Snackbar open={msmeUploadStatus === 'success'} autoHideDuration={3000} onClose={() => setMsmeUploadStatus('')}>
        <Alert severity="success">MSME Excel uploaded!</Alert>
      </Snackbar>
      <Snackbar open={msmeUploadStatus === 'error'} autoHideDuration={3000} onClose={() => setMsmeUploadStatus('')}>
        <Alert severity="error">MSME upload failed!</Alert>
      </Snackbar>
      <Snackbar open={expertUploadStatus === 'success'} autoHideDuration={3000} onClose={() => setExpertUploadStatus('')}>
        <Alert severity="success">Expert Excel uploaded!</Alert>
      </Snackbar>
      <Snackbar open={expertUploadStatus === 'error'} autoHideDuration={3000} onClose={() => setExpertUploadStatus('')}>
        <Alert severity="error">Expert upload failed!</Alert>
      </Snackbar>
    </Container>
  );
}

export default Dashboard;