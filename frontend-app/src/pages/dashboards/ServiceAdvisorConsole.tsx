import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, CheckSquare, Settings, MessageSquare, ClipboardList, Loader2, Search, Bell, RefreshCw, Send, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';

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
  const [newInteraction, setNewInteraction] = useState({ customerId: '', type: 'CALL', notes: '' });
  const [interactionLoading, setInteractionLoading] = useState(false);
  const [interactionMsg, setInteractionMsg] = useState<{ text: string; ok: boolean } | null>(null);

  // Comms tab — in-app messaging
  const [selectedChatCustomer, setSelectedChatCustomer] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const [chatSearch, setChatSearch] = useState('');
  const [chatError, setChatError] = useState<string | null>(null);

  // Notifications tab — top 5
  const [notifsList, setNotifsList] = useState<any[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);

  // Reference data for smart dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);

  // Warranty claims
  const [warrantyClaims, setWarrantyClaims] = useState<any[]>([]);
  const [approveModal, setApproveModal] = useState<{ claimId: number } | null>(null);
  const [approvedAmount, setApprovedAmount] = useState('');
  const [rejectModal, setRejectModal] = useState<{ claimId: number } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [claimActionLoading, setClaimActionLoading] = useState(false);
  const [claimFlash, setClaimFlash] = useState<{ ok: boolean; text: string } | null>(null);

  const showClaimFlash = (ok: boolean, text: string) => {
    setClaimFlash({ ok, text });
    setTimeout(() => setClaimFlash(null), 4000);
  };

  const handleApproveClaim = async () => {
    if (!approveModal) return;
    setClaimActionLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8089/api/v1/warranties/claims/${approveModal.claimId}/approve?approvedAmount=${parseFloat(approvedAmount) || 0}`
      );
      const updated = res.data?.data || res.data;
      setWarrantyClaims(prev => prev.map(c => c.claimId === approveModal.claimId ? updated : c));
      showClaimFlash(true, `Claim #${approveModal.claimId} approved.`);
    } catch (err: any) {
      showClaimFlash(false, err?.response?.data?.message || 'Failed to approve claim.');
    } finally {
      setClaimActionLoading(false);
      setApproveModal(null);
      setApprovedAmount('');
    }
  };

  const handleRejectClaim = async () => {
    if (!rejectModal) return;
    setClaimActionLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:8089/api/v1/warranties/claims/${rejectModal.claimId}/reject?reason=${encodeURIComponent(rejectReason)}`
      );
      const updated = res.data?.data || res.data;
      setWarrantyClaims(prev => prev.map(c => c.claimId === rejectModal.claimId ? updated : c));
      showClaimFlash(true, `Claim #${rejectModal.claimId} rejected.`);
    } catch (err: any) {
      showClaimFlash(false, err?.response?.data?.message || 'Failed to reject claim.');
    } finally {
      setClaimActionLoading(false);
      setRejectModal(null);
      setRejectReason('');
    }
  };

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

  const [intakeAppt, setIntakeAppt] = useState<any>(null);
  const [intakeChecks, setIntakeChecks] = useState<Record<string, boolean>>({});
  const [intakeNotes, setIntakeNotes] = useState('');
  const [intakeSubmitting, setIntakeSubmitting] = useState(false);

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

  // Load chat thread when a customer is selected in the Comms tab
  useEffect(() => {
    if (!selectedChatCustomer) return;
    setChatLoading(true);
    axios.get(`http://localhost:8089/api/notifications/customer/${selectedChatCustomer.customerId}`)
      .then(res => {
        const all: any[] = res.data || [];
        // Show only advisor-sent messages in this thread
        setChatMessages(all.filter((n: any) => n.notificationType === 'ADVISOR_MESSAGE'));
      })
      .catch(() => setChatMessages([]))
      .finally(() => setChatLoading(false));
  }, [selectedChatCustomer]);

  const handleLogInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    setInteractionLoading(true);
    setInteractionMsg(null);
    try {
      const res = await axios.post('http://localhost:8089/api/interactions', {
        customerId: Number(newInteraction.customerId),
        type: newInteraction.type,
        notes: newInteraction.notes,
        advisorId: user?.id,
      });
      setInteractions(prev => [res.data, ...prev]);
      setInteractionMsg({ text: 'Interaction logged successfully.', ok: true });
      setNewInteraction({ customerId: '', type: 'CALL', notes: '' });
    } catch {
      setInteractionMsg({ text: 'Failed to log interaction. Please try again.', ok: false });
    } finally {
      setInteractionLoading(false);
    }
  };

  /** Send an in-app message to the selected customer as an ADVISOR_MESSAGE notification */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChatCustomer || !chatText.trim()) return;
    setChatSending(true);
    setChatError(null);
    try {
      const res = await axios.post('http://localhost:8089/api/notifications', {
        userId: selectedChatCustomer.userId,
        customerId: selectedChatCustomer.customerId,
        channel: 'IN_APP',
        notificationType: 'ADVISOR_MESSAGE',
        subject: 'Message from Service Advisor',
        message: chatText.trim(),
      });
      setChatMessages(prev => [...prev, res.data]);
      setChatText('');
    } catch {
      setChatError('Failed to send message. Please try again.');
    } finally {
      setChatSending(false);
    }
  };

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
      // Notify customer: their vehicle has been checked in and work has started
      const appt = appointments.find((a: any) => a.appId === assignJobAptId);
      if (appt?.customerId) {
        axios.get(`http://localhost:8089/api/customers/${appt.customerId}`)
          .then(res => {
            const iamUserId = res.data?.userId;
            if (iamUserId) {
              axios.post('http://localhost:8089/api/notifications', {
                userId: iamUserId,
                customerId: appt.customerId,   // CRM ID — lets customer find this via /customer/{id}
                channel: 'IN_APP',
                notificationType: 'APPOINTMENT_REMINDER',
                subject: 'Service Work Has Begun 🔧',
                message: `Your vehicle has been checked in and a work order has been created. A technician has been assigned and will begin work shortly. We'll notify you when the service is complete.`,
              }).catch(() => {});
            }
          }).catch(() => {});
      }
      // Notify the advisor themselves so their Notifications tab is populated
      if (user?.id) {
        const customerName = customers.find((c: any) => c.customerId === appt?.customerId)?.name
          || `Customer #${appt?.customerId}`;
        axios.post('http://localhost:8089/api/notifications', {
          userId: user.id,
          channel: 'IN_APP',
          notificationType: 'JOB_ASSIGNED',
          subject: `Job Card Created — Apt #${assignJobAptId}`,
          message: `Work order created for ${customerName}. Technician assigned. Est. ${newJobCard.estimatedHours} hrs.`,
        }).catch(() => {});
      }
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
      // customers already loaded on mount; no additional fetch needed
      setLoading(false);
    } else if (activeTab === 'warranty-claims') {
      axios.get('http://localhost:8089/api/v1/warranties/claims')
        .then(res => setWarrantyClaims(res.data?.data || res.data || []))
        .catch(() => setWarrantyClaims([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'notifications') {
      if (user?.id) {
        setNotifsLoading(true);
        axios.get(`http://localhost:8089/api/notifications/user/${user.id}`)
          .then(res => setNotifsList((res.data || []).slice(0, 5)))
          .catch(() => setNotifsList([]))
          .finally(() => { setNotifsLoading(false); setLoading(false); });
      } else {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const INTAKE_CHECKLIST = [
    'Verify customer ID and contact details',
    'Check vehicle odometer reading',
    'Inspect exterior for pre-existing damage',
    'Inspect interior condition',
    'Check fuel level',
    'Verify all keys / key fobs present',
    'Customer signature on intake form obtained',
    'Vehicle photos taken',
  ];

  const tabs = [
    { id: 'calendar', name: 'Appointment Calendar', icon: Calendar },
    { id: 'workorders', name: 'Work Orders', icon: ClipboardList },
    { id: 'parts', name: 'Parts Reservation', icon: Settings },
    { id: 'warranty-claims', name: 'Warranty Claims', icon: ShieldCheck },
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

          {/* WARRANTY CLAIMS TAB */}
          {activeTab === 'warranty-claims' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Warranty Claims</h1>
                  <p className="text-sm text-slate-500 mt-1">Review and approve or reject customer warranty claim submissions.</p>
                </div>
                <button
                  onClick={() => {
                    setLoading(true);
                    axios.get('http://localhost:8089/api/v1/warranties/claims')
                      .then(res => setWarrantyClaims(res.data?.data || res.data || []))
                      .catch(() => {})
                      .finally(() => setLoading(false));
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              </div>

              {claimFlash && (
                <div className={`rounded-lg px-4 py-3 text-sm font-medium ${claimFlash.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                  {claimFlash.text}
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
              ) : warrantyClaims.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                  <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No warranty claims found.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Claim ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Warranty ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Claimed Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {warrantyClaims.map((claim: any) => (
                        <tr key={claim.claimId} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">#{claim.claimId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">W-{claim.warrantyId}</td>
                          <td className="px-6 py-4 text-sm text-slate-700 max-w-xs truncate">{claim.claimDescription || '—'}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                            {claim.claimAmount ? `$${Number(claim.claimAmount).toLocaleString()}` : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              claim.status === 'APPROVED'     ? 'bg-green-100 text-green-800' :
                              claim.status === 'REJECTED'     ? 'bg-red-100 text-red-800' :
                              claim.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>{claim.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {(claim.status === 'SUBMITTED' || claim.status === 'UNDER_REVIEW') && (
                              <>
                                <button
                                  onClick={() => { setApproveModal({ claimId: claim.claimId }); setApprovedAmount(String(claim.claimAmount || '')); }}
                                  className="text-green-600 hover:text-green-800 font-medium"
                                >Approve</button>
                                <button
                                  onClick={() => { setRejectModal({ claimId: claim.claimId }); setRejectReason(''); }}
                                  className="text-red-500 hover:text-red-700 font-medium"
                                >Reject</button>
                              </>
                            )}
                            {claim.status === 'APPROVED' && claim.approvedAmount && (
                              <span className="text-green-700 text-xs">Approved ${Number(claim.approvedAmount).toLocaleString()}</span>
                            )}
                            {claim.status === 'REJECTED' && (
                              <span className="text-red-600 text-xs" title={claim.rejectionReason || ''}>Rejected</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Approve modal */}
              {approveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
                    <h3 className="font-bold text-slate-900 mb-3">Approve Claim #{approveModal.claimId}</h3>
                    <label className="block text-sm text-slate-600 mb-1">Approved Amount ($)</label>
                    <input
                      type="number"
                      value={approvedAmount}
                      onChange={e => setApprovedAmount(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="0.00"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setApproveModal(null)} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                      <button onClick={handleApproveClaim} disabled={claimActionLoading} className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                        {claimActionLoading ? 'Saving…' : 'Confirm Approval'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reject modal */}
              {rejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
                    <h3 className="font-bold text-slate-900 mb-3">Reject Claim #{rejectModal.claimId}</h3>
                    <label className="block text-sm text-slate-600 mb-1">Reason for rejection</label>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-red-400 outline-none resize-none"
                      placeholder="Describe why the claim is being rejected…"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => setRejectModal(null)} className="flex-1 border border-slate-300 text-slate-600 py-2 rounded-lg text-sm hover:bg-slate-50">Cancel</button>
                      <button onClick={handleRejectClaim} disabled={claimActionLoading || !rejectReason.trim()} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                        {claimActionLoading ? 'Saving…' : 'Confirm Rejection'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NOTIFICATIONS TAB — top 5 from DB */}
          {activeTab === 'notifications' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {notifsList.filter(n => n.status !== 'READ').length > 0
                      ? `${notifsList.filter(n => n.status !== 'READ').length} unread`
                      : 'All caught up'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {notifsList.some(n => n.status !== 'READ') && (
                    <button
                      onClick={() => {
                        notifsList.filter(n => n.status !== 'READ').forEach(n =>
                          axios.patch(`http://localhost:8089/api/notifications/${n.notificationId}/read`).catch(() => {})
                        );
                        setNotifsList(p => p.map(n => ({ ...n, status: 'READ' })));
                      }}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                      ✓✓ Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!user?.id) return;
                      setNotifsLoading(true);
                      axios.get(`http://localhost:8089/api/notifications/user/${user.id}`)
                        .then(res => setNotifsList((res.data || []).slice(0, 5)))
                        .catch(() => setNotifsList([]))
                        .finally(() => setNotifsLoading(false));
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1.5"
                  >
                    <RefreshCw size={13} className={notifsLoading ? 'animate-spin' : ''} /> Refresh
                  </button>
                </div>
              </div>

              {notifsLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                </div>
              ) : notifsList.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
                  <Bell className="w-14 h-14 mx-auto mb-3 text-slate-200" />
                  <p className="font-medium text-slate-500">No notifications yet</p>
                  <p className="text-sm text-slate-400 mt-1">Notifications appear here when you assign job cards, appointments are updated, or customers send messages.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifsList.map((n: any) => {
                    const TYPE_COLOUR: Record<string, string> = {
                      JOB_ASSIGNED:         'bg-orange-100 text-orange-700 border-orange-200',
                      APPOINTMENT_REMINDER: 'bg-blue-100 text-blue-700 border-blue-200',
                      SERVICE_COMPLETE:     'bg-purple-100 text-purple-700 border-purple-200',
                      ADVISOR_MESSAGE:      'bg-teal-100 text-teal-700 border-teal-200',
                      INVOICE_ISSUED:       'bg-green-100 text-green-700 border-green-200',
                      DEAL_FINALIZED:       'bg-emerald-100 text-emerald-700 border-emerald-200',
                      INVOICE_OVERDUE:      'bg-red-100 text-red-700 border-red-200',
                    };
                    const CHANNEL_ICON: Record<string, string> = { EMAIL: '✉️', SMS: '📱', PUSH: '🔔', IN_APP: '💬' };
                    return (
                      <div
                        key={n.notificationId}
                        className={`rounded-xl p-4 border transition-colors ${
                          n.status !== 'READ' ? 'bg-blue-50 border-blue-100' : 'bg-white border-slate-100'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-base">{CHANNEL_ICON[n.channel] ?? '🔔'}</span>
                              {n.subject && (
                                <p className="text-sm font-semibold text-slate-900 truncate">{n.subject}</p>
                              )}
                              {n.status !== 'READ' && (
                                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{n.message}</p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="text-xs text-slate-400">
                                {new Date(n.createdAt).toLocaleString()}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                                TYPE_COLOUR[n.notificationType] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                              }`}>
                                {n.notificationType.replace(/_/g, ' ')}
                              </span>
                            </div>
                          </div>
                          {n.status !== 'READ' && (
                            <button
                              onClick={() => {
                                axios.patch(`http://localhost:8089/api/notifications/${n.notificationId}/read`).catch(() => {});
                                setNotifsList(p => p.map(x => x.notificationId === n.notificationId ? { ...x, status: 'READ' } : x));
                              }}
                              className="shrink-0 text-xs text-blue-500 hover:text-blue-700 font-medium px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                            >
                              ✓ Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-center text-slate-400">
                    Showing {notifsList.length} most recent notification{notifsList.length !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* COMMS TAB — In-App Messaging */}
          {activeTab === 'comms' && (
            <div className="flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
              <h1 className="text-2xl font-bold text-slate-900 mb-4">Customer Messaging</h1>
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
          )}

          {intakeAppt && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Vehicle Intake Checklist</h2>
                    <button onClick={() => setIntakeAppt(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Appointment #{intakeAppt.appId} — {intakeAppt.serviceType}</p>
                </div>
                <div className="p-6 space-y-3">
                  {INTAKE_CHECKLIST.map((item, i) => (
                    <label key={i} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={!!intakeChecks[item]}
                        onChange={e => setIntakeChecks(prev => ({ ...prev, [item]: e.target.checked }))}
                        className="w-5 h-5 rounded text-blue-600"
                      />
                      <span className={`text-sm ${intakeChecks[item] ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item}</span>
                    </label>
                  ))}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea
                      value={intakeNotes}
                      onChange={e => setIntakeNotes(e.target.value)}
                      rows={3}
                      placeholder="Any visible damage, customer concerns, special instructions..."
                      className="w-full border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm border focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {Object.values(intakeChecks).filter(Boolean).length}/{INTAKE_CHECKLIST.length} items checked
                  </span>
                  <div className="flex space-x-3">
                    <button onClick={() => setIntakeAppt(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button
                      disabled={intakeSubmitting}
                      onClick={async () => {
                        setIntakeSubmitting(true);
                        try {
                          // Save intake notes as a job note (use appointment update or a comment endpoint)
                          await axios.put(`http://localhost:8089/api/appointments/${intakeAppt.appId}`, {
                            ...intakeAppt,
                            notes: `INTAKE: ${intakeNotes} | Checks: ${Object.entries(intakeChecks).filter(([,v]) => v).map(([k]) => k).join('; ')}`,
                          });
                        } catch { /* non-critical */ } finally {
                          setIntakeSubmitting(false);
                          setIntakeAppt(null);
                        }
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {intakeSubmitting ? 'Saving...' : 'Complete Intake'}
                    </button>
                  </div>
                </div>
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
