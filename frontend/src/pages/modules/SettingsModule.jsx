import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function SettingsModule() {
  const features = [
    'System-wide configuration and feature flags',
    'Dealership profile — name, logo, address, and contact info',
    'Email notification templates and SMTP configuration',
    'API gateway health check and service registry',
    'Tax rate and currency configuration',
    'Working hours and holiday calendar management',
    'Backup and data export settings',
    'Security policy — password rules, session timeouts, MFA enforcement',
  ];

  return (
    <PageWrapper
      title="System Settings"
      subtitle="Global configuration for AutoConnect"
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-gear-fill" />
          </div>
          <h2 className="ac-coming-soon__title">Settings</h2>
          <p className="ac-coming-soon__desc">
            Administrator-only system configuration. Manage dealership details, notification
            settings, security policies, and global application preferences.
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
