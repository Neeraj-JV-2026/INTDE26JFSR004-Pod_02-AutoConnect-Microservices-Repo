import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useUI } from '../../context/UIContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell() {
  const { sidebarCollapsed, sidebarMobileOpen, closeMobileSidebar } = useUI();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  return (
    <div className="ac-app-shell">
      {/* Mobile overlay — click to close sidebar */}
      {sidebarMobileOpen && (
        <div
          className="ac-sidebar-overlay visible"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="ac-main-area">
        <TopBar />
        <main className="ac-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
