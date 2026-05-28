import { Loader2, Plus, Package, Layers } from 'lucide-react';
import { StatusBadge, TableCard, TableHead, TableLoader, PageTitle } from './DashboardShared';

export interface PricingTabProps {
  loading: boolean;
  pricingRules: any[];
  showPricingForm: boolean;
  setShowPricingForm: (v: boolean) => void;
  pricingForm: {
    name: string; priority: number; status: string;
    effectiveFrom: string; effectiveTo: string;
    adjustmentType: string; adjustmentValue: number;
    conditionMake: string; conditionType: string;
  };
  setPricingForm: (v: PricingTabProps['pricingForm']) => void;
  pricingLoading: boolean;
  handleAddPricingRule: (e: React.FormEvent) => void;
  deletePricingRule: (id: number) => void;
}
export function PricingTab({
  loading,
  pricingRules,
  showPricingForm,
  setShowPricingForm,
  pricingForm,
  setPricingForm,
  pricingLoading,
  handleAddPricingRule,
  deletePricingRule,
}: PricingTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Pricing Rules & Margins</PageTitle>
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
        <TableCard>
            <TableHead cols={['Rule Name', 'Adjustment', 'Priority', 'Effective From', 'Effective To', 'Status', 'Actions']} right={[6]} />
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
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => deletePricingRule(r.priceRuleId)} className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableCard>
      )}
    </div>
  );
}

export interface PromotionsTabProps {
  loading: boolean;
  promotions: any[];
  showPromoForm: boolean;
  setShowPromoForm: (v: boolean) => void;
  promoForm: { code: string; name: string; discountType: string; value: number; startDate: string; endDate: string };
  setPromoForm: (v: PromotionsTabProps['promoForm']) => void;
  promoLoading: boolean;
  handleAddPromo: (e: React.FormEvent) => void;
  deactivatePromo: (id: number) => void;
}
export function PromotionsTab({
  loading,
  promotions,
  showPromoForm,
  setShowPromoForm,
  promoForm,
  setPromoForm,
  promoLoading,
  handleAddPromo,
  deactivatePromo,
}: PromotionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Promotion Builder</PageTitle>
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
  );
}

export interface PartsTabProps {
  parts: any[];
  partsInventory: any[];
  partsLoading: boolean;
  fetchParts: () => void;
  showAddPartForm: boolean;
  setShowAddPartForm: (v: boolean) => void;
  partForm: { partNumber: string; description: string; manufacturer: string; unitOfMeasure: string; cost: number; retailPrice: number };
  setPartForm: (v: PartsTabProps['partForm']) => void;
  partFormLoading: boolean;
  handleAddPart: (e: React.FormEvent) => void;
  showAddStockForm: boolean;
  setShowAddStockForm: (v: boolean) => void;
  stockForm: { partId: number; locationId: number; quantityOnHand: number; quantityReserved: number; reorderPoint: number };
  setStockForm: (v: PartsTabProps['stockForm']) => void;
  stockFormLoading: boolean;
  handleAddStock: (e: React.FormEvent) => void;
}
export function PartsTab({
  parts,
  partsInventory,
  partsLoading,
  fetchParts,
  showAddPartForm,
  setShowAddPartForm,
  partForm,
  setPartForm,
  partFormLoading,
  handleAddPart,
  showAddStockForm,
  setShowAddStockForm,
  stockForm,
  setStockForm,
  stockFormLoading,
  handleAddStock,
}: PartsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Parts Management</PageTitle>
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
              <input type="text" required value={partForm.partNumber} onChange={e => setPartForm({ ...partForm, partNumber: e.target.value.toUpperCase() })} placeholder="e.g. OIL-FILTER-001" className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <input type="text" required value={partForm.description} onChange={e => setPartForm({ ...partForm, description: e.target.value })} placeholder="e.g. Standard Oil Filter" className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manufacturer</label>
              <input type="text" value={partForm.manufacturer} onChange={e => setPartForm({ ...partForm, manufacturer: e.target.value })} placeholder="e.g. Bosch" className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit of Measure</label>
              <select value={partForm.unitOfMeasure} onChange={e => setPartForm({ ...partForm, unitOfMeasure: e.target.value })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white">
                <option value="EACH">Each (EA)</option>
                <option value="LITRE">Litre (L)</option>
                <option value="KG">Kilogram (kg)</option>
                <option value="SET">Set</option>
                <option value="PAIR">Pair</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($) <span className="text-red-500">*</span></label>
              <input type="number" required min={0} step="0.01" value={partForm.cost} onChange={e => setPartForm({ ...partForm, cost: parseFloat(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Retail Price ($) <span className="text-red-500">*</span></label>
              <input type="number" required min={0} step="0.01" value={partForm.retailPrice} onChange={e => setPartForm({ ...partForm, retailPrice: parseFloat(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
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
              <input type="number" required min={1} value={stockForm.locationId} onChange={e => setStockForm({ ...stockForm, locationId: parseInt(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity On Hand <span className="text-red-500">*</span></label>
              <input type="number" required min={0} value={stockForm.quantityOnHand} onChange={e => setStockForm({ ...stockForm, quantityOnHand: parseInt(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Reserved</label>
              <input type="number" min={0} value={stockForm.quantityReserved} onChange={e => setStockForm({ ...stockForm, quantityReserved: parseInt(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reorder Point</label>
              <input type="number" min={0} value={stockForm.reorderPoint} onChange={e => setStockForm({ ...stockForm, reorderPoint: parseInt(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border" />
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
          <TableHead cols={['Part #', 'Description', 'Manufacturer', 'UOM', 'Cost', 'Retail', 'On Hand', 'Reserved']} right={[4, 5, 6, 7]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {partsLoading ? (
              <TableLoader cols={8} />
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
  );
}
