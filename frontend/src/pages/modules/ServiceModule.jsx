import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function ServiceModule() {
  const features = [
    'Appointment scheduling with advisor assignment',
    'Work order creation and lifecycle tracking (open → in-progress → completed)',
    'Job card management with technician task allocation',
    'Parts consumption tracking per job card',
    'Service bay occupancy and throughput monitoring',
    'Customer vehicle service history',
    'Estimated vs. actual time and cost comparison',
    'Quality check and sign-off workflow before vehicle return',
  ];

  return (
    <PageWrapper
      title="Service Management"
      subtitle="Appointments, work orders, job cards, and parts"
      actions={
        <button className="ac-btn-gold ac-btn-gold--sm" disabled>
          <i className="bi bi-plus-lg" aria-hidden="true" />
          New Appointment
        </button>
      }
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-tools" />
          </div>
          <h2 className="ac-coming-soon__title">Service Module</h2>
          <p className="ac-coming-soon__desc">
            Complete service department management — from customer drop-off to vehicle collection.
            Manage work orders, assign technicians, track parts usage, and ensure quality control.
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
