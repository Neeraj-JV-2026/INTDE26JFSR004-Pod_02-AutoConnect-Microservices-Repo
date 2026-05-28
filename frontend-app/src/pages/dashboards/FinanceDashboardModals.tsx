import { X, Loader2 } from 'lucide-react';

// ─── PaymentModal ─────────────────────────────────────────────────────────────

interface PaymentModalProps {
  payModalInvoice: any;
  payForm: { paymentMethod: string; transactionReference: string; amount: number };
  setPayForm: React.Dispatch<React.SetStateAction<{ paymentMethod: string; transactionReference: string; amount: number }>>;
  payLoading: boolean;
  handleProcessPayment: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function PaymentModal({
  payModalInvoice,
  payForm,
  setPayForm,
  payLoading,
  handleProcessPayment,
  onClose,
}: PaymentModalProps) {
  if (!payModalInvoice) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Process Payment — INV-{payModalInvoice.invoiceId}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={payLoading} className="px-6 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold disabled:opacity-50">
              {payLoading ? <span className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Processing...</span> : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── EditAmountsModal ─────────────────────────────────────────────────────────

interface EditAmountsModalProps {
  editAmountsInvoice: any;
  editAmountsForm: { subTotal: number; taxAmount: number };
  setEditAmountsForm: React.Dispatch<React.SetStateAction<{ subTotal: number; taxAmount: number }>>;
  editAmountsLoading: boolean;
  handleUpdateAmounts: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function EditAmountsModal({
  editAmountsInvoice,
  editAmountsForm,
  setEditAmountsForm,
  editAmountsLoading,
  handleUpdateAmounts,
  onClose,
}: EditAmountsModalProps) {
  if (!editAmountsInvoice) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Amounts — INV-{editAmountsInvoice.invoiceId}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
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
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={editAmountsLoading} className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50">
              {editAmountsLoading ? <span className="flex items-center"><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving...</span> : 'Save Amounts'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
