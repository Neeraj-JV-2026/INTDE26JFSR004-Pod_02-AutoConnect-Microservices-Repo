import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, FileText, CreditCard, RefreshCcw, Landmark, PieChart, Loader2, Download, X, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';

export default function FinanceDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoicing');
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [reconciliations, setReconciliations] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);

  // Reference data for smart dropdowns
  const [customers, setCustomers] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);

  // Global feedback
  const [flashMsg, setFlashMsg] = useState<{type: 'success' | 'error'; text: string} | null>(null);
  const flash = (type: 'success' | 'error', text: string) => {
    setFlashMsg({ type, text });
    setTimeout(() => setFlashMsg(null), type === 'error' ? 8000 : 4000);
  };

  // Payment modal
  const [payModalInvoice, setPayModalInvoice] = useState<any | null>(null);
  const [payForm, setPayForm] = useState({ paymentMethod: 'CREDIT_CARD', transactionReference: '', amount: 0 });
  const [payLoading, setPayLoading] = useState(false);

  // Edit Amounts modal (for auto-generated service invoices)
  const [editAmountsInvoice, setEditAmountsInvoice] = useState<any | null>(null);
  const [editAmountsForm, setEditAmountsForm] = useState({ subTotal: 0, taxAmount: 0 });
  const [editAmountsLoading, setEditAmountsLoading] = useState(false);

  const openEditAmounts = (inv: any) => {
    setEditAmountsInvoice(inv);
    setEditAmountsForm({ subTotal: inv.subTotal || 0, taxAmount: inv.taxAmount || 0 });
  };

  const handleUpdateAmounts = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editAmountsInvoice) return;
    setEditAmountsLoading(true);
    try {
      const res = await axios.patch(
        `http://localhost:8089/api/finance/invoices/${editAmountsInvoice.invoiceId}/amounts`,
        null,
        { params: { subTotal: editAmountsForm.subTotal, taxAmount: editAmountsForm.taxAmount } }
      );
      setInvoices(prev => prev.map(i => i.invoiceId === editAmountsInvoice.invoiceId ? res.data : i));
      setEditAmountsInvoice(null);
      flash('success', `INV-${editAmountsInvoice.invoiceId} amounts updated. Total: $${res.data.totalAmount?.toLocaleString()}`);
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to update invoice amounts.');
    } finally {
      setEditAmountsLoading(false);
    }
  };

  const openPayModal = (inv: any) => {
    setPayModalInvoice(inv);
    setPayForm({ paymentMethod: 'CREDIT_CARD', transactionReference: '', amount: inv.totalAmount || 0 });
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalInvoice) return;
    setPayLoading(true);
    try {
      // 1. Record the payment transaction
      await axios.post('http://localhost:8089/api/finance/payments', {
        invoiceId: payModalInvoice.invoiceId,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        transactionReference: payForm.transactionReference || undefined,
      });
      // 2. Update invoice status to PAID
      await axios.patch(`http://localhost:8089/api/finance/invoices/${payModalInvoice.invoiceId}/status?status=PAID`);
      setInvoices(invoices.map(i => i.invoiceId === payModalInvoice.invoiceId ? { ...i, status: 'PAID' } : i));
      setPayModalInvoice(null);
      flash('success', `Invoice INV-${payModalInvoice.invoiceId} marked PAID. Payment recorded.`);
      // 3. Notify customer — resolve userId from invoice's customerId (non-blocking)
      const customerId = payModalInvoice.customerId;
      if (customerId) {
        axios.get(`http://localhost:8089/api/customers/${customerId}`)
          .then(res => {
            const userId = res.data?.userId;
            if (userId) {
              axios.post('http://localhost:8089/api/notifications', {
                userId, channel: 'IN_APP',
                notificationType: 'PAYMENT_RECEIVED',
                subject: 'Payment Confirmed 💳',
                message: `Your payment of $${Number(payForm.amount).toLocaleString()} for Invoice INV-${payModalInvoice.invoiceId} has been received and confirmed. Thank you for your business!`,
              }).catch(() => {});
            }
          }).catch(() => {});
      }
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setPayLoading(false);
    }
  };

  const markOverdue = async (invoiceId: number) => {
    try {
      await axios.patch(`http://localhost:8089/api/finance/invoices/${invoiceId}/status?status=OVERDUE`);
      setInvoices(invoices.map(i => i.invoiceId === invoiceId ? { ...i, status: 'OVERDUE' } : i));
      flash('success', `Invoice INV-${invoiceId} marked OVERDUE.`);
    } catch {
      flash('error', 'Failed to update invoice status.');
    }
  };

  // Strip timezone Z and fractional seconds so Spring's LocalDateTime can parse it
  const toLocalISO = (d: Date) => d.toISOString().split('.')[0];

  const runReconciliation = async () => {
    try {
      const now = new Date();
      const start = toLocalISO(new Date(now.getFullYear(), now.getMonth(), 1));
      const end = toLocalISO(new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59));
      const res = await axios.post('http://localhost:8089/api/finance/reconciliation/run', {
        periodStart: start,
        periodEnd: end,
        notes: `Manual reconciliation run — ${now.toLocaleString()}`,
      });
      setReconciliations(prev => [res.data, ...prev]);
      flash('success', 'Reconciliation completed. Audit package sealed.');
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Reconciliation run failed.');
    }
  };

  const generatePDF = async (reportType: string) => {
    // Save report record in backend (best-effort, non-blocking)
    try {
      await axios.post('http://localhost:8089/api/finance/reports', {
        type: 'FINANCE',
        filters: JSON.stringify({ reportType }),
        generatedBy: user?.name || 'Finance Officer',
      });
    } catch { /* non-critical */ }

    const now = new Date();
    const totalRevenue = invoices.reduce((s, i: any) => s + (i.totalAmount || 0), 0);
    const paidRevenue  = invoices.filter((i: any) => i.status === 'PAID').reduce((s, i: any) => s + (i.totalAmount || 0), 0);
    const invoiceRows  = invoices.map((inv: any) =>
      `<tr>
        <td>INV-${inv.invoiceId}</td>
        <td>${customers.find((c: any) => c.customerId === inv.customerId)?.name || 'Customer #' + inv.customerId}</td>
        <td>${inv.relatedEntityType || '—'}</td>
        <td><span style="padding:2px 8px;border-radius:10px;font-size:11px;background:${inv.status === 'PAID' ? '#d1fae5' : inv.status === 'OVERDUE' ? '#fee2e2' : '#fef9c3'};color:#333">${inv.status}</span></td>
        <td style="text-align:right;font-weight:bold">$${(inv.totalAmount || 0).toLocaleString()}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html><head>
  <title>${reportType} — AutoConnect</title>
  <style>
    body{font-family:Arial,sans-serif;margin:40px;color:#222}
    .hdr{border-bottom:3px solid #166534;padding-bottom:14px;margin-bottom:22px}
    .hdr h1{margin:0;color:#166534;font-size:26px}
    .hdr p{margin:3px 0;color:#555;font-size:12px}
    .cards{display:flex;gap:20px;margin-bottom:22px;flex-wrap:wrap}
    .card{border:1px solid #d1d5db;border-radius:8px;padding:14px 20px;min-width:140px}
    .card .lbl{font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.5px}
    .card .val{font-size:22px;font-weight:bold;color:#166534;margin-top:3px}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    th{background:#166534;color:#fff;padding:9px 12px;text-align:left;font-size:11px;text-transform:uppercase}
    td{padding:8px 12px;border-bottom:1px solid #f3f4f6;font-size:13px}
    tr:nth-child(even) td{background:#f9fafb}
    .footer{margin-top:36px;padding-top:10px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px}
  </style>
</head><body>
  <div class="hdr">
    <h1>AutoConnect Automotive Group</h1>
    <p><strong>${reportType}</strong></p>
    <p>Generated: ${now.toLocaleString()} &nbsp;|&nbsp; Period: ${now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
  </div>
  <div class="cards">
    <div class="card"><div class="lbl">Total Invoiced</div><div class="val">$${totalRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Collected</div><div class="val">$${paidRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Outstanding</div><div class="val">$${(totalRevenue - paidRevenue).toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Transactions</div><div class="val">${invoices.length}</div></div>
  </div>
  <h3 style="font-size:14px;margin-bottom:6px">Invoice Detail</h3>
  <table>
    <thead><tr><th>Invoice</th><th>Customer</th><th>Type</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${invoiceRows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:20px">No invoice data loaded — open Invoicing tab first</td></tr>'}</tbody>
  </table>
  <div class="footer">AutoConnect Financial Systems &nbsp;|&nbsp; Report: RPT-${Date.now().toString(36).toUpperCase()} &nbsp;|&nbsp; Confidential — Do Not Distribute</div>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.addEventListener('load', () => win.print());
    } else {
      flash('error', 'Pop-up blocked — please allow pop-ups for this site and try again.');
    }
  };

  // Pre-load customers once so the invoice form shows names
  useEffect(() => {
    axios.get('http://localhost:8089/api/customers')
      .then(res => {
        const data: any[] = res.data || [];
        setCustomers(data);
        if (data.length > 0) setNewInvoice(prev => ({ ...prev, customerId: data[0].customerId }));
      }).catch(() => {});
  }, []);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  // InvoiceRequestDTO fields: customerId, relatedEntityType, relatedEntityId, subTotal, taxAmount, dueAt
  // totalAmount is computed for display only; status is set by backend (always starts as ISSUED)
  const [newInvoice, setNewInvoice] = useState({
    customerId: 1, relatedEntityType: 'VEHICLE', relatedEntityId: 1, subTotal: 0.00, taxAmount: 0.00, totalAmount: 0.00
  });
  const [invoiceSubmitLoading, setInvoiceSubmitLoading] = useState(false);

  useEffect(() => {
    setNewInvoice(prev => ({...prev, totalAmount: prev.subTotal + prev.taxAmount}));
  }, [newInvoice.subTotal, newInvoice.taxAmount]);

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInvoiceSubmitLoading(true);
    try {
      // Only send InvoiceRequestDTO fields — totalAmount and status are not accepted
      const { totalAmount: _ignored, ...invoicePayload } = newInvoice;
      const res = await axios.post('http://localhost:8089/api/finance/invoices', invoicePayload);
      setInvoices([...invoices, res.data]);
      setShowInvoiceForm(false);
      setNewInvoice({ customerId: 1, relatedEntityType: 'VEHICLE', relatedEntityId: 1, subTotal: 0, taxAmount: 0, totalAmount: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setInvoiceSubmitLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'invoicing') {
      axios.get('http://localhost:8089/api/finance/invoices').then(res => setInvoices(res.data)).catch(() => setInvoices([])).finally(() => setLoading(false));
    } else if (activeTab === 'payments') {
      // GET /api/finance/payments — actual payment transaction records
      axios.get('http://localhost:8089/api/finance/payments').then(res => setTasks(res.data)).catch(() => setTasks([])).finally(() => setLoading(false));
    } else if (activeTab === 'refunds') {
      // No GET endpoint for reconciliation — results are populated after running
      setLoading(false);
    } else if (activeTab === 'commissions') {
      axios.get('http://localhost:8089/api/sales/commissions').then(res => setCommissions(res.data)).catch(() => setCommissions([])).finally(() => setLoading(false));
    } else if (activeTab === 'reports') {
      axios.get('http://localhost:8089/api/finance/reports').then(res => setReports(res.data)).catch(() => setReports([])).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const outstanding = invoices.filter(i => i.status === 'ISSUED' || i.status === 'PARTIAL').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const collected = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + (i.totalAmount || 0), 0);
  const overdue = invoices.filter(i => i.status === 'OVERDUE').reduce((sum, i) => sum + (i.totalAmount || 0), 0);

  const tabs = [
    { id: 'invoicing', name: 'Invoicing & Receivables', icon: FileText },
    { id: 'payments', name: 'Accounts Payable', icon: CreditCard },
    { id: 'refunds', name: 'Reconciliations', icon: RefreshCcw },
    { id: 'commissions', name: 'Commission Payouts', icon: DollarSign },
    { id: 'reports', name: 'Financial Reports', icon: PieChart },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-green-50/30 flex">

      {/* Payment Processing Modal */}
      {payModalInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Process Payment — INV-{payModalInvoice.invoiceId}</h2>
              <button onClick={() => setPayModalInvoice(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Outstanding balance: <span className="font-bold text-gray-900">${payModalInvoice.totalAmount?.toLocaleString()}</span>
            </p>
            <form onSubmit={handleProcessPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount ($)</label>
                <input
                  type="number" step="0.01" required min={0.01}
                  value={payForm.amount}
                  onChange={e => setPayForm({...payForm, amount: parseFloat(e.target.value)})}
                  className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={payForm.paymentMethod}
                  onChange={e => setPayForm({...payForm, paymentMethod: e.target.value})}
                  className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm bg-white"
                >
                  <option value="CREDIT_CARD">Credit / Debit Card</option>
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer (EFT)</option>
                  <option value="FINANCING">Financing / Loan</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Reference (optional)</label>
                <input
                  type="text"
                  value={payForm.transactionReference}
                  onChange={e => setPayForm({...payForm, transactionReference: e.target.value})}
                  placeholder="e.g. TXN-12345 or cheque number"
                  className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setPayModalInvoice(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={payLoading} className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50">
                  {payLoading ? <span className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</span> : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Amounts Modal */}
      {editAmountsInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Amounts — INV-{editAmountsInvoice.invoiceId}</h2>
              <button onClick={() => setEditAmountsInvoice(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Adjust the labor and tax amounts for this service invoice. The total will be recalculated automatically.
            </p>
            <form onSubmit={handleUpdateAmounts} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor / Parts Subtotal ($)</label>
                <input
                  type="number" step="0.01" required min={0}
                  value={editAmountsForm.subTotal}
                  onChange={e => setEditAmountsForm({ ...editAmountsForm, subTotal: parseFloat(e.target.value) || 0 })}
                  className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Amount ($)</label>
                <input
                  type="number" step="0.01" required min={0}
                  value={editAmountsForm.taxAmount}
                  onChange={e => setEditAmountsForm({ ...editAmountsForm, taxAmount: parseFloat(e.target.value) || 0 })}
                  className="block w-full border border-gray-300 rounded-md px-4 py-2 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Suggested: ${(editAmountsForm.subTotal * 0.1).toFixed(2)} (10%)
                  &nbsp;·&nbsp; Total will be: <span className="font-semibold text-gray-700">${(editAmountsForm.subTotal + editAmountsForm.taxAmount).toFixed(2)}</span>
                </p>
              </div>
              <div className="flex justify-end space-x-3 pt-2">
                <button type="button" onClick={() => setEditAmountsInvoice(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={editAmountsLoading} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
                  {editAmountsLoading ? <span className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</span> : 'Save Amounts'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flash messages */}
      {flashMsg && (
        <div className={`fixed top-4 right-4 z-40 flex items-center p-4 rounded-xl shadow-lg border ${flashMsg.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          {flashMsg.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />}
          {flashMsg.text}
        </div>
      )}
      <div className="w-64 bg-green-950 text-green-100 flex-shrink-0">
        <div className="p-6 border-b border-green-900">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Landmark className="w-6 h-6 mr-2 text-green-400" />
            Finance Console
          </h2>
          <p className="text-xs text-green-300 mt-2">Officer: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-green-900 text-green-400 border-l-4 border-green-400 font-medium'
                  : 'hover:bg-green-900 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'invoicing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Accounts Receivable</h1>
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
                      </select>
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : invoices.length === 0 ? (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No invoices found.</td></tr>
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
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            inv.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            inv.status === 'ISSUED' ? 'bg-yellow-100 text-yellow-800' :
                            inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {inv.status}
                          </span>
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
                </table>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Payment Transactions</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : tasks.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No payment records found.</td></tr>
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
                </table>
              </div>
            </div>
          )}

          {activeTab === 'refunds' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliations</h1>
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
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${r.status === 'BALANCED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
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
          )}

          {activeTab === 'commissions' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Commission Payouts</h1>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-500">
                  <p className="text-sm font-medium text-gray-500 uppercase">Total Commission Liability</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">${commissions.reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500">
                  <p className="text-sm font-medium text-gray-500 uppercase">Pending Payout</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">${commissions.filter(c => c.status !== 'PAID').reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                  <p className="text-sm font-medium text-gray-500 uppercase">Paid Out</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">${commissions.filter(c => c.status === 'PAID').reduce((s, c) => s + (c.commissionAmount || 0), 0).toLocaleString()}</h3>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comm ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sales Person</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Calculated At</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Payout Amount</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={7} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : commissions.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No commissions pending payout. Commissions are auto-calculated when deals are finalized.</td></tr>
                    ) : commissions.map((c: any) => (
                      <tr key={c.commissionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{c.commissionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.dealId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">User #{c.salesPersonId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            c.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            c.status === 'CALCULATED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{c.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.calculatedAt ? new Date(c.calculatedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-700">${Number(c.commissionAmount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {c.status !== 'PAID' && (
                            <button
                              onClick={async () => {
                                try {
                                  await axios.patch(`http://localhost:8089/api/sales/commissions/${c.commissionId}/pay`);
                                  setCommissions(prev => prev.map(x => x.commissionId === c.commissionId ? { ...x, status: 'PAID' } : x));
                                  flash('success', `Commission #${c.commissionId} marked as paid.`);
                                } catch (err: any) {
                                  flash('error', err?.response?.data?.message || 'Failed to mark commission as paid.');
                                }
                              }}
                              className="text-green-700 hover:text-green-900 font-bold bg-green-50 border border-green-200 px-3 py-1 rounded text-xs hover:bg-green-100"
                            >
                              Mark Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Financial Reports</h1>
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
                  {reports.map((r:any) => (
                    <p key={r.id} className="text-sm text-gray-600">{r.name || 'Report'} - {r.date}</p>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}

        </div>
      </div>
    </div>
  );
}
