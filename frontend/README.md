# AutoConnect — Frontend

React 18 frontend for the AutoConnect Automotive Dealer & Service Management System.  
A microservices-based platform for managing vehicle inventory, sales pipelines, finance, and service operations.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

> Requires Node.js 18+ and npm 9+.

---

## Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```env
VITE_API_GATEWAY_URL=http://localhost:8089
```

All API calls route through the API Gateway — never directly to individual microservices.

---

## Architecture

```
src/
├── api/                  # Axios instances — one per microservice domain
│   ├── axiosConfig.js    # createApiClient() factory + auth/401 interceptors
│   ├── authApi.js
│   ├── inventoryApi.js
│   ├── salesApi.js
│   ├── financeApi.js
│   ├── serviceApi.js
│   └── userApi.js
│
├── context/
│   ├── AuthContext.jsx   # Auth state, login/logout, hasRole(), hasAnyRole()
│   └── UIContext.jsx     # Sidebar collapsed/mobile state
│
├── routes/
│   ├── roleConfig.js     # ROLES, ROLE_GROUPS, ROLE_NAV_ITEMS, ROUTE_PERMISSIONS
│   └── AppRoutes.jsx     # React Router v6 tree with lazy-loaded modules
│
├── components/
│   ├── layout/
│   │   ├── AppShell.jsx  # Authenticated wrapper — Sidebar + TopBar + Outlet
│   │   ├── Sidebar.jsx   # Royal sidebar with role-based nav
│   │   ├── TopBar.jsx    # Header with hamburger, breadcrumb, notifications, user menu
│   │   └── PageWrapper.jsx  # Page-level container with header slot
│   └── common/
│       ├── ProtectedRoute.jsx  # Redirects to /login if not authenticated
│       ├── RoleGuard.jsx       # Redirects to /unauthorized if role not allowed
│       ├── LoadingSpinner.jsx  # Full-screen gold spinner overlay
│       └── StatCard.jsx        # Reusable KPI card with trend indicator
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   ├── dashboard/
│   │   ├── DashboardRouter.jsx   # Switches on role → correct dashboard
│   │   ├── AdminDashboard.jsx
│   │   ├── SalesDashboard.jsx
│   │   ├── FinanceDashboard.jsx
│   │   ├── ServiceDashboard.jsx
│   │   └── CustomerDashboard.jsx
│   ├── modules/                  # Coming-soon placeholders for each module
│   │   ├── InventoryModule.jsx
│   │   ├── SalesModule.jsx
│   │   ├── FinanceModule.jsx
│   │   ├── ServiceModule.jsx
│   │   ├── UsersModule.jsx
│   │   ├── ReportsModule.jsx
│   │   ├── CustomerModule.jsx
│   │   └── SettingsModule.jsx
│   ├── UnauthorizedPage.jsx      # 403
│   └── NotFoundPage.jsx          # 404
│
└── styles/
    ├── _variables.scss   # Bootstrap overrides + AC design tokens
    ├── _typography.scss  # Font rules, heading styles
    ├── _layout.scss      # App shell, sidebar, topbar, responsive breakpoints
    ├── _components.scss  # .ac-card, .ac-stat-card, .ac-btn-gold, etc.
    ├── _animations.scss  # @keyframes + utility animation classes
    └── main.scss         # Master import: variables → bootstrap → custom
```

---

## Role Matrix

| Role               | Dashboard    | Inventory | Sales | Finance | Service | Users | Reports | Settings |
|--------------------|:------------:|:---------:|:-----:|:-------:|:-------:|:-----:|:-------:|:--------:|
| ADMIN              | Admin        | Yes       | Yes   | Yes     | Yes     | Yes   | Yes     | Yes      |
| SALES_MANAGER      | Sales        | Yes       | Yes   | -       | -       | -     | Yes     | -        |
| SALES_AGENT        | Sales        | View only | Yes   | -       | -       | -     | -       | -        |
| SALES_CONSULTANT   | Sales        | View only | Yes   | -       | -       | -     | -       | -        |
| FINANCE_OFFICER    | Finance      | -         | -     | Yes     | -       | -     | Yes     | -        |
| SERVICE_ADVISOR    | Service      | Parts     | -     | -       | Yes     | -     | -       | -        |
| INVENTORY_MANAGER  | Generic      | Yes       | -     | -       | -       | -     | Yes     | -        |
| PARTS_MANAGER      | Service      | Parts     | -     | -       | Yes     | -     | -       | -        |
| AUDITOR            | Finance      | -         | -     | View    | -       | -     | Yes     | -        |
| CUSTOMER           | Customer     | -         | -     | -       | Appts   | -     | -       | -        |

---

## Design System

**"Royal" aesthetic** — dark backgrounds with gold accents and glassmorphism surfaces.

| Token              | Value                        |
|--------------------|------------------------------|
| Page background    | `#0F0F0F`                    |
| Sidebar background | `#141414`                    |
| Card / surface     | `#1A1A1A`                    |
| Primary accent     | `#D4AF37` (gold)             |
| Gold hover         | `#F0D060`                    |
| Border (subtle)    | `rgba(212, 175, 55, 0.15)`   |
| Text primary       | `#E0E0E0`                    |
| Text muted         | `#9E9E9E`                    |
| Headings font      | Playfair Display (Google)    |
| Body font          | Inter (Google)               |

---

## Authentication

- JWT stored in `localStorage` under key `ac_token`
- User data stored under `ac_user` (JSON)
- Axios interceptor automatically adds `Authorization: Bearer <token>` to every request
- 401 responses trigger automatic logout + redirect to `/login`
- `AuthContext` exposes `hasRole(role)` and `hasAnyRole([roles])` helpers

---

## Tech Stack

| Tool            | Version  | Purpose                              |
|-----------------|----------|--------------------------------------|
| React           | 18       | UI framework                         |
| Vite            | 5        | Build tool, dev server (port 3000)   |
| React Router    | v6       | Client-side routing                  |
| Axios           | 1.x      | HTTP client with interceptors        |
| Bootstrap       | 5.3      | Grid, utilities, responsive layout   |
| Bootstrap Icons | 1.11     | Icon set                             |
| SCSS / Sass     | 1.x      | Styles with Bootstrap variable hooks |
