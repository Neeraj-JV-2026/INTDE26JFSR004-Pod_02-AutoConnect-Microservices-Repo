// ServiceAdvisorModals.tsx
// Extracted modals from ServiceAdvisorConsole.tsx
import axios from 'axios';
import SearchableSelect from '../../components/SearchableSelect';

const INTAKE_CHECKLIST = [
  'Verify customer ID and contact details',
  'Check vehicle odometer reading',
  'Inspect exterior for pre-existing damage',
  'Inspect interior condition',
  'Check fuel level',
  'Verify all keys / key fobs present',
  'Customer signature on intake form obtained',
  'Vehicle photos taken',
];

// ---------------------------------------------------------------------------
// ApproveClaimModal
// ---------------------------------------------------------------------------

export interface ApproveClaimModalProps {
  approvingClaim: { claimId: number } | null;
  approveAmount: string;
  setApproveAmount: React.Dispatch<React.SetStateAction<string>>;
  approveLoading: boolean;
  handleApproveClaim: () => void;
  onClose: () => void;
}

export function ApproveClaimModal({
  approvingClaim,
  approveAmount,
  setApproveAmount,
  approveLoading,
  handleApproveClaim,
  onClose,
}: ApproveClaimModalProps) {
  if (!approvingClaim) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Approve Claim #{approvingClaim.claimId}</h3>
        <label className="block text-sm text-slate-600 mb-1">Approved Amount ($)</label>
        <input
          type="number"
          value={approveAmount}
          onChange={e => setApproveAmount(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
          placeholder="0.00"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApproveClaim}
            disabled={approveLoading}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {approveLoading ? 'Saving…' : 'Confirm Approval'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RejectClaimModal
// ---------------------------------------------------------------------------

export interface RejectClaimModalProps {
  rejectingClaim: { claimId: number } | null;
  rejectReason: string;
  setRejectReason: React.Dispatch<React.SetStateAction<string>>;
  rejectLoading: boolean;
  handleRejectClaim: () => void;
  onClose: () => void;
}

export function RejectClaimModal({
  rejectingClaim,
  rejectReason,
  setRejectReason,
  rejectLoading,
  handleRejectClaim,
  onClose,
}: RejectClaimModalProps) {
  if (!rejectingClaim) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
        <h3 className="font-bold text-slate-900 mb-3">Reject Claim #{rejectingClaim.claimId}</h3>
        <label className="block text-sm text-slate-600 mb-1">Reason for rejection</label>
        <textarea
          value={rejectReason}
          onChange={e => setRejectReason(e.target.value)}
          rows={3}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-red-400 outline-none resize-none"
          placeholder="Describe why the claim is being rejected…"
        />
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleRejectClaim}
            disabled={rejectLoading || !rejectReason.trim()}
            className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
          >
            {rejectLoading ? 'Saving…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VehicleIntakeModal
// ---------------------------------------------------------------------------

export interface VehicleIntakeModalProps {
  intakeAppt: any | null;
  intakeChecks: Record<string, boolean>;
  setIntakeChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  intakeNotes: string;
  setIntakeNotes: React.Dispatch<React.SetStateAction<string>>;
  intakeSubmitting: boolean;
  setIntakeSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
}

export function VehicleIntakeModal({
  intakeAppt,
  intakeChecks,
  setIntakeChecks,
  intakeNotes,
  setIntakeNotes,
  intakeSubmitting,
  setIntakeSubmitting,
  onClose,
}: VehicleIntakeModalProps) {
  if (!intakeAppt) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Vehicle Intake Checklist</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
          </div>
          <p className="text-sm text-gray-500 mt-1">Appointment #{intakeAppt.appId} — {intakeAppt.serviceType}</p>
        </div>
        <div className="p-6 space-y-3">
          {INTAKE_CHECKLIST.map((item, i) => (
            <label key={i} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                checked={!!intakeChecks[item]}
                onChange={e => setIntakeChecks(prev => ({ ...prev, [item]: e.target.checked }))}
                className="w-5 h-5 rounded text-blue-600"
              />
              <span className={`text-sm ${intakeChecks[item] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
            </label>
          ))}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea
              value={intakeNotes}
              onChange={e => setIntakeNotes(e.target.value)}
              rows={3}
              placeholder="Any visible damage, customer concerns, special instructions..."
              className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {Object.values(intakeChecks).filter(Boolean).length}/{INTAKE_CHECKLIST.length} items checked
          </span>
          <div className="flex space-x-3">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button
              disabled={intakeSubmitting}
              onClick={async () => {
                setIntakeSubmitting(true);
                try {
                  // Save intake notes as a job note (use appointment update or a comment endpoint)
                  await axios.put(`http://localhost:8089/api/appointments/${intakeAppt.appId}`, {
                    ...intakeAppt,
                    notes: `INTAKE: ${intakeNotes} | Checks: ${Object.entries(intakeChecks).filter(([,v]) => v).map(([k]) => k).join('; ')}`,
                  });
                } catch { /* non-critical */ } finally {
                  setIntakeSubmitting(false);
                  onClose();
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {intakeSubmitting ? 'Saving...' : 'Complete Intake'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AssignJobCardModal
// ---------------------------------------------------------------------------

export interface AssignJobCardModalProps {
  assignJobAptId: number | null;
  jobError: string | null;
  technicians: any[];
  newJobCard: { technicianId: number; reportedIssues: string; estimatedHours: number };
  setNewJobCard: React.Dispatch<React.SetStateAction<{ technicianId: number; reportedIssues: string; estimatedHours: number }>>;
  jobSubmitLoading: boolean;
  handleJobCardSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function AssignJobCardModal({
  assignJobAptId,
  jobError,
  technicians,
  newJobCard,
  setNewJobCard,
  jobSubmitLoading,
  handleJobCardSubmit,
  onClose,
}: AssignJobCardModalProps) {
  if (!assignJobAptId) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Assign Job Card (Apt #{assignJobAptId})</h2>
        {jobError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
            {jobError}
          </div>
        )}
        <form onSubmit={handleJobCardSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
            <SearchableSelect
              options={technicians.map(t => ({ value: t.userId, label: t.name }))}
              value={newJobCard.technicianId}
              onChange={v => setNewJobCard({...newJobCard, technicianId: v})}
              placeholder="Select technician"
              loadingText="Loading technicians…"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Reported Issue / Notes</label>
            <textarea required value={newJobCard.reportedIssues} onChange={e => setNewJobCard({...newJobCard, reportedIssues: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" rows={3}></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Hours</label>
            <input type="number" step="0.5" min="0.5" required value={newJobCard.estimatedHours} onChange={e => setNewJobCard({...newJobCard, estimatedHours: parseFloat(e.target.value)})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
            <button type="submit" disabled={jobSubmitLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
              {jobSubmitLoading ? 'Saving...' : 'Send to Tech'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
