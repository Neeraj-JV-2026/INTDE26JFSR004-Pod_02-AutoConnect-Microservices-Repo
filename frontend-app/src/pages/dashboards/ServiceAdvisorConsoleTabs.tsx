import { Loader2, CheckSquare, Search, MessageSquare, Send } from 'lucide-react';
import SearchableSelect from '../../components/SearchableSelect';
import { StatusBadge, TableCard, TableHead, TableLoader, TableEmpty, PageTitle } from './DashboardShared';

// WarrantyClaimsTab and NotificationsTab have been moved to ServiceAdvisorClaimsTabs.tsx
export type { WarrantyClaimsTabProps, NotificationsTabProps } from './ServiceAdvisorClaimsTabs';
export { WarrantyClaimsTab, NotificationsTab } from './ServiceAdvisorClaimsTabs';

/** Parse a MySQL JSON column value back to a plain display string.
 *  The backend stores plain text as a JSON string literal: "\"text\""
 *  Arrays like ["a","b"] are joined with ", ". Objects return the first string value. */
function parseJsonField(raw: any): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed === 'string') return parsed;
    if (Array.isArray(parsed)) return parsed.join(', ');
    if (typeof parsed === 'object') return Object.values(parsed).join(', ');
  } catch {
    // Not JSON — return raw string (legacy data or plain text)
  }
  return String(raw);
}

// ---------------------------------------------------------------------------
// CalendarTab
// ---------------------------------------------------------------------------

export interface CalendarTabProps {
  loading: boolean;
  appointments: any[];
  customers: any[];
  allVehicles: any[];
  showAppointmentForm: boolean;
  setShowAppointmentForm: React.Dispatch<React.SetStateAction<boolean>>;
  newAppointment: {
    customerId: number;
    vehicleId: number;
    advisorId: number;
    scheduledAt: string;
    durationMinutes: number;
    serviceType: string;
  };
  setNewAppointment: React.Dispatch<React.SetStateAction<{
    customerId: number;
    vehicleId: number;
    advisorId: number;
    scheduledAt: string;
    durationMinutes: number;
    serviceType: string;
  }>>;
  aptSubmitLoading: boolean;
  handleAppointmentSubmit: (e: React.FormEvent) => void;
  setAssignJobAptId: React.Dispatch<React.SetStateAction<number | null>>;
  setJobError: React.Dispatch<React.SetStateAction<string | null>>;
  setIntakeAppt: React.Dispatch<React.SetStateAction<any>>;
  setIntakeChecks: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  setIntakeNotes: React.Dispatch<React.SetStateAction<string>>;
}

export function CalendarTab({
  loading,
  appointments,
  customers,
  allVehicles,
  showAppointmentForm,
  setShowAppointmentForm,
  newAppointment,
  setNewAppointment,
  aptSubmitLoading,
  handleAppointmentSubmit,
  setAssignJobAptId,
  setJobError,
  setIntakeAppt,
  setIntakeChecks,
  setIntakeNotes,
}: CalendarTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Today's Schedule</PageTitle>
        <div className="flex space-x-3 items-center">
          <button onClick={() => setShowAppointmentForm(!showAppointmentForm)} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            {showAppointmentForm ? 'Cancel' : '+ Book Appt'}
          </button>
        </div>
      </div>

      {showAppointmentForm && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Book New Appointment</h2>
          <form onSubmit={handleAppointmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
              <SearchableSelect
                options={customers.map(c => ({ value: c.customerId, label: c.name }))}
                value={newAppointment.customerId}
                onChange={v => setNewAppointment({...newAppointment, customerId: v})}
                placeholder="Select customer"
                loadingText="Loading customers…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle</label>
              <SearchableSelect
                options={allVehicles.filter(v => v.status !== 'SOLD').map(v => ({ value: v.vehicleId, label: `${v.year} ${v.make} ${v.model}` }))}
                value={newAppointment.vehicleId}
                onChange={v => setNewAppointment({...newAppointment, vehicleId: v})}
                placeholder="Select vehicle"
                loadingText="Loading vehicles…"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date & Time</label>
              <input type="datetime-local" required value={newAppointment.scheduledAt} onChange={e => setNewAppointment({...newAppointment, scheduledAt: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Service Type</label>
              <select value={newAppointment.serviceType} onChange={e => setNewAppointment({...newAppointment, serviceType: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border bg-white">
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
                <option value="DIAGNOSTIC">Diagnostic</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-2">
              <button type="submit" disabled={aptSubmitLoading} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50">
                {aptSubmitLoading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="grid grid-cols-1 divide-y divide-slate-100">
          {loading ? (
            <div className="p-6 text-center text-slate-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></div>
          ) : appointments.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No appointments for today.</div>
          ) : appointments.map((apt) => (
            <div key={apt.appId} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {new Date(apt.appointmentDate || apt.scheduledAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-bold text-slate-900 mr-3">
                      {customers.find(c => c.customerId === apt.customerId)?.name || `Customer #${apt.customerId}`}
                    </h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <p className="text-slate-600 mt-1">
                    {(() => { const v = allVehicles.find(x => x.vehicleId === apt.vehicleId); return v ? `${v.year} ${v.make} ${v.model}` : `Vehicle #${apt.vehicleId}`; })()}
                  </p>
                  <p className="text-sm text-slate-500 mt-1 flex items-center">
                    <CheckSquare className="w-4 h-4 mr-1" /> {apt.serviceType}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 flex-col items-end gap-2">
                <button onClick={() => { setAssignJobAptId(apt.appId); setJobError(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Assign Tech</button>
                <button
                  onClick={() => { setIntakeAppt(apt); setIntakeChecks({}); setIntakeNotes(''); }}
                  className="mt-2 text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700"
                >
                  Vehicle Intake
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// WorkOrdersTab
// ---------------------------------------------------------------------------

export interface WorkOrdersTabProps {
  loading: boolean;
  workorders: any[];
}

export function WorkOrdersTab({ loading, workorders }: WorkOrdersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Active Work Orders</PageTitle>
      </div>
      <TableCard>
        <TableHead cols={['WO #', 'Appointment', 'Reported Issue', 'Est. Hours', 'Status']} />
        <tbody className="bg-white divide-y divide-slate-200">
          {loading ? (
            <TableLoader cols={5} />
          ) : workorders.length === 0 ? (
            <TableEmpty cols={5} message="No active work orders found." />
          ) : workorders.map((wo: any) => (
            <tr key={wo.workOrderId} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">WO-{wo.workOrderId}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Apt #{wo.appointment?.appId}</td>
              <td className="px-6 py-4 text-sm text-slate-900">{parseJsonField(wo.reportedIssues) || '—'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.estimatedHours ?? '—'} hrs</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={wo.status || 'OPEN'} />
              </td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PartsReservationTab
// ---------------------------------------------------------------------------

export interface PartsReservationTabProps {
  loading: boolean;
  parts: any[];
}

export function PartsReservationTab({ loading, parts }: PartsReservationTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <PageTitle>Parts Availability</PageTitle>
      </div>
      <TableCard>
        <TableHead cols={['Part Name', 'Number', 'Cost']} />
        <tbody className="bg-white divide-y divide-slate-200">
          {loading ? (
            <TableLoader cols={3} />
          ) : parts.length === 0 ? (
            <TableEmpty cols={3} message="No parts in inventory." />
          ) : parts.map((p: any) => (
            <tr key={p.partId} className="hover:bg-slate-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.partNumber}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${p.retailPrice?.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CustomerCommsTab
// ---------------------------------------------------------------------------

export interface CustomerCommsTabProps {
  customers: any[];
  chatSearch: string;
  setChatSearch: React.Dispatch<React.SetStateAction<string>>;
  selectedChatCustomer: any | null;
  setSelectedChatCustomer: React.Dispatch<React.SetStateAction<any | null>>;
  setChatError: React.Dispatch<React.SetStateAction<string | null>>;
  chatLoading: boolean;
  chatMessages: any[];
  chatText: string;
  setChatText: React.Dispatch<React.SetStateAction<string>>;
  handleSendMessage: (e: React.FormEvent) => void;
  chatSending: boolean;
  chatError: string | null;
}

export function CustomerCommsTab({
  customers,
  chatSearch,
  setChatSearch,
  selectedChatCustomer,
  setSelectedChatCustomer,
  setChatError,
  chatLoading,
  chatMessages,
  chatText,
  setChatText,
  handleSendMessage,
  chatSending,
  chatError,
}: CustomerCommsTabProps) {
  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
      <div className="mb-4"><PageTitle>Customer Messaging</PageTitle></div>
      <div className="flex flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-0">

        {/* ── Left panel: customer list ── */}
        <div className="w-72 border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-3 border-b border-slate-100 bg-slate-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={chatSearch}
                onChange={e => setChatSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {customers
              .filter(c => !chatSearch || c.name?.toLowerCase().includes(chatSearch.toLowerCase()))
              .map((c: any) => (
                <button
                  key={c.customerId}
                  onClick={() => { setSelectedChatCustomer(c); setChatError(null); }}
                  className={`w-full text-left px-4 py-3 border-b border-slate-50 transition-colors ${
                    selectedChatCustomer?.customerId === c.customerId
                      ? 'bg-blue-50 border-l-4 border-l-blue-500'
                      : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                      {c.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.contactInfo || 'No contact info'}</p>
                    </div>
                  </div>
                </button>
              ))}
            {customers.length === 0 && (
              <div className="p-4 text-center text-slate-400 text-sm py-10">No customers found.</div>
            )}
          </div>
        </div>

        {/* ── Right panel: chat ── */}
        {selectedChatCustomer ? (
          <div className="flex-1 flex flex-col min-w-0">

            {/* Chat header */}
            <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-sm font-bold text-white">
                {selectedChatCustomer.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{selectedChatCustomer.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  In-app messaging · delivered as notification
                </p>
              </div>
            </div>

            {/* Message thread */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50/50">
              {chatLoading ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <MessageSquare className="w-14 h-14 text-slate-200 mb-3" />
                  <p className="text-slate-500 font-medium">No messages yet</p>
                  <p className="text-slate-400 text-sm mt-1">
                    Send a message below — it will appear in the customer's notifications.
                  </p>
                </div>
              ) : (
                chatMessages.map((msg: any) => (
                  <div key={msg.notificationId} className="flex justify-end">
                    <div className="max-w-[72%]">
                      <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm shadow-sm leading-relaxed">
                        {msg.message}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 text-right flex items-center justify-end gap-1">
                        {new Date(msg.createdAt).toLocaleString([], {
                          month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                        {msg.status === 'READ'
                          ? <span className="text-blue-500">✓✓</span>
                          : <span className="text-slate-300">✓</span>}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message input */}
            <div className="p-4 border-t border-slate-200 bg-white flex-shrink-0">
              {chatError && (
                <p className="text-xs text-red-600 mb-2 px-1">{chatError}</p>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                <textarea
                  rows={2}
                  value={chatText}
                  onChange={e => setChatText(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={`Message ${selectedChatCustomer.name}… (Enter to send, Shift+Enter for new line)`}
                  className="flex-1 resize-none border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={chatSending || !chatText.trim()}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-1.5 text-sm flex-shrink-0"
                >
                  {chatSending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Send className="w-4 h-4" />}
                  Send
                </button>
              </form>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50/50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-500 font-semibold">Select a customer to start messaging</p>
              <p className="text-slate-400 text-sm mt-1">Messages are delivered as in-app notifications</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
