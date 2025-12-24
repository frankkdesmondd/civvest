// src/config/axios.ts
import axios from 'axios';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: 'https://civvest-backend.onrender.com',
  withCredentials: true, // CRITICAL: This enables sending cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle FormData content type
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 401) {
      // Clear local storage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Define public routes that don't require authentication
      const publicRoutes = ['/', '/signin', '/signup', '/login', '/home', '/our-company', '/news', '/principled-approach', '/learn-about', '/contact-us', '/faq', '/terms-and-services', '/privacy-policy', '/news/:slug', '/view-investment'];
      const currentPath = window.location.pathname;
      
      // Only redirect if not on a public route
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

