import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { StatusBadge, MetricCard, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── InvoicingTab ────────────────────────────────────────────────────────────

interface InvoicingTabProps {
  invoices: any[];
  customers: any[];
  loading: boolean;
  showInvoiceForm: boolean;
  setShowInvoiceForm: React.Dispatch<React.SetStateAction<boolean>>;
  newInvoice: {
    customerId: number;
    relatedEntityType: string;
    relatedEntityId: number;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
  };
  setNewInvoice: React.Dispatch<React.SetStateAction<{
    customerId: number;
    relatedEntityType: string;
    relatedEntityId: number;
    subTotal: number;
    taxAmount: number;
    totalAmount: number;
  }>>;
  invoiceSubmitLoading: boolean;
  handleInvoiceSubmit: (e: React.FormEvent) => void;
  outstanding: number;
  collected: number;
  overdue: number;
  openEditAmounts: (inv: any) => void;
  openPayModal: (inv: any) => void;
  markOverdue: (invoiceId: number) => void;
}

export function InvoicingTab({
  invoices,
  customers,
  loading,
  showInvoiceForm,
  setShowInvoiceForm,
  newInvoice,
  setNewInvoice,
  invoiceSubmitLoading,
  handleInvoiceSubmit,
  outstanding,
  collected,
  overdue,
  openEditAmounts,
  openPayModal,
  markOverdue,
}: InvoicingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Accounts Receivable</PageTitle>
        <div className="flex space-x-3">
          <button onClick={() => setShowInvoiceForm(!showInvoiceForm)} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
            {showInvoiceForm ? 'Cancel' : '+ New Invoice'}
          </button>
        </div>
      </div>

      {showInvoiceForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Invoice</h2>
          <form onSubmit={handleInvoiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={newInvoice.customerId}
                onChange={v => setNewInvoice({...newInvoice, customerId: v})}
                placeholder="Select customer"
                loadingText="Loading customers…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select value={newInvoice.relatedEntityType} onChange={e => setNewInvoice({...newInvoice, relatedEntityType: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-2 border bg-white">
                <option value="VEHICLE">Vehicle Sale</option>
                <option value="SERVICE">Service Repair</option>
                <option value="PARTS">Parts Sale</option>
                <option value="RECALL">Recall Remediation</option>
                <option value="CREDIT_NOTE">Credit Note / Vehicle Return</option>
              </select>
              {newInvoice.relatedEntityType === 'CREDIT_NOTE' && (
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Enter a <strong>negative subtotal</strong> (e.g. −25000) to issue a refund credit against the customer's account.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity ID</label>
              <input type="number" required value={newInvoice.relatedEntityId} onChange={e => setNewInvoice({...newInvoice, relatedEntityId: parseInt(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal ($)</label>
              <input type="number" step="0.01" required value={newInvoice.subTotal} onChange={e => setNewInvoice({...newInvoice, subTotal: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount ($)</label>
              <input type="number" step="0.01" required value={newInvoice.taxAmount} onChange={e => setNewInvoice({...newInvoice, taxAmount: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-200">
              <span className="font-medium text-gray-700">Total Amount:</span>
              <span className="text-xl font-bold text-green-700">${newInvoice.totalAmount.toFixed(2)}</span>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={invoiceSubmitLoading} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {invoiceSubmitLoading ? 'Saving...' : 'Generate Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-blue-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Outstanding (30 Days)</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">${outstanding.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-green-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Collected (MTD)</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">${collected.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-t-4 border-t-red-500">
          <p className="text-sm font-medium text-gray-500 uppercase">Overdue (90+ Days)</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">${overdue.toLocaleString()}</h3>
        </div>
      </div>

      <TableCard>
          <TableHead cols={['Invoice #', 'Client', 'Type', 'Amount', 'Status', 'Actions']} right={[5]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={6} />
            ) : invoices.length === 0 ? (
              <TableEmpty cols={6} message="No invoices found." />
            ) : invoices.map(inv => {
              const isServiceInvoice = inv.relatedEntityType === 'WORK_ORDER';
              const needsAmounts = isServiceInvoice && (!inv.totalAmount || inv.totalAmount === 0);
              const typeLabel = inv.relatedEntityType === 'WORK_ORDER' ? 'Service RO'
                : inv.relatedEntityType === 'VEHICLE' ? 'Vehicle Sale'
                : inv.relatedEntityType || '—';
              const typeColor = inv.relatedEntityType === 'WORK_ORDER' ? 'bg-blue-100 text-blue-700'
                : inv.relatedEntityType === 'VEHICLE' ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-600';
              return (
              <tr key={inv.invoiceId} className={`hover:bg-gray-50 ${needsAmounts ? 'bg-amber-50/40' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">INV-{inv.invoiceId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {customers.find(c => c.customerId === inv.customerId)?.name || `Customer #${inv.customerId}`}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeColor}`}>{typeLabel}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                  {needsAmounts
                    ? <span className="text-amber-600 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> $0 — needs update</span>
                    : <span className="text-gray-900">${inv.totalAmount?.toLocaleString()}</span>
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={inv.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  {isServiceInvoice && inv.status !== 'PAID' && inv.status !== 'CANCELLED' && (
                    <button
                      onClick={() => openEditAmounts(inv)}
                      className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 border border-blue-200 px-3 py-1 rounded hover:bg-blue-100 text-xs"
                    >
                      Edit Amounts
                    </button>
                  )}
                  {(inv.status === 'ISSUED' || inv.status === 'PARTIAL') && (
                    <button
                      onClick={() => openPayModal(inv)}
                      className="text-green-700 hover:text-green-900 font-bold bg-green-50 border border-green-200 px-3 py-1 rounded hover:bg-green-100 text-xs"
                    >
                      Process Payment
                    </button>
                  )}
                  {inv.status === 'ISSUED' && (
                    <button
                      onClick={() => markOverdue(inv.invoiceId)}
                      className="text-orange-600 hover:text-orange-900 font-medium bg-orange-50 border border-orange-200 px-3 py-1 rounded hover:bg-orange-100 text-xs"
                    >
                      Mark Overdue
                    </button>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── PaymentsTab ─────────────────────────────────────────────────────────────

interface PaymentsTabProps {
  tasks: any[];
  loading: boolean;
}

export function PaymentsTab({ tasks, loading }: PaymentsTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Payment Transactions</PageTitle>
      <TableCard>
          <TableHead cols={['Payment #', 'Invoice', 'Method', 'Reference', 'Amount']} right={[4]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={5} />
            ) : tasks.length === 0 ? (
              <TableEmpty cols={5} message="No payment records found." />
            ) : tasks.map((t: any) => (
              <tr key={t.paymentId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">PAY-{t.paymentId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">INV-{t.invoiceId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.paymentMethod}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{t.transactionReference || '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-700">${t.amount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── ReconciliationsTab ───────────────────────────────────────────────────────

interface ReconciliationsTabProps {
  reconciliations: any[];
  loading: boolean;
  runReconciliation: () => void;
}

export function ReconciliationsTab({ reconciliations, loading, runReconciliation }: ReconciliationsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Bank Reconciliations</PageTitle>
        <button
          onClick={runReconciliation}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center"
        >
          <RefreshCcw className="w-4 h-4 mr-2" /> Run Period Reconciliation
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {loading ? (
          <div className="text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400"/></div>
        ) : reconciliations.length === 0 ? (
          <div className="text-center py-8">
            <RefreshCcw className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
            <p className="text-gray-500 font-medium">No reconciliations run yet.</p>
            <p className="text-sm text-gray-400 mt-1">Click "Run Period Reconciliation" to seal this month's audit package.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reconciliations.map((r: any, idx: number) => (
              <div key={r.auditPackageId || idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold text-gray-900">Audit Package #{r.auditPackageId}</p>
                  <StatusBadge status={r.status} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs">Total Invoices</p><p className="font-bold">{r.totalInvoices}</p></div>
                  <div><p className="text-gray-500 text-xs">Collected</p><p className="font-bold text-green-700">${Number(r.totalPaymentsCollected || 0).toLocaleString()}</p></div>
                  <div><p className="text-gray-500 text-xs">Unpaid</p><p className="font-bold text-orange-600">{r.unpaidInvoiceCount}</p></div>
                  <div><p className="text-gray-500 text-xs">Reconciled By</p><p className="font-bold">{r.reconciledBy || '—'}</p></div>
                </div>
                {r.notes && <p className="text-xs text-gray-400 mt-2 italic">{r.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CommissionsTab ───────────────────────────────────────────────────────────

interface CommissionsTabProps {
  commissions: any[];
  loading: boolean;
  markCommissionPaid: (commissionId: number) => void;
}

export function CommissionsTab({ commissions, loading, markCommissionPaid }: CommissionsTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Commission Payouts</PageTitle>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total Commission Liability" value={`$${commissions.reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}`} accent="yellow" />
        <MetricCard title="Pending Payout" value={`$${commissions.filter(c => c.status !== 'PAID').reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}`} accent="red" />
        <MetricCard title="Paid Out" value={`$${commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}`} accent="green" />
      </div>

      <TableCard>
          <TableHead cols={['Comm ID', 'Deal ID', 'Sales Person', 'Status', 'Calculated At', 'Payout Amount', 'Actions']} right={[5, 6]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={7} />
            ) : commissions.length === 0 ? (
              <TableEmpty cols={7} message="No commissions pending payout. Commissions are auto-calculated when deals are finalized." />
            ) : commissions.map((c: any) => (
              <tr key={c.commissionId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{c.commissionId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.dealId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{c.salesPersonId}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {c.calculatedAt ? new Date(c.calculatedAt).toLocaleDateString() : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-700">${Number(c.commissionAmount || 0).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  {c.status !== 'PAID' && (
                    <button
                      onClick={() => markCommissionPaid(c.commissionId)}
                      className="text-green-700 hover:text-green-900 font-bold bg-green-50 border border-green-200 px-3 py-1 rounded text-xs hover:bg-green-100"
                    >
                      Mark Paid
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}
