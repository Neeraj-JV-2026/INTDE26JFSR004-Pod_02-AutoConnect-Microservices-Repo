import React, { lazy, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../routes/roleConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// Lazy load each dashboard to keep bundle size down
const AdminDashboard    = lazy(() => import('./AdminDashboard'));
const SalesDashboard    = lazy(() => import('./SalesDashboard'));
const FinanceDashboard  = lazy(() => import('./FinanceDashboard'));
const ServiceDashboard  = lazy(() => import('./ServiceDashboard'));
const CustomerDashboard = lazy(() => import('./CustomerDashboard'));

// Generic dashboard for roles that don't have a specialized one
function GenericDashboard({ role }) {
  return (
    <div className="ac-page-wrapper ac-fade-in-up">
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div
          style={{
            width: 64,
            height: 64,
            background: 'rgba(212,175,55,0.1)',
            border: '1.5px solid rgba(212,175,55,0.2)',
            borderRadius: '50%',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            color: '#D4AF37',
            marginBottom: '1.25rem',
          }}
          aria-hidden="true"
        >
          <i className="bi bi-speedometer2" />
        </div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#E0E0E0',
            marginBottom: '0.625rem',
          }}
        >
          Dashboard
        </h2>
        <p style={{ color: '#9E9E9E', fontSize: '0.9rem' }}>
          Welcome to AutoConnect. Use the navigation to get started.
        </p>
      </div>
    </div>
  );
}

/**
 * DashboardRouter
 *
 * Switches on user.role to render the appropriate dashboard.
 * This keeps each dashboard in its own chunk and avoids
 * a giant switch in AppRoutes.
 */
export default function DashboardRouter() {
  const { user } = useAuth();

  const renderDashboard = () => {
    switch (user?.role) {
      case ROLES.ADMIN:
        return <AdminDashboard />;

      case ROLES.SALES_MANAGER:
      case ROLES.SALES_AGENT:
      case ROLES.SALES_CONSULTANT:
        return <SalesDashboard />;

      case ROLES.FINANCE_OFFICER:
        return <FinanceDashboard />;

      case ROLES.SERVICE_ADVISOR:
      case ROLES.PARTS_MANAGER:
        return <ServiceDashboard />;

      case ROLES.INVENTORY_MANAGER:
        // Inventory manager uses the generic dashboard
        // (dedicated InventoryDashboard can be added later)
        return <GenericDashboard role={user.role} />;

      case ROLES.AUDITOR:
        return <FinanceDashboard />;

      case ROLES.CUSTOMER:
        return <CustomerDashboard />;

      default:
        return <GenericDashboard role={user?.role} />;
    }
  };

  return (
    <Suspense fallback={<LoadingSpinner message="Loading dashboard…" />}>
      {renderDashboard()}
    </Suspense>
  );
}
