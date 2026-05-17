import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { ROLE_NAV_ITEMS, ROLE_BADGE_CLASS, ROLE_LABELS } from '../../routes/roleConfig';

// ── Crown SVG Icon ────────────────────────────────────────────
function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2 19h20v2H2v-2zm0-3l4-8 6 4 6-4 4 8H2zm5.9-1.8h8.2L14 11.1l-2 1.3-2-1.3-2.1 3.1z" />
    </svg>
  );
}

// ── User Initials ─────────────────────────────────────────────
function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// ── Group nav items by section ────────────────────────────────
function groupNavItems(items) {
  const sections = [];
  const seen = new Map();

  items.forEach((item) => {
    const section = item.section || 'General';
    if (!seen.has(section)) {
      seen.set(section, []);
      sections.push({ section, items: seen.get(section) });
    }
    seen.get(section).push(item);
  });

  return sections;
}

// ── Sidebar Component ─────────────────────────────────────────
export default function Sidebar() {
  const { user, logout } = useAuth();
  const { sidebarCollapsed, sidebarMobileOpen, toggleSidebar } = useUI();
  const navigate = useNavigate();

  const navItems = useMemo(() => {
    if (!user?.role) return [];
    return ROLE_NAV_ITEMS[user.role] || [];
  }, [user?.role]);

  const groupedNav = useMemo(() => groupNavItems(navItems), [navItems]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const sidebarClass = [
    'ac-sidebar',
    sidebarCollapsed ? 'collapsed' : '',
    sidebarMobileOpen ? 'mobile-open' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const roleBadgeClass = user?.role ? ROLE_BADGE_CLASS[user.role] : '';
  const roleLabel = user?.role ? ROLE_LABELS[user.role] : '';

  return (
    <aside className={sidebarClass} aria-label="Main navigation">
      {/* Logo */}
      <NavLink to="/dashboard" className="ac-sidebar-logo" aria-label="AutoConnect Home">
        <div className="ac-sidebar-logo-icon" aria-hidden="true">
          <CrownIcon />
        </div>
        <span className="ac-sidebar-logo-text">AutoConnect</span>
      </NavLink>

      {/* Navigation */}
      <nav className="ac-sidebar-nav" aria-label="Application menu">
        {groupedNav.map(({ section, items }) => (
          <div className="ac-sidebar-section" key={section}>
            <div className="ac-sidebar-section-title">{section}</div>
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  ['ac-sidebar-nav-item', isActive ? 'active' : ''].filter(Boolean).join(' ')
                }
                title={sidebarCollapsed ? item.label : undefined}
                aria-label={item.label}
              >
                <i className={`bi ${item.icon} ac-sidebar-nav-icon`} aria-hidden="true" />
                <span className="ac-sidebar-nav-label">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Collapse toggle (desktop) */}
      <button
        className="ac-sidebar-collapse-btn"
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <i
          className={`bi ${sidebarCollapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}
          aria-hidden="true"
        />
      </button>

      {/* Footer — user info + logout */}
      <div className="ac-sidebar-footer">
        <div className="ac-sidebar-avatar" aria-hidden="true">
          {getInitials(user?.fullName || user?.email)}
        </div>

        <div className="ac-sidebar-user-info">
          <div className="ac-sidebar-user-name" title={user?.fullName || user?.email}>
            {user?.fullName || user?.email || 'User'}
          </div>
          <div className="ac-sidebar-user-role">
            <span className={`ac-badge-role ${roleBadgeClass}`}>{roleLabel}</span>
          </div>
        </div>

        <button
          className="ac-sidebar-logout-btn"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <i className="bi bi-box-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
