// ============================================================
// AutoConnect — Role Configuration & Navigation Map
// ============================================================

// ── All Roles (exact strings from backend @PreAuthorize) ──────
export const ROLES = {
  ADMIN:             'ADMIN',
  SALES_MANAGER:     'SALES_MANAGER',
  SALES_AGENT:       'SALES_AGENT',
  SALES_CONSULTANT:  'SALES_CONSULTANT',
  FINANCE_OFFICER:   'FINANCE_OFFICER',
  SERVICE_ADVISOR:   'SERVICE_ADVISOR',
  INVENTORY_MANAGER: 'INVENTORY_MANAGER',
  PARTS_MANAGER:     'PARTS_MANAGER',
  AUDITOR:           'AUDITOR',
  CUSTOMER:          'CUSTOMER',
};

// ── Role Groups ───────────────────────────────────────────────
export const ROLE_GROUPS = {
  ALL_STAFF: [
    ROLES.ADMIN,
    ROLES.SALES_MANAGER,
    ROLES.SALES_AGENT,
    ROLES.SALES_CONSULTANT,
    ROLES.FINANCE_OFFICER,
    ROLES.SERVICE_ADVISOR,
    ROLES.INVENTORY_MANAGER,
    ROLES.PARTS_MANAGER,
    ROLES.AUDITOR,
  ],
  ALL: Object.values(ROLES),
  SALES: [ROLES.SALES_MANAGER, ROLES.SALES_AGENT, ROLES.SALES_CONSULTANT],
  SALES_AND_ADMIN: [ROLES.ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_AGENT, ROLES.SALES_CONSULTANT],
  FINANCE: [ROLES.FINANCE_OFFICER],
  FINANCE_AND_ADMIN: [ROLES.ADMIN, ROLES.FINANCE_OFFICER],
  SERVICE: [ROLES.SERVICE_ADVISOR],
  SERVICE_AND_ADMIN: [ROLES.ADMIN, ROLES.SERVICE_ADVISOR],
  INVENTORY: [ROLES.INVENTORY_MANAGER, ROLES.PARTS_MANAGER],
  INVENTORY_AND_ADMIN: [ROLES.ADMIN, ROLES.INVENTORY_MANAGER, ROLES.PARTS_MANAGER],
  MANAGEMENT: [ROLES.ADMIN, ROLES.SALES_MANAGER],
  REPORTING: [ROLES.ADMIN, ROLES.AUDITOR, ROLES.FINANCE_OFFICER, ROLES.SALES_MANAGER],
};

// ── Route Permissions ─────────────────────────────────────────
export const ROUTE_PERMISSIONS = {
  '/dashboard':  ROLE_GROUPS.ALL,
  '/inventory':  [...ROLE_GROUPS.INVENTORY_AND_ADMIN, ROLES.SALES_MANAGER, ROLES.SALES_AGENT, ROLES.SALES_CONSULTANT, ROLES.SERVICE_ADVISOR],
  '/sales':      ROLE_GROUPS.SALES_AND_ADMIN,
  '/finance':    [...ROLE_GROUPS.FINANCE_AND_ADMIN, ROLES.AUDITOR],
  '/service':    [...ROLE_GROUPS.SERVICE_AND_ADMIN, ROLES.PARTS_MANAGER],
  '/users':      [ROLES.ADMIN],
  '/reports':    ROLE_GROUPS.REPORTING,
  '/customer':   [ROLES.CUSTOMER],
  '/settings':   [ROLES.ADMIN],
};

// ── Role Display Colors ───────────────────────────────────────
export const ROLE_COLORS = {
  [ROLES.ADMIN]:             '#E74C3C',
  [ROLES.SALES_MANAGER]:     '#3498DB',
  [ROLES.SALES_AGENT]:       '#5DADE2',
  [ROLES.SALES_CONSULTANT]:  '#7FB3D3',
  [ROLES.FINANCE_OFFICER]:   '#D4AF37',
  [ROLES.SERVICE_ADVISOR]:   '#2ECC71',
  [ROLES.INVENTORY_MANAGER]: '#9B59B6',
  [ROLES.PARTS_MANAGER]:     '#F39C12',
  [ROLES.AUDITOR]:           '#95A5A6',
  [ROLES.CUSTOMER]:          '#1ABC9C',
};

// ── Role CSS Modifier Classes ─────────────────────────────────
export const ROLE_BADGE_CLASS = {
  [ROLES.ADMIN]:             'ac-badge-role--admin',
  [ROLES.SALES_MANAGER]:     'ac-badge-role--sales-manager',
  [ROLES.SALES_AGENT]:       'ac-badge-role--sales-agent',
  [ROLES.SALES_CONSULTANT]:  'ac-badge-role--sales-consultant',
  [ROLES.FINANCE_OFFICER]:   'ac-badge-role--finance',
  [ROLES.SERVICE_ADVISOR]:   'ac-badge-role--service',
  [ROLES.INVENTORY_MANAGER]: 'ac-badge-role--inventory',
  [ROLES.PARTS_MANAGER]:     'ac-badge-role--parts',
  [ROLES.AUDITOR]:           'ac-badge-role--auditor',
  [ROLES.CUSTOMER]:          'ac-badge-role--customer',
};

// ── Role Display Labels ───────────────────────────────────────
export const ROLE_LABELS = {
  [ROLES.ADMIN]:             'Administrator',
  [ROLES.SALES_MANAGER]:     'Sales Manager',
  [ROLES.SALES_AGENT]:       'Sales Agent',
  [ROLES.SALES_CONSULTANT]:  'Sales Consultant',
  [ROLES.FINANCE_OFFICER]:   'Finance Officer',
  [ROLES.SERVICE_ADVISOR]:   'Service Advisor',
  [ROLES.INVENTORY_MANAGER]: 'Inventory Manager',
  [ROLES.PARTS_MANAGER]:     'Parts Manager',
  [ROLES.AUDITOR]:           'Auditor',
  [ROLES.CUSTOMER]:          'Customer',
};

// ── Navigation Items per Role ─────────────────────────────────
// Each item: { path, icon, label, section }
// Items with the same `section` are grouped under a section header in the sidebar.

const NAV_DASHBOARD = { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard', section: 'Overview' };

const NAV_INVENTORY  = { path: '/inventory',  icon: 'bi-car-front-fill',  label: 'Inventory',  section: 'Operations' };
const NAV_SALES      = { path: '/sales',      icon: 'bi-bag-check-fill',  label: 'Sales',      section: 'Operations' };
const NAV_FINANCE    = { path: '/finance',    icon: 'bi-currency-dollar', label: 'Finance',    section: 'Operations' };
const NAV_SERVICE    = { path: '/service',    icon: 'bi-tools',           label: 'Service',    section: 'Operations' };
const NAV_REPORTS    = { path: '/reports',    icon: 'bi-bar-chart-fill',  label: 'Reports',    section: 'Analytics' };
const NAV_USERS      = { path: '/users',      icon: 'bi-people-fill',     label: 'Users',      section: 'Administration' };
const NAV_SETTINGS   = { path: '/settings',   icon: 'bi-gear-fill',       label: 'Settings',   section: 'Administration' };
const NAV_CUSTOMER   = { path: '/customer',   icon: 'bi-person-circle',   label: 'My Account', section: 'Overview' };

export const ROLE_NAV_ITEMS = {
  [ROLES.ADMIN]: [
    NAV_DASHBOARD,
    NAV_INVENTORY,
    NAV_SALES,
    NAV_FINANCE,
    NAV_SERVICE,
    NAV_REPORTS,
    NAV_USERS,
    NAV_SETTINGS,
  ],

  [ROLES.SALES_MANAGER]: [
    NAV_DASHBOARD,
    NAV_INVENTORY,
    NAV_SALES,
    NAV_REPORTS,
  ],

  [ROLES.SALES_AGENT]: [
    NAV_DASHBOARD,
    { path: '/inventory', icon: 'bi-car-front-fill', label: 'Vehicle Listings', section: 'Operations' },
    NAV_SALES,
  ],

  [ROLES.SALES_CONSULTANT]: [
    NAV_DASHBOARD,
    { path: '/inventory', icon: 'bi-car-front-fill', label: 'Vehicle Listings', section: 'Operations' },
    NAV_SALES,
  ],

  [ROLES.FINANCE_OFFICER]: [
    NAV_DASHBOARD,
    NAV_FINANCE,
    NAV_REPORTS,
  ],

  [ROLES.SERVICE_ADVISOR]: [
    NAV_DASHBOARD,
    NAV_SERVICE,
    { path: '/inventory', icon: 'bi-box-seam', label: 'Parts & Stock', section: 'Operations' },
  ],

  [ROLES.INVENTORY_MANAGER]: [
    NAV_DASHBOARD,
    NAV_INVENTORY,
    { path: '/reports', icon: 'bi-bar-chart-fill', label: 'Inventory Reports', section: 'Analytics' },
  ],

  [ROLES.PARTS_MANAGER]: [
    NAV_DASHBOARD,
    { path: '/inventory', icon: 'bi-box-seam', label: 'Parts Inventory', section: 'Operations' },
    NAV_SERVICE,
  ],

  [ROLES.AUDITOR]: [
    NAV_DASHBOARD,
    NAV_REPORTS,
    NAV_FINANCE,
  ],

  [ROLES.CUSTOMER]: [
    NAV_DASHBOARD,
    NAV_CUSTOMER,
    { path: '/service', icon: 'bi-calendar-check', label: 'My Appointments', section: 'Overview' },
  ],
};
