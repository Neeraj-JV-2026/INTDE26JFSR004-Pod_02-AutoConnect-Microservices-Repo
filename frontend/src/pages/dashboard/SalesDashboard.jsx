import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';
import StatCard from '../../components/common/StatCard';

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    {
      icon: 'bi-bag-check-fill',
      label: 'Active Deals',
      value: '12',
      trend: '+3 this week',
      trendUp: true,
      accentColor: '#3498DB',
    },
    {
      icon: 'bi-file-earmark-text-fill',
      label: 'Pending Quotes',
      value: '8',
      trend: '2 awaiting approval',
      trendUp: undefined,
      accentColor: '#F39C12',
    },
    {
      icon: 'bi-car-front-fill',
      label: 'Test Drives Today',
      value: '5',
      trend: '2 completed',
      trendUp: undefined,
      accentColor: '#2ECC71',
    },
    {
      icon: 'bi-currency-dollar',
      label: 'Commission Earned',
      value: '$4,820',
      trend: '+$620 this week',
      trendUp: true,
      accentColor: '#D4AF37',
    },
  ];

  const quickActions = [
    {
      icon: 'bi-plus-circle-fill',
      label: 'Create New Deal',
      desc: 'Start a new vehicle sale',
      path: '/sales',
    },
    {
      icon: 'bi-file-earmark-plus-fill',
      label: 'Generate Quote',
      desc: 'Prepare a customer quote',
      path: '/sales',
    },
    {
      icon: 'bi-car-front-fill',
      label: 'Browse Inventory',
      desc: 'Find available vehicles',
      path: '/inventory',
    },
    {
      icon: 'bi-calendar-plus-fill',
      label: 'Schedule Test Drive',
      desc: 'Book a test drive appointment',
      path: '/sales',
    },
  ];

  return (
    <PageWrapper
      title={`Good day, ${user?.fullName?.split(' ')[0] || 'Agent'}`}
      subtitle="Your sales performance and active pipeline at a glance."
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
          Sales Actions
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
