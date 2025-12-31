// context/UserContext.tsx
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
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
  updateUserById: (userId: string, updatedData: Partial<User>) => void;
  incrementReferralCount: (incrementBy?: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await axiosInstance.get('/api/auth/me');
      if (response.data.user) {
        const newUser = response.data.user;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        console.log('User refreshed:', newUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserById = (userId: string, updatedData: Partial<User>) => {
    // Validate referralCount
    if (updatedData.referralCount !== undefined && updatedData.referralCount < 0) {
      console.warn('referralCount cannot be negative');
      return;
    }

    // Update if it's the current user
    if (user && user.id === userId) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Broadcast events more aggressively
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
      
      // Dispatch specific events for important fields
      if (updatedData.balance !== undefined) {
        window.dispatchEvent(new CustomEvent('balanceUpdated', {
          detail: {
            userId: userId,
            newBalance: updatedData.balance
          }
        }));
      }
      
      if (updatedData.roi !== undefined) {
        window.dispatchEvent(new CustomEvent('roiUpdated', {
          detail: {
            userId: userId,
            newROI: updatedData.roi
          }
        }));
      }
      
      if (updatedData.referralCount !== undefined) {
        window.dispatchEvent(new CustomEvent('referralCountUpdated', {
          detail: {
            userId: userId,
            newReferralCount: updatedData.referralCount,
            previousReferralCount: user.referralCount
          }
        }));
      }
      
      if (updatedData.referralBonus !== undefined) {
        window.dispatchEvent(new CustomEvent('referralBonusUpdated', {
          detail: {
            userId: userId,
            newReferralBonus: updatedData.referralBonus
          }
        }));
      }
      
      // Force refresh after a short delay
      setTimeout(() => {
        refreshUser();
      }, 100);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    
    // Validate referralCount
    if (updatedData.referralCount !== undefined && updatedData.referralCount < 0) {
      console.warn('referralCount cannot be negative');
      return;
    }
    
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

  const incrementReferralCount = async (incrementBy: number = 1) => {
    if (!user) return;
    
    // Optimistic update
    const currentCount = user.referralCount || 0;
    updateUser({ referralCount: currentCount + incrementBy });
    
    try {
      // Call backend API to update referral count
      await axiosInstance.patch(`/api/users/${user.id}/referral-count`, {
        increment: incrementBy
      });
      
      // Refresh to get latest data from server
      await refreshUser();
      console.log(`Referral count incremented by ${incrementBy}`);
    } catch (error) {
      // Rollback on error
      updateUser({ referralCount: currentCount });
      console.error('Failed to update referral count:', error);
      throw error;
    }
  };

  useEffect(() => {
    refreshUser();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const parsedUser = JSON.parse(e.newValue);
            setUser(parsedUser);
            console.log('User updated from storage:', parsedUser);
          } catch (error) {
            console.error('Failed to parse user from storage:', error);
          }
        } else {
          setUser(null);
        }
      }
    };

    const handleCustomUserUpdate = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
        localStorage.setItem('user', JSON.stringify(e.detail.user));
        console.log('User updated from custom event:', e.detail.user);
      }
    };

    const handleReferralCountUpdate = (e: CustomEvent) => {
      if (e.detail?.userId === user?.id) {
        console.log('Referral count updated:', e.detail);
        // Refresh user data to ensure consistency
        setTimeout(() => refreshUser(), 50);
      }
    };

    const handleReferralBonusUpdate = (e: CustomEvent) => {
      if (e.detail?.userId === user?.id) {
        console.log('Referral bonus updated:', e.detail);
        setTimeout(() => refreshUser(), 50);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userUpdated', handleCustomUserUpdate as EventListener);
    window.addEventListener('referralCountUpdated', handleReferralCountUpdate as EventListener);
    window.addEventListener('referralBonusUpdated', handleReferralBonusUpdate as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userUpdated', handleCustomUserUpdate as EventListener);
      window.removeEventListener('referralCountUpdated', handleReferralCountUpdate as EventListener);
      window.removeEventListener('referralBonusUpdated', handleReferralBonusUpdate as EventListener);
    };
  }, [user?.id]); // Added user.id as dependency

  return (
    <UserContext.Provider value={{ 
      user, 
      loading, 
      refreshUser, 
      updateUser, 
      updateUserById,
      incrementReferralCount 
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
