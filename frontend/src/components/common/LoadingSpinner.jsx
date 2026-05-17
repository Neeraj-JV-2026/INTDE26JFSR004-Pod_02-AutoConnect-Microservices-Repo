import React from 'react';

/**
 * LoadingSpinner
 *
 * Full-screen loading overlay with gold spinner and AutoConnect branding.
 * Used for initial auth check and Suspense fallback.
 *
 * Props:
 *   message  {string}   - Optional message below brand text
 *   inline   {boolean}  - If true, renders a smaller inline version (no overlay)
 */
export default function LoadingSpinner({ message, inline = false }) {
  if (inline) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '1rem 0',
          color: '#D4AF37',
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            border: '2px solid rgba(212,175,55,0.2)',
            borderTopColor: '#D4AF37',
            borderRadius: '50%',
            animation: 'acSpin 0.8s linear infinite',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '0.875rem', color: '#9E9E9E' }}>
          {message || 'Loading...'}
        </span>
      </div>
    );
  }

  return (
    <div className="ac-spinner-overlay" role="status" aria-live="polite" aria-label="Loading">
      {/* Gold spinner ring */}
      <div className="ac-spinner" aria-hidden="true" />

      {/* Brand text */}
      <div className="ac-spinner-text">AutoConnect</div>

      {/* Optional message */}
      {message && (
        <p
          style={{
            color: '#9E9E9E',
            fontSize: '0.8125rem',
            margin: 0,
            textAlign: 'center',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}
