import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  id?: number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const interceptorId = useRef<number | null>(null);

  const attachInterceptor = (jwt: string) => {
    if (interceptorId.current !== null) {
      axios.interceptors.request.eject(interceptorId.current);
    }
    interceptorId.current = axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${jwt}`;
      return config;
    });
  };

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      attachInterceptor(storedToken);
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    attachInterceptor(newToken);
  };

  const logout = () => {
    if (interceptorId.current !== null) {
      axios.interceptors.request.eject(interceptorId.current);
      interceptorId.current = null;
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
