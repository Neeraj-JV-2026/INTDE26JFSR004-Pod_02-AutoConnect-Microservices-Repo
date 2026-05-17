import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function ReportsModule() {
  const features = [
    'Revenue dashboards — daily, weekly, monthly, and annual',
    'Sales performance by agent, team, and region',
    'Inventory turnover and aging report',
    'Service throughput and efficiency metrics',
    'Outstanding invoices and collection rate analysis',
    'Commission summary and payroll export',
    'Audit trail and compliance reporting',
    'Custom report builder with scheduled email delivery',
  ];

  return (
    <PageWrapper
      title="Reports & Analytics"
      subtitle="Business intelligence across all dealership operations"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          New Report
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-bar-chart-fill" />
          </div>
          <h2 className="ac-coming-soon__title">Reports & Analytics</h2>
          <p className="ac-coming-soon__desc">
            Comprehensive business intelligence for dealership management. Access pre-built
            reports and build custom analytics to drive data-informed decisions.
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
