import { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, FileText, CreditCard, RefreshCcw, Landmark, PieChart, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { InvoicingTab, PaymentsTab, ReconciliationsTab, CommissionsTab } from './FinanceDashboardTabs';
import { PartsBillingTab, RecallsTab, ReportsTab, NotificationsTab } from './FinanceDashboardReportsTabs';
import { PaymentModal, EditAmountsModal } from './FinanceDashboardModals';
import { generatePDF } from './FinanceDashboardPDF';

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

  const handleGeneratePDF = (reportType: string) => {
    generatePDF(reportType, { invoices, commissions, allDeals, allQuotes, allVehicles, customers, user, flash });
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

  const markCommissionPaid = async (commissionId: number) => {
    try {
      await axios.patch(`http://localhost:8089/api/sales/commissions/${commissionId}/pay`);
      setCommissions(prev => prev.map(x => x.commissionId === commissionId ? { ...x, status: 'PAID' } : x));
      flash('success', `Commission #${commissionId} marked as paid.`);
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to mark commission as paid.');
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
      <PaymentModal
        payModalInvoice={payModalInvoice}
        payForm={payForm}
        setPayForm={setPayForm}
        payLoading={payLoading}
        handleProcessPayment={handleProcessPayment}
        onClose={() => setPayModalInvoice(null)}
      />

      {/* Edit Amounts Modal */}
      <EditAmountsModal
        editAmountsInvoice={editAmountsInvoice}
        editAmountsForm={editAmountsForm}
        setEditAmountsForm={setEditAmountsForm}
        editAmountsLoading={editAmountsLoading}
        handleUpdateAmounts={handleUpdateAmounts}
        onClose={() => setEditAmountsInvoice(null)}
      />

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
            <InvoicingTab
              invoices={invoices}
              customers={customers}
              loading={loading}
              showInvoiceForm={showInvoiceForm}
              setShowInvoiceForm={setShowInvoiceForm}
              newInvoice={newInvoice}
              setNewInvoice={setNewInvoice}
              invoiceSubmitLoading={invoiceSubmitLoading}
              handleInvoiceSubmit={handleInvoiceSubmit}
              outstanding={outstanding}
              collected={collected}
              overdue={overdue}
              openEditAmounts={openEditAmounts}
              openPayModal={openPayModal}
              markOverdue={markOverdue}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsTab tasks={tasks} loading={loading} />
          )}

          {activeTab === 'refunds' && (
            <ReconciliationsTab
              reconciliations={reconciliations}
              loading={loading}
              runReconciliation={runReconciliation}
            />
          )}

          {activeTab === 'commissions' && (
            <CommissionsTab
              commissions={commissions}
              loading={loading}
              markCommissionPaid={markCommissionPaid}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab reports={reports} generatePDF={handleGeneratePDF} />
          )}
          
          {/* PARTS BILLING TAB */}
          {activeTab === 'parts-billing' && (
            <PartsBillingTab
              inventoryParts={inventoryParts}
              partsBillingSearch={partsBillingSearch}
              setPartsBillingSearch={setPartsBillingSearch}
              loading={loading}
              showRecallBilling={showRecallBilling}
              setShowRecallBilling={setShowRecallBilling}
              recallBillingForm={recallBillingForm}
              setRecallBillingForm={setRecallBillingForm}
              recallBillingLoading={recallBillingLoading}
              handleBillRecallRemediation={handleBillRecallRemediation}
              recalls={recalls}
              customers={customers}
            />
          )}

          {activeTab === 'recalls' && (
            <RecallsTab recalls={recalls} loading={loading} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab userId={user?.id} />
          )}

        </div>
      </div>
    </div>
  );
}
