import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckSquare, Settings, MessageSquare, ClipboardList, Loader2, Search, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';

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

export default function ServiceAdvisorConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('calendar');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [workorders, setWorkorders] = useState<any[]>([]);
  const [parts, setParts] = useState<any[]>([]);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Reference data for smart dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerId: 1,
    vehicleId: 1,
    advisorId: user?.id || 3,
    scheduledAt: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
    serviceType: 'MAINTENANCE'
  });
  const [aptSubmitLoading, setAptSubmitLoading] = useState(false);

  const [assignJobAptId, setAssignJobAptId] = useState<number | null>(null);
  // WorkOrderRequest: appointmentId, advisorId, reportedIssues, estimatedHours
  // JobCardRequest (via assign-technician): technicianId
  const [newJobCard, setNewJobCard] = useState({
    technicianId: 0,
    reportedIssues: 'Initial inspection',
    estimatedHours: 1.0,
  });
  const [jobSubmitLoading, setJobSubmitLoading] = useState(false);
  const [jobError, setJobError] = useState<string | null>(null);

  useEffect(() => {
    axios.get('http://localhost:8089/api/customers')
      .then(res => {
        const data: any[] = res.data || [];
        setCustomers(data);
        if (data.length > 0) setNewAppointment(prev => ({ ...prev, customerId: data[0].customerId }));
      }).catch(() => {});
    axios.get('http://localhost:8089/api/inventory/vehicles')
      .then(res => {
        const data: any[] = res.data || [];
        setAllVehicles(data);
        const available = data.filter((v: any) => v.status !== 'SOLD');
        if (available.length > 0) setNewAppointment(prev => ({ ...prev, vehicleId: available[0].vehicleId }));
      }).catch(() => {});
    axios.get('http://localhost:8089/api/users/by-role?role=TECHNICIAN')
      .then(res => {
        const data: any[] = res.data || [];
        setTechnicians(data);
        if (data.length > 0) setNewJobCard(prev => ({ ...prev, technicianId: data[0].userId }));
      }).catch(() => {});
  }, []);

  const handleAppointmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAptSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:8089/api/appointments', newAppointment);
      setAppointments([...appointments, res.data.data || res.data]);
      setShowAppointmentForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setAptSubmitLoading(false);
    }
  };

  const handleJobCardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJobSubmitLoading(true);
    setJobError(null);
    try {
      // Step 0: Transition appointment BOOKED → IN_PROGRESS (required before WorkOrder creation)
      try {
        await axios.post(`http://localhost:8089/api/appointments/${assignJobAptId}/schedule`);
      } catch (schedErr: any) {
        // If already IN_PROGRESS that's fine — any other error is a real problem
        const msg: string = schedErr?.response?.data?.message || schedErr?.message || '';
        if (!msg.toLowerCase().includes('in_progress')) {
          throw new Error(msg || 'Failed to schedule appointment.');
        }
      }
      // Step 1: Create WorkOrder from appointment
      const woRes = await axios.post('http://localhost:8089/api/workorders', {
        appointmentId: assignJobAptId,
        advisorId: user?.id || 3,
        reportedIssues: newJobCard.reportedIssues,
        estimatedHours: newJobCard.estimatedHours,
      });
      const workOrder = woRes.data?.data || woRes.data;
      // Step 2: Assign technician to WorkOrder — field is woId (not workOrderId)
      await axios.post(`http://localhost:8089/api/workorders/${workOrder.woId}/assign-technician`, {
        technicianId: newJobCard.technicianId,
      });
      // Step 3: Create a JobCard from the WorkOrder — this is what appears in TechnicianConsole
      // (WorkOrder and JobCard are separate entities; technicians only see JobCards via /api/jobcards/my)
      await axios.post(`http://localhost:8089/api/jobcards`, {
        workOrderId: workOrder.woId,
        technicianId: newJobCard.technicianId,
      });
      setAppointments(prev => prev.map(a => a.appId === assignJobAptId ? { ...a, status: 'IN_PROGRESS' } : a));
      setWorkorders(prev => [...prev, workOrder]);
      setAssignJobAptId(null);
      setJobError(null);
    } catch (err: any) {
      setJobError(err?.response?.data?.message || err?.message || 'Failed to assign technician. Check the technician ID and try again.');
    } finally {
      setJobSubmitLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'calendar') {
      axios.get('http://localhost:8089/api/appointments').then(res => setAppointments(res.data.data || res.data)).finally(() => setLoading(false));
    } else if (activeTab === 'workorders') {
      // WorkOrderController exposes GET /api/workorders — returns ApiResponse<List<WorkOrder>>
      axios.get('http://localhost:8089/api/workorders')
        .then(res => setWorkorders(res.data?.data || res.data || []))
        .catch(() => setWorkorders([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'parts') {
      axios.get('http://localhost:8089/api/v1/inventory/parts').then(res => setParts(res.data)).catch(() => setParts([])).finally(() => setLoading(false));
    } else if (activeTab === 'comms') {
      axios.get('http://localhost:8089/api/interactions').then(res => setInteractions(res.data)).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'calendar', name: 'Appointment Calendar', icon: Calendar },
    { id: 'workorders', name: 'Work Orders', icon: ClipboardList },
    { id: 'parts', name: 'Parts Reservation', icon: Settings },
    { id: 'comms', name: 'Customer Comms', icon: MessageSquare },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-400" />
            Service Console
          </h2>
          <p className="text-xs text-slate-400 mt-2">Advisor: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-slate-800 text-blue-400 border-l-4 border-blue-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          
          {/* CALENDAR TAB */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Today's Schedule</h1>
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
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                              apt.status === 'CHECKED_IN' || apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                              apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                              apt.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1">
                            {(() => { const v = allVehicles.find(x => x.vehicleId === apt.vehicleId); return v ? `${v.year} ${v.make} ${v.model}` : `Vehicle #${apt.vehicleId}`; })()}
                          </p>
                          <p className="text-sm text-slate-500 mt-1 flex items-center">
                            <CheckSquare className="w-4 h-4 mr-1" /> {apt.serviceType}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button onClick={() => { setAssignJobAptId(apt.appId); setJobError(null); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Assign Tech</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* WORKORDERS TAB */}
          {activeTab === 'workorders' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Active Work Orders</h1>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">WO #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Appointment</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reported Issue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Est. Hours</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></td></tr>
                    ) : workorders.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No active work orders found.</td></tr>
                    ) : workorders.map((wo: any) => (
                      <tr key={wo.workOrderId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">WO-{wo.workOrderId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">Apt #{wo.appointment?.appId}</td>
                        <td className="px-6 py-4 text-sm text-slate-900">{parseJsonField(wo.reportedIssues) || '—'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{wo.estimatedHours ?? '—'} hrs</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            wo.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                            wo.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {wo.status || 'OPEN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PARTS TAB */}
          {activeTab === 'parts' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Parts Availability</h1>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Part Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-400"/></td></tr>
                    ) : parts.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">No parts in inventory.</td></tr>
                    ) : parts.map((p: any) => (
                      <tr key={p.partId} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{p.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{p.partNumber}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">${p.retailPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" />
          )}

          {/* COMMS TAB */}
          {activeTab === 'comms' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Customer Interactions</h1>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                {loading ? <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400"/> : 
                 interactions.length === 0 ? <p className="text-slate-500 text-center py-4">No recent customer interactions.</p> :
                 interactions.map((i: any) => (
                  <div key={i.interactionId} className="border-b border-slate-100 last:border-0 py-4">
                    <p className="font-bold text-slate-900">Interaction #{i.interactionId} - Customer {i.customerId}</p>
                    <p className="text-sm text-slate-500">{i.notes || 'No notes available.'}</p>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded mt-2 inline-block">{i.type || 'CONTACT'}</span>
                  </div>
                 ))}
              </div>
            </div>
          )}

          {/* Modal overlay */}
          {assignJobAptId && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl border border-slate-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Assign Job Card (Apt #{assignJobAptId})</h2>
                {jobError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-2">
                    {jobError}
                  </div>
                )}
                <form onSubmit={handleJobCardSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Technician</label>
                    <SearchableSelect
                      options={technicians.map(t => ({ value: t.userId, label: t.name }))}
                      value={newJobCard.technicianId}
                      onChange={v => setNewJobCard({...newJobCard, technicianId: v})}
                      placeholder="Select technician"
                      loadingText="Loading technicians…"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reported Issue / Notes</label>
                    <textarea required value={newJobCard.reportedIssues} onChange={e => setNewJobCard({...newJobCard, reportedIssues: e.target.value})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" rows={3}></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Hours</label>
                    <input type="number" step="0.5" min="0.5" required value={newJobCard.estimatedHours} onChange={e => setNewJobCard({...newJobCard, estimatedHours: parseFloat(e.target.value)})} className="block w-full border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" />
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button type="button" onClick={() => { setAssignJobAptId(null); setJobError(null); }} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                    <button type="submit" disabled={jobSubmitLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
                      {jobSubmitLoading ? 'Saving...' : 'Send to Tech'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
