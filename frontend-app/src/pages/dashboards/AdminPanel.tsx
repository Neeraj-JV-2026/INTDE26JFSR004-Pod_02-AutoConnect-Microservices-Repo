import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Tags, Gift, Database, Car, Search, Loader2, X, CheckCircle, AlertCircle, Bell, Package, Plus, Layers, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';

const ROLES = ['CUSTOMER', 'SALES_CONSULTANT', 'SERVICE_ADVISOR', 'TECHNICIAN', 'PARTS_MANAGER', 'FINANCE_OFFICER', 'ADMIN', 'AUDITOR'];

const GW = 'http://localhost:8089';

export default function AdminPanel() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // global feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const flash = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccessMsg(msg); setErrorMsg(''); }
    else { setErrorMsg(msg); setSuccessMsg(''); }
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
  };
  const showFlash = flash;

  // --- Pending Approvals tab ---
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [approvalLoading, setApprovalLoading] = useState(false);

  // --- Users tab ---
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    axios.get(`${GW}/api/users`).then(res => setUsersList(res.data)).catch(() => setUsersList([])).finally(() => setLoading(false));
  };

  // Add User modal
  const [showAddUser, setShowAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });
  const [addLoading, setAddLoading] = useState(false);
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      await axios.post(`${GW}/api/auth/register`, addForm);
      flash('success', `User "${addForm.name}" created successfully.`);
      setShowAddUser(false);
      setAddForm({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' });
      fetchUsers();
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to create user.');
    } finally {
      setAddLoading(false);
    }
  };

  // Edit Role modal
  const [editRoleUser, setEditRoleUser] = useState<any | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const openEditRole = (u: any) => { setEditRoleUser(u); setSelectedRole(u.role); };
  const handleEditRole = async () => {
    if (!editRoleUser) return;
    setEditRoleLoading(true);
    try {
      await axios.post(`${GW}/api/users/${editRoleUser.userId}/assign-role?role=${selectedRole}`);
      flash('success', `Role updated to ${selectedRole} for ${editRoleUser.name}.`);
      setEditRoleUser(null);
      fetchUsers();
    } catch {
      flash('error', 'Failed to update role.');
    } finally {
      setEditRoleLoading(false);
    }
  };

  // Disable / Enable toggle
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const handleToggleStatus = async (u: any) => {
    const newStatus = u.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
    setTogglingId(u.userId);
    try {
      await axios.put(`${GW}/api/users/${u.userId}`, { ...u, status: newStatus });
      flash('success', `User ${u.name} set to ${newStatus}.`);
      fetchUsers();
    } catch {
      flash('error', 'Failed to update user status.');
    } finally {
      setTogglingId(null);
    }
  };

  // --- Pricing tab ---
  const [pricingRules, setPricingRules] = useState<any[]>([]);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [pricingForm, setPricingForm] = useState({
    name: '', priority: 1, status: 'ACTIVE',
    effectiveFrom: '', effectiveTo: '',
    adjustmentType: 'PERCENTAGE', adjustmentValue: 5,
    conditionMake: '', conditionType: 'NEW',
  });
  const [pricingLoading, setPricingLoading] = useState(false);

  const handleAddPricingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    setPricingLoading(true);
    try {
      const rule = {
        name: pricingForm.name,
        priority: pricingForm.priority,
        status: pricingForm.status,
        effectiveFrom: pricingForm.effectiveFrom ? new Date(pricingForm.effectiveFrom).toISOString() : null,
        effectiveTo: pricingForm.effectiveTo ? new Date(pricingForm.effectiveTo).toISOString() : null,
        conditions: {
          ...(pricingForm.conditionMake && { make: pricingForm.conditionMake }),
          ...(pricingForm.conditionType && { conditionType: pricingForm.conditionType }),
        },
        adjustmentExpression: {
          type: pricingForm.adjustmentType,
          ...(pricingForm.adjustmentType === 'PERCENTAGE'
            ? { percentage: pricingForm.adjustmentValue }
            : { amount: pricingForm.adjustmentValue }),
        },
      };
      const res = await axios.post(`${GW}/api/inventory/pricing/rules`, rule);
      setPricingRules([...pricingRules, res.data]);
      flash('success', `Pricing rule "${pricingForm.name}" created.`);
      setShowPricingForm(false);
      setPricingForm({ name: '', priority: 1, status: 'ACTIVE', effectiveFrom: '', effectiveTo: '', adjustmentType: 'PERCENTAGE', adjustmentValue: 5, conditionMake: '', conditionType: 'NEW' });
    } catch {
      flash('error', 'Failed to create pricing rule. Check required fields.');
    } finally {
      setPricingLoading(false);
    }
  };

  const deletePricingRule = async (id: number) => {
    try {
      await axios.delete(`${GW}/api/inventory/pricing/rules/${id}`);
      setPricingRules(pricingRules.filter(r => r.priceRuleId !== id));
      flash('success', 'Pricing rule deleted.');
    } catch {
      flash('error', 'Failed to delete pricing rule.');
    }
  };

  const deactivatePromo = async (id: number) => {
    try {
      // sales-service DELETE /{id} calls promotionService.deactivatePromotion() → sets isActive=false
      await axios.delete(`${GW}/api/sales/promotions/${id}`);
      setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: false } : p));
      flash('success', 'Promotion deactivated.');
    } catch {
      flash('error', 'Failed to deactivate promotion.');
    }
  };

  // --- Promotions tab ---
  const [promotions, setPromotions] = useState<any[]>([]);
  const [showPromoForm, setShowPromoForm] = useState(false);
  // sales-service Promotion entity: id, name, code, discountType (PERCENTAGE|FLAT), value (BigDecimal), startDate, endDate, isActive
  const [promoForm, setPromoForm] = useState({
    code: '', name: '', discountType: 'PERCENTAGE', value: 0, startDate: '', endDate: ''
  });
  const [promoLoading, setPromoLoading] = useState(false);
  const handleAddPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setPromoLoading(true);
    try {
      const res = await axios.post(`${GW}/api/sales/promotions`, {
        code: promoForm.code,
        name: promoForm.name,
        discountType: promoForm.discountType,
        value: promoForm.value,
        startDate: promoForm.startDate ? new Date(promoForm.startDate).toISOString() : null,
        endDate: promoForm.endDate ? new Date(promoForm.endDate).toISOString() : null,
      });
      setPromotions([...promotions, res.data]);
      flash('success', `Promotion "${promoForm.name}" created.`);
      setShowPromoForm(false);
      setPromoForm({ code: '', name: '', discountType: 'PERCENTAGE', value: 0, startDate: '', endDate: '' });
    } catch {
      flash('error', 'Failed to create promotion.');
    } finally {
      setPromoLoading(false);
    }
  };

  // --- Parts tab ---
  const [parts, setParts] = useState<any[]>([]);
  const [partsInventory, setPartsInventory] = useState<any[]>([]);
  const [partsLoading, setPartsLoading] = useState(false);

  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [partForm, setPartForm] = useState({
    partNumber: '', description: '', manufacturer: '', unitOfMeasure: 'EACH', cost: 0, retailPrice: 0,
  });
  const [partFormLoading, setPartFormLoading] = useState(false);

  const [showAddStockForm, setShowAddStockForm] = useState(false);
  const [stockForm, setStockForm] = useState({
    partId: 0, locationId: 1, quantityOnHand: 0, quantityReserved: 0, reorderPoint: 5,
  });
  const [stockFormLoading, setStockFormLoading] = useState(false);

  const fetchParts = () => {
    setPartsLoading(true);
    Promise.all([
      axios.get(`${GW}/api/v1/inventory/parts`).catch(() => ({ data: [] })),
      axios.get(`${GW}/api/v1/inventory/parts/inventory`).catch(() => ({ data: [] })),
    ]).then(([partsRes, invRes]) => {
      const partsData: any[] = partsRes.data || [];
      setParts(partsData);
      setPartsInventory(invRes.data || []);
      if (partsData.length > 0 && stockForm.partId === 0) {
        setStockForm(prev => ({ ...prev, partId: partsData[0].partId }));
      }
    }).finally(() => setPartsLoading(false));
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartFormLoading(true);
    try {
      const res = await axios.post(`${GW}/api/v1/inventory/parts`, partForm);
      flash('success', `Part "${partForm.description}" added. Part ID: ${res.data.partId}`);
      setShowAddPartForm(false);
      setPartForm({ partNumber: '', description: '', manufacturer: '', unitOfMeasure: 'EACH', cost: 0, retailPrice: 0 });
      fetchParts();
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to add part.');
    } finally {
      setPartFormLoading(false);
    }
  };

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    setStockFormLoading(true);
    try {
      await axios.post(`${GW}/api/v1/inventory/parts/inventory`, stockForm);
      const partName = parts.find(p => p.partId === stockForm.partId)?.description || `Part #${stockForm.partId}`;
      flash('success', `Stock added: ${stockForm.quantityOnHand} units of "${partName}" at Location ${stockForm.locationId}.`);
      setShowAddStockForm(false);
      setStockForm(prev => ({ ...prev, quantityOnHand: 0, quantityReserved: 0 }));
      fetchParts();
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to add stock. Part may already have an inventory record for this location.');
    } finally {
      setStockFormLoading(false);
    }
  };

  // --- Recalls tab ---
  const [recalls, setRecalls] = useState<any[]>([]);
  const [showRecallForm, setShowRecallForm] = useState(false);
  const [recallForm, setRecallForm] = useState({
    recallNumber: '', description: '', affectedModels: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '', remedyDescription: '', status: 'ACTIVE',
  });
  const [recallLoading, setRecallLoading] = useState(false);

  const handleCreateRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecallLoading(true);
    try {
      // Empty strings break Jackson LocalDate parsing — send null instead
      const payload = {
        ...recallForm,
        issueDate:  recallForm.issueDate  || null,
        expiryDate: recallForm.expiryDate || null,
      };
      const res = await axios.post(`${GW}/api/v1/inventory/recalls`, payload);
      setRecalls(prev => [res.data, ...prev]);
      flash('success', `Recall ${recallForm.recallNumber} created.`);
      setShowRecallForm(false);
      setRecallForm({ recallNumber: '', description: '', affectedModels: '', issueDate: new Date().toISOString().split('T')[0], expiryDate: '', remedyDescription: '', status: 'ACTIVE' });
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to create recall.');
    } finally {
      setRecallLoading(false);
    }
  };

  const updateRecallStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${GW}/api/v1/inventory/recalls/${id}/status?status=${status}`);
      setRecalls(prev => prev.map(r => r.recallId === id ? { ...r, status } : r));
      flash('success', `Recall #${id} marked as ${status}.`);
    } catch (err: any) {
      flash('error', err?.response?.data?.message || 'Failed to update recall status.');
    }
  };

  // --- Audit tab ---
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // --- Inventory tab ---
  const [vinData, setVinData] = useState({
    vin: '', stockNumber: '', make: '', model: '', year: new Date().getFullYear(),
    trim: '', color: '', mileage: 0, conditionType: 'NEW', locationId: 1,
    basePrice: 0, msrp: 0
  });
  const [vinLoading, setVinLoading] = useState(false);
  const [vinError, setVinError] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'audit') {
      axios.get(`${GW}/api/audit-logs`).then(res => setAuditLogs(res.data)).catch(() => setAuditLogs([])).finally(() => setLoading(false));
    } else if (activeTab === 'pricing') {
      axios.get(`${GW}/api/inventory/pricing/rules`).then(res => setPricingRules(res.data)).catch(() => setPricingRules([])).finally(() => setLoading(false));
    } else if (activeTab === 'promotions') {
      axios.get(`${GW}/api/sales/promotions`).then(res => setPromotions(res.data)).catch(() => setPromotions([])).finally(() => setLoading(false));
    } else if (activeTab === 'parts') {
      setLoading(false);
      fetchParts();
    } else if (activeTab === 'approvals') {
      setLoading(false);
      setApprovalLoading(true);
      axios.get(`${GW}/api/users/pending-approval`)
        .then(res => setPendingUsers(res.data || []))
        .catch(() => setPendingUsers([]))
        .finally(() => setApprovalLoading(false));
    } else if (activeTab === 'recalls') {
      axios.get(`${GW}/api/v1/inventory/recalls`)
        .then(res => setRecalls(res.data || []))
        .catch(() => setRecalls([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const decodeVin = async () => {
    if (!vinData.vin || vinData.vin.length < 17) { setVinError('Please enter a valid 17-digit VIN'); return; }
    setVinLoading(true); setVinError('');
    try {
      const res = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vinData.vin}?format=json`);
      const r = res.data.Results[0];
      if (r?.Make) {
        setVinData(prev => ({ ...prev, make: r.Make, model: r.Model, year: parseInt(r.ModelYear) || new Date().getFullYear(), trim: r.Trim || '' }));
      } else { setVinError('Could not decode VIN. Enter details manually.'); }
    } catch { setVinError('Failed to decode VIN. API error.'); }
    finally { setVinLoading(false); }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitLoading(true); setVinError('');
    try {
      await axios.post(`${GW}/api/inventory/vehicles`, vinData);
      flash('success', 'Vehicle successfully added to inventory!');
      setVinData({ vin: '', stockNumber: '', make: '', model: '', year: new Date().getFullYear(), trim: '', color: '', mileage: 0, conditionType: 'NEW', locationId: 1, basePrice: 0, msrp: 0 });
    } catch { setVinError('Failed to add vehicle to database.'); }
    finally { setSubmitLoading(false); }
  };

  const handleApproveUser = async (userId: number, userName: string) => {
    try {
      await axios.post(`${GW}/api/users/${userId}/approve`);
      setPendingUsers(prev => prev.filter(u => u.userId !== userId));
      showFlash('success', `${userName} approved successfully.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to approve user.');
    }
  };

  const handleRejectUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Reject and delete account for ${userName}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${GW}/api/users/${userId}`);
      setPendingUsers(prev => prev.filter(u => u.userId !== userId));
      showFlash('success', `${userName}'s registration rejected.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to reject user.');
    }
  };

  const tabs = [
    { id: 'users', name: 'User & Role Management', icon: Users },
    { id: 'approvals', name: 'Pending Approvals', icon: UserCheck },
    { id: 'inventory', name: 'Inventory Intake (DMS)', icon: Car },
    { id: 'pricing', name: 'Pricing Rules', icon: Tags },
    { id: 'promotions', name: 'Promotion Builder', icon: Gift },
    { id: 'parts', name: 'Parts Management', icon: Package },
    { id: 'recalls', name: 'Recalls & Returns', icon: AlertCircle },
    { id: 'audit', name: 'Audit & Exports', icon: Database },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Edit Role Modal */}
      {editRoleUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Edit Role — {editRoleUser.name}</h2>
              <button onClick={() => setEditRoleUser(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <p className="text-sm text-gray-500 mb-4">Current role: <span className="font-semibold text-indigo-700">{editRoleUser.role}</span></p>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm px-4 py-2 border bg-white mb-4"
            >
              {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
            </select>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setEditRoleUser(null)} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button onClick={handleEditRole} disabled={editRoleLoading || selectedRole === editRoleUser.role} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                {editRoleLoading ? 'Saving...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-64 bg-indigo-950 text-indigo-100 flex-shrink-0">
        <div className="p-6 border-b border-indigo-900">
          <h2 className="text-xl font-bold text-white flex items-center">
            <ShieldAlert className="w-6 h-6 mr-2 text-indigo-400" />
            System Admin
          </h2>
          <p className="text-xs text-indigo-300 mt-2">Admin: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-900 text-indigo-400 border-l-4 border-indigo-400 font-medium'
                  : 'hover:bg-indigo-900 hover:text-white'
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
          {/* Global feedback */}
          {successMsg && (
            <div className="mb-4 flex items-center p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{errorMsg}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">User Access Management</h1>
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

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name / Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MFA</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : usersList.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No users found.</td></tr>
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
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'INACTIVE' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                            {u.status || 'ACTIVE'}
                          </span>
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
                </table>
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Pending Account Approvals</h1>
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
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role Requested</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
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
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">DMS Inventory Intake</h1>
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
          )}

          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Pricing Rules & Margins</h1>
                <button
                  onClick={() => setShowPricingForm(!showPricingForm)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  {showPricingForm ? 'Cancel' : '+ New Pricing Rule'}
                </button>
              </div>

              {showPricingForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Create Pricing Rule</h2>
                  <form onSubmit={handleAddPricingRule} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rule Name</label>
                      <input type="text" required value={pricingForm.name} onChange={e => setPricingForm({...pricingForm, name: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" placeholder="e.g. New Vehicle Standard Markup" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adjustment Type</label>
                      <select value={pricingForm.adjustmentType} onChange={e => setPricingForm({...pricingForm, adjustmentType: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {pricingForm.adjustmentType === 'PERCENTAGE' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                      </label>
                      <input type="number" step="0.01" required min={0} value={pricingForm.adjustmentValue} onChange={e => setPricingForm({...pricingForm, adjustmentValue: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition: Make (optional)</label>
                      <input type="text" value={pricingForm.conditionMake} onChange={e => setPricingForm({...pricingForm, conditionMake: e.target.value})} placeholder="e.g. Toyota (leave blank for all)" className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Condition: Vehicle Type</label>
                      <select value={pricingForm.conditionType} onChange={e => setPricingForm({...pricingForm, conditionType: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                        <option value="">All Types</option>
                        <option value="NEW">New</option>
                        <option value="USED">Used</option>
                        <option value="CERTIFIED_PRE_OWNED">CPO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority (1 = highest)</label>
                      <input type="number" required min={1} value={pricingForm.priority} onChange={e => setPricingForm({...pricingForm, priority: parseInt(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select value={pricingForm.status} onChange={e => setPricingForm({...pricingForm, status: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                      <input type="datetime-local" value={pricingForm.effectiveFrom} onChange={e => setPricingForm({...pricingForm, effectiveFrom: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Effective To</label>
                      <input type="datetime-local" value={pricingForm.effectiveTo} onChange={e => setPricingForm({...pricingForm, effectiveTo: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" disabled={pricingLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                        {pricingLoading ? 'Creating...' : 'Create Rule'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
              ) : pricingRules.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-500 text-center">No pricing rules configured yet. Click "+ New Pricing Rule" to add one.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rule Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adjustment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective From</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effective To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pricingRules.map((r: any) => (
                        <tr key={r.priceRuleId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{r.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {r.adjustmentExpression?.type === 'PERCENTAGE'
                              ? `${r.adjustmentExpression.percentage}%`
                              : r.adjustmentExpression?.amount
                                ? `$${r.adjustmentExpression.amount}`
                                : '—'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{r.priority}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{r.effectiveFrom ? new Date(r.effectiveFrom).toLocaleDateString() : '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{r.effectiveTo ? new Date(r.effectiveTo).toLocaleDateString() : '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${r.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm">
                            <button onClick={() => deletePricingRule(r.priceRuleId)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Promotion Builder</h1>
                <button onClick={() => setShowPromoForm(!showPromoForm)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
                  {showPromoForm ? 'Cancel' : '+ New Promo'}
                </button>
              </div>

              {showPromoForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Create Promotion</h2>
                  <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Promo Code</label>
                      <input type="text" required value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" placeholder="e.g. SUMMER2026" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name</label>
                      <input type="text" required value={promoForm.name} onChange={e => setPromoForm({...promoForm, name: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Discount Type</label>
                      <select value={promoForm.discountType} onChange={e => setPromoForm({...promoForm, discountType: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Amount ($)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {promoForm.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount ($)'}
                      </label>
                      <input type="number" required min={0} step="0.01" value={promoForm.value} onChange={e => setPromoForm({...promoForm, value: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" placeholder={promoForm.discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 5000'} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input type="datetime-local" value={promoForm.startDate} onChange={e => setPromoForm({...promoForm, startDate: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input type="datetime-local" value={promoForm.endDate} onChange={e => setPromoForm({...promoForm, endDate: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" disabled={promoLoading} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50">
                        {promoLoading ? 'Creating...' : 'Create Promotion'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Campaigns</h3>
                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
                ) : promotions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No promotions found. Create one above.</p>
                ) : (
                  <div className="space-y-3">
                    {promotions.map((p: any) => (
                      <div key={p.id} className={`p-4 border rounded-lg flex justify-between items-center ${p.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                        <div>
                          <p className={`font-bold ${p.isActive ? 'text-green-800' : 'text-gray-700'}`}>{p.name}</p>
                          <p className={`text-xs mt-1 ${p.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                            Code: <span className="font-mono font-bold">{p.code}</span>
                            {' · '}{p.discountType === 'PERCENTAGE' ? `${p.value}% off` : `$${p.value} off`}
                            {p.endDate && ` · Expires: ${new Date(p.endDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase ${p.isActive ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                            {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                          {p.isActive && (
                            <button
                              onClick={() => deactivatePromo(p.id)}
                              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 border border-red-200 rounded bg-red-50 hover:bg-red-100"
                            >
                              Deactivate
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'parts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Parts Management</h1>
                <div className="flex space-x-3">
                  <button
                    onClick={() => { setShowAddStockForm(false); setShowAddPartForm(!showAddPartForm); }}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {showAddPartForm ? 'Cancel' : 'Add Part'}
                  </button>
                  <button
                    onClick={() => { setShowAddPartForm(false); setShowAddStockForm(!showAddStockForm); }}
                    disabled={parts.length === 0}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Layers className="w-4 h-4 mr-2" />
                    {showAddStockForm ? 'Cancel' : 'Add Stock'}
                  </button>
                </div>
              </div>

              {/* ADD PART FORM */}
              {showAddPartForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-indigo-600" /> New Part
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Add a part to the parts catalogue. Then use "Add Stock" to set the quantity on-hand.</p>
                  <form onSubmit={handleAddPart} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part Number <span className="text-red-500">*</span></label>
                      <input
                        type="text" required
                        value={partForm.partNumber}
                        onChange={e => setPartForm({ ...partForm, partNumber: e.target.value.toUpperCase() })}
                        placeholder="e.g. OIL-FILTER-001"
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
                      <input
                        type="text" required
                        value={partForm.description}
                        onChange={e => setPartForm({ ...partForm, description: e.target.value })}
                        placeholder="e.g. Standard Oil Filter"
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input
                        type="text"
                        value={partForm.manufacturer}
                        onChange={e => setPartForm({ ...partForm, manufacturer: e.target.value })}
                        placeholder="e.g. Bosch"
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                      <select
                        value={partForm.unitOfMeasure}
                        onChange={e => setPartForm({ ...partForm, unitOfMeasure: e.target.value })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white"
                      >
                        <option value="EACH">Each (EA)</option>
                        <option value="LITRE">Litre (L)</option>
                        <option value="KG">Kilogram (kg)</option>
                        <option value="SET">Set</option>
                        <option value="PAIR">Pair</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($) <span className="text-red-500">*</span></label>
                      <input
                        type="number" required min={0} step="0.01"
                        value={partForm.cost}
                        onChange={e => setPartForm({ ...partForm, cost: parseFloat(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price ($) <span className="text-red-500">*</span></label>
                      <input
                        type="number" required min={0} step="0.01"
                        value={partForm.retailPrice}
                        onChange={e => setPartForm({ ...partForm, retailPrice: parseFloat(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    {partForm.cost > 0 && partForm.retailPrice > 0 && (
                      <div className="md:col-span-2 bg-indigo-50 border border-indigo-100 rounded-lg px-4 py-2 text-sm text-indigo-700 flex items-center justify-between">
                        <span>Margin: <strong>{(((partForm.retailPrice - partForm.cost) / partForm.retailPrice) * 100).toFixed(1)}%</strong></span>
                        <span>Markup: <strong>${(partForm.retailPrice - partForm.cost).toFixed(2)}</strong></span>
                      </div>
                    )}
                    <div className="md:col-span-2 flex justify-end pt-2">
                      <button
                        type="submit" disabled={partFormLoading}
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {partFormLoading ? 'Saving...' : 'Save Part to Catalogue'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ADD STOCK FORM */}
              {showAddStockForm && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-green-600" /> Add Stock / Inventory Record
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">Set the on-hand quantity for a part at a specific location. Creates a new inventory record.</p>
                  <form onSubmit={handleAddStock} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part <span className="text-red-500">*</span></label>
                      <select
                        required
                        value={stockForm.partId}
                        onChange={e => setStockForm({ ...stockForm, partId: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white"
                      >
                        <option value={0} disabled>— Select a part —</option>
                        {parts.map(p => (
                          <option key={p.partId} value={p.partId}>
                            [{p.partNumber}] {p.description}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location ID <span className="text-red-500">*</span></label>
                      <input
                        type="number" required min={1}
                        value={stockForm.locationId}
                        onChange={e => setStockForm({ ...stockForm, locationId: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity On Hand <span className="text-red-500">*</span></label>
                      <input
                        type="number" required min={0}
                        value={stockForm.quantityOnHand}
                        onChange={e => setStockForm({ ...stockForm, quantityOnHand: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Reserved</label>
                      <input
                        type="number" min={0}
                        value={stockForm.quantityReserved}
                        onChange={e => setStockForm({ ...stockForm, quantityReserved: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
                      <input
                        type="number" min={0}
                        value={stockForm.reorderPoint}
                        onChange={e => setStockForm({ ...stockForm, reorderPoint: parseInt(e.target.value) })}
                        className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                      />
                    </div>
                    <div className="md:col-span-2 flex justify-end pt-2">
                      <button
                        type="submit" disabled={stockFormLoading || stockForm.partId === 0}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
                      >
                        {stockFormLoading ? 'Saving...' : 'Add Stock'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* PARTS CATALOGUE TABLE */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-bold text-gray-800 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-500" /> Parts Catalogue
                    <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">{parts.length} parts</span>
                  </h3>
                  <button onClick={fetchParts} disabled={partsLoading} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    {partsLoading ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                    Refresh
                  </button>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manufacturer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Retail</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">On Hand</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reserved</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partsLoading ? (
                      <tr><td colSpan={8} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></td></tr>
                    ) : parts.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center">
                          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                          <p className="text-gray-500 font-medium">No parts in catalogue yet.</p>
                          <p className="text-sm text-gray-400 mt-1">Click <strong>"Add Part"</strong> above to add the first part.</p>
                        </td>
                      </tr>
                    ) : parts.map(p => {
                      const inv = partsInventory.find((i: any) => i.partId === p.partId || i.part?.partId === p.partId);
                      const onHand = inv?.quantityOnHand ?? null;
                      const reserved = inv?.quantityReserved ?? null;
                      const isLow = onHand !== null && inv?.reorderPoint && onHand <= inv.reorderPoint;
                      return (
                        <tr key={p.partId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-indigo-700">{p.partNumber}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.manufacturer || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{p.unitOfMeasure || 'EA'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600">${Number(p.cost || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900">${Number(p.retailPrice || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            {onHand === null ? (
                              <span className="text-xs text-gray-400 italic">No stock</span>
                            ) : (
                              <span className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-green-700'}`}>
                                {onHand} {isLow && <span className="text-xs font-normal text-red-500">⚠ low</span>}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                            {reserved === null ? '—' : reserved}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* RECALLS & RETURNS TAB */}
          {activeTab === 'recalls' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Recalls & Returns</h1>
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recall #</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Affected Models</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recalls.map((r: any) => (
                        <tr key={r.recallId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.recallNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={r.affectedModels}>{r.affectedModels}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.issueDate || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              r.status === 'ACTIVE'    ? 'bg-red-100 text-red-800' :
                              r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-700'
                            }`}>{r.status}</span>
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
                  </table>
                </div>
              )}

              {/* Returns Notice */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                <strong>Vehicle Returns:</strong> Customer return requests are processed through the Finance Dashboard as credit notes.
                Contact the Finance team or navigate to Finance → Invoicing to issue a refund or credit adjustment.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">System Audit Logs</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : auditLogs.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No audit logs available.</td></tr>
                    ) : auditLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 font-medium">{log.userId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{log.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
