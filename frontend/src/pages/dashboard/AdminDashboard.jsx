import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      icon: 'bi-car-front-fill',
      label: 'Total Vehicles',
      value: '248',
      trend: '+6 this week',
      trendUp: true,
      accentColor: '#9B59B6',
    },
    {
      icon: 'bi-bag-check-fill',
      label: 'Active Sales',
      value: '37',
      trend: '+4 today',
      trendUp: true,
      accentColor: '#3498DB',
    },
    {
      icon: 'bi-currency-dollar',
      label: 'Revenue This Month',
      value: '$1.24M',
      trend: '+18% vs last month',
      trendUp: true,
      accentColor: '#D4AF37',
    },
    {
      icon: 'bi-calendar-check-fill',
      label: 'Appointments Today',
      value: '14',
      trend: '3 pending',
      trendUp: undefined,
      accentColor: '#2ECC71',
    },
    {
      icon: 'bi-receipt',
      label: 'Open Invoices',
      value: '62',
      trend: '8 overdue',
      trendUp: false,
      accentColor: '#F39C12',
    },
    {
      icon: 'bi-people-fill',
      label: 'Registered Users',
      value: '193',
      trend: '+12 this month',
      trendUp: true,
      accentColor: '#1ABC9C',
    },
  ];

  const quickActions = [
    {
      icon: 'bi-car-front-fill',
      label: 'Manage Inventory',
      desc: 'View and update vehicle listings',
      path: '/inventory',
    },
    {
      icon: 'bi-bag-check-fill',
      label: 'View Sales Pipeline',
      desc: 'Deals, quotes and commissions',
      path: '/sales',
    },
    {
      icon: 'bi-people-fill',
      label: 'User Management',
      desc: 'Manage staff accounts and roles',
      path: '/users',
    },
    {
      icon: 'bi-bar-chart-fill',
      label: 'Reports & Analytics',
      desc: 'Financial and operational reports',
      path: '/reports',
    },
  ];

  return (
    <PageWrapper
      title={`Welcome back, ${user?.fullName?.split(' ')[0] || 'Admin'}`}
      subtitle="Here's what's happening across AutoConnect today."
    >
      {/* Stats Grid */}
      <div className="ac-stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '0.875rem' }}>
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
          Quick Actions
        </h2>
        <div
          className="ac-stagger-children"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}
        >
          {quickActions.map((action) => (
            <div
              key={action.path}
              className="ac-quick-action-card"
              onClick={() => navigate(action.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(action.path)}
              aria-label={`Go to ${action.label}`}
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
