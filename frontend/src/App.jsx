import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import AppRoutes from './routes/AppRoutes';

/**
 * App
 *
 * Root component. Wraps the entire application with:
 * 1. AuthProvider  — authentication state, login/logout, role helpers
 * 2. UIProvider    — sidebar collapsed state, mobile open state
 * 3. AppRoutes     — React Router v6 route tree
 *
 * BrowserRouter is provided by main.jsx so it wraps everything.
 */
export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <AppRoutes />
      </UIProvider>
    </AuthProvider>
  );
}
