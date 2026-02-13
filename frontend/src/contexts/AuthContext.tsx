'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
}

interface AuthApiResponse {
  status: string;
  message: string;
  data: AuthUser;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  isAdmin: boolean;
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

const parseErrorMessage = async (res: Response, fallback: string) => {
  try {
    const body = (await res.json()) as { message?: string };
    return body.message || fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          if (!cancelled) {
            setUser(null);
            setIsAuthenticated(false);
          }
          return;
        }

        const body = (await res.json()) as AuthApiResponse;

        if (!cancelled) {
          setUser(body.data);
          setIsAuthenticated(true);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!email || !password) {
      return { ok: false, message: 'Email và mật khẩu là bắt buộc.' };
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        return {
          ok: false,
          message: await parseErrorMessage(res, 'Đăng nhập thất bại'),
        };
      }

      const body = (await res.json()) as AuthApiResponse;
      setUser(body.data);
      setIsAuthenticated(true);

      return { ok: true };
    } catch {
      return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
    }
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

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          return {
            ok: false,
            message: await parseErrorMessage(res, 'Đăng ký thất bại'),
          };
        }

        const body = (await res.json()) as AuthApiResponse;
        setUser(body.data);
        setIsAuthenticated(true);

        return { ok: true };
      } catch {
        return { ok: false, message: 'Không thể kết nối đến máy chủ.' };
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

  const isAdmin = isAuthenticated && user?.role === 'admin';

  const value = useMemo(
    () => ({
      isAuthenticated,
      user,
      isLoading,
      isAdmin,
      login,
      logout,
      register,
    }),
    [isAuthenticated, user, isLoading, isAdmin, login, logout, register]
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
