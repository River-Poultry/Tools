// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
  MSMES: `${API_BASE_URL}/msmes`,
  EXPERTS: `${API_BASE_URL}/experts`,
  UPLOAD_MSMES: `${API_BASE_URL}/upload/msmes`,
  UPLOAD_EXPERTS: `${API_BASE_URL}/upload/experts`,
  TOKEN: `${API_BASE_URL}/token`,
};

export default API_BASE_URL; 