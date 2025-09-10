"use client";

import type { ReactNode } from 'react';
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_ADMIN_PASSWORD = "password123"; // In a real app, this would be handled by a backend.

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem('autopart_admin_auth');
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("No se pudo acceder a localStorage para verificar el estado de autenticación:", error);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (password: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    if (password === MOCK_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      try {
        localStorage.setItem('autopart_admin_auth', 'true');
      } catch (error) {
        console.error("No se pudo acceder a localStorage para establecer el estado de autenticación:", error);
      }
      setIsLoading(false);
      return true;
    }
    setIsAuthenticated(false);
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('autopart_admin_auth');
    } catch (error) {
      console.error("No se pudo acceder a localStorage para eliminar el estado de autenticación:", error);
    }
    // Redirect to login page after logout if currently in a protected admin route
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
        router.push('/admin/login');
    }
  }, [router, pathname]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
