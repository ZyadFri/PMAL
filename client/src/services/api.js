import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    // Token is already set by AuthContext when login succeeds
// No need to get from localStorage for Keycloak
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      console.error('Response error:', error.response.data);
      console.error('Status:', error.response.status);
      
      // Handle authentication errors
      if (error.response.status === 401) {
  // Let Keycloak handle the redirect
  window.location.href = '/login';
  return Promise.reject(error);
}
      
      // Return the error response for component handling
      return Promise.reject(error);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Request error:', error.request);
      return Promise.reject(new Error('Network error - please check your connection'));
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return Promise.reject(error);
    }
  }
);

export default api;