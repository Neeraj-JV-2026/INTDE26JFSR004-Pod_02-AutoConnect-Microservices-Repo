import { Loader2, ArrowLeftRight } from 'lucide-react';
import NotificationsPanel from '../../components/NotificationsPanel';
import { StatusBadge, MetricCard, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── InventoryTab ────────────────────────────────────────────────────────────

export interface InventoryTabProps {
  parts: any[];
  loading: boolean;
  showAddPartForm: boolean;
  setShowAddPartForm: React.Dispatch<React.SetStateAction<boolean>>;
  newPart: {
    partNumber: string;
    description: string;
    manufacturer: string;
    unitOfMeasure: string;
    cost: number;
    retailPrice: number;
  };
  setNewPart: React.Dispatch<React.SetStateAction<{
    partNumber: string;
    description: string;
    manufacturer: string;
    unitOfMeasure: string;
    cost: number;
    retailPrice: number;
  }>>;
  handlePartSubmit: (e: React.FormEvent) => void;
  partSubmitLoading: boolean;
}

export function InventoryTab({
  parts,
  loading,
  showAddPartForm,
  setShowAddPartForm,
  newPart,
  setNewPart,
  handlePartSubmit,
  partSubmitLoading,
}: InventoryTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Inventory Management</PageTitle>
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

      <TableCard>
          <TableHead cols={['Part Number', 'Description', 'Category', 'On Hand', 'Price']} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={5} />
            ) : parts.length === 0 ? (
              <TableEmpty cols={5} message="No parts found." />
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
      </TableCard>
    </div>
  );
}

// ─── StockTab ────────────────────────────────────────────────────────────────

export interface StockTabProps {
  parts: any[];
  loading: boolean;
}

export function StockTab({ parts, loading }: StockTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Stock Level Reports</PageTitle>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <MetricCard title="Total SKUs" value={parts.length} accent="yellow" />
        <MetricCard title="Inventory Value" value={`$${parts.reduce((sum, p) => sum + (p.cost || 0), 0).toLocaleString()}`} accent="green" />
        <MetricCard title="Low Stock Alerts" value={0} accent="red" />
      </div>
    </div>
  );
}

// ─── OrdersTab ───────────────────────────────────────────────────────────────

export interface OrdersTabProps {
  loading: boolean;
  purchaseOrders: any[];
  parts: any[];
  showPOForm: boolean;
  setShowPOForm: React.Dispatch<React.SetStateAction<boolean>>;
  newPO: { vendorName: string; partId: string; quantity: number; unitCost: number; notes: string };
  setNewPO: React.Dispatch<React.SetStateAction<{ vendorName: string; partId: string; quantity: number; unitCost: number; notes: string }>>;
  handleCreatePO: (e: React.FormEvent) => void;
  poLoading: boolean;
  poMsg: { text: string; ok: boolean } | null;
  updatingPO: number | null;
  handleUpdatePOStatus: (index: number, newStatus: string) => void;
}

export function OrdersTab({
  loading,
  purchaseOrders,
  parts,
  showPOForm,
  setShowPOForm,
  newPO,
  setNewPO,
  handleCreatePO,
  poLoading,
  poMsg,
  updatingPO,
  handleUpdatePOStatus,
}: OrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Purchase Orders</PageTitle>
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

      <TableCard>
          <TableHead cols={['PO Number', 'Vendor', 'Part', 'Qty', 'Total', 'Status', 'Actions']} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={7} />
            ) : purchaseOrders.length === 0 ? (
              <TableEmpty cols={7} message='No purchase orders yet. Click "+ Draft PO" to create one.' />
            ) : purchaseOrders.map((po: any, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-amber-600">{po.poNumber}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{po.vendorName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{parts.find((p:any) => String(p.partId) === String(po.partId))?.description || po.partId}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{po.quantity}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">${(po.totalCost || 0).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <StatusBadge status={po.status} />
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
      </TableCard>
    </div>
  );
}

// ─── TransfersTab ────────────────────────────────────────────────────────────

export interface TransfersTabProps {
  loading: boolean;
  recalls: any[];
}

export function TransfersTab({ loading, recalls }: TransfersTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <PageTitle>Recalls & Returns</PageTitle>
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
        <TableCard>
            <TableHead cols={['Recall #', 'Affected Models', 'Description', 'Remedy', 'Issue Date', 'Status']} />
            <tbody className="bg-white divide-y divide-gray-200">
              {recalls.map((r: any) => (
                <tr key={r.recallId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.recallNumber || `#${r.recallId}`}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs" title={r.affectedModels}>{r.affectedModels || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={r.description}>{r.description || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={r.remedyDescription}>{r.remedyDescription || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.issueDate || '—'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={r.status || 'ACTIVE'} />
                  </td>
                </tr>
              ))}
            </tbody>
        </TableCard>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Parts affected by recalls:</strong> Check the affected models above and ensure any parts earmarked for recalled vehicles are flagged in your inventory.
        Contact the service team to coordinate recall repair work orders.
      </div>
    </div>
  );
}

// ─── VendorsTab ──────────────────────────────────────────────────────────────

export interface VendorsTabProps {
  parts: any[];
  loading: boolean;
}

export function VendorsTab({ parts, loading }: VendorsTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Vendor Directory</PageTitle>
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
  );
}

// ─── NotificationsTab ────────────────────────────────────────────────────────

export interface NotificationsTabProps {
  userId?: number;
}

export function NotificationsTab({ userId }: NotificationsTabProps) {
  return <NotificationsPanel userId={userId} theme="light" limit={5} />;
}
