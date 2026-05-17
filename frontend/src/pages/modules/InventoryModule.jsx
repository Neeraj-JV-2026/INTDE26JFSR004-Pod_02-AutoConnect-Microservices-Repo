import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function InventoryModule() {
  const features = [
    'Vehicle listing management — add, update, and retire vehicles',
    'Real-time stock tracking with VIN and chassis number support',
    'Parts inventory with reorder point alerts',
    'Vehicle pricing rules and promotional discount engine',
    'Recall management and compliance tracking',
    'Multi-location inventory support with transfer workflows',
    'Vehicle condition reports and damage logging',
    'Integration with valuation APIs (KBB, Black Book)',
  ];

  return (
    <PageWrapper
      title="Inventory Management"
      subtitle="Vehicles, parts, and stock control"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          Add Vehicle
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-car-front-fill" />
          </div>
          <h2 className="ac-coming-soon__title">Inventory Module</h2>
          <p className="ac-coming-soon__desc">
            Full inventory management for vehicles and parts. Track stock, manage pricing,
            handle recalls, and maintain your dealer catalogue — all from one place.
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
