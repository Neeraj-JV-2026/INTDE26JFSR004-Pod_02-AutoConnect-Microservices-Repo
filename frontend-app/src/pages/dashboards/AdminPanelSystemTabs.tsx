import { Loader2, Plus, AlertCircle } from 'lucide-react';
import NotificationsPanel from '../../components/NotificationsPanel';
import { StatusBadge, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── Recalls Tab ──────────────────────────────────────────────────────────────

export interface RecallsTabProps {
  loading: boolean;
  recalls: any[];
  showRecallForm: boolean;
  setShowRecallForm: (v: boolean) => void;
  recallForm: {
    recallNumber: string; description: string; affectedModels: string;
    issueDate: string; expiryDate: string; remedyDescription: string; status: string;
  };
  setRecallForm: (v: (prev: RecallsTabProps['recallForm']) => RecallsTabProps['recallForm']) => void;
  recallLoading: boolean;
  handleCreateRecall: (e: React.FormEvent) => void;
  updateRecallStatus: (id: number, status: string) => void;
}

export function RecallsTab({
  loading,
  recalls,
  showRecallForm,
  setShowRecallForm,
  recallForm,
  setRecallForm,
  recallLoading,
  handleCreateRecall,
  updateRecallStatus,
}: RecallsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <PageTitle>Recalls & Returns</PageTitle>
          <p className="text-sm text-gray-500 mt-1">Manage active vehicle recalls. Returns are handled via the Finance team.</p>
        </div>
        <button
          onClick={() => setShowRecallForm(!showRecallForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />{showRecallForm ? 'Cancel' : 'New Recall'}
        </button>
      </div>

      {showRecallForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create Recall Notice</h2>
          <form onSubmit={handleCreateRecall} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recall Number *</label>
              <input required value={recallForm.recallNumber} onChange={e => setRecallForm(p => ({ ...p, recallNumber: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. NHTSA-2024-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Models *</label>
              <input required value={recallForm.affectedModels} onChange={e => setRecallForm(p => ({ ...p, affectedModels: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="e.g. Toyota Camry 2020-2022" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea required rows={2} value={recallForm.description} onChange={e => setRecallForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none" placeholder="Describe the safety issue or defect…" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remedy Description</label>
              <textarea rows={2} value={recallForm.remedyDescription} onChange={e => setRecallForm(p => ({ ...p, remedyDescription: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none" placeholder="Describe the fix / replacement procedure…" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input type="date" value={recallForm.issueDate} onChange={e => setRecallForm(p => ({ ...p, issueDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input type="date" value={recallForm.expiryDate} onChange={e => setRecallForm(p => ({ ...p, expiryDate: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={recallLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {recallLoading ? 'Creating…' : 'Create Recall'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
      ) : recalls.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No recalls on record. Use the button above to issue a new recall notice.</p>
        </div>
      ) : (
        <TableCard>
            <TableHead cols={['Recall #', 'Affected Models', 'Issue Date', 'Status', 'Actions']} right={[4]} />
            <tbody className="bg-white divide-y divide-gray-200">
              {recalls.map((r: any) => (
                <tr key={r.recallId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.recallNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={r.affectedModels}>{r.affectedModels}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.issueDate || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {r.status === 'ACTIVE' && (
                      <button onClick={() => updateRecallStatus(r.recallId, 'COMPLETED')} className="text-green-600 hover:text-green-800 font-medium">Mark Completed</button>
                    )}
                    {r.status !== 'CANCELLED' && r.status !== 'COMPLETED' && (
                      <button onClick={() => updateRecallStatus(r.recallId, 'CANCELLED')} className="text-gray-400 hover:text-gray-600 font-medium">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </TableCard>
      )}

      {/* Returns Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <strong>Vehicle Returns:</strong> Customer return requests are processed through the Finance Dashboard as credit notes.
        Contact the Finance team or navigate to Finance → Invoicing to issue a refund or credit adjustment.
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

export interface NotificationsTabProps {
  userId: number | undefined;
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
  return (
    <NotificationsPanel userId={userId} theme="light" limit={5} />
  );
}

// ─── Audit Tab ────────────────────────────────────────────────────────────────

export interface AuditTabProps {
  loading: boolean;
  auditLogs: any[];
}

export function AuditTab({ loading, auditLogs }: AuditTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>System Audit Logs</PageTitle>
      <TableCard>
          <TableHead cols={['Timestamp', 'User ID', 'Action', 'Details']} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={4} />
            ) : auditLogs.length === 0 ? (
              <TableEmpty cols={4} message="No audit logs available." />
            ) : auditLogs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{log.userId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
    </div>
  );
}
