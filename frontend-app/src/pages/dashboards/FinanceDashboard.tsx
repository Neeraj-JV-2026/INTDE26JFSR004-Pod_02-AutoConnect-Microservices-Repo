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
  // For P&L MSRP calculation
  const [allDeals, setAllDeals] = useState<any[]>([]);
  const [allQuotes, setAllQuotes] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);

  // Parts billing
  const [inventoryParts, setInventoryParts] = useState<any[]>([]);
  const [partsBillingSearch, setPartsBillingSearch] = useState('');

  // Recall remediation billing
  const [showRecallBilling, setShowRecallBilling] = useState(false);
  const [recallBillingForm, setRecallBillingForm] = useState({ recallId: '', customerId: 0, laborCost: 0, partsCost: 0, notes: '' });
  const [recallBillingLoading, setRecallBillingLoading] = useState(false);

  // Recalls
  const [recalls, setRecalls] = useState<any[]>([]);

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

    // ── Invoice summary ──────────────────────────────────────────────
    const totalRevenue = invoices.reduce((s, i: any) => s + (i.totalAmount || 0), 0);
    const paidRevenue  = invoices.filter((i: any) => i.status === 'PAID').reduce((s, i: any) => s + (i.totalAmount || 0), 0);

    // ── P&L calculation ───────────────────────────────────────────────
    // Vehicle sale revenue: DEAL-type PAID invoices
    const dealInvoicesPaid = invoices.filter((i: any) => i.relatedEntityType === 'DEAL' && i.status === 'PAID');
    const serviceInvoicesPaid = invoices.filter((i: any) => i.relatedEntityType === 'WORK_ORDER' && i.status === 'PAID');

    let vehicleSalesRevenue = 0;
    let vehicleMSRPCost = 0;
    const plRows: string[] = [];

    dealInvoicesPaid.forEach((inv: any) => {
      vehicleSalesRevenue += inv.totalAmount || 0;
      const deal   = allDeals.find((d: any) => d.dealId === inv.relatedEntityId);
      const quote  = allQuotes.find((q: any) => q.quoteId === deal?.quoteId);
      const vehicle = allVehicles.find((v: any) => v.vehicleId === quote?.vehicleId);
      const msrp   = vehicle?.msrp || 0;
      vehicleMSRPCost += msrp;
      const profit = (inv.totalAmount || 0) - msrp;
      const margin = msrp > 0 ? ((profit / msrp) * 100).toFixed(1) : '—';
      plRows.push(`<tr>
        <td>INV-${inv.invoiceId}</td>
        <td>${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `Deal #${inv.relatedEntityId}`}</td>
        <td>${customers.find((c: any) => c.customerId === inv.customerId)?.name || `#${inv.customerId}`}</td>
        <td style="text-align:right">$${(inv.totalAmount || 0).toLocaleString()}</td>
        <td style="text-align:right">$${msrp.toLocaleString()}</td>
        <td style="text-align:right;font-weight:bold;color:${profit >= 0 ? '#166534' : '#dc2626'}">
          ${profit >= 0 ? '+' : ''}$${profit.toLocaleString()}
        </td>
        <td style="text-align:right">${margin !== '—' ? margin + '%' : '—'}</td>
      </tr>`);
    });

    const serviceRevenue = serviceInvoicesPaid.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0);
    const grossProfit = vehicleSalesRevenue - vehicleMSRPCost;
    const netRevenue  = vehicleSalesRevenue + serviceRevenue;
    const totalCOGS   = vehicleMSRPCost;
    const totalCommissions = commissions.filter((c: any) => c.status === 'PAID').reduce((s: number, c: any) => s + (c.commissionAmount || 0), 0);
    const netProfit   = grossProfit + serviceRevenue - totalCommissions;
    const overallMargin = netRevenue > 0 ? ((netProfit / netRevenue) * 100).toFixed(1) : '0.0';

    const invoiceRows = invoices.map((inv: any) =>
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
    .section-title{font-size:15px;font-weight:bold;margin:24px 0 8px;color:#111;border-bottom:2px solid #e5e7eb;padding-bottom:4px}
    .cards{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}
    .card{border:1px solid #d1d5db;border-radius:8px;padding:12px 18px;min-width:130px}
    .card .lbl{font-size:10px;text-transform:uppercase;color:#6b7280;letter-spacing:.5px}
    .card .val{font-size:20px;font-weight:bold;color:#166534;margin-top:3px}
    .card .val.loss{color:#dc2626}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    th{background:#166534;color:#fff;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase}
    td{padding:7px 10px;border-bottom:1px solid #f3f4f6;font-size:12px}
    tr:nth-child(even) td{background:#f9fafb}
    .footer{margin-top:36px;padding-top:10px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px}
  </style>
</head><body>
  <div class="hdr">
    <h1>AutoConnect Automotive Group</h1>
    <p><strong>${reportType}</strong></p>
    <p>Generated: ${now.toLocaleString()} &nbsp;|&nbsp; Period: ${now.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</p>
  </div>

  <div class="section-title">Profit &amp; Loss Statement</div>
  <div class="cards">
    <div class="card"><div class="lbl">Vehicle Sales Revenue</div><div class="val">$${vehicleSalesRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Service Revenue</div><div class="val">$${serviceRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Total Revenue</div><div class="val">$${netRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Cost (MSRP)</div><div class="val loss">$${totalCOGS.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Gross Profit</div><div class="val ${grossProfit < 0 ? 'loss' : ''}">$${grossProfit.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Commissions Paid</div><div class="val loss">$${totalCommissions.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Net Profit</div><div class="val ${netProfit < 0 ? 'loss' : ''}">$${netProfit.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Net Margin</div><div class="val ${netProfit < 0 ? 'loss' : ''}">${overallMargin}%</div></div>
  </div>

  <div class="section-title">Vehicle Sales Detail (PAID Deals)</div>
  <table>
    <thead><tr><th>Invoice</th><th>Vehicle</th><th>Customer</th><th style="text-align:right">Sale Price</th><th style="text-align:right">MSRP (Cost)</th><th style="text-align:right">Gross Profit</th><th style="text-align:right">Margin</th></tr></thead>
    <tbody>${plRows.length ? plRows.join('') : '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:16px">No finalized vehicle deals in this period</td></tr>'}</tbody>
  </table>

  <div class="section-title">Invoice Summary</div>
  <div class="cards">
    <div class="card"><div class="lbl">Total Invoiced</div><div class="val">$${totalRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Collected</div><div class="val">$${paidRevenue.toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Outstanding</div><div class="val">${(totalRevenue - paidRevenue).toLocaleString()}</div></div>
    <div class="card"><div class="lbl">Transactions</div><div class="val">${invoices.length}</div></div>
  </div>
  <table>
    <thead><tr><th>Invoice</th><th>Customer</th><th>Type</th><th>Status</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${invoiceRows || '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:16px">No invoice data loaded — open Invoicing tab first</td></tr>'}</tbody>
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

  const handleBillRecallRemediation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recallBillingForm.recallId || !recallBillingForm.customerId) {
      flash('error', 'Please select a recall and a customer.');
      return;
    }
    setRecallBillingLoading(true);
    try {
      const subTotal = Number(recallBillingForm.laborCost) + Number(recallBillingForm.partsCost);
      const taxAmount = parseFloat((subTotal * 0.1).toFixed(2));
      const res = await axios.post('http://localhost:8089/api/finance/invoices', {
        customerId: recallBillingForm.customerId,
        relatedEntityType: 'RECALL',
        relatedEntityId: parseInt(recallBillingForm.recallId),
        subTotal,
        taxAmount,
      });
      setInvoices(prev => [res.data, ...prev]);
      flash('success', `Recall remediation invoice INV-${res.data.invoiceId} created. Total: $${(subTotal + taxAmount).toLocaleString()}`);
      setShowRecallBilling(false);
      setRecallBillingForm({ recallId: '', customerId: 0, laborCost: 0, partsCost: 0, notes: '' });
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to create recall invoice.');
    } finally {
      setRecallBillingLoading(false);
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
    } else if (activeTab === 'recalls') {
      axios.get('http://localhost:8089/api/v1/inventory/recalls')
        .then(res => setRecalls(res.data || []))
        .catch(() => setRecalls([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'parts-billing') {
      Promise.all([
        axios.get('http://localhost:8089/api/v1/inventory/parts').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/v1/inventory/recalls').catch(() => ({ data: [] })),
      ]).then(([partsRes, recallsRes]) => {
        setInventoryParts(partsRes.data || []);
        setRecalls(recallsRes.data || []);
      }).finally(() => setLoading(false));
    } else if (activeTab === 'reports') {
      Promise.all([
        axios.get('http://localhost:8089/api/finance/reports').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/sales/deals').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/sales/quotes').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/inventory/vehicles').catch(() => ({ data: [] })),
      ]).then(([repRes, dealRes, quoteRes, vehRes]) => {
        setReports(repRes.data || []);
        setAllDeals(dealRes.data || []);
        setAllQuotes(quoteRes.data || []);
        setAllVehicles(vehRes.data || []);
      }).finally(() => setLoading(false));
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
    { id: 'parts-billing', name: 'Parts Billing', icon: Landmark },
    { id: 'recalls', name: 'Recalls & Returns', icon: AlertCircle },
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
          
          {/* PARTS BILLING TAB */}
          {activeTab === 'parts-billing' && (() => {
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
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-400">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Total Parts Cost (Catalog)</h3>
                    <p className="text-3xl font-bold text-gray-900">${totalCatalogValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Sum of purchase cost across {inventoryParts.length} parts</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Total Retail Value</h3>
                    <p className="text-3xl font-bold text-gray-900">${totalRetailValue.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-1">Retail price × parts count</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-yellow-400">
                    <h3 className="text-gray-500 text-sm font-medium mb-1">Average Parts Margin</h3>
                    <p className="text-3xl font-bold text-gray-900">{avgMargin}%</p>
                    <p className="text-xs text-gray-400 mt-1">Retail − Cost ÷ Retail</p>
                  </div>
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
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Part #</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Manufacturer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Retail</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margin</th>
                        </tr>
                      </thead>
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
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                  {p.status || 'ACTIVE'}
                                </span>
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
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'recalls' && (
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
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500">
                  <p className="text-sm font-medium text-gray-500 uppercase">Active Recalls</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{recalls.filter((r: any) => r.status === 'ACTIVE').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                  <p className="text-sm font-medium text-gray-500 uppercase">Completed</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{recalls.filter((r: any) => r.status === 'COMPLETED').length}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-gray-400">
                  <p className="text-sm font-medium text-gray-500 uppercase">Total Recalls</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{recalls.length}</h3>
                </div>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affected Models</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remedy</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
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
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                              r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {r.status || 'UNKNOWN'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
