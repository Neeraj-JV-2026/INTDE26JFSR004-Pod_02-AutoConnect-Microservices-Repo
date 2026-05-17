import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import PageWrapper from '../../components/layout/PageWrapper';

function PlaceholderCard({ icon, title, desc, action, actionLabel, accentColor = '#D4AF37' }) {
  const navigate = useNavigate();
  return (
    <div
      className="ac-card"
      style={{ height: '100%' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: `${accentColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            color: accentColor,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <i className={`bi ${icon}`} />
        </div>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 600, color: '#E0E0E0', margin: 0 }}>
          {title}
        </h3>
      </div>
      <p style={{ color: '#9E9E9E', fontSize: '0.875rem', lineHeight: 1.6, margin: '0 0 1rem' }}>
        {desc}
      </p>
      {action && (
        <button
          className="ac-btn-gold ac-btn-gold--sm"
          onClick={() => navigate(action)}
          style={{ marginTop: 'auto' }}
        >
          {actionLabel || 'View'}
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export default function CustomerDashboard() {
  const { user } = useAuth();

  const firstName = user?.fullName?.split(' ')[0] || user?.email || 'there';

  return (
    <PageWrapper>
      {/* Welcome Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, rgba(212,175,55,0.02) 100%)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 16,
          padding: '2rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.05))',
            border: '2px solid rgba(212,175,55,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#D4AF37',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {firstName.substring(0, 2).toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
              fontWeight: 700,
              color: '#E0E0E0',
              margin: '0 0 0.375rem',
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p style={{ color: '#9E9E9E', margin: 0, fontSize: '0.9rem' }}>
            Manage your vehicles, appointments, and service history from your personal portal.
          </p>
        </div>

        <div
          aria-hidden="true"
          style={{
            fontSize: '3.5rem',
            opacity: 0.12,
          }}
        >
          🚗
        </div>
      </div>

      {/* Portal Cards */}
      <div
        className="ac-stagger-children"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}
      >
        <PlaceholderCard
          icon="bi-car-front-fill"
          title="My Vehicles"
          desc="View your registered vehicles, check ownership details, and browse your purchase history."
          action="/customer"
          actionLabel="View Vehicles"
          accentColor="#9B59B6"
        />
        <PlaceholderCard
          icon="bi-calendar-check-fill"
          title="Upcoming Appointment"
          desc="You have no upcoming service appointments. Book one to keep your vehicle in top condition."
          action="/service"
          actionLabel="Book Appointment"
          accentColor="#2ECC71"
        />
        <PlaceholderCard
          icon="bi-clock-history"
          title="Recent Service"
          desc="Your most recent service was completed successfully. View the full service history and job cards."
          action="/customer"
          actionLabel="View History"
          accentColor="#3498DB"
        />
      </div>
    </PageWrapper>
  );
}
