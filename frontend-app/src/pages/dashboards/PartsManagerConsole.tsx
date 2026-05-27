import { useState, useEffect } from 'react';
import axios from 'axios';
import { PackageSearch, Boxes, ShoppingCart, ArrowLeftRight, Truck, Loader2, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';

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
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
                <button onClick={() => setShowAddPartForm(!showAddPartForm)} className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  {showAddPartForm ? 'Cancel' : '+ Add Part'}
                </button>
              </div>

              {showAddPartForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Part</h2>
                  <form onSubmit={handlePartSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part Number</label>
                      <input type="text" required value={newPart.partNumber} onChange={e => setNewPart({...newPart, partNumber: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input type="text" required value={newPart.description} onChange={e => setNewPart({...newPart, description: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
                      <input type="text" required value={newPart.manufacturer} onChange={e => setNewPart({...newPart, manufacturer: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
                      <input type="text" value={newPart.unitOfMeasure} onChange={e => setNewPart({...newPart, unitOfMeasure: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cost ($)</label>
                      <input type="number" step="0.01" required value={newPart.cost} onChange={e => setNewPart({...newPart, cost: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price ($)</label>
                      <input type="number" step="0.01" required value={newPart.retailPrice} onChange={e => setNewPart({...newPart, retailPrice: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 sm:text-sm px-4 py-2 border" />
                    </div>
                    <div className="md:col-span-2 flex justify-end mt-2">
                      <button type="submit" disabled={partSubmitLoading} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                        {partSubmitLoading ? 'Saving...' : 'Save Part'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">On Hand</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : parts.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No parts found.</td></tr>
                    ) : parts.map((part) => (
                      <tr key={part.partId || part.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-amber-600">{part.partNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{part.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{part.manufacturer}</td>
                        <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">In Stock</span></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${part.retailPrice?.toLocaleString() || part.unitPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Stock Level Reports</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-amber-500">
                  <h3 className="text-gray-500 text-sm font-medium">Total SKUs</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{parts.length}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                  <h3 className="text-gray-500 text-sm font-medium">Inventory Value</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">${parts.reduce((sum, p) => sum + (p.cost || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-red-500">
                  <h3 className="text-gray-500 text-sm font-medium">Low Stock Alerts</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
                <button onClick={() => setShowPOForm(!showPOForm)} className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 transition-colors">
                  {showPOForm ? 'Cancel' : '+ Draft PO'}
                </button>
              </div>

              {showPOForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Create Purchase Order</h2>
                  <form onSubmit={handleCreatePO} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                      <input type="text" required value={newPO.vendorName} onChange={e => setNewPO({...newPO, vendorName: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" placeholder="e.g. OEM Parts Direct" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Part</label>
                      <select value={newPO.partId} onChange={e => {
                        const part = parts.find((p:any) => String(p.partId) === e.target.value);
                        setNewPO({...newPO, partId: e.target.value, unitCost: part?.cost || 0});
                      }} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                        <option value="">Select a part...</option>
                        {parts.map((p:any) => <option key={p.partId} value={p.partId}>{p.partNumber} — {p.description}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                      <input type="number" min={1} required value={newPO.quantity} onChange={e => setNewPO({...newPO, quantity: parseInt(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit Cost ($)</label>
                      <input type="number" step="0.01" required value={newPO.unitCost} onChange={e => setNewPO({...newPO, unitCost: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <input type="text" value={newPO.notes} onChange={e => setNewPO({...newPO, notes: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" placeholder="Delivery instructions, urgency, etc." />
                    </div>
                    <div className="md:col-span-2 flex justify-end">
                      <button type="submit" disabled={poLoading} className="bg-amber-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-700 disabled:opacity-50">
                        {poLoading ? 'Creating...' : 'Create PO'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {poMsg && (
                <div className={`px-4 py-3 rounded-lg text-sm font-medium ${poMsg.ok ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {poMsg.text}
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={7} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : purchaseOrders.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-500">No purchase orders yet. Click "+ Draft PO" to create one.</td></tr>
                    ) : purchaseOrders.map((po: any, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-amber-600">{po.poNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{po.vendorName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{parts.find((p:any) => String(p.partId) === String(po.partId))?.description || po.partId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{po.quantity}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">${(po.totalCost || 0).toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            po.status === 'RECEIVED' || po.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            po.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            po.status === 'SUBMITTED' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{po.status}</span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          {updatingPO === i ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                          ) : po.status === 'DRAFT' ? (
                            <button onClick={() => handleUpdatePOStatus(i, 'SUBMITTED')} className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded font-medium hover:bg-amber-700 transition-colors">Submit</button>
                          ) : po.status === 'SUBMITTED' ? (
                            <button onClick={() => handleUpdatePOStatus(i, 'APPROVED')} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded font-medium hover:bg-blue-700 transition-colors">Approve</button>
                          ) : po.status === 'APPROVED' ? (
                            <button onClick={() => handleUpdatePOStatus(i, 'RECEIVED')} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded font-medium hover:bg-green-700 transition-colors">Mark Received</button>
                          ) : (
                            <span className="text-xs text-green-600 font-semibold">✓ Complete</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Recalls & Returns</h1>
                <p className="text-sm text-gray-500 mt-1">Read-only view of active vehicle recalls. Recalls are issued by Admin; returns are processed via Finance.</p>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-gray-400"/></div>
              ) : recalls.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <ArrowLeftRight className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-500">No recalls on record.</p>
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recalls.map((r: any) => (
                        <tr key={r.recallId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.recallNumber || `#${r.recallId}`}</td>
                          <td className="px-6 py-4 text-sm text-gray-700 max-w-xs" title={r.affectedModels}>{r.affectedModels || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={r.description}>{r.description || '—'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={r.remedyDescription}>{r.remedyDescription || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.issueDate || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                              r.status === 'ACTIVE'    ? 'bg-red-100 text-red-800' :
                              r.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>{r.status || 'ACTIVE'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                <strong>Parts affected by recalls:</strong> Check the affected models above and ensure any parts earmarked for recalled vehicles are flagged in your inventory.
                Contact the service team to coordinate recall repair work orders.
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}

          {activeTab === 'vendors' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Vendor Directory</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from(new Set(parts.map(p => p.manufacturer))).filter(Boolean).map((vendor: any) => (
                  <div key={vendor} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start space-x-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-lg flex items-center justify-center font-bold text-xl">
                      {vendor.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{vendor}</h3>
                      <p className="text-sm text-gray-500 mt-1">Approved OEM Supplier</p>
                      <button className="text-amber-600 text-sm font-medium mt-3 hover:text-amber-700">View Catalog &rarr;</button>
                    </div>
                  </div>
                ))}
                {parts.length === 0 && !loading && (
                   <p className="text-gray-500 col-span-3">No vendors found based on current inventory.</p>
                )}
              </div>

              {parts.length > 0 && (
                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Vendor Performance Summary</h3>
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                        <th className="py-2 pr-4">Vendor</th>
                        <th className="py-2 pr-4">SKUs Supplied</th>
                        <th className="py-2 pr-4">Total Inventory Value</th>
                        <th className="py-2">Avg Unit Cost</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {Array.from(new Set(parts.map((p:any) => p.manufacturer))).filter(Boolean).map((vendor: any) => {
                        const vendorParts = parts.filter((p:any) => p.manufacturer === vendor);
                        const totalValue = vendorParts.reduce((s:number, p:any) => s + (p.cost || 0), 0);
                        const avgCost = totalValue / vendorParts.length;
                        return (
                          <tr key={vendor} className="hover:bg-gray-50">
                            <td className="py-3 pr-4 font-medium text-gray-900">{vendor}</td>
                            <td className="py-3 pr-4 text-gray-500">{vendorParts.length}</td>
                            <td className="py-3 pr-4 text-gray-900">${totalValue.toLocaleString()}</td>
                            <td className="py-3 text-gray-500">${avgCost.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
