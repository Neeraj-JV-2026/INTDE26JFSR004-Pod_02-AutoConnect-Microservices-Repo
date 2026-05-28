import { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, FileText, Calendar, Shield, AlertCircle, CheckCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';
import { VehiclesTab, QuotesTab, ServiceTab, WarrantyTab, MessagesTab } from './CustomerPortalTabs';

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
            <VehiclesTab
              loading={loading}
              vehicles={vehicles}
              handleRequestQuote={handleRequestQuote}
              handleTestDrive={handleTestDrive}
            />
          )}

          {/* QUOTES TAB */}
          {activeTab === 'quotes' && (
            <QuotesTab
              loading={loading}
              quotes={quotes}
              allVehicles={allVehicles}
            />
          )}

          {/* SERVICE BOOKING TAB */}
          {activeTab === 'service' && (
            <ServiceTab
              loading={loading}
              appointments={appointments}
              showApptForm={showApptForm}
              setShowApptForm={setShowApptForm}
              newAppt={newAppt}
              setNewAppt={setNewAppt}
              apptLoading={apptLoading}
              handleApptSubmit={handleApptSubmit}
              allVehicles={allVehicles}
              crmCustomerId={crmCustomerId}
            />
          )}

          {/* WARRANTY & INVOICES TAB */}
          {activeTab === 'warranty' && (
            <WarrantyTab
              loading={loading}
              invoices={invoices}
              warranties={warranties}
              activeRecalls={activeRecalls}
              claimWarrantyId={claimWarrantyId}
              setClaimWarrantyId={setClaimWarrantyId}
              claimDescription={claimDescription}
              setClaimDescription={setClaimDescription}
              claimAmount={claimAmount}
              setClaimAmount={setClaimAmount}
              claimLoading={claimLoading}
              handleSubmitClaim={handleSubmitClaim}
            />
          )}

          {/* MESSAGES / NOTIFICATIONS TAB */}
          {activeTab === 'messages' && (
            <MessagesTab
              advisors={advisors}
              messages={messages}
              messagesLoading={messagesLoading}
              messageText={messageText}
              setMessageText={setMessageText}
              selectedAdvisorId={selectedAdvisorId}
              setSelectedAdvisorId={setSelectedAdvisorId}
              messageSending={messageSending}
              handleSendMessage={handleSendMessage}
            />
          )}

        </div>
      </div>
    </div>
  );
}
