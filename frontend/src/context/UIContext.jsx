import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

// ── Context ──────────────────────────────────────────────────
const UIContext = createContext(null);

// ── Provider ──────────────────────────────────────────────────
export function UIProvider({ children }) {
  // Persist sidebar collapsed preference
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem('ac_sidebar_collapsed');
    return stored === 'true';
  });

  // Mobile overlay state
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  // Sync collapsed state to localStorage
  useEffect(() => {
    localStorage.setItem('ac_sidebar_collapsed', String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Close mobile sidebar on route change (handled in AppShell with useLocation)
  // or when window is resized to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /**
   * Toggle sidebar collapsed state (desktop).
   */
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  /**
   * Toggle sidebar mobile open state.
   */
  const toggleMobileSidebar = useCallback(() => {
    setSidebarMobileOpen((prev) => !prev);
  }, []);

  /**
   * Close the mobile sidebar.
   */
  const closeMobileSidebar = useCallback(() => {
    setSidebarMobileOpen(false);
  }, []);

  /**
   * Open the mobile sidebar.
   */
  const openMobileSidebar = useCallback(() => {
    setSidebarMobileOpen(true);
  }, []);

  const value = {
    sidebarCollapsed,
    sidebarMobileOpen,
    toggleSidebar,
    toggleMobileSidebar,
    closeMobileSidebar,
    openMobileSidebar,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI must be used inside a <UIProvider>');
  }
  return ctx;
}

export default UIContext;
