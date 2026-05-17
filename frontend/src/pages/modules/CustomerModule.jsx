import React from 'react';
import PageWrapper from '../../components/layout/PageWrapper';

export default function CustomerModule() {
  const features = [
    'Vehicle ownership records and purchase history',
    'Service history with detailed job card summaries',
    'Upcoming and past appointment management',
    'Invoice and payment history with PDF download',
    'Service reminders and recall notifications',
    'Direct messaging with service advisors',
    'Feedback and review submission',
    'Loyalty programme points and rewards tracking',
  ];

  return (
    <PageWrapper
      title="My Account"
      subtitle="Your vehicles, appointments, and service history"
    >
      <div className="ac-card">
        <div className="ac-coming-soon">
          <div className="ac-coming-soon__icon" aria-hidden="true">
            <i className="bi bi-person-circle" />
          </div>
          <h2 className="ac-coming-soon__title">Customer Portal</h2>
          <p className="ac-coming-soon__desc">
            Your personal AutoConnect portal. View your registered vehicles, manage service
            appointments, and access your full history with us.
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
