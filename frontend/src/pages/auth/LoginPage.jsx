import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Crown SVG ─────────────────────────────────────────────────
function CrownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 22, height: 22, fill: '#000' }}
      aria-hidden="true"
    >
      <path d="M2 19h20v2H2v-2zm0-3l4-8 6 4 6-4 4 8H2zm5.9-1.8h8.2L14 11.1l-2 1.3-2-1.3-2.1 3.1z" />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!form.password) {
      setError('Password is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(form.email.trim(), form.password);
      navigate(from, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Invalid email or password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0F0F0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorative gradient */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div
        className="ac-scale-in"
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(26,26,26,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 16,
          padding: '2.5rem 2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #D4AF37, #C9A227)',
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              boxShadow: '0 0 20px rgba(212,175,55,0.25)',
            }}
            aria-hidden="true"
          >
            <CrownIcon />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#D4AF37',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: '0 0 0.375rem',
            }}
          >
            AutoConnect
          </h1>
          <p style={{ color: '#9E9E9E', fontSize: '0.875rem', margin: 0 }}>
            Sign in to your account
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <div className="ac-alert ac-alert--error ac-fade-in" role="alert">
            <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div style={{ marginBottom: '1.125rem' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Email Address
            </label>
            <div className="ac-input-group">
              <i className="bi bi-envelope ac-input-icon" aria-hidden="true" />
              <input
                id="email"
                name="email"
                type="email"
                className="ac-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
                aria-required="true"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Password
            </label>
            <div className="ac-input-group" style={{ position: 'relative' }}>
              <i className="bi bi-lock ac-input-icon" aria-hidden="true" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="ac-input"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
                aria-required="true"
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#9E9E9E',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '1rem',
                }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="ac-btn-gold ac-btn-gold--lg"
            style={{ width: '100%', marginBottom: '1rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: '2px solid rgba(0,0,0,0.2)',
                    borderTopColor: '#000',
                    borderRadius: '50%',
                    animation: 'acSpin 0.8s linear infinite',
                    display: 'inline-block',
                  }}
                  aria-hidden="true"
                />
                Signing in...
              </>
            ) : (
              <>
                <i className="bi bi-box-arrow-in-right" aria-hidden="true" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Register link */}
        <p style={{ textAlign: 'center', color: '#9E9E9E', fontSize: '0.875rem', margin: 0 }}>
          Don't have an account?{' '}
          <Link
            to="/register"
            style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Request Access
          </Link>
        </p>
      </div>
    </div>
  );
}
