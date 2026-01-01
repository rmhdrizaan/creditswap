import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    
    // Add request timestamp
    config.headers['X-Request-Timestamp'] = Date.now();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => {
    // You can transform response data here if needed
    return response;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network Error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
    
    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 401:
        // Token expired or invalid
        if (!originalRequest._retry) {
          originalRequest._retry = true;
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        break;
        
      case 403:
        console.error('Forbidden:', data.message);
        break;
        
      case 404:
        console.error('Not Found:', data.message);
        break;
        
      case 422:
        // Validation errors
        console.error('Validation Error:', data.errors);
        break;
        
      case 429:
        // Rate limiting
        console.error('Rate Limited:', data.message);
        break;
        
      case 500:
        console.error('Server Error:', data.message);
        break;
        
      default:
        console.error(`HTTP ${status}:`, data.message);
    }
    
    // Return a consistent error format
    return Promise.reject({
      status: status || 500,
      message: data?.message || 'An unexpected error occurred',
      errors: data?.errors || null,
      timestamp: new Date().toISOString()
    });
  }
);

// Helper methods
api.setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

api.removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
};

export default api;