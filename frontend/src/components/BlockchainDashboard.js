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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  AccountBalance,
  Token,
  SmartToy,
  SwapHoriz,
  TrendingUp,
  TrendingDown,
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
  ExpandMore,
  AccountBalanceWallet,
  Security,
  VerifiedUser,
  Payment,
  Business,
  People,
  School,
  Support,
} from '@mui/icons-material';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

function BlockchainDashboard({ token }) {
  const [activeTab, setActiveTab] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [fundingContracts, setFundingContracts] = useState([]);
  const [investmentPools, setInvestmentPools] = useState([]);
  const [identities, setIdentities] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const fetchBlockchainData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, contractsRes, tokensRes, fundingRes, poolsRes, identitiesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_TRANSACTIONS}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_CONTRACTS}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_TOKENS}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_FUNDING_CONTRACTS}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_INVESTMENT_POOLS}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_IDENTITIES}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_ENDPOINTS.BLOCKCHAIN_TRANSACTIONS}/analytics/`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTransactions(transactionsRes.data);
      setContracts(contractsRes.data);
      setTokens(tokensRes.data);
      setFundingContracts(fundingRes.data);
      setInvestmentPools(poolsRes.data);
      setIdentities(identitiesRes.data);
      setAnalytics(analyticsRes.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch blockchain data');
      console.error('Error fetching blockchain data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFundingContract = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.BLOCKCHAIN_FUNDING_CONTRACTS}/create_contract/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSuccess('Funding contract created successfully!');
        fetchBlockchainData();
        setDialogOpen(false);
        setFormData({});
      }
    } catch (err) {
      setError('Failed to create funding contract');
    }
  };

  const handleContributeToFunding = async (contractId, amount) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.BLOCKCHAIN_FUNDING_CONTRACTS}/${contractId}/contribute/`, {
        investor_address: '0x' + Math.random().toString(36).substr(2, 40),
        amount: amount
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSuccess('Contribution successful!');
        fetchBlockchainData();
      }
    } catch (err) {
      setError('Failed to contribute to funding');
    }
  };

  const handleCreateInvestmentPool = async () => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.BLOCKCHAIN_INVESTMENT_POOLS}/create_pool/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSuccess('Investment pool created successfully!');
        fetchBlockchainData();
        setDialogOpen(false);
        setFormData({});
      }
    } catch (err) {
      setError('Failed to create investment pool');
    }
  };

  const handleInvestInPool = async (poolId, amount) => {
    try {
      const response = await axios.post(`${API_ENDPOINTS.BLOCKCHAIN_INVESTMENT_POOLS}/${poolId}/invest/`, {
        investor_address: '0x' + Math.random().toString(36).substr(2, 40),
        amount: amount
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setSuccess('Investment successful!');
        fetchBlockchainData();
      }
    } catch (err) {
      setError('Failed to invest in pool');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount || 0);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'FUNDED':
      case 'APPROVED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
      case 'FAILED':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderTransactionsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Blockchain Transactions
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hash</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>
                  <Chip label={formatAddress(tx.transaction_hash)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={tx.transaction_type} size="small" color="primary" />
                </TableCell>
                <TableCell>{formatAddress(tx.from_address)}</TableCell>
                <TableCell>{formatAddress(tx.to_address)}</TableCell>
                <TableCell>{formatCurrency(tx.amount)}</TableCell>
                <TableCell>
                  <Chip label={tx.status} color={getStatusColor(tx.status)} size="small" />
                </TableCell>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderContractsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Smart Contracts
      </Typography>
      <Grid container spacing={2}>
        {contracts.map((contract) => (
          <Grid item xs={12} md={6} key={contract.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{contract.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Chip label={contract.contract_type} size="small" />
                  <Chip label={formatAddress(contract.contract_address)} size="small" sx={{ ml: 1 }} />
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Owner: {formatAddress(contract.owner_address)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderTokensTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Tokens
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Total Supply</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell>{token.name}</TableCell>
                <TableCell>
                  <Chip label={token.symbol} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={token.token_type} size="small" color="secondary" />
                </TableCell>
                <TableCell>{token.total_supply}</TableCell>
                <TableCell>{formatAddress(token.owner_address)}</TableCell>
                <TableCell>
                  <IconButton size="small">
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

  const renderFundingContractsTab = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">MSME Funding Contracts</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedItem({ type: 'funding_contract' });
            setDialogOpen(true);
          }}
        >
          Create Contract
        </Button>
      </Box>
      <Grid container spacing={2}>
        {fundingContracts.map((contract) => (
          <Grid item xs={12} md={6} key={contract.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{contract.msme_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {contract.msme_code}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Funding Amount: {formatCurrency(contract.funding_amount)}
                  </Typography>
                  <Typography variant="body2">
                    Funded: {formatCurrency(contract.funded_amount)}
                  </Typography>
                  <Typography variant="body2">
                    Remaining: {formatCurrency(contract.remaining_amount)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={contract.funding_progress || 0}
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2">
                    Progress: {Math.round(contract.funding_progress || 0)}%
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Chip label={contract.status} color={getStatusColor(contract.status)} size="small" />
                  <Chip label={formatAddress(contract.contract_address)} size="small" sx={{ ml: 1 }} />
                </Box>
                {contract.status === 'PENDING' && (
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{ mt: 1 }}
                    onClick={() => handleContributeToFunding(contract.id, 1000)}
                  >
                    Contribute
                  </Button>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderInvestmentPoolsTab = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Investment Pools</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setSelectedItem({ type: 'investment_pool' });
            setDialogOpen(true);
          }}
        >
          Create Pool
        </Button>
      </Box>
      <Grid container spacing={2}>
        {investmentPools.map((pool) => (
          <Grid item xs={12} md={6} key={pool.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{pool.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {pool.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    Target: {formatCurrency(pool.target_amount)}
                  </Typography>
                  <Typography variant="body2">
                    Current: {formatCurrency(pool.current_amount)}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={pool.funding_progress || 0}
                    sx={{ mt: 1, mb: 1 }}
                  />
                  <Typography variant="body2">
                    Progress: {Math.round(pool.funding_progress || 0)}%
                  </Typography>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Chip label={formatAddress(pool.contract_address)} size="small" />
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => handleInvestInPool(pool.id, 500)}
                >
                  Invest
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const renderIdentitiesTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Decentralized Identities
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>DID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Entity</TableCell>
              <TableCell>Verified</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {identities.map((identity) => (
              <TableRow key={identity.id}>
                <TableCell>
                  <Chip label={identity.did.slice(0, 20) + '...'} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={identity.identity_type} size="small" color="primary" />
                </TableCell>
                <TableCell>{identity.entity_name || 'N/A'}</TableCell>
                <TableCell>
                  <Chip
                    label={identity.is_verified ? 'Verified' : 'Pending'}
                    color={identity.is_verified ? 'success' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(identity.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderAnalyticsTab = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Blockchain Analytics
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SwapHoriz color="primary" />
                <Box>
                  <Typography variant="h4">{analytics.total_transactions || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Transactions
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
                    {formatCurrency(analytics.total_volume || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Volume
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
                <SmartToy color="primary" />
                <Box>
                  <Typography variant="h4">{contracts.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Smart Contracts
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
                <Token color="primary" />
                <Box>
                  <Typography variant="h4">{tokens.length}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tokens
                  </Typography>
                </Box>
              </Box>
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
          <AccountBalance sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blockchain Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Transactions" icon={<SwapHoriz />} />
          <Tab label="Contracts" icon={<SmartToy />} />
          <Tab label="Tokens" icon={<Token />} />
          <Tab label="Funding" icon={<Payment />} />
          <Tab label="Pools" icon={<AccountBalanceWallet />} />
          <Tab label="Identities" icon={<Security />} />
          <Tab label="Analytics" icon={<Assessment />} />
        </Tabs>
      </Box>

      {activeTab === 0 && renderTransactionsTab()}
      {activeTab === 1 && renderContractsTab()}
      {activeTab === 2 && renderTokensTab()}
      {activeTab === 3 && renderFundingContractsTab()}
      {activeTab === 4 && renderInvestmentPoolsTab()}
      {activeTab === 5 && renderIdentitiesTab()}
      {activeTab === 6 && renderAnalyticsTab()}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedItem?.type === 'funding_contract' ? 'Create Funding Contract' : 'Create Investment Pool'}
        </DialogTitle>
        <DialogContent>
          {selectedItem?.type === 'funding_contract' ? (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="MSME ID"
                  value={formData.msme_id || ''}
                  onChange={(e) => setFormData({ ...formData, msme_id: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Funding Amount"
                  type="number"
                  value={formData.funding_amount || ''}
                  onChange={(e) => setFormData({ ...formData, funding_amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Interest Rate (%)"
                  type="number"
                  value={formData.interest_rate || ''}
                  onChange={(e) => setFormData({ ...formData, interest_rate: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Term (months)"
                  type="number"
                  value={formData.term_months || ''}
                  onChange={(e) => setFormData({ ...formData, term_months: e.target.value })}
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Pool Name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  multiline
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  type="number"
                  value={formData.target_amount || ''}
                  onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Min Investment"
                  type="number"
                  value={formData.min_investment || ''}
                  onChange={(e) => setFormData({ ...formData, min_investment: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Max Investment"
                  type="number"
                  value={formData.max_investment || ''}
                  onChange={(e) => setFormData({ ...formData, max_investment: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={selectedItem?.type === 'funding_contract' ? handleCreateFundingContract : handleCreateInvestmentPool}
            variant="contained"
          >
            Create
          </Button>
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

export default BlockchainDashboard; 