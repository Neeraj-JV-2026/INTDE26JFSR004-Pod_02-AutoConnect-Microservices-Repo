/**
 * DashboardShared.tsx
 * Small reusable display components shared across all dashboard tabs.
 * No state, no API calls – pure presentational helpers.
 */

import { Loader2 } from 'lucide-react';

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  // Generic
  ACTIVE:       'bg-green-100 text-green-800',
  INACTIVE:     'bg-gray-100 text-gray-600',
  CANCELLED:    'bg-gray-100 text-gray-600',
  COMPLETED:    'bg-green-100 text-green-800',
  PENDING:      'bg-yellow-100 text-yellow-800',
  // Finance
  PAID:         'bg-green-100 text-green-800',
  ISSUED:       'bg-yellow-100 text-yellow-800',
  OVERDUE:      'bg-red-100 text-red-800',
  PARTIAL:      'bg-blue-100 text-blue-800',
  // Inventory / recalls
  AVAILABLE:    'bg-green-100 text-green-800',
  RESERVED:     'bg-blue-100 text-blue-800',
  SOLD:         'bg-gray-100 text-gray-600',
  RECALL_ACTIVE:'bg-red-100 text-red-800',
  // Parts
  IN_STOCK:     'bg-green-100 text-green-800',
  LOW_STOCK:    'bg-yellow-100 text-yellow-800',
  OUT_OF_STOCK: 'bg-red-100 text-red-800',
  // Warranty claims
  SUBMITTED:    'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  APPROVED:     'bg-green-100 text-green-800',
  REJECTED:     'bg-red-100 text-red-800',
  // Leads
  NEW:          'bg-gray-100 text-gray-700',
  CONTACTED:    'bg-blue-100 text-blue-700',
  INTERESTED:   'bg-yellow-100 text-yellow-700',
  CONVERTED:    'bg-green-100 text-green-700',
  CLOSED:       'bg-red-100 text-red-700',
  // Quotes / deals
  DRAFT:        'bg-gray-100 text-gray-600',
  GENERATED:    'bg-blue-100 text-blue-700',
  ACCEPTED:     'bg-green-100 text-green-800',
  EXPIRED:      'bg-gray-100 text-gray-600',
  FINALIZED:    'bg-green-100 text-green-800',
  // Appointments
  REQUESTED:    'bg-yellow-100 text-yellow-700',
  SCHEDULED:    'bg-blue-100 text-blue-700',
  IN_PROGRESS:  'bg-blue-100 text-blue-700',
  OPEN:         'bg-yellow-100 text-yellow-700',
  // Commissions
  CALCULATED:   'bg-blue-100 text-blue-800',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// ─── KPI / metric card ─────────────────────────────────────────────────────────

type Accent = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

const ACCENT: Record<Accent, string> = {
  blue:   'border-l-blue-500',
  green:  'border-l-green-500',
  red:    'border-l-red-500',
  yellow: 'border-l-yellow-500',
  purple: 'border-l-purple-500',
  gray:   'border-l-gray-400',
};

export function MetricCard({ title, value, accent = 'blue', sub }: {
  title: string;
  value: string | number;
  accent?: Accent;
  sub?: string;
}) {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 ${ACCENT[accent]}`}>
      <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

// ─── Table helpers ─────────────────────────────────────────────────────────────

/** White card wrapper + <table> shell */
export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">{children}</table>
    </div>
  );
}

/** Renders a standard <thead> from an array of column name strings.
 *  Pass `right` indices for columns that should be right-aligned. */
export function TableHead({ cols, right = [] }: { cols: string[]; right?: number[] }) {
  return (
    <thead className="bg-gray-50">
      <tr>
        {cols.map((col, i) => (
          <th
            key={col}
            className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${right.includes(i) ? 'text-right' : 'text-left'}`}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Animated spinner row shown while data is loading */
export function TableLoader({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" />
      </td>
    </tr>
  );
}

/** Empty-state row shown when the list is empty */
export function TableEmpty({ cols, message = 'No records found.' }: {
  cols: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-8 text-center text-gray-500 text-sm">
        {message}
      </td>
    </tr>
  );
}

// ─── Page heading ──────────────────────────────────────────────────────────────

export function PageTitle({ children }: { children: React.ReactNode }) {
  return <h1 className="text-2xl font-bold text-gray-900">{children}</h1>;
}
