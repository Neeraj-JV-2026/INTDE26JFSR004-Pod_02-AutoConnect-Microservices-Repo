/**
 * ReportingPortalTabs.tsx
 * Tab content components for ReportingPortal.
 * Pure presentational — all data and handlers come from props.
 */

import { Loader2, BarChart3, PieChart, Download, FileText } from 'lucide-react';
import { StatusBadge, MetricCard, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── CSV download helper (shared across tabs) ───────────────────────────────────

function downloadCSV(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map(c => c.label).join(',');
  const body = rows.map(row =>
    columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(',')
  );
  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── KPI Tab ────────────────────────────────────────────────────────────────────

export interface KPITabProps {
  kpiData: { revenue: number; unitsSold: number; serviceROs: number };
  loading: boolean;
  invoices: any[];
  vehicles: any[];
  appointments: any[];
}

export function KPITab({ kpiData, loading, invoices, vehicles, appointments }: KPITabProps) {
  const statusDefs = [
    { s: 'PAID',    color: 'bg-emerald-500' },
    { s: 'PENDING', color: 'bg-amber-400' },
    { s: 'OVERDUE', color: 'bg-red-500' },
    { s: 'DRAFT',   color: 'bg-gray-300' },
  ];
  const totals = statusDefs.map(({ s }) =>
    invoices.filter((i: any) => i.status === s).reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0)
  );
  const maxTotal = Math.max(...totals, 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Executive KPI Dashboard</PageTitle>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadCSV('kpi-report.csv', [
              { metric: 'Total Revenue', value: invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0) },
              { metric: 'Total Vehicles', value: vehicles.length },
              { metric: 'Vehicles Sold', value: vehicles.filter((v: any) => v.status === 'SOLD').length },
              { metric: 'Total Appointments', value: appointments.length },
            ], [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }])}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center"
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </button>
          <button onClick={() => window.print()}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" /> Print / PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard title="Gross Revenue (MTD)" value={loading ? '…' : `$${(kpiData.revenue / 1000).toFixed(1)}k`} accent="green" sub="Live Data" />
        <MetricCard title="Units Sold (MTD)"    value={loading ? '…' : kpiData.unitsSold}  accent="purple" sub="Live Data" />
        <MetricCard title="Service ROs (MTD)"   value={loading ? '…' : kpiData.serviceROs} accent="blue"   sub="Live Data" />
        <MetricCard title="CSAT Score"          value="4.8/5.0"                             accent="yellow" sub="+0.2 vs last month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fleet status bar chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-500" /> Fleet Status Breakdown
          </h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-purple-400" /></div>
          ) : (
            <div className="space-y-4">
              {[
                { status: 'AVAILABLE',  color: 'bg-emerald-500' },
                { status: 'SOLD',       color: 'bg-red-500' },
                { status: 'IN_SERVICE', color: 'bg-blue-500' },
                { status: 'RESERVED',   color: 'bg-amber-400' },
              ].map(({ status, color }) => {
                const count = vehicles.filter((v: any) => v.status === status).length;
                const pct   = vehicles.length > 0 ? Math.round((count / vehicles.length) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span className="font-medium">{status}</span>
                      <span>{count} unit{count !== 1 ? 's' : ''} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div className={`h-3 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 pt-1">Total fleet: {vehicles.length} vehicles</p>
            </div>
          )}
        </div>

        {/* Revenue by invoice status bar chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-500" /> Revenue by Invoice Status
          </h3>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-purple-400" /></div>
          ) : (
            <div className="space-y-4">
              {statusDefs.map(({ s, color }, idx) => (
                <div key={s}>
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span className="font-medium">{s}</span>
                    <span>${totals[idx].toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div className={`h-3 rounded-full ${color} transition-all duration-500`}
                      style={{ width: `${Math.round((totals[idx] / maxTotal) * 100)}%` }} />
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 pt-1">
                Grand total: ${invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sales Analytics Tab ────────────────────────────────────────────────────────

export function SalesAnalyticsTab({ deals, loading }: { deals: any[]; loading: boolean }) {
  return (
    <div className="space-y-6">
      <PageTitle>Sales Analytics</PageTitle>
      <TableCard>
        <TableHead cols={['Deal ID', 'Vehicle ID', 'Gross Profit', 'Status']} />
        <tbody className="divide-y divide-gray-200">
          {loading    ? <TableLoader cols={4} /> :
           deals.length === 0 ? <TableEmpty cols={4} message="No deals data available." /> :
           deals.map((d: any) => (
            <tr key={d.dealId} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-purple-600">DL-{d.dealId}</td>
              <td className="px-6 py-4 text-sm text-gray-900">Veh #{d.vehicleId}</td>
              <td className="px-6 py-4 text-sm font-bold text-gray-900">${d.finalPrice?.toLocaleString()}</td>
              <td className="px-6 py-4"><StatusBadge status={d.status} /></td>
            </tr>
          ))}
        </tbody>
      </TableCard>
      <div className="flex justify-end">
        <button
          onClick={() => downloadCSV('sales-report.csv', deals, [
            { key: 'dealId', label: 'Deal ID' }, { key: 'quoteId', label: 'Quote ID' },
            { key: 'salesPersonId', label: 'Salesperson ID' }, { key: 'status', label: 'Status' },
          ])}
          className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 flex items-center"
        >
          <Download className="w-4 h-4 mr-1" /> Export CSV
        </button>
      </div>
    </div>
  );
}

// ─── Inventory Analytics Tab ────────────────────────────────────────────────────

export function InventoryAnalyticsTab({ vehicles, loading }: { vehicles: any[]; loading: boolean }) {
  return (
    <div className="space-y-6">
      <PageTitle>Inventory Analytics</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard title="Total Fleet Size" value={vehicles.length} accent="purple" />
        <MetricCard
          title="Fleet Value"
          value={`$${vehicles.reduce((sum, v) => sum + (v.basePrice || 0), 0).toLocaleString()}`}
          accent="green"
        />
      </div>
      <TableCard>
        <TableHead cols={['Make & Model', 'Year', 'Status']} />
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? <TableLoader cols={3} /> :
           vehicles.length === 0 ? <TableEmpty cols={3} message="No inventory data." /> :
           vehicles.map((v: any) => (
            <tr key={v.vehicleId || v.vin} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{v.make} {v.model}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{v.year}</td>
              <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ─── Service Revenue Tab ────────────────────────────────────────────────────────

export function ServiceRevenueTab({ appointments, invoices, loading }: {
  appointments: any[];
  invoices: any[];
  loading: boolean;
}) {
  const serviceInvs    = invoices.filter((i: any) => i.relatedEntityType === 'WORK_ORDER');
  const paidServiceInvs = serviceInvs.filter((i: any) => i.status === 'PAID');
  const serviceRevenue = serviceInvs.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      <PageTitle>Service Revenue & RO Analytics</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Total Service ROs"         value={loading ? '…' : appointments.length} accent="blue" />
        <MetricCard title="Service Revenue (Invoiced)" value={loading ? '…' : `$${serviceRevenue.toLocaleString()}`} accent="green" />
        <MetricCard title="Paid / Total Service Invoices"
          value={loading ? '…' : `${paidServiceInvs.length} / ${serviceInvs.length}`} accent="purple" />
      </div>
      <TableCard>
        <TableHead cols={['Appt ID', 'Type', 'Date', 'Status', 'Revenue']} />
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? <TableLoader cols={5} /> :
           appointments.length === 0 ? <TableEmpty cols={5} message="No service appointments." /> :
           appointments.map((a: any) => {
            const apptId = a.appId ?? a.appointmentId;
            const custInvs = invoices.filter((inv: any) =>
              inv.customerId === a.customerId && inv.relatedEntityType === 'WORK_ORDER'
            );
            const revenue = custInvs.reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);
            return (
              <tr key={apptId} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">APT-{apptId}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{a.serviceType}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(a.scheduledAt || a.appointmentDate || Date.now()).toLocaleDateString()}
                </td>
                <td className="px-6 py-4"><StatusBadge status={a.status} /></td>
                <td className="px-6 py-4 text-sm font-bold">
                  {revenue > 0
                    ? <span className="text-emerald-600">${revenue.toLocaleString()}</span>
                    : <span className="text-gray-400">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </TableCard>
    </div>
  );
}

// ─── Custom Reports Tab ─────────────────────────────────────────────────────────

export interface CustomReportsTabProps {
  rptType: string;
  setRptType: (v: string) => void;
  rptFrom: string;
  setRptFrom: (v: string) => void;
  rptTo: string;
  setRptTo: (v: string) => void;
  reportResult: any[] | null;
  reportColumns: { key: string; label: string }[];
  reportLoading: boolean;
  reportMsg: { text: string; ok: boolean } | null;
  handleGenerateReport: () => void;
  loading: boolean;
  savedReports: any[];
}

export function CustomReportsTab({
  rptType, setRptType, rptFrom, setRptFrom, rptTo, setRptTo,
  reportResult, reportColumns, reportLoading, reportMsg,
  handleGenerateReport, loading, savedReports,
}: CustomReportsTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Custom Reports</PageTitle>

      {/* Builder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select value={rptType} onChange={e => setRptType(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white"
            >
              <option value="SALES">Sales Report</option>
              <option value="SERVICE">Service Revenue</option>
              <option value="FINANCE">Finance Summary</option>
              <option value="PARTS">Parts Inventory</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input type="date" value={rptFrom} onChange={e => setRptFrom(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input type="date" value={rptTo} onChange={e => setRptTo(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
          </div>
        </div>

        {reportMsg && (
          <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
            reportMsg.ok
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {reportMsg.text}
          </div>
        )}

        <div className="flex justify-end mt-4 space-x-3">
          <button disabled={reportLoading} onClick={handleGenerateReport}
            className="bg-purple-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50 flex items-center"
          >
            {reportLoading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</>
              : 'Generate & Save'}
          </button>
          {reportResult && reportResult.length > 0 && (
            <button
              onClick={() => downloadCSV(`${rptType.toLowerCase()}-report.csv`, reportResult, reportColumns)}
              className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-2" /> Export CSV
            </button>
          )}
          <button onClick={() => window.print()}
            className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center"
          >
            <FileText className="w-4 h-4 mr-2" />Print PDF
          </button>
        </div>
      </div>

      {/* Results table */}
      {reportResult !== null && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-bold text-gray-800">{rptType} Report Results</h3>
            <span className="text-sm text-gray-500">{reportResult.length} record(s)</span>
          </div>
          {reportResult.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No records found for the selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {reportColumns.map(col => (
                      <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportResult.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {reportColumns.map(col => (
                        <td key={col.key} className="px-6 py-3 whitespace-nowrap text-gray-800">
                          {row[col.key] != null ? String(row[col.key]) : '—'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Saved reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">Saved Reports</h3>
        {loading ? (
          <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
        ) : savedReports.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No saved reports yet. Generate one above.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Scope</th>
                <th className="py-2 pr-4">Generated By</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {savedReports.map((r: any) => (
                <tr key={r.id || r.reportId} className="hover:bg-gray-50">
                  <td className="py-2 pr-4 font-medium">RPT-{r.id || r.reportId}</td>
                  <td className="py-2 pr-4">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                      {r.scope || r.type}
                    </span>
                  </td>
                  <td className="py-2 pr-4 text-gray-500">User #{r.generatedBy}</td>
                  <td className="py-2 text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
