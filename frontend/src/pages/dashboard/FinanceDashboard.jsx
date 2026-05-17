import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';

export default function FinanceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      icon: 'bi-receipt',
      label: 'Pending Invoices',
      value: '24',
      trend: '4 due today',
      trendUp: undefined,
      accentColor: '#F39C12',
    },
    {
      icon: 'bi-credit-card-fill',
      label: 'Payments Today',
      value: '9',
      trend: '$48,200 collected',
      trendUp: true,
      accentColor: '#2ECC71',
    },
    {
      icon: 'bi-exclamation-triangle-fill',
      label: 'Overdue Invoices',
      value: '6',
      trend: 'Action required',
      trendUp: false,
      accentColor: '#E74C3C',
    },
    {
      icon: 'bi-currency-dollar',
      label: 'Total Collected',
      value: '$318K',
      trend: '+22% this month',
      trendUp: true,
      accentColor: '#D4AF37',
    },
  ];

  const quickActions = [
    {
      icon: 'bi-plus-circle-fill',
      label: 'Create Invoice',
      desc: 'Generate a new invoice',
      path: '/finance',
    },
    {
      icon: 'bi-credit-card-fill',
      label: 'Process Payment',
      desc: 'Record a payment received',
      path: '/finance',
    },
    {
      icon: 'bi-bar-chart-line-fill',
      label: 'Financial Reports',
      desc: 'View revenue and P&L reports',
      path: '/reports',
    },
    {
      icon: 'bi-clock-history',
      label: 'Overdue Follow-up',
      desc: 'Review overdue invoices',
      path: '/finance',
    },
  ];

  return (
    <PageWrapper
      title={`Finance Overview`}
      subtitle={`Welcome, ${user?.fullName?.split(' ')[0] || 'Officer'}. Here's today's financial snapshot.`}
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
          Finance Actions
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
