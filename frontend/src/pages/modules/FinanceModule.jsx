import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function FinanceModule() {
  const features = [
    'Invoice creation and lifecycle management (draft → sent → paid)',
    'Payment processing with multiple payment method support',
    'Overdue invoice tracking and automated reminders',
    'Customer billing history and statement generation',
    'Revenue reporting: daily, monthly, and annual summaries',
    'Finance task assignment and work queue',
    'Notification center for payment events',
    'Export to PDF and accounting system integrations',
  ];

  return (
    <PageWrapper
      title="Finance Management"
      subtitle="Invoices, payments, and financial reporting"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          New Invoice
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-currency-dollar" />
          </div>
          <h2 className="ac-coming-soon__title">Finance Module</h2>
          <p className="ac-coming-soon__desc">
            Comprehensive financial management for your dealership operations. Handle invoicing,
            payment processing, and generate detailed financial reports.
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
