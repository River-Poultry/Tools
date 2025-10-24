// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/auth/login/`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout/`,
  
  // Core API endpoints
  MSMES: `${API_BASE_URL}/api/msmes/`,
  EXPERTS: `${API_BASE_URL}/api/experts/`,
  PORTFOLIOS: `${API_BASE_URL}/api/portfolios/`,
  INVESTMENTS: `${API_BASE_URL}/api/investments/`,
  TRANSACTIONS: `${API_BASE_URL}/api/transactions/`,
  SUPPORT_REQUESTS: `${API_BASE_URL}/api/support-requests/`,
  TRAINING_SESSIONS: `${API_BASE_URL}/api/training-sessions/`,
  ATTENDANCE: `${API_BASE_URL}/api/attendance/`,
  TRAINING_TOPICS: `${API_BASE_URL}/api/training-topics/`,
  
  // Analytics endpoints
  MSME_ANALYTICS: `${API_BASE_URL}/api/msmes/analytics/`,
  PORTFOLIO_ANALYTICS: `${API_BASE_URL}/api/portfolios/analytics/`,
  EXPERT_LEADERBOARD: `${API_BASE_URL}/api/experts/leaderboard/`,
  
  // Blockchain endpoints
  BLOCKCHAIN_TRANSACTIONS: `${API_BASE_URL}/api/blockchain/transactions/`,
  BLOCKCHAIN_CONTRACTS: `${API_BASE_URL}/api/blockchain/contracts/`,
  BLOCKCHAIN_TOKENS: `${API_BASE_URL}/api/blockchain/tokens/`,
  BLOCKCHAIN_FUNDING_CONTRACTS: `${API_BASE_URL}/api/blockchain/funding-contracts/`,
  BLOCKCHAIN_INVESTMENT_POOLS: `${API_BASE_URL}/api/blockchain/investment-pools/`,
  BLOCKCHAIN_IDENTITIES: `${API_BASE_URL}/api/blockchain/identities/`,
  
  // File upload endpoints
  UPLOAD_MSMES: `${API_BASE_URL}/upload/msmes`,
  UPLOAD_EXPERTS: `${API_BASE_URL}/upload/experts`,
  
  // Legacy endpoints for backward compatibility
  TOKEN: `${API_BASE_URL}/token`,
};

export default API_BASE_URL; 