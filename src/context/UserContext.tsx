'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export interface UserAddress {
  _id?: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface UserPaymentMethod {
  _id?: string;
  brand: string;
  last4: string;
  expiry: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  wishlist?: string[];
  addresses?: UserAddress[];
  savedPayments?: UserPaymentMethod[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => Promise<boolean>;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    try {
      await axios.post('/api/auth/logout');
    } catch {
      // ignore
    }
    router.push('/');
  }, [router]);

  // Global Session Hydration
  const hydrateSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      }
      
      const { data } = await axios.get('/api/auth/me');
      if (data?.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.warn('Authentication hydration check failed. Clearing session.', error);
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      hydrateSession();
    });

    // Setup Axios Interceptor for token refresh
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post('/api/auth/refresh');
            localStorage.setItem('accessToken', data.accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
            originalRequest.headers['Authorization'] = `Bearer ${data.accessToken}`;
            return axios(originalRequest);
          } catch {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [logout, hydrateSession]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('accessToken', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const updateUser = async (updatedData: Partial<User>): Promise<boolean> => {
    try {
      // Optimistic update
      setUser((prev) => prev ? { ...prev, ...updatedData } : null);
      
      // Update local storage
      const saved = localStorage.getItem('user');
      if (saved) {
        const current = JSON.parse(saved);
        localStorage.setItem('user', JSON.stringify({ ...current, ...updatedData }));
      }
      
      return true;
    } catch (err) {
      console.error('Update user state error:', err);
      return false;
    }
  };

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const currentWishlist = user.wishlist || [];
      if (!currentWishlist.includes(productId)) {
        const newWishlist = [...currentWishlist, productId];
        await updateUser({ wishlist: newWishlist });
      }
      return true;
    } catch {
      return false;
    }
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const currentWishlist = user.wishlist || [];
      const newWishlist = currentWishlist.filter((id) => id !== productId);
      await updateUser({ wishlist: newWishlist });
      return true;
    } catch {
      return false;
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, login, logout, updateUser, addToWishlist, removeFromWishlist }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};
