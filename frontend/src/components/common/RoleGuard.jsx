import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleGuard
 *
 * Restricts access to a section based on the user's role.
 *
 * Props:
 *   roles     {string[]}  - Array of allowed roles
 *   children  {ReactNode} - Content to render if authorized
 *   fallback  {string}    - Redirect path if not authorized (default: /unauthorized)
 *
 * Usage:
 *   <RoleGuard roles={['ADMIN', 'SALES_MANAGER']}>
 *     <SomePage />
 *   </RoleGuard>
 */
export default function RoleGuard({ roles, children, fallback = '/unauthorized' }) {
  const { user, isAuthenticated } = useAuth();

  // If not authenticated at all, ProtectedRoute handles it upstream
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // If no roles restriction, allow everyone
  if (!roles || roles.length === 0) {
    return children;
  }

  // Check if the user's role is in the allowed list
  if (!roles.includes(user.role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
