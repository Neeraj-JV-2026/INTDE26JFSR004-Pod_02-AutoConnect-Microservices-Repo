import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ROLES, ROUTE_PERMISSIONS } from './roleConfig';

// Layout
import AppShell from '../components/layout/AppShell';

// Guards
import ProtectedRoute from '../components/common/ProtectedRoute';
import RoleGuard from '../components/common/RoleGuard';

// Loading
import LoadingSpinner from '../components/common/LoadingSpinner';

// Auth pages (eager-loaded — needed immediately)
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Error pages (small, eager-loaded)
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

// Lazy-loaded dashboard components
const DashboardRouter = lazy(() => import('../pages/dashboard/DashboardRouter'));

// Lazy-loaded module pages
const InventoryModule = lazy(() => import('../pages/modules/InventoryModule'));
const SalesModule     = lazy(() => import('../pages/modules/SalesModule'));
const FinanceModule   = lazy(() => import('../pages/modules/FinanceModule'));
const ServiceModule   = lazy(() => import('../pages/modules/ServiceModule'));
const UsersModule     = lazy(() => import('../pages/modules/UsersModule'));
const ReportsModule   = lazy(() => import('../pages/modules/ReportsModule'));
const CustomerModule  = lazy(() => import('../pages/modules/CustomerModule'));
const SettingsModule  = lazy(() => import('../pages/modules/SettingsModule'));

// ── App Routes ────────────────────────────────────────────────
export default function AppRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public: root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public: auth pages */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected: all authenticated routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>

            {/* Dashboard — role-specific routing handled inside DashboardRouter */}
            <Route
              path="/dashboard"
              element={<DashboardRouter />}
            />

            {/* Inventory */}
            <Route
              path="/inventory/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/inventory']}>
                  <InventoryModule />
                </RoleGuard>
              }
            />

            {/* Sales */}
            <Route
              path="/sales/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/sales']}>
                  <SalesModule />
                </RoleGuard>
              }
            />

            {/* Finance */}
            <Route
              path="/finance/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/finance']}>
                  <FinanceModule />
                </RoleGuard>
              }
            />

            {/* Service */}
            <Route
              path="/service/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/service']}>
                  <ServiceModule />
                </RoleGuard>
              }
            />

            {/* Users (ADMIN only) */}
            <Route
              path="/users/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/users']}>
                  <UsersModule />
                </RoleGuard>
              }
            />

            {/* Reports */}
            <Route
              path="/reports/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/reports']}>
                  <ReportsModule />
                </RoleGuard>
              }
            />

            {/* Customer portal */}
            <Route
              path="/customer/*"
              element={
                <RoleGuard roles={ROUTE_PERMISSIONS['/customer']}>
                  <CustomerModule />
                </RoleGuard>
              }
            />

            {/* Settings (ADMIN only) */}
            <Route
              path="/settings"
              element={
                <RoleGuard roles={[ROLES.ADMIN]}>
                  <SettingsModule />
                </RoleGuard>
              }
            />

          </Route>
        </Route>

        {/* Error pages */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*"             element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
