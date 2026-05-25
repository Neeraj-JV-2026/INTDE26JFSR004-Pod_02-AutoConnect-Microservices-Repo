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

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'inventory' || activeTab === 'stock' || activeTab === 'orders' || activeTab === 'vendors') {
      axios.get('http://localhost:8089/api/v1/inventory/parts')
        .then(res => setParts(res.data))
        .catch(err => setParts([]))
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Purchase Orders</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Active POs</h3>
                  <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ Draft PO</button>
                </div>
                <p className="text-gray-500">No active purchase orders found in the system for current inventory.</p>
              </div>
            </div>
          )}

          {activeTab === 'transfers' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Recalls & Returns</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recall ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle/Part</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400"/></td></tr>
                    ) : recalls.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No active recalls or returns.</td></tr>
                    ) : recalls.map((r: any) => (
                      <tr key={r.recallId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.recallNumber || r.recallId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.affectedPart}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{r.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" />
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
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
