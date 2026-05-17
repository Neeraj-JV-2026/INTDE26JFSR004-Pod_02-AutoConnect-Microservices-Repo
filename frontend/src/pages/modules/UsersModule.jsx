import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function UsersModule() {
  const features = [
    'User creation with role assignment and permissions matrix',
    'User activation, deactivation, and password reset workflows',
    'Role-based access control management',
    'Staff profile pages with activity summaries',
    'Audit log viewer — who did what and when',
    'Bulk user import from CSV',
    'Session management and force-logout capability',
    'Two-factor authentication enforcement per role',
  ];

  return (
    <PageWrapper
      title="User Management"
      subtitle="Staff accounts, roles, permissions, and audit trails"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-person-plus-fill" aria-hidden="true" />
          Add User
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-people-fill" />
          </div>
          <h2 className="ac-coming-soon__title">User Management</h2>
          <p className="ac-coming-soon__desc">
            Administrator-level control over all system users. Manage staff accounts,
            assign roles, review audit logs, and enforce security policies.
          </p>
          <ul className="ac-coming-soon__features" aria-label="Planned features">
            {features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
}
