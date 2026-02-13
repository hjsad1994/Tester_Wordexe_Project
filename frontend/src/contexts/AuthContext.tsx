'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) {
      return { ok: false, message: 'Email và mật khẩu là bắt buộc.' };
    }

    const displayName = email.split('@')[0]?.trim() || 'Khách hàng';
    setUser({
      id: `mock-${Date.now()}`,
      name: displayName,
      email,
      phone: '',
    });
    setIsAuthenticated(true);

    return { ok: true };
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<AuthResult> => {
      if (!data.name || !data.email || !data.phone || !data.password) {
        return { ok: false, message: 'Vui lòng điền đầy đủ thông tin.' };
      }

      setUser({
        id: `mock-${Date.now()}`,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      setIsAuthenticated(true);

      return { ok: true };
    },
    []
  );

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, isLoading, login, logout, register }),
    [isAuthenticated, user, isLoading, login, logout, register]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
