import { Loader2, UserCheck, Search } from 'lucide-react';
import { StatusBadge, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

const ROLES = ['CUSTOMER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'TECHNICIAN', 'PARTS_MANAGER', 'FINANCE_OFFICER', 'ADMIN', 'AUDITOR'];

// ─── Users Tab ───────────────────────────────────────────────────────────────

export interface UsersTabProps {
  loading: boolean;
  usersList: any[];
  showAddUser: boolean;
  setShowAddUser: (v: boolean) => void;
  addForm: { name: string; email: string; password: string; phone: string; role: string };
  setAddForm: (v: { name: string; email: string; password: string; phone: string; role: string }) => void;
  addLoading: boolean;
  handleAddUser: (e: React.FormEvent) => void;
  openEditRole: (u: any) => void;
  togglingId: number | null;
  handleToggleStatus: (u: any) => void;
}

export function UsersTab({
  loading,
  usersList,
  showAddUser,
  setShowAddUser,
  addForm,
  setAddForm,
  addLoading,
  handleAddUser,
  openEditRole,
  togglingId,
  handleToggleStatus,
}: UsersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>User Access Management</PageTitle>
        <button
          onClick={() => setShowAddUser(!showAddUser)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
        >
          {showAddUser ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {showAddUser && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New User</h2>
          <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" required value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={6} value={addForm.password} onChange={e => setAddForm({...addForm, password: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
              <input type="text" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={addForm.role} onChange={e => setAddForm({...addForm, role: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border bg-white">
                {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button type="submit" disabled={addLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {addLoading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      <TableCard>
          <TableHead cols={['Name / Email', 'Role', 'Status', 'MFA', 'Actions']} right={[4]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={5} />
            ) : usersList.length === 0 ? (
              <TableEmpty cols={5} message="No users found." />
            ) : usersList.map(u => (
              <tr key={u.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{u.name}</div>
                  <div className="text-sm text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.role?.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={u.status || 'ACTIVE'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.mfaEnabled ? 'Enabled' : 'Disabled'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => openEditRole(u)} className="text-indigo-600 hover:text-indigo-900 font-medium">Edit Role</button>
                  <button
                    onClick={() => handleToggleStatus(u)}
                    disabled={togglingId === u.userId}
                    className={`font-medium ${u.status === 'INACTIVE' ? 'text-green-600 hover:text-green-900' : 'text-red-600 hover:text-red-900'} disabled:opacity-50`}
                  >
                    {togglingId === u.userId ? '...' : (u.status === 'INACTIVE' ? 'Enable' : 'Disable')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── Approvals Tab ────────────────────────────────────────────────────────────

export interface ApprovalsTabProps {
  pendingUsers: any[];
  approvalLoading: boolean;
  handleApproveUser: (userId: number, userName: string) => void;
  handleRejectUser: (userId: number, userName: string) => void;
}

export function ApprovalsTab({
  pendingUsers,
  approvalLoading,
  handleApproveUser,
  handleRejectUser,
}: ApprovalsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <PageTitle>Pending Account Approvals</PageTitle>
          <p className="text-gray-500 text-sm mt-1">Review and approve or reject new staff registrations</p>
        </div>
        <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">{pendingUsers.length} pending</span>
      </div>
      {approvalLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400"/></div>
      ) : pendingUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <UserCheck className="w-12 h-12 text-green-500 mx-auto mb-3"/>
          <p className="text-gray-500 font-medium">No pending approvals — all registrations are up to date.</p>
        </div>
      ) : (
        <TableCard>
            <TableHead cols={['User', 'Email', 'Role Requested', 'Registered', 'Actions']} right={[4]} />
            <tbody className="divide-y divide-gray-200">
              {pendingUsers.map((u: any) => (
                <tr key={u.userId} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm mr-3">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {u.role?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleApproveUser(u.userId, u.name)} className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                      Approve
                    </button>
                    <button onClick={() => handleRejectUser(u.userId, u.name)} className="bg-red-100 text-red-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableCard>
      )}
    </div>
  );
}

// ─── Inventory Tab ────────────────────────────────────────────────────────────

export interface InventoryTabProps {
  vinData: {
    vin: string; stockNumber: string; make: string; model: string; year: number;
    trim: string; color: string; mileage: number; conditionType: string; locationId: number;
    basePrice: number; msrp: number;
  };
  setVinData: (v: InventoryTabProps['vinData']) => void;
  vinLoading: boolean;
  vinError: string;
  submitLoading: boolean;
  decodeVin: () => void;
  handleInventorySubmit: (e: React.FormEvent) => void;
}

export function InventoryTab({
  vinData,
  setVinData,
  vinLoading,
  vinError,
  submitLoading,
  decodeVin,
  handleInventorySubmit,
}: InventoryTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>DMS Inventory Intake</PageTitle>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-end space-x-4">
          <div className="flex-1 max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Identification Number (VIN)</label>
            <input
              type="text"
              value={vinData.vin}
              onChange={e => setVinData({...vinData, vin: e.target.value.toUpperCase()})}
              className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
              placeholder="Enter 17-digit VIN..."
            />
          </div>
          <button onClick={decodeVin} disabled={vinLoading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 flex items-center disabled:opacity-50">
            {vinLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Search className="w-5 h-5 mr-2" />}
            Decode VIN
          </button>
        </div>
        <div className="p-6">
          {vinError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">{vinError}</div>}
          <form onSubmit={handleInventorySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Make', key: 'make', type: 'text', req: true },
                { label: 'Model', key: 'model', type: 'text', req: true },
                { label: 'Year', key: 'year', type: 'number', req: true },
                { label: 'Trim', key: 'trim', type: 'text', req: false },
                { label: 'Stock Number', key: 'stockNumber', type: 'text', req: true },
                { label: 'Color', key: 'color', type: 'text', req: true },
                { label: 'Mileage', key: 'mileage', type: 'number', req: true },
                { label: 'Location ID', key: 'locationId', type: 'number', req: true },
                { label: 'Base Price ($)', key: 'basePrice', type: 'number', req: true },
                { label: 'MSRP ($)', key: 'msrp', type: 'number', req: true },
              ].map(({ label, key, type, req }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type={type}
                    required={req}
                    value={(vinData as any)[key]}
                    onChange={e => setVinData({...vinData, [key]: type === 'number' ? parseFloat(e.target.value) : e.target.value})}
                    className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-gray-50"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select value={vinData.conditionType} onChange={e => setVinData({...vinData, conditionType: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                  <option value="NEW">New</option>
                  <option value="USED">Used</option>
                  <option value="CERTIFIED_PRE_OWNED">CPO</option>
                </select>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 flex justify-end">
              <button type="submit" disabled={submitLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                {submitLoading ? 'Saving...' : 'Add to Fleet'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
