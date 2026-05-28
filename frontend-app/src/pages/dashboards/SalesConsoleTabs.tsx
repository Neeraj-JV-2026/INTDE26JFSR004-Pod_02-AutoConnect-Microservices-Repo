import { Loader2, Calendar } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ─── LeadsTab ─────────────────────────────────────────────────────────────────

export interface LeadsTabProps {
  leads: any[];
  testDrives: any[];
  customers: any[];
  tabLoading: boolean;
  showNewLeadForm: boolean;
  setShowNewLeadForm: (v: boolean) => void;
  newLeadData: { customerId: number; source: string; interestedModel: string; status: string; notes: string };
  setNewLeadData: (v: any) => void;
  leadSubmitLoading: boolean;
  handleLeadSubmit: (e: React.FormEvent) => void;
  advanceLeadStatus: (lead: any, nextStatus: string) => void;
  handleAssignToMe: (lead: any) => void;
  currentUserId?: number;
  confirmTestDrive: (td: any) => void;
  newProspects: any[];
  contacted: any[];
  interested: any[];
  converted: any[];
}

export function LeadsTab({
  leads,
  testDrives,
  customers,
  tabLoading,
  showNewLeadForm,
  setShowNewLeadForm,
  newLeadData,
  setNewLeadData,
  leadSubmitLoading,
  handleLeadSubmit,
  advanceLeadStatus,
  handleAssignToMe,
  currentUserId,
  confirmTestDrive,
  newProspects,
  contacted,
  interested,
  converted,
}: LeadsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Active Leads pipeline</PageTitle>
        <button onClick={() => setShowNewLeadForm(!showNewLeadForm)} className="bg-brand-yellow text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
          {showNewLeadForm ? 'Cancel' : '+ New Lead'}
        </button>
      </div>

      {showNewLeadForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Lead</h2>
          <form onSubmit={handleLeadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={newLeadData.customerId}
                onChange={v => setNewLeadData({...newLeadData, customerId: v})}
                placeholder="Select customer"
                loadingText="Loading customers…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select value={newLeadData.source} onChange={e => setNewLeadData({...newLeadData, source: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border bg-white">
                <option value="WALK_IN">Walk In</option>
                <option value="PHONE">Phone</option>
                <option value="WEB">Website</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interested Model</label>
              <input type="text" required value={newLeadData.interestedModel} onChange={e => setNewLeadData({...newLeadData, interestedModel: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" placeholder="e.g. BMW X3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <input type="text" value={newLeadData.notes} onChange={e => setNewLeadData({...newLeadData, notes: e.target.value})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={leadSubmitLoading} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {leadSubmitLoading ? 'Saving...' : 'Create Lead'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lead Lifecycle Kanban */}
      <div className="flex space-x-4 overflow-x-auto pb-4">

        {/* Column: NEW */}
        <div className="bg-gray-50 rounded-xl p-4 min-w-[260px] border border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
            New <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{newProspects.length}</span>
          </h3>
          <div className="space-y-3">
            {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
             newProspects.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No new leads</p> :
             newProspects.map(lead => {
              const isAssigned = !!lead.assignedTo;
              const isMine = lead.assignedTo === currentUserId;
              return (
              <div key={lead.leadId} className={`bg-white p-3 rounded-lg shadow-sm border ${isAssigned ? 'border-gray-100' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 text-sm">Lead #{lead.leadId}</p>
                  {isAssigned
                    ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                        {isMine ? 'Mine' : `Assigned #${lead.assignedTo}`}
                      </span>
                    : <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Unassigned</span>
                  }
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customers.find(c => c.customerId === lead.customerId)?.name || `Customer #${lead.customerId}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Interested in: {lead.interestedModel || 'Any'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Source: {lead.source}</p>
                {!isAssigned && (
                  <button
                    onClick={() => handleAssignToMe(lead)}
                    className="mt-2 w-full text-xs bg-orange-500 text-white py-1 rounded font-medium hover:bg-orange-600"
                  >
                    Claim Lead
                  </button>
                )}
                <button
                  onClick={() => advanceLeadStatus(lead, 'CONTACTED')}
                  disabled={!isAssigned}
                  title={!isAssigned ? 'Claim this lead before advancing its status' : ''}
                  className="mt-1 w-full text-xs bg-blue-600 text-white py-1 rounded font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Mark Contacted →
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Column: CONTACTED */}
        <div className="bg-blue-50 rounded-xl p-4 min-w-[260px] border border-blue-200 flex-shrink-0">
          <h3 className="font-semibold text-blue-700 mb-4 flex items-center justify-between">
            Contacted <span className="bg-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs">{contacted.length}</span>
          </h3>
          <div className="space-y-3">
            {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
             contacted.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No contacted leads</p> :
             contacted.map(lead => {
              const isAssigned = !!lead.assignedTo;
              const isMine = lead.assignedTo === currentUserId;
              return (
              <div key={lead.leadId} className={`bg-white p-3 rounded-lg shadow-sm border ${isAssigned ? 'border-blue-100' : 'border-red-200 bg-red-50/30'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 text-sm">Lead #{lead.leadId}</p>
                  {isAssigned
                    ? <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">{isMine ? 'Mine' : `#${lead.assignedTo}`}</span>
                    : <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Unassigned</span>
                  }
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customers.find(c => c.customerId === lead.customerId)?.name || `Customer #${lead.customerId}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Interested in: {lead.interestedModel || 'Any'}</p>
                {!isAssigned && (
                  <button onClick={() => handleAssignToMe(lead)} className="mt-2 w-full text-xs bg-orange-500 text-white py-1 rounded font-medium hover:bg-orange-600">
                    Claim Lead
                  </button>
                )}
                <button
                  onClick={() => advanceLeadStatus(lead, 'INTERESTED')}
                  disabled={!isAssigned}
                  title={!isAssigned ? 'Claim this lead before advancing its status' : ''}
                  className="mt-1 w-full text-xs bg-yellow-500 text-white py-1 rounded font-medium hover:bg-yellow-600 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Mark Interested →
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Column: INTERESTED / Negotiation */}
        <div className="bg-yellow-50 rounded-xl p-4 min-w-[260px] border border-yellow-200 flex-shrink-0">
          <h3 className="font-semibold text-yellow-700 mb-4 flex items-center justify-between">
            Interested <span className="bg-yellow-200 text-yellow-700 px-2 py-0.5 rounded text-xs">{interested.length}</span>
          </h3>
          <div className="space-y-3">
            {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
             interested.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No interested leads</p> :
             interested.map(lead => {
              const isAssigned = !!lead.assignedTo;
              const isMine = lead.assignedTo === currentUserId;
              return (
              <div key={lead.leadId} className={`bg-white p-3 rounded-lg shadow-sm border border-l-4 ${isAssigned ? 'border-yellow-100 border-l-yellow-400' : 'border-red-200 border-l-red-400 bg-red-50/30'}`}>
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 text-sm">Lead #{lead.leadId}</p>
                  <div className="flex gap-1">
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-1.5 py-0.5 rounded font-medium">Hot</span>
                    {isAssigned
                      ? <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">{isMine ? 'Mine' : `#${lead.assignedTo}`}</span>
                      : <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">Unassigned</span>
                    }
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customers.find(c => c.customerId === lead.customerId)?.name || `Customer #${lead.customerId}`}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{lead.notes || 'No notes'}</p>
                {!isAssigned && (
                  <button onClick={() => handleAssignToMe(lead)} className="mt-2 w-full text-xs bg-orange-500 text-white py-1 rounded font-medium hover:bg-orange-600">
                    Claim Lead
                  </button>
                )}
                <button
                  onClick={() => advanceLeadStatus(lead, 'CONVERTED')}
                  disabled={!isAssigned}
                  title={!isAssigned ? 'Claim this lead before advancing its status' : ''}
                  className="mt-1 w-full text-xs bg-green-600 text-white py-1 rounded font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Convert Lead ✓
                </button>
              </div>
              );
            })}
          </div>
        </div>

        {/* Column: CONVERTED */}
        <div className="bg-green-50 rounded-xl p-4 min-w-[260px] border border-green-200 flex-shrink-0">
          <h3 className="font-semibold text-green-700 mb-4 flex items-center justify-between">
            Converted <span className="bg-green-200 text-green-700 px-2 py-0.5 rounded text-xs">{converted.length}</span>
          </h3>
          <div className="space-y-3">
            {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
             converted.length === 0 ? <p className="text-xs text-gray-400 text-center py-4">No converted leads yet</p> :
             converted.map(lead => {
              const isMine = lead.assignedTo === currentUserId;
              return (
              <div key={lead.leadId} className="bg-white p-3 rounded-lg shadow-sm border border-green-100 border-l-4 border-l-green-500">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 text-sm">Lead #{lead.leadId}</p>
                  {lead.assignedTo && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                      {isMine ? 'Mine' : `#${lead.assignedTo}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  {customers.find(c => c.customerId === lead.customerId)?.name || `Customer #${lead.customerId}`}
                </p>
                <p className="text-xs text-green-600 font-medium mt-1">✓ Ready for quote</p>
              </div>
              );
            })}
          </div>
        </div>

        {/* Test Drives column */}
        <div className="bg-gray-50 rounded-xl p-4 min-w-[260px] border border-gray-200 flex-shrink-0">
          <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
            Test Drives <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').length}</span>
          </h3>
          <div className="space-y-3">
            {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
             testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').length === 0
               ? <p className="text-xs text-gray-400 text-center py-4">No pending test drives.</p>
               : testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').map(td => (
              <div key={td.id} className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900 text-sm">TD-{td.id}</p>
                  <span className={`text-xs px-2 py-0.5 rounded font-semibold ${td.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {td.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Customer #{td.customerId} • Vehicle #{td.vehicleId}</p>
                <p className="text-xs text-gray-400 mt-1">
                  <Calendar className="w-3 h-3 inline mr-1" />
                  {td.scheduledAt ? new Date(td.scheduledAt).toLocaleString() : '—'}
                </p>
                {td.status === 'REQUESTED' && (
                  <button
                    onClick={() => confirmTestDrive(td)}
                    className="mt-2 w-full text-xs bg-blue-600 text-white py-1.5 rounded font-medium hover:bg-blue-700"
                  >
                    Confirm & Schedule
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── VehiclesTab ───────────────────────────────────────────────────────────────

export interface VehiclesTabProps {
  inventory: any[];
  tabLoading: boolean;
}

export function VehiclesTab({ inventory, tabLoading }: VehiclesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Available Inventory</PageTitle>
      </div>
      <TableCard>
          <TableHead cols={['Vehicle', 'VIN', 'Condition', 'MSRP']} right={[3]} />
          <tbody className="bg-white divide-y divide-gray-200">
            {tabLoading ? (
              <TableLoader cols={4} />
            ) : inventory.length === 0 ? (
              <TableEmpty cols={4} message="No vehicles in inventory." />
            ) : inventory.map((v: any) => (
              <tr key={v.vehicleId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900">{v.year} {v.make} {v.model}</div>
                  <div className="text-sm text-gray-500">{v.color} - {v.mileage} mi</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.vin}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${v.conditionType === 'NEW' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {v.conditionType}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                  ${v.msrp?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
      </TableCard>
    </div>
  );
}

// ─── QuotesTab ─────────────────────────────────────────────────────────────────

export interface QuotesTabProps {
  quotes: any[];
  customers: any[];
  allVehicles: any[];
  tabLoading: boolean;
  showNewQuoteForm: boolean;
  setShowNewQuoteForm: (v: boolean) => void;
  newQuoteData: { customerId: number; vehicleId: number; taxes: number; fees: number };
  setNewQuoteData: (v: any) => void;
  quoteSubmitLoading: boolean;
  handleQuoteSubmit: (e: React.FormEvent) => void;
  convertQuoteToDeal: (quote: any) => void;
}

export function QuotesTab({
  quotes,
  customers,
  allVehicles,
  tabLoading,
  showNewQuoteForm,
  setShowNewQuoteForm,
  newQuoteData,
  setNewQuoteData,
  quoteSubmitLoading,
  handleQuoteSubmit,
  convertQuoteToDeal,
}: QuotesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Quote Builder</PageTitle>
        <button onClick={() => setShowNewQuoteForm(!showNewQuoteForm)} className="bg-brand-yellow text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors">
          {showNewQuoteForm ? 'Cancel' : '+ New Quote'}
        </button>
      </div>

      {showNewQuoteForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Generate Sales Quote</h2>
          <form onSubmit={handleQuoteSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={newQuoteData.customerId}
                onChange={v => setNewQuoteData({...newQuoteData, customerId: v})}
                placeholder="Select customer"
                loadingText="Loading customers…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <SearchableSelect
                options={allVehicles.filter(v => v.status === 'AVAILABLE').map(v => ({ value: v.vehicleId, label: `${v.year} ${v.make} ${v.model}` }))}
                value={newQuoteData.vehicleId}
                onChange={v => setNewQuoteData({...newQuoteData, vehicleId: v})}
                placeholder="Select vehicle"
                loadingText="Loading vehicles…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taxes ($)</label>
              <input type="number" required value={newQuoteData.taxes} onChange={e => setNewQuoteData({...newQuoteData, taxes: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fees ($)</label>
              <input type="number" required value={newQuoteData.fees} onChange={e => setNewQuoteData({...newQuoteData, fees: parseFloat(e.target.value)})} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={quoteSubmitLoading} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {quoteSubmitLoading ? 'Saving...' : 'Generate Quote'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tabLoading ? <div className="col-span-full flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-400"/></div> :
         quotes.length === 0 ? <p className="text-gray-500 col-span-full text-center py-10">No quotes found.</p> :
         quotes.map((q: any) => (
          <div key={q.quoteId} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-gray-900">Quote #{q.quoteId}</h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">{q.status || 'DRAFT'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Customer: {customers.find(c => c.customerId === q.customerId)?.name || `ID #${q.customerId}`}
            </p>
            <p className="text-sm text-gray-500 mb-4">
              {(() => { const v = allVehicles.find(x => x.vehicleId === q.vehicleId); return v ? `${v.year} ${v.make} ${v.model}` : `Vehicle #${q.vehicleId}`; })()}
            </p>
            <div className="border-t border-gray-100 pt-4 flex justify-between items-center mb-4">
              <span className="text-gray-500 text-sm">Total Amount</span>
              <span className="font-bold text-lg text-gray-900">${q.totalPrice?.toLocaleString()}</span>
            </div>
            {q.status !== 'CONVERTED' && (
              <button onClick={() => convertQuoteToDeal(q)} className="w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Convert to Deal
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

