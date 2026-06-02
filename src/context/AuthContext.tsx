import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import type { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
  isOrganizer: boolean;
  isPrivileged: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('vf_token');
    const savedUser = localStorage.getItem('vf_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const loginFn = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await authApi.login(email, password);
    const { access_token, user: userData } = res.data;
    setToken(access_token);
    setUser(userData);
    localStorage.setItem('vf_token', access_token);
    localStorage.setItem('vf_user', JSON.stringify(userData));
    return userData;
  }, []);

  const registerFn = useCallback(async (email: string, password: string): Promise<User> => {
    await authApi.register(email, password);
    return loginFn(email, password);
  }, [loginFn]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vf_token');
    localStorage.removeItem('vf_user');
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isOrganizer = user?.role === 'ORGANIZER';
  const isPrivileged = isAdmin || isOrganizer;

  return (
    <AuthContext.Provider value={{ user, token, loading, login: loginFn, register: registerFn, logout, isAdmin, isOrganizer, isPrivileged }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
