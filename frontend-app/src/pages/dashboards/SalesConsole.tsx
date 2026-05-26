import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, Search, DollarSign, Briefcase, TrendingUp, Calendar, Clock, Loader2, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchableSelect from '../../components/SearchableSelect';
import NotificationsPanel from '../../components/NotificationsPanel';

export default function SalesConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');
  
  // Data states
  const [leads, setLeads] = useState<any[]>([]);
  const [testDrives, setTestDrives] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabError, setTabError] = useState('');

  // Pre-loaded reference data for smart dropdowns
  const [customers, setCustomers] = useState<any[]>([]);
  const [allVehicles, setAllVehicles] = useState<any[]>([]);

  // Feedback
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const showFlash = (type: 'success' | 'error', msg: string) => {
    if (type === 'success') { setSuccessMsg(msg); setErrorMsg(''); }
    else { setErrorMsg(msg); setSuccessMsg(''); }
    setTimeout(() => { setSuccessMsg(''); setErrorMsg(''); }, 4000);
  };
  
  // Trade-in Valuation
  const [vinInput, setVinInput] = useState('');
  const [valuationResult, setValuationResult] = useState<any>(null);
  const [valuationLoading, setValuationLoading] = useState(false);
  const [valuationError, setValuationError] = useState('');

  // Forms
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState({ customerId: user?.id || 1, source: 'WALK_IN', interestedModel: '', status: 'NEW', notes: '' });
  const [leadSubmitLoading, setLeadSubmitLoading] = useState(false);

  // New Quote Form
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({ customerId: user?.id || 1, vehicleId: 1, taxes: 0, fees: 0 });
  const [quoteSubmitLoading, setQuoteSubmitLoading] = useState(false);

  const handleVinAppraise = async () => {
    if (!vinInput.trim()) return;
    setValuationLoading(true);
    setValuationError('');
    setValuationResult(null);
    try {
      // Use NHTSA free VIN decode API
      const res = await axios.get(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vinInput.trim()}?format=json`);
      const results: any[] = res.data?.Results || [];
      const get = (varName: string) => results.find((r: any) => r.Variable === varName)?.Value || '—';
      setValuationResult({
        vin: vinInput.trim().toUpperCase(),
        make: get('Make'),
        model: get('Model'),
        year: get('Model Year'),
        bodyClass: get('Body Class'),
        engineCylinders: get('Engine Number of Cylinders'),
        fuelType: get('Fuel Type - Primary'),
        driveType: get('Drive Type'),
        trim: get('Trim'),
        manufacturer: get('Manufacturer Name'),
        // Estimate trade-in value based on year (rough heuristic)
        estimatedTradeIn: Math.max(2000, (parseInt(get('Model Year')) || 2015) > 2020
          ? 28000 : (parseInt(get('Model Year')) || 2015) > 2018 ? 18000
          : (parseInt(get('Model Year')) || 2015) > 2015 ? 10000 : 5500),
      });
    } catch {
      setValuationError('Could not decode VIN. Please check the VIN and try again.');
    } finally {
      setValuationLoading(false);
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadSubmitLoading(true);
    try {
      const res = await axios.post('http://localhost:8089/api/leads', newLeadData);
      setLeads([...leads, res.data]);
      setShowNewLeadForm(false);
      setNewLeadData({ customerId: user?.id || 1, source: 'WALK_IN', interestedModel: '', status: 'NEW', notes: '' });
      showFlash('success', 'Lead created successfully.');
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to create lead.');
    } finally {
      setLeadSubmitLoading(false);
    }
  };

  /** Fire-and-forget IN_APP notification — never blocks the caller */
  const sendNotification = async (userId: number | null | undefined, type: string, subject: string, message: string) => {
    if (!userId) return;
    axios.post('http://localhost:8089/api/notifications', {
      userId, channel: 'IN_APP', notificationType: type, subject, message,
    }).catch(() => {/* non-critical */});
  };

  /** Resolve IAM userId from CRM customerId: check local state first, then API */
  const getIamUserId = async (customerId: number): Promise<number | null> => {
    const local = customers.find(c => c.customerId === customerId);
    if (local?.userId) return local.userId;
    try {
      const res = await axios.get(`http://localhost:8089/api/customers/${customerId}`);
      return res.data?.userId ?? null;
    } catch { return null; }
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSubmitLoading(true);
    try {
      // Step 1: Create DRAFT — taxes/fees must be Map<String,Object> (not plain numbers) per backend entity
      const createPayload = {
        customerId: newQuoteData.customerId,
        vehicleId: newQuoteData.vehicleId,
        taxes: { amount: newQuoteData.taxes },
        fees: { amount: newQuoteData.fees },
        status: 'DRAFT',
      };
      const created = await axios.post('http://localhost:8089/api/sales/quotes', createPayload);
      // Step 2: Generate — triggers inventory availability check + pricing calculation
      const generated = await axios.post(`http://localhost:8089/api/sales/quotes/${created.data.quoteId}/generate`);
      setQuotes([...quotes, generated.data]);
      setShowNewQuoteForm(false);
      setNewQuoteData({ customerId: user?.id || 1, vehicleId: 1, taxes: 0, fees: 0 });
      showFlash('success', 'Quote generated successfully.');
      // Notify customer
      const uid = await getIamUserId(newQuoteData.customerId);
      const vehicle = allVehicles.find(v => v.vehicleId === newQuoteData.vehicleId);
      const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : `Vehicle #${newQuoteData.vehicleId}`;
      sendNotification(uid, 'GENERAL', 'Your Quote Is Ready',
        `A sales quote has been generated for the ${vehicleName}. Total: $${generated.data?.totalPrice?.toLocaleString() ?? '—'}. Please visit the dealership or contact us to review the details.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to generate quote.');
    } finally {
      setQuoteSubmitLoading(false);
    }
  };

  const convertQuoteToDeal = async (quote: any) => {
    try {
      // Deal entity fields: quoteId, salesPersonId, status (PENDING/APPROVED/REJECTED/FINALIZED)
      // customerId, vehicleId, finalPrice are NOT Deal entity fields
      const payload = {
        quoteId: quote.quoteId,
        salesPersonId: user?.id,
        status: 'PENDING',
      };
      const res = await axios.post('http://localhost:8089/api/sales/deals', payload);
      setDeals([...deals, res.data]);
      showFlash('success', 'Quote converted to Deal! Pending Manager Approval.');
      setActiveTab('approvals');
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to convert quote to deal.');
    }
  };

  const approveDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/approve`);
      setDeals(deals.map(d => d.dealId === dealId ? { ...d, status: 'APPROVED' } : d));
      showFlash('success', `Deal #${dealId} approved.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to approve deal.');
    }
  };

  const rejectDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/reject`);
      setDeals(deals.map(d => d.dealId === dealId ? { ...d, status: 'REJECTED' } : d));
      showFlash('success', `Deal #${dealId} rejected.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to reject deal.');
    }
  };

  const finalizeDeal = async (dealId: number) => {
    try {
      await axios.post(`http://localhost:8089/api/sales/deals/${dealId}/finalize`);
      setDeals(deals.map(d => d.dealId === dealId ? { ...d, status: 'FINALIZED' } : d));
      showFlash('success', `Deal #${dealId} finalized! Invoice sent to Finance. Commission calculated.`);
      // Notify customer: resolve customerId via the quote linked to this deal
      const deal = deals.find(d => d.dealId === dealId);
      if (deal?.quoteId) {
        axios.get(`http://localhost:8089/api/sales/quotes/${deal.quoteId}`)
          .then(async qRes => {
            const customerId = qRes.data?.customerId;
            if (customerId) {
              const uid = await getIamUserId(customerId);
              sendNotification(uid, 'DEAL_FINALIZED', 'Deal Finalized — Congratulations! 🎉',
                `Your vehicle deal #${dealId} has been finalized! Our finance team will contact you shortly with payment and delivery details.`);
            }
          }).catch(() => {/* non-critical */});
      }
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to finalize deal.');
    }
  };

  const confirmTestDrive = async (td: any) => {
    try {
      await axios.patch(`http://localhost:8089/api/sales/test-drives/${td.id}/status?status=SCHEDULED`);
      setTestDrives(prev => prev.map(t => t.id === td.id ? { ...t, status: 'SCHEDULED' } : t));
      showFlash('success', `Test drive TD-${td.id} confirmed as Scheduled.`);
      // Notify customer
      const uid = await getIamUserId(td.customerId);
      sendNotification(uid, 'APPOINTMENT_REMINDER', 'Test Drive Confirmed ✅',
        `Great news! Your test drive request for Vehicle #${td.vehicleId} has been confirmed and scheduled. We look forward to seeing you!`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Failed to confirm test drive.');
    }
  };

  // Fetch reference data once on mount so forms can show names instead of raw IDs
  useEffect(() => {
    axios.get('http://localhost:8089/api/customers')
      .then(res => {
        const data: any[] = res.data || [];
        setCustomers(data);
        if (data.length > 0) {
          setNewLeadData(prev => ({ ...prev, customerId: data[0].customerId }));
          setNewQuoteData(prev => ({ ...prev, customerId: data[0].customerId }));
        }
      }).catch(() => {});
    axios.get('http://localhost:8089/api/inventory/vehicles')
      .then(res => {
        const data: any[] = res.data || [];
        setAllVehicles(data);
        const available = data.filter((v: any) => v.status !== 'SOLD');
        if (available.length > 0) {
          setNewQuoteData(prev => ({ ...prev, vehicleId: available[0].vehicleId }));
        }
      }).catch(() => {});
  }, []);

  useEffect(() => {
    setTabLoading(true);
    setTabError('');
    if (activeTab === 'leads') {
      // Fetch leads and test-drive requests in parallel
      Promise.all([
        axios.get('http://localhost:8089/api/leads').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/sales/test-drives').catch(() => ({ data: [] })),
      ]).then(([leadsRes, tdRes]) => {
        setLeads(leadsRes.data || []);
        setTestDrives(tdRes.data || []);
      }).catch(() => {
        setTabError('Could not load leads. Please check your permissions.');
      }).finally(() => setTabLoading(false));
    } else if (activeTab === 'inventory') {
      axios.get('http://localhost:8089/api/inventory/vehicles')
        .then(res => setInventory(res.data || []))
        .catch(() => { setInventory([]); setTabError('Could not load inventory.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'quotes') {
      axios.get('http://localhost:8089/api/sales/quotes')
        .then(res => setQuotes(res.data || []))
        .catch(() => { setQuotes([]); setTabError('Could not load quotes.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'approvals') {
      axios.get('http://localhost:8089/api/sales/deals')
        .then(res => setDeals(res.data || []))
        .catch(() => { setDeals([]); setTabError('Could not load deals.'); })
        .finally(() => setTabLoading(false));
    } else if (activeTab === 'commissions') {
      const url = user?.id
        ? `http://localhost:8089/api/sales/commissions/salesperson/${user.id}`
        : 'http://localhost:8089/api/sales/commissions';
      axios.get(url)
        .then(res => setCommissions(res.data || []))
        .catch(() => { setCommissions([]); setTabError('Could not load commissions.'); })
        .finally(() => setTabLoading(false));
    } else {
      setTabLoading(false);
    }
  }, [activeTab]);

  const newProspects = leads.filter(l => ['NEW', 'ASSIGNED', 'CONTACTED'].includes(l.status));
  const negotiations = leads.filter(l => l.status === 'NEGOTIATING');

  const tabs = [
    { id: 'leads', name: 'Lead Board', icon: Users },
    { id: 'inventory', name: 'Inventory Search', icon: Search },
    { id: 'quotes', name: 'Quote Builder', icon: Briefcase },
    { id: 'valuation', name: 'Trade-in Valuation', icon: CarIcon },
    { id: 'approvals', name: 'Deal Approvals', icon: LayoutDashboard },
    { id: 'commissions', name: 'Commissions', icon: TrendingUp },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  function CarIcon(props: any) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
        <circle cx="7" cy="17" r="2" />
        <path d="M9 17h6" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1c23] text-gray-300 flex-shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white flex items-center">
            <DollarSign className="w-6 h-6 mr-2 text-brand-yellow" />
            Sales Console
          </h2>
          <p className="text-xs text-gray-400 mt-2">Consultant: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-gray-800 text-brand-yellow border-r-4 border-brand-yellow font-medium'
                  : 'hover:bg-gray-800 hover:text-white'
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

          {/* Flash messages */}
          {successMsg && (
            <div className="mb-4 flex items-center p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
              <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />{successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{errorMsg}
            </div>
          )}
          {tabError && (
            <div className="mb-4 flex items-center p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-800">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />{tabError}
            </div>
          )}

          {/* LEADS TAB */}
          {activeTab === 'leads' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Active Leads pipeline</h1>
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
              
              <div className="flex space-x-6 overflow-x-auto pb-4">
                <div className="bg-gray-50 rounded-xl p-4 min-w-[300px] border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                    New Prospects <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{newProspects.length}</span>
                  </h3>
                  <div className="space-y-3">
                    {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> : newProspects.map(lead => (
                      <div key={lead.leadId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-brand-yellow hover:shadow-md transition-all">
                        <p className="font-bold text-gray-900">Lead #{lead.leadId}</p>
                        <p className="text-sm text-gray-500">Interested in: {lead.interestedModel || 'Any'}</p>
                        <div className="mt-3 flex items-center text-xs text-gray-400">
                          <Clock className="w-3 h-3 mr-1" /> {lead.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 min-w-[300px] border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                    Test Drive Requests <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">{testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').length}</span>
                  </h3>
                  <div className="space-y-3">
                    {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> :
                     testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').length === 0
                       ? <p className="text-sm text-gray-400 text-center py-4">No pending test drives.</p>
                       : testDrives.filter(t => t.status === 'REQUESTED' || t.status === 'SCHEDULED').map(td => (
                      <div key={td.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-brand-yellow hover:shadow-md transition-all border-l-4 border-l-blue-500">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-900">TD-{td.id}</p>
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold ${td.status === 'SCHEDULED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {td.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Customer #{td.customerId} • Vehicle #{td.vehicleId}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {td.scheduledAt ? new Date(td.scheduledAt).toLocaleString() : '—'}
                        </p>
                        {td.status === 'REQUESTED' && (
                          <button
                            onClick={() => confirmTestDrive(td)}
                            className="mt-3 w-full text-xs bg-blue-600 text-white py-1.5 rounded font-medium hover:bg-blue-700 transition-colors"
                          >
                            Confirm & Schedule
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 min-w-[300px] border border-gray-200">
                  <h3 className="font-semibold text-gray-700 mb-4 flex items-center justify-between">
                    Negotiation <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs">{negotiations.length}</span>
                  </h3>
                  <div className="space-y-3">
                    {tabLoading ? <p className="text-sm text-gray-500">Loading...</p> : negotiations.map(lead => (
                      <div key={lead.leadId} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:border-brand-yellow hover:shadow-md transition-all border-l-4 border-l-brand-yellow">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-gray-900">Lead #{lead.leadId}</p>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded font-medium">Hot</span>
                        </div>
                        <p className="text-sm text-gray-500">{lead.notes || 'No notes'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* INVENTORY TAB */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Available Inventory</h1>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">VIN</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">MSRP</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tabLoading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : inventory.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No vehicles in inventory.</td></tr>
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
                </table>
              </div>
            </div>
          )}

          {/* QUOTES TAB */}
          {activeTab === 'quotes' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Quote Builder</h1>
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
                        options={allVehicles.filter(v => v.status !== 'SOLD').map(v => ({ value: v.vehicleId, label: `${v.year} ${v.make} ${v.model}` }))}
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
          )}

          {/* APPROVALS TAB */}
          {activeTab === 'approvals' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Deal Approvals</h1>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales Person</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tabLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : deals.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No deals found.</td></tr>
                    ) : deals.map((d: any) => (
                      <tr key={d.dealId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{d.dealId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">QT-{d.quoteId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">User #{d.salesPersonId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            d.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                            d.status === 'FINALIZED' ? 'bg-blue-100 text-blue-800' :
                            d.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          {d.status === 'PENDING' && (
                            <>
                              <button onClick={() => approveDeal(d.dealId)} className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                              <button onClick={() => rejectDeal(d.dealId)} className="text-red-500 hover:text-red-800 font-medium">Reject</button>
                            </>
                          )}
                          {d.status === 'APPROVED' && (
                            <button onClick={() => finalizeDeal(d.dealId)} className="text-brand-yellow hover:text-yellow-600 font-bold">Finalize & Invoice</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* COMMISSIONS TAB */}
          {activeTab === 'commissions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Commissions</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-brand-yellow">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Total Earned</h3>
                  <p className="text-3xl font-bold text-gray-900">${commissions.reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Paid Out</h3>
                  <p className="text-3xl font-bold text-gray-900">${commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500">
                  <h3 className="text-gray-500 text-sm font-medium mb-2">Pending Payout</h3>
                  <p className="text-3xl font-bold text-gray-900">${commissions.filter(c => c.status !== 'PAID').reduce((acc, c) => acc + (c.commissionAmount || 0), 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Calculated At</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tabLoading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : commissions.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No commissions recorded. Commissions are calculated automatically when a deal is finalized.</td></tr>
                    ) : commissions.map((c: any) => (
                      <tr key={c.commissionId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.commissionId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{c.dealId}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            c.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            c.status === 'CALCULATED' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>{c.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {c.calculatedAt ? new Date(c.calculatedAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600">+${Number(c.commissionAmount || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}

          {activeTab === 'valuation' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Trade-in Valuation</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <p className="text-gray-500 mb-4">Enter the customer's trade-in vehicle VIN to decode specs and get an estimated trade-in value.</p>
                <div className="flex items-center space-x-3 max-w-xl">
                  <input
                    type="text"
                    value={vinInput}
                    onChange={e => setVinInput(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleVinAppraise()}
                    placeholder="Enter 17-char VIN (e.g. 1HGCM82633A004352)"
                    maxLength={17}
                    className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-brand-yellow focus:border-brand-yellow sm:text-sm px-4 py-2 border font-mono uppercase"
                  />
                  <button
                    onClick={handleVinAppraise}
                    disabled={valuationLoading || vinInput.length < 11}
                    className="bg-brand-yellow text-gray-900 px-5 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center"
                  >
                    {valuationLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin"/>Decoding...</> : 'Appraise'}
                  </button>
                </div>
                {valuationError && <p className="text-red-600 text-sm mt-3">{valuationError}</p>}
              </div>

              {valuationResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Vehicle Details</h3>
                    <dl className="space-y-3">
                      {[
                        ['VIN', valuationResult.vin],
                        ['Year / Make / Model', `${valuationResult.year} ${valuationResult.make} ${valuationResult.model}`],
                        ['Trim', valuationResult.trim],
                        ['Body Class', valuationResult.bodyClass],
                        ['Engine Cylinders', valuationResult.engineCylinders],
                        ['Fuel Type', valuationResult.fuelType],
                        ['Drive Type', valuationResult.driveType],
                        ['Manufacturer', valuationResult.manufacturer],
                      ].map(([label, value]) => (
                        <div key={label} className="flex justify-between">
                          <dt className="text-sm text-gray-500">{label}</dt>
                          <dd className="text-sm font-medium text-gray-900 text-right">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 text-lg mb-4">Trade-in Estimate</h3>
                    <div className="text-center py-6">
                      <p className="text-5xl font-bold text-brand-yellow">${valuationResult.estimatedTradeIn.toLocaleString()}</p>
                      <p className="text-gray-500 text-sm mt-2">Estimated trade-in value</p>
                      <p className="text-xs text-gray-400 mt-1">Based on model year. Actual value subject to physical inspection.</p>
                    </div>
                    <div className="border-t border-gray-100 pt-4 grid grid-cols-3 gap-3 text-center">
                      <div><p className="text-xs text-gray-500">Excellent</p><p className="font-bold text-green-600">${Math.round(valuationResult.estimatedTradeIn * 1.15).toLocaleString()}</p></div>
                      <div><p className="text-xs text-gray-500">Good</p><p className="font-bold text-brand-yellow">${valuationResult.estimatedTradeIn.toLocaleString()}</p></div>
                      <div><p className="text-xs text-gray-500">Fair</p><p className="font-bold text-red-500">${Math.round(valuationResult.estimatedTradeIn * 0.8).toLocaleString()}</p></div>
                    </div>
                    <button
                      onClick={() => {
                        const payload = {
                          customerId: customers[0]?.customerId || 1,
                          vehicleId: allVehicles[0]?.vehicleId || 1,
                          taxes: { amount: 0 },
                          fees: { amount: 0 },
                          tradeInValue: valuationResult.estimatedTradeIn,
                          tradeInVin: valuationResult.vin,
                          status: 'DRAFT',
                        };
                        axios.post('http://localhost:8089/api/sales/quotes', payload)
                          .then(() => showFlash('success', 'Trade-in quote created in Quote Builder.'))
                          .catch(() => showFlash('error', 'Failed to create quote.'));
                      }}
                      className="mt-4 w-full bg-gray-900 text-white py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                    >
                      Create Trade-in Quote
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
