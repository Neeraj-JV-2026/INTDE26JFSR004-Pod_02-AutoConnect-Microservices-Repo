import React from 'react';

/**
 * StatCard
 *
 * Reusable stat / KPI card with glassmorphism styling.
 *
 * Props:
 *   icon         {string}   - Bootstrap Icon class, e.g. 'bi-car-front-fill'
 *   label        {string}   - Stat label (e.g. 'Total Vehicles')
 *   value        {string|number} - Main display value
 *   trend        {string}   - Trend text, e.g. '+12% this month'
 *   trendUp      {boolean}  - true = green up, false = red down, undefined = neutral
 *   accentColor  {string}   - Optional override for icon bg color (CSS color)
 *   onClick      {function} - Optional click handler (makes card clickable)
 *   loading      {boolean}  - Show shimmer skeleton instead of content
 */
export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendUp,
  accentColor,
  onClick,
  loading = false,
}) {
  const iconBg = accentColor
    ? `${accentColor}20` // 12% opacity
    : 'rgba(212, 175, 55, 0.12)';

  const iconColor = accentColor || '#D4AF37';

  const trendClass =
    trendUp === true
      ? 'ac-stat-card__trend--up'
      : trendUp === false
      ? 'ac-stat-card__trend--down'
      : 'ac-stat-card__trend--neutral';

  const trendIcon =
    trendUp === true
      ? 'bi-arrow-up-short'
      : trendUp === false
      ? 'bi-arrow-down-short'
      : 'bi-dash';

  const cardStyle = onClick
    ? { cursor: 'pointer' }
    : {};

  if (loading) {
    return (
      <div className="ac-stat-card" style={cardStyle}>
        <div
          className="ac-shimmer"
          style={{ width: 48, height: 48, borderRadius: 10 }}
        />
        <div>
          <div className="ac-shimmer" style={{ width: 80, height: 12, borderRadius: 4, marginBottom: 8 }} />
          <div className="ac-shimmer" style={{ width: 120, height: 28, borderRadius: 4 }} />
        </div>
        {trend && (
          <div className="ac-shimmer" style={{ width: 100, height: 22, borderRadius: 20 }} />
        )}
      </div>
    );
  }

  return (
    <div
      className="ac-stat-card"
      style={cardStyle}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick(e) : undefined}
    >
      {/* Icon */}
      <div
        className="ac-stat-card__icon-wrapper"
        style={{ background: iconBg, color: iconColor }}
        aria-hidden="true"
      >
        <i className={`bi ${icon}`} />
      </div>

      {/* Label + Value */}
      <div>
        <p className="ac-stat-card__label">{label}</p>
        <p className="ac-stat-card__value">
          {value !== undefined && value !== null ? value : '—'}
        </p>
      </div>

      {/* Trend badge */}
      {trend && (
        <div>
          <span className={`ac-stat-card__trend ${trendClass}`}>
            <i className={`bi ${trendIcon}`} aria-hidden="true" />
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
