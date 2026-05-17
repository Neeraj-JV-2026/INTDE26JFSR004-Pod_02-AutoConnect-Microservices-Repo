import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { ROLE_LABELS, ROLE_BADGE_CLASS } from '../../routes/roleConfig';

// ── Page title map from pathname ──────────────────────────────
const PAGE_TITLES = {
  '/dashboard':  'Dashboard',
  '/inventory':  'Inventory',
  '/sales':      'Sales',
  '/finance':    'Finance',
  '/service':    'Service Management',
  '/users':      'User Management',
  '/reports':    'Reports & Analytics',
  '/customer':   'My Account',
  '/settings':   'Settings',
};

function getPageTitle(pathname) {
  const base = '/' + pathname.split('/').filter(Boolean)[0];
  return PAGE_TITLES[base] || 'AutoConnect';
}

// ── User initials ─────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// ── TopBar Component ──────────────────────────────────────────
export default function TopBar() {
  const { user, logout } = useAuth();
  const { toggleSidebar, toggleMobileSidebar } = useUI();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifCount] = useState(3); // placeholder notification count
  const dropdownRef = useRef(null);

  const pageTitle = getPageTitle(location.pathname);
  const roleBadgeClass = user?.role ? ROLE_BADGE_CLASS[user.role] : '';
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : '';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/settings');
  };

  // Toggle sidebar: mobile vs desktop
  const handleHamburger = () => {
    if (window.innerWidth < 768) {
      toggleMobileSidebar();
    } else {
      toggleSidebar();
    }
  };

  return (
    <header className="ac-topbar">
      {/* Left section */}
      <div className="ac-topbar-left">
        {/* Hamburger */}
        <button
          className="ac-hamburger"
          onClick={handleHamburger}
          aria-label="Toggle navigation"
          aria-expanded={undefined}
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>

        {/* Page title / breadcrumb */}
        <div className="ac-topbar-breadcrumb">
          <span className="ac-topbar-page-title">{pageTitle}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="ac-topbar-right">
        {/* Notification Bell */}
        <button
          className="ac-notif-btn"
          aria-label={`${notifCount} notifications`}
          title="Notifications"
        >
          <i className="bi bi-bell" aria-hidden="true" />
          {notifCount > 0 && (
            <span className="ac-notif-badge" aria-hidden="true">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <div className="ac-user-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="dropdown-toggle"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            {/* Avatar */}
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: '#D4AF37',
                flexShrink: 0,
                textTransform: 'uppercase',
                border: '1.5px solid rgba(212,175,55,0.2)',
              }}
              aria-hidden="true"
            >
              {getInitials(user?.fullName || user?.email)}
            </div>

            {/* Name + role (hidden on small screens) */}
            <div
              className="d-none d-sm-flex flex-column align-items-start"
              style={{ lineHeight: 1.2 }}
            >
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E0E0E0', whiteSpace: 'nowrap' }}>
                {user?.fullName?.split(' ')[0] || 'User'}
              </span>
              <span className={`ac-badge-role ${roleBadgeClass}`} style={{ fontSize: '0.62rem' }}>
                {roleLabel}
              </span>
            </div>

            <i className="bi bi-chevron-down d-none d-sm-block" style={{ fontSize: '0.7rem', color: '#9E9E9E' }} aria-hidden="true" />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div
              className="dropdown-menu show ac-slide-down"
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                zIndex: 1000,
              }}
              role="menu"
            >
              {/* User info header */}
              <div style={{ padding: '0.625rem 0.875rem 0.5rem', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#E0E0E0' }}>
                  {user?.fullName || 'User'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#9E9E9E' }}>{user?.email}</div>
              </div>

              <button
                className="dropdown-item"
                onClick={handleProfile}
                role="menuitem"
              >
                <i className="bi bi-person" aria-hidden="true" />
                Profile & Settings
              </button>

              <div className="dropdown-divider" role="separator" />

              <button
                className="dropdown-item text-danger"
                onClick={handleLogout}
                role="menuitem"
              >
                <i className="bi bi-box-arrow-right" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
