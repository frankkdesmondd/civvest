// context/UserContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

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

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  updateUser: (updatedData: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      // Also fetch fresh data from server
      const response = await axiosInstance.get('/auth/me');
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    if (!user) return;
    
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    // Dispatch events for other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'user',
      newValue: JSON.stringify(newUser)
    }));
    
    window.dispatchEvent(new CustomEvent('userUpdated', {
      detail: { user: newUser }
    }));
  };

  useEffect(() => {
    refreshUser();
    
    // Listen for user updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          setUser(JSON.parse(e.newValue));
        } else {
          setUser(null);
        }
      }
    };

    const handleCustomUserUpdate = (e: CustomEvent) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
        localStorage.setItem('user', JSON.stringify(e.detail.user));
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
    <UserContext.Provider value={{ user, loading, refreshUser, updateUser }}>
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