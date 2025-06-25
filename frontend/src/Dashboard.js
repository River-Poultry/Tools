import React, { useEffect, useState, useRef } from 'react';
import { Box, Button, Typography, Container, Grid, Snackbar, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

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
      const res = await axios.get('http://127.0.0.1:8002/msmes', {
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
      const res = await axios.get('http://127.0.0.1:8002/experts', {
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
      await axios.post('http://127.0.0.1:8002/upload/msmes', form, {
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
      await axios.post('http://127.0.0.1:8002/upload/experts', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpertUploadStatus('success');
      fetchExperts();
    } catch (err) {
      setExpertUploadStatus('error');
    }
    expertFileRef.current.value = '';
  };

  const msmeColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'gps_lat', headerName: 'GPS Lat', width: 120 },
    { field: 'gps_lng', headerName: 'GPS Lng', width: 120 },
    { field: 'skill_needs', headerName: 'Skill Needs', width: 220, valueGetter: (params) => params.row.skill_needs?.join(', ') },
    { field: 'assigned_expert_id', headerName: 'Assigned Expert', width: 140 },
  ];

  const expertColumns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Name', width: 180 },
    { field: 'gps_lat', headerName: 'GPS Lat', width: 120 },
    { field: 'gps_lng', headerName: 'GPS Lng', width: 120 },
    { field: 'skills', headerName: 'Skills', width: 220, valueGetter: (params) => params.row.skills?.join(', ') },
  ];

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 4, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4">Portfolio Manager Dashboard</Typography>
        <Button variant="outlined" color="secondary" onClick={onLogout}>Logout</Button>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">MSMEs</Typography>
            <Button variant="contained" component="label">
              Upload Excel
              <input type="file" accept=".xlsx" hidden ref={msmeFileRef} onChange={handleMsmeUpload} />
            </Button>
          </Box>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid rows={msmes} columns={msmeColumns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} getRowId={row => row.id} />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">Experts</Typography>
            <Button variant="contained" component="label">
              Upload Excel
              <input type="file" accept=".xlsx" hidden ref={expertFileRef} onChange={handleExpertUpload} />
            </Button>
          </Box>
          <div style={{ height: 400, width: '100%' }}>
            <DataGrid rows={experts} columns={expertColumns} pageSize={5} rowsPerPageOptions={[5, 10, 20]} getRowId={row => row.id} />
          </div>
        </Grid>
      </Grid>
      <Snackbar open={msmeUploadStatus === 'success'} autoHideDuration={3000} onClose={() => setMsmeUploadStatus('')}><Alert severity="success">MSME Excel uploaded!</Alert></Snackbar>
      <Snackbar open={msmeUploadStatus === 'error'} autoHideDuration={3000} onClose={() => setMsmeUploadStatus('')}><Alert severity="error">MSME upload failed!</Alert></Snackbar>
      <Snackbar open={expertUploadStatus === 'success'} autoHideDuration={3000} onClose={() => setExpertUploadStatus('')}><Alert severity="success">Expert Excel uploaded!</Alert></Snackbar>
      <Snackbar open={expertUploadStatus === 'error'} autoHideDuration={3000} onClose={() => setExpertUploadStatus('')}><Alert severity="error">Expert upload failed!</Alert></Snackbar>
    </Container>
  );
}

export default Dashboard;