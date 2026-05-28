import { X } from 'lucide-react';

const ROLES = ['CUSTOMER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'TECHNICIAN', 'PARTS_MANAGER', 'FINANCE_OFFICER', 'ADMIN', 'AUDITOR'];

export interface EditRoleModalProps {
  editingUser: any | null;
  editRoleValue: string;
  setEditRoleValue: (v: string) => void;
  editRoleLoading: boolean;
  handleEditRole: () => void;
  onClose: () => void;
}

export function EditRoleModal({
  editingUser,
  editRoleValue,
  setEditRoleValue,
  editRoleLoading,
  handleEditRole,
  onClose,
}: EditRoleModalProps) {
  if (!editingUser) return null;
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-900">Edit Role — {editingUser.name}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
        </div>
        <p className="text-sm text-gray-500 mb-4">Current role: <span className="font-semibold text-indigo-700">{editingUser.role}</span></p>
        <select
          value={editRoleValue}
          onChange={e => setEditRoleValue(e.target.value)}
          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border bg-white mb-4"
        >
          {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
        </select>
        <div className="flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
          <button onClick={handleEditRole} disabled={editRoleLoading || editRoleValue === editingUser.role} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            {editRoleLoading ? 'Saving...' : 'Save Role'}
          </button>
        </div>
      </div>
    </div>
  );
}
