import { Car, FileText, Calendar, Clock, Shield, Loader2, Send, MessageSquare } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// ---------------------------------------------------------------------------
// VehiclesTab
// ---------------------------------------------------------------------------

interface VehiclesTabProps {
  loading: boolean;
  vehicles: any[];
  handleRequestQuote: (vehicle: any) => void;
  handleTestDrive: (vehicle: any) => void;
}

export function VehiclesTab({ loading, vehicles, handleRequestQuote, handleTestDrive }: VehiclesTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Vehicle Inventory</PageTitle>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-yellow" /></div>
        ) : vehicles.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-gray-500">No vehicles available.</div>
        ) : vehicles.map((v) => {
          const isSold = v.status === 'SOLD';
          return (
            <div key={v.vehicleId || v.vin} className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-shadow ${isSold ? 'border-gray-200 opacity-75' : 'border-gray-200 hover:shadow-md group'}`}>
              <div className="h-48 bg-gray-100 flex items-center justify-center relative">
                <Car className={`w-16 h-16 text-gray-300 ${!isSold && 'group-hover:scale-110 transition-transform duration-300'}`} />
                {isSold && (
                  <div className="absolute inset-0 bg-gray-900/60 flex items-center justify-center">
                    <span className="bg-red-600 text-white font-bold text-lg px-4 py-1 rounded-full tracking-wide">SOLD</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-bold text-gray-900">{v.year} {v.make} {v.model}</h3>
                  <span className={`font-bold text-lg ${isSold ? 'text-gray-400 line-through' : 'text-brand-yellow'}`}>${v.basePrice?.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{v.conditionType} {v.trim ? `• ${v.trim}` : ''}</p>
                <p className="text-xs text-gray-400 mb-4">{v.color} • {v.mileage?.toLocaleString()} mi</p>
                {isSold ? (
                  <div className="text-center py-2 text-sm text-gray-400 font-medium">This vehicle has been sold</div>
                ) : (
                  <div className="flex space-x-3">
                    <button onClick={() => handleRequestQuote(v)} className="flex-1 bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                      Request Quote
                    </button>
                    <button onClick={() => handleTestDrive(v)} className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Test Drive
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QuotesTab
// ---------------------------------------------------------------------------

interface QuotesTabProps {
  loading: boolean;
  quotes: any[];
  allVehicles: any[];
}

export function QuotesTab({ loading, quotes, allVehicles }: QuotesTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>My Quotes</PageTitle>
      <TableCard>
        <TableHead cols={['Quote ID', 'Vehicle ID', 'Total Amount', 'Status']} />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <TableLoader cols={4} />
            ) : quotes.length === 0 ? (
              <TableEmpty cols={4} message="You have no active quotes." />
            ) : quotes.map((q: any) => (
              <tr key={q.quoteId} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">QT-{q.quoteId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(() => { const v = allVehicles.find((x: any) => x.vehicleId === q.vehicleId); return v ? `${v.year} ${v.make} ${v.model}` : `#${q.vehicleId}`; })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">${q.totalPrice?.toLocaleString() ?? '—'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{q.status || 'DRAFT'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </TableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ServiceTab
// ---------------------------------------------------------------------------

interface ServiceTabProps {
  loading: boolean;
  appointments: any[];
  showApptForm: boolean;
  setShowApptForm: React.Dispatch<React.SetStateAction<boolean>>;
  newAppt: {
    customerId: number;
    vehicleId: number;
    advisorId: number;
    scheduledAt: string;
    durationMinutes: number;
    serviceType: string;
  };
  setNewAppt: React.Dispatch<React.SetStateAction<{
    customerId: number;
    vehicleId: number;
    advisorId: number;
    scheduledAt: string;
    durationMinutes: number;
    serviceType: string;
  }>>;
  apptLoading: boolean;
  handleApptSubmit: (e: React.FormEvent) => void;
  allVehicles: any[];
  crmCustomerId: number;
}

export function ServiceTab({
  loading,
  appointments,
  showApptForm,
  setShowApptForm,
  newAppt,
  setNewAppt,
  apptLoading,
  handleApptSubmit,
  allVehicles,
  crmCustomerId,
}: ServiceTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle>Service Center</PageTitle>
        <button onClick={() => setShowApptForm(!showApptForm)} className="bg-brand-yellow text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          {showApptForm ? 'Cancel' : 'Book Appointment'}
        </button>
      </div>

      {showApptForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Book New Appointment</h2>
          <form onSubmit={handleApptSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
              <SearchableSelect
                options={(() => {
                  // Service booking = customer's own cars. SOLD = purchased by a customer.
                  // If the vehicle record carries a customerId (owner), prefer matching ones;
                  // otherwise show all SOLD/IN_SERVICE vehicles so the customer can pick theirs.
                  const serviceable = allVehicles.filter(
                    v => v.status === 'SOLD' || v.status === 'IN_SERVICE'
                  );
                  const owned = serviceable.filter(
                    v => v.customerId != null && v.customerId === crmCustomerId
                  );
                  return (owned.length > 0 ? owned : serviceable).map(v => ({
                    value: v.vehicleId,
                    label: `${v.year} ${v.make} ${v.model}${v.color ? ` — ${v.color}` : ''}`,
                  }));
                })()}
                value={newAppt.vehicleId}
                onChange={v => setNewAppt({ ...newAppt, vehicleId: v })}
                placeholder="Select your vehicle"
                loadingText="Loading vehicles…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input type="datetime-local" required value={newAppt.scheduledAt} onChange={e => setNewAppt({ ...newAppt, scheduledAt: e.target.value })} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select value={newAppt.serviceType} onChange={e => setNewAppt({ ...newAppt, serviceType: e.target.value })} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border bg-white">
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
                <option value="DIAGNOSTIC">Diagnostic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input type="number" value={newAppt.durationMinutes} onChange={e => setNewAppt({ ...newAppt, durationMinutes: parseInt(e.target.value) })} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border" />
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={apptLoading} className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                {apptLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Your Appointments</h3>
        {loading ? (
          <div className="flex justify-center p-4"><Loader2 className="w-6 h-6 animate-spin text-brand-yellow" /></div>
        ) : appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-6">No appointments found. Book your first service above.</p>
        ) : (
          <div className="space-y-4">
            {appointments.map((a: any) => (
              <div key={a.appointmentId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                    <Clock className="w-6 h-6 text-brand-yellow" />
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{a.serviceType} — Vehicle #{a.vehicleId}</p>
                    <p className="text-sm text-gray-500">{new Date(a.scheduledAt || a.appointmentDate || Date.now()).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded mt-1 inline-block font-medium ${
                      a.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                      a.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>{a.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WarrantyTab
// ---------------------------------------------------------------------------

interface WarrantyTabProps {
  loading: boolean;
  invoices: any[];
  warranties: any[];
  activeRecalls: any[];
  claimWarrantyId: number | null;
  setClaimWarrantyId: React.Dispatch<React.SetStateAction<number | null>>;
  claimDescription: string;
  setClaimDescription: React.Dispatch<React.SetStateAction<string>>;
  claimAmount: string;
  setClaimAmount: React.Dispatch<React.SetStateAction<string>>;
  claimLoading: boolean;
  handleSubmitClaim: (e: React.FormEvent) => void;
}

export function WarrantyTab({
  loading,
  invoices,
  warranties,
  activeRecalls,
  claimWarrantyId,
  setClaimWarrantyId,
  claimDescription,
  setClaimDescription,
  claimAmount,
  setClaimAmount,
  claimLoading,
  handleSubmitClaim,
}: WarrantyTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Warranty & Invoices</PageTitle>

      {/* Active Recalls Banner */}
      {activeRecalls.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
            <span className="text-red-600">⚠</span> Active Vehicle Recalls ({activeRecalls.length})
          </h3>
          <div className="space-y-2">
            {activeRecalls.map((r: any) => (
              <div key={r.recallId} className="bg-white rounded-lg border border-red-100 p-3">
                <div className="flex justify-between items-start">
                  <span className="text-sm font-semibold text-red-800">{r.recallNumber}</span>
                  <span className="text-xs text-red-500">{r.issueDate}</span>
                </div>
                <p className="text-xs text-gray-700 mt-1">{r.description}</p>
                {r.affectedModels && <p className="text-xs text-gray-500 mt-1">Affected: {r.affectedModels}</p>}
                {r.remedyDescription && <p className="text-xs text-green-700 mt-1">Remedy: {r.remedyDescription}</p>}
              </div>
            ))}
          </div>
          <p className="text-xs text-red-600 mt-3">Please contact the service desk to schedule your free recall service appointment.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-gray-500" /> My Invoices
          </h3>
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-yellow" /> :
            invoices.length === 0 ? <p className="text-gray-500 text-center py-4">No invoices found.</p> : (
              <div className="space-y-3">
                {invoices.map((inv: any) => (
                  <div key={inv.invoiceId} className="flex justify-between items-center p-3 border border-gray-100 rounded hover:bg-gray-50">
                    <div>
                      <p className="font-bold text-gray-900">INV-{inv.invoiceId}</p>
                      <p className="text-xs text-gray-500">{inv.relatedEntityType} — {inv.status}</p>
                    </div>
                    <p className="font-bold text-green-700">${inv.totalAmount?.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-gray-500" /> Active Warranties
          </h3>
          {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-yellow" /> :
            warranties.length === 0 ? <p className="text-gray-500 text-center py-4">No active warranties found.</p> : (
              <div className="space-y-3">
                {warranties.map((w: any) => {
                  const wid = w.warrantyId || w.id;
                  const isActive = w.status === 'ACTIVE' || !w.status;
                  return (
                    <div key={wid} className="p-3 border border-gray-100 rounded hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-gray-900">{w.warrantyType || 'Standard Warranty'}</p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Vehicle #{w.vehicleId} • Expires: {w.endDate ? new Date(w.endDate).toLocaleDateString() : '—'}
                            {w.mileageLimit ? ` • ${w.mileageLimit.toLocaleString()} mi` : ''}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-semibold ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {w.status || 'ACTIVE'}
                        </span>
                      </div>
                      {isActive && (
                        claimWarrantyId === wid ? (
                          <form onSubmit={handleSubmitClaim} className="mt-3 space-y-2">
                            <textarea
                              required
                              value={claimDescription}
                              onChange={e => setClaimDescription(e.target.value)}
                              placeholder="Describe the issue covered by this warranty..."
                              rows={2}
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 resize-none"
                            />
                            <input
                              required
                              type="number"
                              min="0"
                              step="0.01"
                              value={claimAmount}
                              onChange={e => setClaimAmount(e.target.value)}
                              placeholder="Estimated repair cost ($)"
                              className="w-full text-xs border border-gray-300 rounded px-2 py-1.5"
                            />
                            <div className="flex gap-2">
                              <button type="submit" disabled={claimLoading} className="flex-1 text-xs bg-brand-yellow text-gray-900 py-1.5 rounded font-medium hover:bg-yellow-400 disabled:opacity-50">
                                {claimLoading ? 'Submitting...' : 'Submit Claim'}
                              </button>
                              <button type="button" onClick={() => { setClaimWarrantyId(null); setClaimDescription(''); setClaimAmount(''); }} className="text-xs text-gray-500 hover:text-gray-700 px-2">
                                Cancel
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            onClick={() => setClaimWarrantyId(wid)}
                            className="mt-2 text-xs text-brand-yellow hover:text-yellow-600 font-medium"
                          >
                            + Submit Claim
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MessagesTab
// ---------------------------------------------------------------------------

interface MessagesTabProps {
  advisors: any[];
  messages: any[];
  messagesLoading: boolean;
  messageText: string;
  setMessageText: React.Dispatch<React.SetStateAction<string>>;
  selectedAdvisorId: number | null;
  setSelectedAdvisorId: React.Dispatch<React.SetStateAction<number | null>>;
  messageSending: boolean;
  handleSendMessage: (e: React.FormEvent) => void;
}

export function MessagesTab({
  advisors,
  messages,
  messagesLoading,
  messageText,
  setMessageText,
  selectedAdvisorId,
  setSelectedAdvisorId,
  messageSending,
  handleSendMessage,
}: MessagesTabProps) {
  return (
    <div className="space-y-6">
      <PageTitle>Messages</PageTitle>

      {/* Compose form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-brand-yellow" /> Send a Message to Service Team
        </h3>
        {advisors.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No service advisors available at the moment.</p>
        ) : (
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Send to</label>
              <select
                value={selectedAdvisorId ?? ''}
                onChange={e => setSelectedAdvisorId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              >
                {advisors.map((a: any) => (
                  <option key={a.userId} value={a.userId}>{a.name} — Service Advisor</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
              <textarea
                required
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                rows={3}
                placeholder="Type your message here… e.g. asking about your vehicle status, appointment query, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:ring-brand-yellow focus:border-brand-yellow outline-none"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={messageSending || !messageText.trim()}
                className="bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {messageSending ? <><Loader2 className="w-4 h-4 animate-spin"/>Sending…</> : <><Send className="w-4 h-4"/>Send Message</>}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Message history */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-400" /> Message History
        </h3>
        {messagesLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-400"/></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No messages yet. Use the form above to contact your service advisor.</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {messages.slice().sort((a: any, b: any) => new Date(b.createdAt || b.sentAt || 0).getTime() - new Date(a.createdAt || a.sentAt || 0).getTime()).map((msg: any, i: number) => {
              const isSent = msg._sent;
              const isAdvisor = msg.notificationType === 'ADVISOR_MESSAGE' && !isSent;
              return (
                <div key={msg.notificationId || i} className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 ${
                    isSent
                      ? 'bg-brand-yellow text-gray-900 rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                  }`}>
                    <p className="text-xs font-semibold mb-1 opacity-70">
                      {isSent ? 'You' : isAdvisor ? 'Service Advisor' : msg.notificationType?.replace('_', ' ')}
                    </p>
                    <p className="text-sm">{msg.message || msg.subject}</p>
                    {(msg.createdAt || msg.sentAt) && (
                      <p className="text-xs opacity-50 mt-1 text-right">
                        {new Date(msg.createdAt || msg.sentAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
