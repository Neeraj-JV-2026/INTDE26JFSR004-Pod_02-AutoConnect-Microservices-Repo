import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Simple road/car ASCII art as SVG ─────────────────────────
function RoadSVG() {
  return (
    <svg
      viewBox="0 0 280 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', maxWidth: 280, opacity: 0.15 }}
      aria-hidden="true"
    >
      {/* Road */}
      <rect x="0" y="60" width="280" height="40" rx="4" fill="#D4AF37" />
      {/* Dashes */}
      <rect x="20"  y="76" width="30" height="8" rx="4" fill="#0F0F0F" />
      <rect x="70"  y="76" width="30" height="8" rx="4" fill="#0F0F0F" />
      <rect x="120" y="76" width="30" height="8" rx="4" fill="#0F0F0F" />
      <rect x="170" y="76" width="30" height="8" rx="4" fill="#0F0F0F" />
      <rect x="220" y="76" width="30" height="8" rx="4" fill="#0F0F0F" />
      {/* Car body */}
      <rect x="90" y="28" width="100" height="34" rx="6" fill="#D4AF37" />
      {/* Car roof */}
      <rect x="110" y="10" width="60" height="20" rx="6" fill="#D4AF37" />
      {/* Wheels */}
      <circle cx="110" cy="62" r="10" fill="#141414" stroke="#D4AF37" strokeWidth="3" />
      <circle cx="170" cy="62" r="10" fill="#141414" stroke="#D4AF37" strokeWidth="3" />
      {/* Windows */}
      <rect x="113" y="13" width="24" height="14" rx="3" fill="rgba(15,15,15,0.5)" />
      <rect x="141" y="13" width="24" height="14" rx="3" fill="rgba(15,15,15,0.5)" />
      {/* Headlight */}
      <rect x="186" y="38" width="8" height="8" rx="2" fill="#F0D060" />
    </svg>
  );
}

export default function NotFoundPage() {
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
      {/* Background gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="ac-scale-in"
        style={{
          maxWidth: 520,
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Road illustration */}
        <div style={{ marginBottom: '0.5rem' }}>
          <RoadSVG />
        </div>

        {/* 404 number */}
        <div
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(5rem, 15vw, 8rem)',
            fontWeight: 800,
            color: 'rgba(212,175,55,0.12)',
            lineHeight: 1,
            marginBottom: '0.25rem',
            letterSpacing: '-0.02em',
            userSelect: 'none',
          }}
          aria-hidden="true"
        >
          404
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
          Page Not Found
        </h1>

        <p
          style={{
            color: '#9E9E9E',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            marginBottom: '2rem',
            maxWidth: 380,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          Looks like you've taken a wrong turn. The page you're looking for doesn't exist
          or may have been moved.
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {isAuthenticated ? (
            <button
              className="ac-btn-gold"
              onClick={() => navigate('/dashboard')}
            >
              <i className="bi bi-house-fill" aria-hidden="true" />
              Back to Dashboard
            </button>
          ) : (
            <button
              className="ac-btn-gold"
              onClick={() => navigate('/login')}
            >
              <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
              Sign In
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
