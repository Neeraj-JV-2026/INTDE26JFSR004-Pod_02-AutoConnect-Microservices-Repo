import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldAlert, Users, Tags, Gift, Database, Car, CheckCircle, AlertCircle, Bell, Package, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UsersTab, ApprovalsTab, InventoryTab } from './AdminPanelTabs';
import { PricingTab, PromotionsTab, PartsTab } from './AdminPanelProductTabs';
import { RecallsTab, NotificationsTab, AuditTab } from './AdminPanelSystemTabs';
import { EditRoleModal } from './AdminPanelModals';

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
    } finally { setAddLoading(false); }
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
    } catch { flash('error', 'Failed to update role.'); }
    finally { setEditRoleLoading(false); }
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
    } catch { flash('error', 'Failed to update user status.'); }
    finally { setTogglingId(null); }
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
    } catch { flash('error', 'Failed to create pricing rule. Check required fields.'); }
    finally { setPricingLoading(false); }
  };
  const deletePricingRule = async (id: number) => {
    try {
      await axios.delete(`${GW}/api/inventory/pricing/rules/${id}`);
      setPricingRules(pricingRules.filter(r => r.priceRuleId !== id));
      flash('success', 'Pricing rule deleted.');
    } catch { flash('error', 'Failed to delete pricing rule.'); }
  };
  const deactivatePromo = async (id: number) => {
    try {
      // sales-service DELETE /{id} calls promotionService.deactivatePromotion() → sets isActive=false
      await axios.delete(`${GW}/api/sales/promotions/${id}`);
      setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: false } : p));
      flash('success', 'Promotion deactivated.');
    } catch { flash('error', 'Failed to deactivate promotion.'); }
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
    } catch { flash('error', 'Failed to create promotion.'); }
    finally { setPromoLoading(false); }
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
    } catch (err: any) { flash('error', err?.response?.data?.message || 'Failed to add part.'); }
    finally { setPartFormLoading(false); }
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
    } catch (err: any) { flash('error', err?.response?.data?.message || 'Failed to add stock. Part may already have an inventory record for this location.'); }
    finally { setStockFormLoading(false); }
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
    } catch (err: any) { flash('error', err?.response?.data?.message || 'Failed to create recall.'); }
    finally { setRecallLoading(false); }
  };
  const updateRecallStatus = async (id: number, status: string) => {
    try {
      await axios.patch(`${GW}/api/v1/inventory/recalls/${id}/status?status=${status}`);
      setRecalls(prev => prev.map(r => r.recallId === id ? { ...r, status } : r));
      flash('success', `Recall #${id} marked as ${status}.`);
    } catch (err: any) { flash('error', err?.response?.data?.message || 'Failed to update recall status.'); }
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
    } catch (err: any) { showFlash('error', err?.response?.data?.message || 'Failed to approve user.'); }
  };
  const handleRejectUser = async (userId: number, userName: string) => {
    if (!window.confirm(`Reject and delete account for ${userName}? This cannot be undone.`)) return;
    try {
      await axios.delete(`${GW}/api/users/${userId}`);
      setPendingUsers(prev => prev.filter(u => u.userId !== userId));
      showFlash('success', `${userName}'s registration rejected.`);
    } catch (err: any) { showFlash('error', err?.response?.data?.message || 'Failed to reject user.'); }
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
      <EditRoleModal
        editingUser={editRoleUser}
        editRoleValue={selectedRole}
        setEditRoleValue={setSelectedRole}
        editRoleLoading={editRoleLoading}
        handleEditRole={handleEditRole}
        onClose={() => setEditRoleUser(null)}
      />

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
            <UsersTab loading={loading} usersList={usersList} showAddUser={showAddUser} setShowAddUser={setShowAddUser}
              addForm={addForm} setAddForm={setAddForm} addLoading={addLoading} handleAddUser={handleAddUser}
              openEditRole={openEditRole} togglingId={togglingId} handleToggleStatus={handleToggleStatus} />
          )}
          {activeTab === 'approvals' && (
            <ApprovalsTab pendingUsers={pendingUsers} approvalLoading={approvalLoading}
              handleApproveUser={handleApproveUser} handleRejectUser={handleRejectUser} />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab vinData={vinData} setVinData={setVinData} vinLoading={vinLoading}
              vinError={vinError} submitLoading={submitLoading} decodeVin={decodeVin}
              handleInventorySubmit={handleInventorySubmit} />
          )}
          {activeTab === 'pricing' && (
            <PricingTab loading={loading} pricingRules={pricingRules} showPricingForm={showPricingForm}
              setShowPricingForm={setShowPricingForm} pricingForm={pricingForm} setPricingForm={setPricingForm}
              pricingLoading={pricingLoading} handleAddPricingRule={handleAddPricingRule} deletePricingRule={deletePricingRule} />
          )}
          {activeTab === 'promotions' && (
            <PromotionsTab loading={loading} promotions={promotions} showPromoForm={showPromoForm}
              setShowPromoForm={setShowPromoForm} promoForm={promoForm} setPromoForm={setPromoForm}
              promoLoading={promoLoading} handleAddPromo={handleAddPromo} deactivatePromo={deactivatePromo} />
          )}
          {activeTab === 'parts' && (
            <PartsTab parts={parts} partsInventory={partsInventory} partsLoading={partsLoading} fetchParts={fetchParts}
              showAddPartForm={showAddPartForm} setShowAddPartForm={setShowAddPartForm} partForm={partForm}
              setPartForm={setPartForm} partFormLoading={partFormLoading} handleAddPart={handleAddPart}
              showAddStockForm={showAddStockForm} setShowAddStockForm={setShowAddStockForm} stockForm={stockForm}
              setStockForm={setStockForm} stockFormLoading={stockFormLoading} handleAddStock={handleAddStock} />
          )}
          {/* RECALLS & RETURNS TAB */}
          {activeTab === 'recalls' && (
            <RecallsTab loading={loading} recalls={recalls} showRecallForm={showRecallForm}
              setShowRecallForm={setShowRecallForm} recallForm={recallForm} setRecallForm={setRecallForm}
              recallLoading={recallLoading} handleCreateRecall={handleCreateRecall} updateRecallStatus={updateRecallStatus} />
          )}
          {activeTab === 'notifications' && <NotificationsTab userId={user?.id} />}
          {activeTab === 'audit' && <AuditTab loading={loading} auditLogs={auditLogs} />}
        </div>
      </div>
    </div>
  );
}
