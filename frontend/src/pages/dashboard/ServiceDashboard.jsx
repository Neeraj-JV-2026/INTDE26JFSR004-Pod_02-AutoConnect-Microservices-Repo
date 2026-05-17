import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';

export default function ServiceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      icon: 'bi-calendar-check-fill',
      label: "Today's Appointments",
      value: '11',
      trend: '3 upcoming',
      trendUp: undefined,
      accentColor: '#3498DB',
    },
    {
      icon: 'bi-tools',
      label: 'Active Work Orders',
      value: '7',
      trend: '2 near completion',
      trendUp: undefined,
      accentColor: '#2ECC71',
    },
    {
      icon: 'bi-card-checklist',
      label: 'Open Job Cards',
      value: '15',
      trend: '4 awaiting parts',
      trendUp: false,
      accentColor: '#F39C12',
    },
    {
      icon: 'bi-box-seam-fill',
      label: 'Parts Requests',
      value: '9',
      trend: '3 pending approval',
      trendUp: undefined,
      accentColor: '#9B59B6',
    },
  ];

  const quickActions = [
    {
      icon: 'bi-plus-circle-fill',
      label: 'New Appointment',
      desc: 'Schedule a service appointment',
      path: '/service',
    },
    {
      icon: 'bi-wrench-adjustable-circle-fill',
      label: 'Create Work Order',
      desc: 'Open a new work order',
      path: '/service',
    },
    {
      icon: 'bi-card-checklist',
      label: 'View Job Cards',
      desc: 'Manage active job cards',
      path: '/service',
    },
    {
      icon: 'bi-box-seam',
      label: 'Parts Inventory',
      desc: 'Check parts stock levels',
      path: '/inventory',
    },
  ];

  return (
    <PageWrapper
      title="Service Operations"
      subtitle={`Hello, ${user?.fullName?.split(' ')[0] || 'Advisor'}. Here's the service bay status.`}
    >
      {/* Stats Grid */}
      <div
        className="ac-stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}
      >
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#E0E0E0',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <i className="bi bi-lightning-charge-fill" style={{ color: '#D4AF37' }} aria-hidden="true" />
          Service Actions
        </h2>
        <div
          className="ac-stagger-children"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}
        >
          {quickActions.map((action) => (
            <div
              key={action.label}
              className="ac-quick-action-card"
              onClick={() => navigate(action.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(action.path)}
              aria-label={action.label}
            >
              <div className="ac-quick-action-icon" aria-hidden="true">
                <i className={`bi ${action.icon}`} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="ac-quick-action-label">{action.label}</div>
                <div style={{ fontSize: '0.8rem', color: '#9E9E9E', marginTop: '0.125rem' }}>
                  {action.desc}
                </div>
              </div>
              <i className="bi bi-chevron-right ac-quick-action-arrow" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
