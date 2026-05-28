import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageSearch, Boxes, ShoppingCart, ArrowLeftRight, Truck, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  InventoryTab,
  StockTab,
  OrdersTab,
  TransfersTab,
  VendorsTab,
  NotificationsTab,
} from './PartsManagerConsoleTabs';

export default function PartsManagerConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('inventory');

  const [parts, setParts] = useState<any[]>([]);
  const [recalls, setRecalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [showPOForm, setShowPOForm] = useState(false);
  const [newPO, setNewPO] = useState({ vendorName: '', partId: '', quantity: 1, unitCost: 0, notes: '' });
  const [poLoading, setPOLoading] = useState(false);
  const [updatingPO, setUpdatingPO] = useState<number | null>(null); // index of PO being updated
  const [poMsg, setPoMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const [showAddPartForm, setShowAddPartForm] = useState(false);
  const [newPart, setNewPart] = useState({
    partNumber: '', description: '', manufacturer: 'OEM', unitOfMeasure: 'EACH', cost: 0.0, retailPrice: 0.0
  });
  const [partSubmitLoading, setPartSubmitLoading] = useState(false);

  const handlePartSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:8089/api/v1/inventory/parts', newPart);
      setParts([...parts, res.data]);
      setShowAddPartForm(false);
      setNewPart({ partNumber: '', description: '', manufacturer: 'OEM', unitOfMeasure: 'EACH', cost: 0.0, retailPrice: 0.0 });
    } catch (err) {
      console.error(err);
    } finally {
      setPartSubmitLoading(false);
    }
  };

  const handleUpdatePOStatus = async (index: number, newStatus: string) => {
    setUpdatingPO(index);
    setPoMsg(null);
    const po = purchaseOrders[index];
    const updatedPO = { ...po, status: newStatus };
    try {
      // Best-effort persist to backend (PO may only exist locally)
      if (po.id || po.poId) {
        await axios.patch(`http://localhost:8089/api/v1/inventory/purchase-orders/${po.id ?? po.poId}`, { status: newStatus }).catch(() => {});
      }
      setPurchaseOrders(prev => prev.map((p, i) => i === index ? updatedPO : p));
      setPoMsg({ text: `PO ${po.poNumber} marked as ${newStatus}.`, ok: true });
    } catch {
      setPoMsg({ text: 'Failed to update PO status.', ok: false });
    } finally {
      setUpdatingPO(null);
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setPOLoading(true);
    try {
      const po = {
        ...newPO,
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        totalCost: newPO.quantity * newPO.unitCost,
      };
      // Try to POST to backend, fall back to local state
      await axios.post('http://localhost:8089/api/v1/inventory/purchase-orders', po).catch(() => {});
      setPurchaseOrders(prev => [...prev, po]);
      setShowPOForm(false);
      setNewPO({ vendorName: '', partId: '', quantity: 1, unitCost: 0, notes: '' });
    } catch {
      alert('Failed to create purchase order.');
    } finally {
      setPOLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'inventory' || activeTab === 'stock' || activeTab === 'vendors') {
      axios.get('http://localhost:8089/api/v1/inventory/parts')
        .then(res => setParts(res.data))
        .catch(err => setParts([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'orders') {
      // Load both parts (for PO form) and any existing POs
      axios.get('http://localhost:8089/api/v1/inventory/parts')
        .then(res => setParts(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (activeTab === 'transfers') {
      axios.get('http://localhost:8089/api/v1/inventory/recalls')
        .then(res => setRecalls(res.data))
        .catch(err => setRecalls([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'inventory', name: 'Parts Inventory', icon: PackageSearch },
    { id: 'stock', name: 'Stock Levels', icon: Boxes },
    { id: 'orders', name: 'Purchase Orders', icon: ShoppingCart },
    { id: 'transfers', name: 'Recalls & Returns', icon: ArrowLeftRight },
    { id: 'vendors', name: 'Vendors', icon: Truck },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-amber-900 text-amber-50 flex-shrink-0">
        <div className="p-6 border-b border-amber-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Boxes className="w-6 h-6 mr-2 text-amber-400" />
            Parts Console
          </h2>
          <p className="text-xs text-amber-200 mt-2">Manager: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-800 text-amber-400 border-l-4 border-amber-400 font-medium'
                  : 'hover:bg-amber-800 hover:text-white'
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
          {activeTab === 'inventory' && (
            <InventoryTab
              parts={parts}
              loading={loading}
              showAddPartForm={showAddPartForm}
              setShowAddPartForm={setShowAddPartForm}
              newPart={newPart}
              setNewPart={setNewPart}
              handlePartSubmit={handlePartSubmit}
              partSubmitLoading={partSubmitLoading}
            />
          )}

          {activeTab === 'stock' && (
            <StockTab
              parts={parts}
              loading={loading}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              loading={loading}
              purchaseOrders={purchaseOrders}
              parts={parts}
              showPOForm={showPOForm}
              setShowPOForm={setShowPOForm}
              newPO={newPO}
              setNewPO={setNewPO}
              handleCreatePO={handleCreatePO}
              poLoading={poLoading}
              poMsg={poMsg}
              updatingPO={updatingPO}
              handleUpdatePOStatus={handleUpdatePOStatus}
            />
          )}

          {activeTab === 'transfers' && (
            <TransfersTab
              loading={loading}
              recalls={recalls}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab userId={user?.id} />
          )}

          {activeTab === 'vendors' && (
            <VendorsTab
              parts={parts}
              loading={loading}
            />
          )}

        </div>
      </div>
    </div>
  );
}
