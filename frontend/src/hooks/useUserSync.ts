import { useState } from 'react';
import axiosInstance from '../config/axios';
import { useUser } from '../context/UserContext';

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
}

export const useUserSync = () => {
  const { user, updateUser, refreshUser } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // This function will update user and force refresh across all components
  const syncUser = async (updatedData?: Partial<User>) => {
    setLoading(true);
    setError(null);
    
    try {
      if (updatedData && user) {
        const newUser = { ...user, ...updatedData };
        updateUser(newUser);
      }
      
      // Always refresh from server to ensure consistency
      await refreshUser();
      
      // Dispatch event to notify all profile picture components
      window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
      
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to sync user';
      setError(errorMessage);
      console.error('User sync error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Sync with server (force refresh from API)
  const syncWithServer = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axiosInstance.get('/auth/me');
      if (response.data.user) {
        updateUser(response.data.user);
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Dispatch events for other components
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'user',
          newValue: JSON.stringify(response.data.user)
        }));
        
        window.dispatchEvent(new CustomEvent('userUpdated', {
          detail: { user: response.data.user }
        }));
        
        // Dispatch profile picture update event
        window.dispatchEvent(new CustomEvent('profilePictureUpdated'));
        
        return { success: true, user: response.data.user };
      }
      return { success: false, error: 'No user data returned' };
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to sync with server';
      setError(errorMessage);
      console.error('Server sync error:', errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    updateUser: syncUser,
    refreshUser: syncWithServer
  };
};