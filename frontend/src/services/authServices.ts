import axios, { AxiosError } from 'axios';

// FIX: Use a valid URL format
const API_BASE_URL = 'https://civvest-backend.onrender.com/api'; // Direct hardcoded URL for now

// Type definitions for API responses
interface ApiResponse {
    message: string;
    success: boolean;
    error?: string;
    [key: string]: any;
}

/**
 * Reset user password using token
 */
export const resetPassword = async (token: string, password: string): Promise<ApiResponse> => {
    try {
        console.log('Sending reset request to:', `${API_BASE_URL}/auth/reset-password`);
        
        const response = await axios.post<ApiResponse>(`${API_BASE_URL}/auth/reset-password`, {
            token,
            password
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true // Important for cookies if you're using them
        });
        
        return response.data;
    } catch (error: unknown) {
        console.error('Reset password service error:', error);
        
        // Type-safe error handling
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiResponse>;
            
            // Check if it's a URL construction error
            if (error.message.includes('Invalid URL') || error.message.includes('Failed to construct')) {
                console.error('URL Error! Check API_BASE_URL:', API_BASE_URL);
                throw { 
                    error: 'Configuration error. Please check API URL.', 
                    success: false 
                };
            }
            
            throw axiosError.response?.data || { 
                error: error.message || 'Network error', 
                success: false 
            };
        }
        
        throw { 
            error: 'Unexpected error occurred', 
            success: false 
        };
    }
};

/**
 * Request password reset link
 */
export const forgotPassword = async (email: string): Promise<ApiResponse> => {
    try {
        const response = await axios.post<ApiResponse>(`${API_BASE_URL}/auth/forgot-password`, {
            email
        }, {
            headers: {
                'Content-Type': 'application/json',
            },
            withCredentials: true
        });
        return response.data;
    } catch (error: unknown) {
        console.error('Forgot password service error:', error);
        
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<ApiResponse>;
            
            if (error.message.includes('Invalid URL') || error.message.includes('Failed to construct')) {
                console.error('URL Error! Check API_BASE_URL:', API_BASE_URL);
                throw { 
                    error: 'Configuration error. Please check API URL.', 
                    success: false 
                };
            }
            
            throw axiosError.response?.data || { 
                error: error.message || 'Network error', 
                success: false 
            };
        }
        
        throw { 
            error: 'Unexpected error occurred', 
            success: false 
        };
    }
};

// Optional: Debug function to test the URL
export const testApiConnection = async (): Promise<void> => {
    try {
        console.log('Testing API connection to:', API_BASE_URL);
        
        const response = await axios.get(`${API_BASE_URL}/health`, {
            timeout: 5000
        });
        
        console.log('✅ API Connection Successful:', response.data);
    } catch (error) {
        console.error('❌ API Connection Failed:', error);
        console.log('Please ensure:');
        console.log('1. Your backend server is running on port 5000');
        console.log('2. The URL is correct:', API_BASE_URL);
        console.log('3. There are no CORS issues');
    }
};
