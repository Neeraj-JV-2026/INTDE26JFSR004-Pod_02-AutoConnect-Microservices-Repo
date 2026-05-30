/**
 * DashboardShared.tsx
 * Reusable presentational components shared across all dashboard tabs.
 * No state, no API calls — pure UI primitives.
 */

import { Loader2 } from 'lucide-react';

// ─── Status badge ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  // Generic lifecycle
  ACTIVE:        'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  INACTIVE:      'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
  CANCELLED:     'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
  COMPLETED:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  PENDING:       'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  // Finance
  PAID:          'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  ISSUED:        'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  OVERDUE:       'bg-red-50     text-red-700    ring-1 ring-red-200',
  PARTIAL:       'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  // Inventory
  AVAILABLE:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  RESERVED:      'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  SOLD:          'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
  RECALL_ACTIVE: 'bg-red-50     text-red-700    ring-1 ring-red-200',
  // Parts
  IN_STOCK:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  LOW_STOCK:     'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  OUT_OF_STOCK:  'bg-red-50     text-red-700    ring-1 ring-red-200',
  // Warranty claims
  SUBMITTED:     'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  UNDER_REVIEW:  'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  APPROVED:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  REJECTED:      'bg-red-50     text-red-700    ring-1 ring-red-200',
  // Leads
  NEW:           'bg-slate-100  text-slate-600  ring-1 ring-slate-200',
  CONTACTED:     'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  INTERESTED:    'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  CONVERTED:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  CLOSED:        'bg-red-50     text-red-700    ring-1 ring-red-200',
  // Quotes / deals
  DRAFT:         'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
  GENERATED:     'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  ACCEPTED:      'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  EXPIRED:       'bg-gray-100   text-gray-500   ring-1 ring-gray-200',
  FINALIZED:     'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  // Appointments
  REQUESTED:     'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  SCHEDULED:     'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
  IN_PROGRESS:   'bg-violet-50  text-violet-700 ring-1 ring-violet-200',
  OPEN:          'bg-amber-50   text-amber-700  ring-1 ring-amber-200',
  // Commissions
  CALCULATED:    'bg-sky-50     text-sky-700    ring-1 ring-sky-200',
};

export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-500 ring-1 ring-gray-200';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70 flex-shrink-0" />
      {status.replace(/_/g, ' ')}
    </span>
  );
}

// ─── KPI / metric card ─────────────────────────────────────────────────────────

type Accent = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

const ACCENT_BORDER: Record<Accent, string> = {
  blue:   'border-l-blue-500',
  green:  'border-l-emerald-500',
  red:    'border-l-red-500',
  yellow: 'border-l-amber-400',
  purple: 'border-l-violet-500',
  gray:   'border-l-gray-300',
};

const ACCENT_GLOW: Record<Accent, string> = {
  blue:   'bg-blue-400',
  green:  'bg-emerald-400',
  red:    'bg-red-400',
  yellow: 'bg-amber-300',
  purple: 'bg-violet-400',
  gray:   'bg-gray-300',
};

export function MetricCard({ title, value, accent = 'blue', sub }: {
  title: string;
  value: string | number;
  accent?: Accent;
  sub?: string;
}) {
  return (
    <div className={`relative bg-white p-6 rounded-2xl shadow-card hover:shadow-card-md transition-shadow duration-200 border border-gray-100 border-l-4 ${ACCENT_BORDER[accent]} overflow-hidden`}>
      {/* Subtle corner blob */}
      <div className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-[0.06] ${ACCENT_GLOW[accent]}`} />
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{title}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-2 tabular-nums leading-tight">{value}</h3>
      {sub && <p className="text-xs text-gray-400 mt-1.5 font-medium">{sub}</p>}
    </div>
  );
}

// ─── Table helpers ─────────────────────────────────────────────────────────────

/** White card wrapper + <table> shell */
export function TableCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-100">{children}</table>
    </div>
  );
}

/** Standard <thead> from an array of column names.
 *  Pass `right` indices for right-aligned columns. */
export function TableHead({ cols, right = [] }: { cols: string[]; right?: number[] }) {
  return (
    <thead className="bg-slate-50/80">
      <tr>
        {cols.map((col, i) => (
          <th
            key={col}
            className={`px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${right.includes(i) ? 'text-right' : 'text-left'}`}
          >
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Animated spinner row while data loads */
export function TableLoader({ cols }: { cols: number }) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-12 text-center">
        <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-300" />
      </td>
    </tr>
  );
}

/** Empty-state row when the list is empty */
export function TableEmpty({ cols, message = 'No records found.' }: {
  cols: number;
  message?: string;
}) {
  return (
    <tr>
      <td colSpan={cols} className="px-6 py-12 text-center text-sm text-gray-400 font-medium">
        {message}
      </td>
    </tr>
  );
}

// ─── Page heading ──────────────────────────────────────────────────────────────

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{children}</h1>
  );
}

// ─── Section card with optional header bar ────────────────────────────────────

export function SectionCard({ title, children, action }: {
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
      {title && (
        <div className="px-6 py-4 border-b border-gray-100 bg-slate-50/60 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">{title}</h3>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
