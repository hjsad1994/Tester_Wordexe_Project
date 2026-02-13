'use client';

import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

const parseErrorResponse = async (
  res: Response
): Promise<{ message: string; fieldErrors?: Record<string, string> }> => {
  const data = await res.json().catch(() => null);

  if (data?.errors && Array.isArray(data.errors)) {
    const fieldErrors: Record<string, string> = {};
    for (const error of data.errors) {
      const field = error.field || error.param;
      if (field && !fieldErrors[field]) {
        fieldErrors[field] = error.message || error.msg || 'Dữ liệu không hợp lệ';
      }
    }
    return {
      message: data.message || 'Dữ liệu không hợp lệ',
      fieldErrors,
    };
  }

  return {
    message: data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const error = await parseErrorResponse(res);
        return { ok: false, ...error };
      }

      const data = await res.json();
      setUser(data.data);
      setIsAuthenticated(true);
      return { ok: true };
    } catch {
      return { ok: false, message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' };
    }
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }): Promise<AuthResult> => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await parseErrorResponse(res);
          return { ok: false, ...error };
        }

        const response = await res.json();
        setUser(response.data);
        setIsAuthenticated(true);
        return { ok: true };
      } catch {
        return { ok: false, message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại.' };
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, isLoading, login, logout, register }),
    [isAuthenticated, user, isLoading, login, logout, register]
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
