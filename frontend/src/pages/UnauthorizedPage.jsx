import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(231,76,60,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="ac-scale-in"
        style={{
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Lock icon */}
        <div
          className="ac-pulse-gold"
          style={{
            width: 88,
            height: 88,
            borderRadius: '50%',
            background: 'rgba(212,175,55,0.08)',
            border: '2px solid rgba(212,175,55,0.2)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            color: '#D4AF37',
            marginBottom: '1.75rem',
          }}
          aria-hidden="true"
        >
          <i className="bi bi-lock-fill" />
        </div>

        {/* Error code */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '5rem',
            fontWeight: 800,
            color: 'rgba(212,175,55,0.15)',
            lineHeight: 1,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          403
        </div>

        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(1.5rem, 3vw, 2rem)',
            fontWeight: 700,
            color: '#E0E0E0',
            marginBottom: '0.875rem',
            lineHeight: 1.25,
          }}
        >
          Access Denied
        </h1>

        <p
          style={{
            color: '#9E9E9E',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: 360,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          You don't have permission to access this page. Please contact your administrator
          if you believe this is a mistake.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated && (
            <button
              className="ac-btn-gold"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house-fill" aria-hidden="true" />
              Back to Dashboard
            </button>
          )}

          <button
            className="ac-btn-gold ac-btn-gold--outline"
            onClick={() => navigate(-1)}
          >
            <i className="bi bi-arrow-left" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
