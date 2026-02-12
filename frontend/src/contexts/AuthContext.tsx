'use client';

import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react';

export interface AuthUser {
  name: string;
  email: string;
  phone: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => void;
  logout: () => void;
  register: (data: { name: string; email: string; phone: string; password: string }) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  const login = useCallback((email: string, _password: string) => {
    // Mock login — always succeeds
    setUser({ name: 'Người dùng', email, phone: '' });
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const register = useCallback(
    (data: { name: string; email: string; phone: string; password: string }) => {
      // Mock register — always succeeds
      setUser({ name: data.name, email: data.email, phone: data.phone });
      setIsAuthenticated(true);
    },
    []
  );

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout, register }),
    [isAuthenticated, user, login, logout, register]
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
