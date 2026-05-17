import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authApi from '../api/authApi';

const TOKEN_KEY = 'ac_token';
const USER_KEY = 'ac_user';

// ── Context ──────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Simple JWT decoder (no external dep needed) ───────────────
function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1];
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
    const decoded = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return Date.now() / 1000 > payload.exp;
}

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Bootstrap from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);

    if (storedToken && storedUser) {
      if (isTokenExpired(storedToken)) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } else {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }
    }
    setLoading(false);
  }, []);

  /**
   * Login: calls API, stores credentials, updates state.
   * @param {string} email
   * @param {string} password
   * @returns {Promise<object>} - the user object
   */
  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);

    // Backend may return { token, user } or { token, role, ... }
    const receivedToken = data.token || data.accessToken || data.jwt;
    if (!receivedToken) {
      throw new Error('No token received from server');
    }

    // Build user object — prefer explicit user object, fall back to JWT payload
    let userObj = data.user || null;
    if (!userObj) {
      const payload = decodeJwtPayload(receivedToken);
      userObj = {
        id: payload?.sub || payload?.userId || null,
        email: payload?.email || email,
        fullName: payload?.name || payload?.fullName || email,
        role: payload?.role || payload?.roles?.[0] || data.role || 'CUSTOMER',
      };
    }

    // Normalize role — strip ROLE_ prefix if present
    if (userObj.role && userObj.role.startsWith('ROLE_')) {
      userObj.role = userObj.role.replace('ROLE_', '');
    }
    // Handle array of roles → take first
    if (Array.isArray(userObj.role)) {
      userObj.role = userObj.role[0]?.replace('ROLE_', '') || 'CUSTOMER';
    }

    localStorage.setItem(TOKEN_KEY, receivedToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userObj));

    setToken(receivedToken);
    setUser(userObj);

    return userObj;
  }, []);

  /**
   * Logout: clears state and localStorage.
   */
  const logout = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      await authApi.logout(storedToken);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  /**
   * Check if the current user has a specific role.
   * @param {string} role
   * @returns {boolean}
   */
  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      return user.role === role;
    },
    [user]
  );

  /**
   * Check if the current user has any of the given roles.
   * @param {string[]} roles
   * @returns {boolean}
   */
  const hasAnyRole = useCallback(
    (roles) => {
      if (!user || !roles?.length) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    hasRole,
    hasAnyRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
