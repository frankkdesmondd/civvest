// src/config/axios.ts
import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'https://civvest-backend.onrender.com',
  withCredentials: true, // Enable sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Add Authorization header with token
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request:', config.url);
    } else {
      console.log('⚠️ No token found for request:', config.url);
    }
    
    // Handle FormData content type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful responses
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      method: response.config.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    // Enhanced error logging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle 401 Unauthorized errors ONLY
    if (error.response?.status === 401) {
      console.log('🚫 Unauthorized - clearing authentication');
      
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Dispatch storage event to notify components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: null
      }));
      
      // Define public routes that don't require authentication
      const publicRoutes = [
        '/', 
        '/signin', 
        '/signup', 
        '/login', 
        '/home', 
        '/our-company', 
        '/news', 
        '/principled-approach', 
        '/learn-about', 
        '/contact-us', 
        '/faq', 
        '/terms-and-services', 
        '/privacy-policy',
        '/forgot-password',
        '/reset-password',
        '/view-investment'
      ];
      
      const currentPath = window.location.pathname;
      
      // Check if current path is public or starts with a public route
      const isPublicRoute = publicRoutes.some(route => 
        currentPath === route || currentPath.startsWith('/news/') || currentPath.startsWith('/investment/')
      );
      
      // Only redirect if not on a public route
      if (!isPublicRoute) {
        console.log('🔀 Redirecting to signin page');
        window.location.href = '/signin';
      }
    }
    
    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      console.log('🚫 Forbidden - insufficient permissions');
    }
    
    // Handle 500 Server errors - DON'T LOG OUT USER
    if (error.response?.status === 500) {
      console.error('🔥 Server error - The server encountered an error');
      console.error('🔥 This is a backend issue, not an authentication problem');
      console.error('🔥 Keeping user logged in with cached data');
      // DON'T clear tokens or redirect - let UserContext handle it with cached data
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
