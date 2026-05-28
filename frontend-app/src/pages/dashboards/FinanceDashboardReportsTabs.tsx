import { Loader2, AlertCircle, PieChart, Download } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';
import { StatusBadge, MetricCard, TableCard, TableHead } from './DashboardShared';

// ─── PartsBillingTab ──────────────────────────────────────────────────────────

interface PartsBillingTabProps {
  inventoryParts: any[];
  partsBillingSearch: string;
  setPartsBillingSearch: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  showRecallBilling: boolean;
  setShowRecallBilling: React.Dispatch<React.SetStateAction<boolean>>;
  recallBillingForm: { recallId: string; customerId: number; laborCost: number; partsCost: number; notes: string };
  setRecallBillingForm: React.Dispatch<React.SetStateAction<{ recallId: string; customerId: number; laborCost: number; partsCost: number; notes: string }>>;
  recallBillingLoading: boolean;
  handleBillRecallRemediation: (e: React.FormEvent) => void;
  recalls: any[];
  customers: any[];
}

export function PartsBillingTab({
  inventoryParts,
  partsBillingSearch,
  setPartsBillingSearch,
  loading,
  showRecallBilling,
  setShowRecallBilling,
  recallBillingForm,
  setRecallBillingForm,
  recallBillingLoading,
  handleBillRecallRemediation,
  recalls,
  customers,
}: PartsBillingTabProps) {
  const filtered = inventoryParts.filter((p: any) =>
    !partsBillingSearch ||
    (p.description || '').toLowerCase().includes(partsBillingSearch.toLowerCase()) ||
    (p.partNumber || '').toLowerCase().includes(partsBillingSearch.toLowerCase())
  );
  const totalCatalogValue = inventoryParts.reduce((s: number, p: any) => s + (Number(p.cost) || 0), 0);
  const totalRetailValue  = inventoryParts.reduce((s: number, p: any) => s + (Number(p.retailPrice) || 0), 0);
  const avgMargin = totalRetailValue > 0
    ? (((totalRetailValue - totalCatalogValue) / totalRetailValue) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Parts Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Parts catalog — purchase cost vs. retail pricing and estimated margin.</p>
        </div>
        <button
          onClick={() => setShowRecallBilling(v => !v)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          {showRecallBilling ? 'Cancel' : 'Bill Recall Remediation'}
        </button>
      </div>

      {/* Recall Remediation Billing Form */}
      {showRecallBilling && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-base font-bold text-red-900 mb-1 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Recall Remediation Invoice
          </h2>
          <p className="text-xs text-red-700 mb-4">Creates a billable invoice for labour and parts used to remedy a vehicle recall. The invoice will appear in Invoicing &amp; Receivables.</p>
          <form onSubmit={handleBillRecallRemediation} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recall</label>
              <select
                required
                value={recallBillingForm.recallId}
                onChange={e => setRecallBillingForm(f => ({ ...f, recallId: e.target.value }))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-red-400 focus:border-red-400"
              >
                <option value="">— Select recall —</option>
                {recalls.filter((r: any) => r.status === 'ACTIVE').map((r: any) => (
                  <option key={r.recallId} value={r.recallId}>
                    {r.recallNumber} — {r.affectedModels}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={recallBillingForm.customerId}
                onChange={v => setRecallBillingForm(f => ({ ...f, customerId: v }))}
                placeholder="Select customer"
                loadingText="Loading customers…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Labour Cost ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={recallBillingForm.laborCost}
                onChange={e => setRecallBillingForm(f => ({ ...f, laborCost: parseFloat(e.target.value) || 0 }))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-400 focus:border-red-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parts Cost ($)</label>
              <input
                type="number" min="0" step="0.01"
                value={recallBillingForm.partsCost}
                onChange={e => setRecallBillingForm(f => ({ ...f, partsCost: parseFloat(e.target.value) || 0 }))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-400 focus:border-red-400"
              />
            </div>
            <div className="md:col-span-2 bg-white border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
              <div className="text-gray-600">
                Subtotal: <span className="font-semibold text-gray-900">${(Number(recallBillingForm.laborCost) + Number(recallBillingForm.partsCost)).toLocaleString()}</span>
                &nbsp;·&nbsp; Tax (10%): <span className="font-semibold text-gray-900">${((Number(recallBillingForm.laborCost) + Number(recallBillingForm.partsCost)) * 0.1).toFixed(2)}</span>
              </div>
              <div className="text-base font-bold text-red-700">
                Total: ${((Number(recallBillingForm.laborCost) + Number(recallBillingForm.partsCost)) * 1.1).toFixed(2)}
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowRecallBilling(false)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={recallBillingLoading} className="px-6 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-bold disabled:opacity-50 flex items-center gap-2">
                {recallBillingLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Total Parts Cost (Catalog)" value={`$${totalCatalogValue.toLocaleString()}`} accent="red" sub={`Sum of purchase cost across ${inventoryParts.length} parts`} />
        <MetricCard title="Total Retail Value" value={`$${totalRetailValue.toLocaleString()}`} accent="green" sub="Retail price × parts count" />
        <MetricCard title="Average Parts Margin" value={`${avgMargin}%`} accent="yellow" sub="Retail − Cost ÷ Retail" />
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={partsBillingSearch}
          onChange={e => setPartsBillingSearch(e.target.value)}
          placeholder="Search by part # or description…"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:ring-green-400 focus:border-green-400 outline-none"
        />
        <span className="absolute left-3 top-2.5 text-gray-400 text-sm">🔍</span>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : inventoryParts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No parts found in inventory catalog.</p>
        </div>
      ) : (
        <TableCard>
            <TableHead cols={['Part #', 'Description', 'Manufacturer', 'Status', 'Cost', 'Retail', 'Margin']} right={[4, 5, 6]} />
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((p: any) => {
                const cost   = Number(p.cost)        || 0;
                const retail = Number(p.retailPrice)  || 0;
                const margin = retail > 0 ? (((retail - cost) / retail) * 100).toFixed(1) : '—';
                return (
                  <tr key={p.partId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">{p.partNumber || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={p.description}>{p.description || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.manufacturer || '—'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={p.status || 'ACTIVE'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-medium">${cost.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-700 font-medium">${retail.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-700">{margin !== '—' ? `${margin}%` : '—'}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-sm">No parts match your search.</td></tr>
              )}
            </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ─── RecallsTab ───────────────────────────────────────────────────────────────

interface RecallsTabProps {
  recalls: any[];
  loading: boolean;
}

export function RecallsTab({ recalls, loading }: RecallsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Recalls &amp; Returns</h1>
        <p className="text-sm text-gray-500 mt-1">Active and historical safety recalls. Recall-related parts costs can be tracked via the Parts Billing tab.</p>
      </div>

      {/* Action links */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <span className="font-semibold">Billing actions:</span> Use the <strong>Parts Billing</strong> tab → <em>Bill Recall Remediation</em> button to invoice labour and parts for each recall repair. For vehicle returns, use <strong>Invoicing &amp; Receivables</strong> → <em>New Invoice</em> with type <em>Credit Note / Vehicle Return</em> and a negative subtotal.
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard title="Active Recalls" value={recalls.filter((r: any) => r.status === 'ACTIVE').length} accent="red" />
        <MetricCard title="Completed" value={recalls.filter((r: any) => r.status === 'COMPLETED').length} accent="green" />
        <MetricCard title="Total Recalls" value={recalls.length} accent="gray" />
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : recalls.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No recalls on record.</p>
          <p className="text-sm text-gray-400 mt-1">Recalls are created and managed by the Admin Panel.</p>
        </div>
      ) : (
        <TableCard>
            <TableHead cols={['Recall #', 'Affected Models', 'Description', 'Remedy', 'Issue Date', 'Expiry', 'Status']} />
            <tbody className="bg-white divide-y divide-gray-200">
              {recalls.map((r: any) => (
                <tr key={r.recallId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-semibold text-gray-800">{r.recallNumber || `#${r.recallId}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={r.affectedModels}>{r.affectedModels || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={r.description}>{r.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={r.remedyDescription}>{r.remedyDescription || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.issueDate || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.expiryDate || 'Open-ended'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={r.status || 'UNKNOWN'} />
                  </td>
                </tr>
              ))}
            </tbody>
        </TableCard>
      )}
    </div>
  );
}

// ─── ReportsTab ───────────────────────────────────────────────────────────────

interface ReportsTabProps {
  reports: any[];
  generatePDF: (reportType: string) => void;
}

export function ReportsTab({ reports, generatePDF }: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['P&L Statement'].map((rep) => (
          <div
            key={rep}
            onClick={() => generatePDF(rep)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center hover:border-green-500 hover:shadow-md cursor-pointer transition-all group"
          >
            <PieChart className="w-10 h-10 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-bold text-gray-900">{rep}</h3>
            <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
              <Download className="w-3 h-3" /> Generate PDF
            </p>
          </div>
        ))}
      </div>
      {reports.length > 0 && (
        <div className="mt-8 p-6 bg-white border border-gray-200 rounded-xl">
          <h3 className="font-bold text-gray-900 mb-4">Saved Reports</h3>
          {reports.map((r: any) => (
            <p key={r.id} className="text-sm text-gray-600">{r.name || 'Report'} - {r.date}</p>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── NotificationsTab ─────────────────────────────────────────────────────────

interface NotificationsTabProps {
  userId: number | undefined;
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
  return <NotificationsPanel userId={userId} theme="light" limit={5} />;
}
