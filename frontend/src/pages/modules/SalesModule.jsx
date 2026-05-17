import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function SalesModule() {
  const features = [
    'Deal pipeline management with stage-based workflow',
    'Quote generation with configurable line items and discounts',
    'Approval workflows for deals above threshold values',
    'Commission calculation and agent performance tracking',
    'Test drive scheduling and outcome logging',
    'Sales promotions and campaign management',
    'Customer relationship and lead tracking',
    'Integration with finance for seamless deal-to-invoice flow',
  ];

  return (
    <PageWrapper
      title="Sales Management"
      subtitle="Deals, quotes, commissions, and the full sales pipeline"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          New Deal
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-bag-check-fill" />
          </div>
          <h2 className="ac-coming-soon__title">Sales Module</h2>
          <p className="ac-coming-soon__desc">
            End-to-end sales management for your dealership. Track deals from first contact
            to final signature, manage quotes and approvals, and monitor agent performance.
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
