'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserSession } from './types';

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  login: (email: string, role?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  switchDemoUser: (role: 'ADMIN' | 'CONTRIBUTOR' | 'STUDENT') => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password = 'password') => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  const switchDemoUser = async (role: 'ADMIN' | 'CONTRIBUTOR' | 'STUDENT') => {
    const demoEmails: Record<string, string> = {
      ADMIN: 'admin@campus.edu',
      CONTRIBUTOR: 'contributor@campus.edu',
      STUDENT: 'student@campus.edu',
    };
    const email = demoEmails[role];
    await login(email, role === 'ADMIN' ? 'admin123' : role === 'CONTRIBUTOR' ? 'contrib123' : 'student123');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchDemoUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
