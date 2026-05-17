import React from 'react';

/**
 * PageWrapper
 *
 * A consistent page-level wrapper that provides:
 * - A .ac-page-wrapper container with max-width constraint
 * - An optional page header (title, subtitle, action buttons)
 * - Children content
 *
 * Props:
 *   title       {string}      - Page heading (Playfair Display)
 *   subtitle    {string}      - Optional subtitle below heading
 *   actions     {ReactNode}   - Optional slot for action buttons (top-right)
 *   className   {string}      - Additional class names on the wrapper
 *   children    {ReactNode}   - Page content
 */
export default function PageWrapper({
  title,
  subtitle,
  actions,
  className = '',
  children,
}) {
  const hasHeader = title || subtitle || actions;

  return (
    <div className={`ac-page-wrapper ac-fade-in-up ${className}`.trim()}>
      {hasHeader && (
        <div className="ac-page-header">
          <div>
            {title && <h1 className="ac-page-title">{title}</h1>}
            {subtitle && <p className="ac-page-subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="ac-page-actions">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
