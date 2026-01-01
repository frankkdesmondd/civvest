import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

interface Wallet {
  id: string;
  coinHost: string;
  walletAddress: string;
  userId: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  accountNumber: string;
  balance: number;
  roi: number;
  referralBonus: number;
  referralCount: number;
  profilePicture?: string | null;
  country?: string | null;
  state?: string | null;
  address?: string | null;
  phone?: string | null;
  referralCode?: string;
  createdAt?: string;
  bankName?: string | null;
  accountName?: string | null;
  bankAccountNumber?: string | null;
  routingCode?: string | null;
  wallets?: Wallet[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  updateUserById: (userId: string, updatedData: Partial<User>) => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Refreshing user data...');
      
      // First check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No token found, user is not authenticated');
        setUser(null);
        setLoading(false);
        return;
      }
      
      const response = await axiosInstance.get('/api/auth/me');
      
      if (response.data.success && response.data.user) {
        const newUser = response.data.user;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('✅ User refreshed:', newUser.email);
      } else {
        console.error('❌ API returned unsuccessful response:', response.data);
        setError(response.data.message || 'Failed to fetch user data');
        
        // Check if it's an authentication error
        if (response.data.error?.includes('token') || response.data.error?.includes('authenticated')) {
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to refresh user:', error);
      
      // Handle different error types
      if (error.response?.status === 401) {
        console.log('🚫 401 Unauthorized - clearing authentication');
        setError('Session expired. Please sign in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } else if (error.response?.status === 500) {
        console.error('🔥 Server error - but keeping user logged in with cached data');
        setError('Server error. Using cached data.');
        
        // Try to use cached data
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
            console.log('🔄 Using cached user data due to server error');
          } catch (parseError) {
            console.error('Failed to parse cached user:', parseError);
          }
        }
      } else {
        setError(error.message || 'Failed to refresh user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUserById = (userId: string, updatedData: Partial<User>) => {
    if (user && user.id === userId) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'user',
        newValue: JSON.stringify(newUser),
        oldValue: JSON.stringify(user)
      }));
      
      window.dispatchEvent(new CustomEvent('userUpdated', {
        detail: { 
          user: newUser,
          source: 'admin-update',
          userId: userId,
          updatedData: updatedData
        }
      }));
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: JSON.stringify(newUser)
    }));
    
    window.dispatchEvent(new CustomEvent('userUpdated', {
      detail: { user: newUser }
    }));
  };

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    const initializeUser = async () => {
      // First, check for cached user data
      const cachedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (cachedUser && token) {
        try {
          const parsedUser = JSON.parse(cachedUser);
          setUser(parsedUser);
          console.log('🔄 Using cached user data while fetching fresh data');
        } catch (error) {
          console.error('Failed to parse cached user:', error);
        }
      }
      
      // Then try to refresh from server
      await refreshUser();
    };
    
    initializeUser();
    
    // Listen for storage events (e.g., logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
            console.log('User updated from storage:', parsedUser.email);
          } catch (error) {
            console.error('Failed to parse user from storage:', error);
          }
        } else {
          setUser(null);
        }
      }
      
      if (e.key === 'token' && !e.newValue) {
        // Token was cleared (logout)
        setUser(null);
        console.log('Token cleared, user logged out');
      }
    };

    const handleCustomUserUpdate = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
        localStorage.setItem('user', JSON.stringify(e.detail.user));
        console.log('User updated from custom event:', e.detail.user.email);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleCustomUserUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleCustomUserUpdate as EventListener);
    };
  }, []);

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      error,
      refreshUser, 
      updateUser, 
      updateUserById,
      clearError
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
