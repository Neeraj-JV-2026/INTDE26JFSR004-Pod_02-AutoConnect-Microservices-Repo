import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../../api/authApi';

const REGISTERABLE_ROLES = [
  { value: 'SALES_CONSULTANT',  label: 'Sales Consultant' },
  { value: 'FINANCE_OFFICER',   label: 'Finance Officer' },
  { value: 'SERVICE_ADVISOR',   label: 'Service Advisor' },
  { value: 'INVENTORY_MANAGER', label: 'Inventory Manager' },
  { value: 'PARTS_MANAGER',     label: 'Parts Manager' },
];

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

const INITIAL_FORM = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  role: '',
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!form.email.trim()) newErrors.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!form.role) newErrors.role = 'Please select a role.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');

    try {
      await authApi.register({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      });
      setSuccess(true);
      // Redirect to login after 2.5s
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Registration failed. Please try again.';
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...(errors[field] ? { borderColor: '#E74C3C', boxShadow: '0 0 0 3px rgba(231,76,60,0.15)' } : {}),
  });

  if (success) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0F0F0F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}
      >
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
            padding: '3rem 2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              background: 'rgba(46,204,113,0.12)',
              border: '2px solid rgba(46,204,113,0.3)',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#2ECC71',
              marginBottom: '1.25rem',
            }}
            aria-hidden="true"
          >
            <i className="bi bi-check-lg" />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#E0E0E0', marginBottom: '0.75rem' }}>
            Registration Successful
          </h2>
          <p style={{ color: '#9E9E9E', fontSize: '0.9rem' }}>
            Your account has been created. Redirecting to sign in…
          </p>
        </div>
      </div>
    );
  }

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
      {/* Background decorative gradients */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Register Card */}
      <div
        className="ac-scale-in"
        style={{
          width: '100%',
          maxWidth: 460,
          background: 'rgba(26,26,26,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 16,
          padding: '2.25rem 2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: 'linear-gradient(135deg, #D4AF37, #C9A227)',
              borderRadius: 10,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.875rem',
              boxShadow: '0 0 20px rgba(212,175,55,0.25)',
            }}
            aria-hidden="true"
          >
            <CrownIcon />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#D4AF37',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              margin: '0 0 0.25rem',
            }}
          >
            AutoConnect
          </h1>
          <p style={{ color: '#9E9E9E', fontSize: '0.875rem', margin: 0 }}>
            Create your staff account
          </p>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="ac-alert ac-alert--error ac-fade-in" role="alert">
            <i className="bi bi-exclamation-circle-fill" aria-hidden="true" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="fullName" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Full Name <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <div className="ac-input-group">
              <i className="bi bi-person ac-input-icon" aria-hidden="true" />
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="ac-input"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                disabled={loading}
                style={inputStyle('fullName')}
                aria-describedby={errors.fullName ? 'err-fullName' : undefined}
              />
            </div>
            {errors.fullName && (
              <p id="err-fullName" style={{ color: '#E74C3C', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Email */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="reg-email" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Email Address <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <div className="ac-input-group">
              <i className="bi bi-envelope ac-input-icon" aria-hidden="true" />
              <input
                id="reg-email"
                name="email"
                type="email"
                className="ac-input"
                placeholder="you@company.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
                style={inputStyle('email')}
                aria-describedby={errors.email ? 'err-email' : undefined}
              />
            </div>
            {errors.email && (
              <p id="err-email" style={{ color: '#E74C3C', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="phone" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Phone Number <span style={{ color: '#5A5A5A' }}>(optional)</span>
            </label>
            <div className="ac-input-group">
              <i className="bi bi-telephone ac-input-icon" aria-hidden="true" />
              <input
                id="phone"
                name="phone"
                type="tel"
                className="ac-input"
                placeholder="+1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
                disabled={loading}
              />
            </div>
          </div>

          {/* Role */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="role" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Role <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <i
                className="bi bi-briefcase"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: '1rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#5A5A5A',
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              />
              <select
                id="role"
                name="role"
                className="ac-input"
                value={form.role}
                onChange={handleChange}
                disabled={loading}
                style={{
                  paddingLeft: '2.75rem',
                  appearance: 'none',
                  ...inputStyle('role'),
                }}
                aria-describedby={errors.role ? 'err-role' : undefined}
              >
                <option value="" disabled>Select your role</option>
                {REGISTERABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            {errors.role && (
              <p id="err-role" style={{ color: '#E74C3C', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                {errors.role}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="reg-password" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Password <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <div className="ac-input-group" style={{ position: 'relative' }}>
              <i className="bi bi-lock ac-input-icon" aria-hidden="true" />
              <input
                id="reg-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="ac-input"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                style={{ paddingRight: '2.75rem', ...inputStyle('password') }}
                aria-describedby={errors.password ? 'err-password' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9E9E9E', cursor: 'pointer', padding: 0, fontSize: '1rem' }}
              >
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
              </button>
            </div>
            {errors.password && (
              <p id="err-password" style={{ color: '#E74C3C', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8125rem', fontWeight: 500, color: '#9E9E9E' }}>
              Confirm Password <span style={{ color: '#E74C3C' }}>*</span>
            </label>
            <div className="ac-input-group" style={{ position: 'relative' }}>
              <i className="bi bi-lock-fill ac-input-icon" aria-hidden="true" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                className="ac-input"
                placeholder="Repeat password"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                disabled={loading}
                style={{ paddingRight: '2.75rem', ...inputStyle('confirmPassword') }}
                aria-describedby={errors.confirmPassword ? 'err-confirm' : undefined}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9E9E9E', cursor: 'pointer', padding: 0, fontSize: '1rem' }}
              >
                <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" />
              </button>
            </div>
            {errors.confirmPassword && (
              <p id="err-confirm" style={{ color: '#E74C3C', fontSize: '0.75rem', margin: '0.25rem 0 0' }}>
                {errors.confirmPassword}
              </p>
            )}
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
                Creating Account...
              </>
            ) : (
              <>
                <i className="bi bi-person-plus-fill" aria-hidden="true" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Login link */}
        <p style={{ textAlign: 'center', color: '#9E9E9E', fontSize: '0.875rem', margin: 0 }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={(e) => (e.target.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.target.style.textDecoration = 'none')}
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
