import { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, FileText, Calendar, Clock, Shield, Loader2, AlertCircle, CheckCircle, Bell, Send, MessageSquare } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';

const API = 'http://localhost:8089';

export default function CustomerPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('vehicles');

  // CRM customerId (may differ from IAM userId) — looked up on mount via /by-user
  const [crmCustomerId, setCrmCustomerId] = useState<number>(user?.id || 1);

  const [vehicles, setVehicles] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]); // for appointment form dropdown
  const [quotes, setQuotes] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [warranties, setWarranties] = useState<any[]>([]);
  const [activeRecalls, setActiveRecalls] = useState<any[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Warranty claim form
  const [claimWarrantyId, setClaimWarrantyId] = useState<number | null>(null);
  const [claimDescription, setClaimDescription] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // Messaging (Messages tab)
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedAdvisorId, setSelectedAdvisorId] = useState<number | null>(null);
  const [messageSending, setMessageSending] = useState(false);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimWarrantyId) return;
    setClaimLoading(true);
    try {
      await axios.post(`${API}/api/v1/warranties/claims`, {
        warrantyId:       claimWarrantyId,
        claimDescription: claimDescription,   // matches @NotBlank field name
        claimAmount:      parseFloat(claimAmount) || 0,  // matches @NotNull field name
      });
      showSuccess('Warranty claim submitted successfully. A service advisor will review it shortly.');
      setClaimWarrantyId(null);
      setClaimDescription('');
      setClaimAmount('');
    } catch {
      setError('Failed to submit warranty claim. Please try again.');
    } finally {
      setClaimLoading(false);
    }
  };

  const [showApptForm, setShowApptForm] = useState(false);
  const [newAppt, setNewAppt] = useState({
    customerId: user?.id || 1,
    vehicleId: 1,
    advisorId: 3,
    scheduledAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    durationMinutes: 60,
    serviceType: 'MAINTENANCE',
  });
  const [apptLoading, setApptLoading] = useState(false);

  // On mount: resolve CRM customerId from IAM userId + pre-load vehicles
  useEffect(() => {
    if (user?.id) {
      axios.get(`${API}/api/customers/by-user/${user.id}`)
        .then(res => {
          const crmId = res.data?.customerId || user.id;
          setCrmCustomerId(crmId);
          setNewAppt(prev => ({ ...prev, customerId: crmId }));
        })
        .catch(() => {
          // Fallback to IAM userId if lookup fails (e.g. not a CUSTOMER role)
          setCrmCustomerId(user.id);
        });
    }
    axios.get(`${API}/api/inventory/vehicles`)
      .then(res => {
        const data: any[] = res.data || [];
        setAllVehicles(data);
        // For service booking the customer brings in a car they own — default to first SOLD vehicle.
        const sold = data.filter((v: any) => v.status === 'SOLD');
        const first = sold.length > 0 ? sold : data;
        if (first.length > 0) setNewAppt(prev => ({ ...prev, vehicleId: first[0].vehicleId }));
      }).catch(() => {});
  }, [user?.id]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3500);
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    if (activeTab === 'vehicles') {
      axios.get(`${API}/api/inventory/vehicles`)
        .then(res => setVehicles(res.data))
        .catch(() => setError('Could not load vehicles.'))
        .finally(() => setLoading(false));
    } else if (activeTab === 'quotes') {
      axios.get(`${API}/api/sales/quotes`)
        .then(res => {
          const all = res.data || [];
          setQuotes(crmCustomerId ? all.filter((q: any) => q.customerId === crmCustomerId) : all);
        })
        .catch(() => setQuotes([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'service') {
      axios.get(`${API}/api/appointments`)
        .then(res => {
          const all = res.data?.data || res.data || [];
          setAppointments(crmCustomerId ? all.filter((a: any) => a.customerId === crmCustomerId) : all);
        })
        .catch(() => setAppointments([]))
        .finally(() => setLoading(false));
    } else if (activeTab === 'warranty') {
      const invoiceReq = crmCustomerId
        ? axios.get(`${API}/api/finance/invoices/customer/${crmCustomerId}`).catch(() => ({ data: [] }))
        : Promise.resolve({ data: [] });
      Promise.all([
        invoiceReq,
        axios.get(`${API}/api/v1/inventory/warranties`).catch(() => ({ data: [] })),
        axios.get(`${API}/api/v1/inventory/recalls/active`).catch(() => ({ data: [] })),
      ]).then(([invRes, warRes, recallRes]) => {
        setInvoices(invRes.data);
        // Filter warranties to only those belonging to this customer
        const all: any[] = Array.isArray(warRes.data) ? warRes.data : [];
        setWarranties(crmCustomerId ? all.filter(w => w.customerId === crmCustomerId) : all);
        setActiveRecalls(Array.isArray(recallRes.data) ? recallRes.data : []);
      }).finally(() => setLoading(false));
    } else if (activeTab === 'messages') {
      setMessagesLoading(true);
      Promise.all([
        // Load received messages for this customer
        user?.id
          ? axios.get(`${API}/api/notifications/user/${user.id}`).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        // Load available service advisors for the compose form
        axios.get(`${API}/api/users/by-role?role=SERVICE_ADVISOR`).catch(() => ({ data: [] })),
      ]).then(([msgRes, advisorRes]) => {
        const all: any[] = Array.isArray(msgRes.data) ? msgRes.data : [];
        // Show advisor messages and general notifications
        setMessages(all.filter((n: any) => ['ADVISOR_MESSAGE', 'GENERAL', 'APPOINTMENT_REMINDER', 'DEAL_FINALIZED', 'JOB_ASSIGNED'].includes(n.notificationType)));
        const advisorList: any[] = Array.isArray(advisorRes.data) ? advisorRes.data : [];
        setAdvisors(advisorList);
        if (advisorList.length > 0 && !selectedAdvisorId) {
          setSelectedAdvisorId(advisorList[0].userId);
        }
      }).finally(() => { setMessagesLoading(false); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, [activeTab, crmCustomerId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedAdvisorId) return;
    setMessageSending(true);
    try {
      // Post to the advisor's notification inbox
      const res = await axios.post(`${API}/api/notifications`, {
        userId:           selectedAdvisorId,
        customerId:       crmCustomerId,
        channel:          'IN_APP',
        notificationType: 'ADVISOR_MESSAGE',
        subject:          `Message from ${user?.name || 'Customer'}`,
        message:          messageText.trim(),
      });
      // Also add to local message list so user sees it immediately
      setMessages(prev => [{ ...res.data, _sent: true }, ...prev]);
      setMessageText('');
      showSuccess('Message sent to service team.');
    } catch {
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000);
    } finally {
      setMessageSending(false);
    }
  };

  const handleApptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApptLoading(true);
    try {
      const res = await axios.post(`${API}/api/appointments`, {
        ...newAppt,
        customerId: crmCustomerId,
      });
      const created = res.data?.data || res.data;
      setAppointments(prev => [...prev, created]);
      setShowApptForm(false);
      showSuccess('Appointment booked successfully!');
    } catch {
      setError('Failed to book appointment. Please try again.');
    } finally {
      setApptLoading(false);
    }
  };

  const handleRequestQuote = async (vehicle: any) => {
    try {
      // taxes/fees must be Map<String,Object> per Quote entity (not plain numbers)
      const createPayload = {
        customerId: crmCustomerId,
        vehicleId: vehicle.vehicleId,
        taxes: { amount: Math.round((vehicle.basePrice || 0) * 0.08) },
        fees: { amount: 500 },
        status: 'DRAFT',
      };
      const created = await axios.post(`${API}/api/sales/quotes`, createPayload);
      // Chain /generate to trigger inventory availability + pricing calculation
      await axios.post(`${API}/api/sales/quotes/${created.data.quoteId}/generate`);
      showSuccess('Quote requested! A Sales Consultant will contact you soon.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to request quote. Please try again.');
    }
  };

  const handleTestDrive = async (vehicle: any) => {
    try {
      await axios.post(`${API}/api/sales/test-drives`, {
        customerId: crmCustomerId,
        vehicleId: vehicle.vehicleId,
        scheduledAt: new Date(Date.now() + 86400000).toISOString(), // default: tomorrow
        status: 'REQUESTED',
      });
      showSuccess('Test drive requested! Our team will reach out to confirm.');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to request test drive. Please try again.');
    }
  };

  const tabs = [
    { id: 'vehicles', name: 'Browse Vehicles', icon: Car },
    { id: 'quotes', name: 'My Quotes', icon: FileText },
    { id: 'service', name: 'Service Booking', icon: Calendar },
    { id: 'warranty', name: 'Warranty & Invoices', icon: Shield },
    { id: 'messages', name: 'Messages', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800">Customer Portal</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome, {user?.name || 'Customer'}</p>
        </div>
        <nav className="mt-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setError(''); }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-yellow/10 border-r-4 border-brand-yellow text-gray-900 font-semibold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <tab.icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? 'text-brand-yellow' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">

          {/* Global alerts */}
          {error && (
            <div className="mb-4 flex items-center p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />{error}
              <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">✕</button>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 flex items-center p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />{successMsg}
            </div>
          )}

          {/* VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Vehicle Inventory</h1>
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
          )}

          {/* QUOTES TAB */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">My Quotes</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quote ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-yellow" /></td></tr>
                    ) : quotes.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">You have no active quotes.</td></tr>
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
                </table>
              </div>
            </div>
          )}

          {/* SERVICE BOOKING TAB */}
          {activeTab === 'service' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Service Center</h1>
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
          )}

          {/* WARRANTY & INVOICES TAB */}
          {activeTab === 'warranty' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Warranty & Invoices</h1>

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
          )}

          {/* MESSAGES / NOTIFICATIONS TAB */}
          {activeTab === 'messages' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Messages</h1>

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
          )}

        </div>
      </div>
    </div>
  );
}
