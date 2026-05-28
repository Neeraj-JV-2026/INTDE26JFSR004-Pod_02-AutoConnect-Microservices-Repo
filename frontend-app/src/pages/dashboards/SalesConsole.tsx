import { useState, useEffect } from 'react';
import axios from 'axios';
import { LayoutDashboard, Users, Search, DollarSign, Briefcase, TrendingUp, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LeadsTab, VehiclesTab, QuotesTab } from './SalesConsoleTabs';
import { ValuationTab, DealsTab, CommissionsTab, NotificationsTab } from './SalesDealsTabs';
import { WarrantyModal } from './SalesWarrantyModal';
import { useSalesTabData } from './useSalesData';
import { makeLeadHandlers, makeDealHandlers } from './useSalesHandlers';

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

const TABS = [
  { id: 'leads',         name: 'Lead Board',         icon: Users },
  { id: 'inventory',     name: 'Inventory Search',    icon: Search },
  { id: 'quotes',        name: 'Quote Builder',       icon: Briefcase },
  { id: 'valuation',     name: 'Trade-in Valuation',  icon: CarIcon },
  { id: 'approvals',     name: 'Deal Approvals',      icon: LayoutDashboard },
  { id: 'commissions',   name: 'Commissions',         icon: TrendingUp },
  { id: 'notifications', name: 'Notifications',       icon: Bell },
];

export default function SalesConsole() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leads');

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
  const [tradeInCustomerId, setTradeInCustomerId] = useState(0);
  const [tradeInVehicleId, setTradeInVehicleId] = useState(0);
  const [tradeInCondition, setTradeInCondition] = useState<'excellent' | 'good' | 'fair'>('good');
  const [tradeInQuoteLoading, setTradeInQuoteLoading] = useState(false);

  // Warranty offer modal (shown after deal finalization)
  const [warrantyModal, setWarrantyModal] = useState<{ dealId: number; vehicleId: number; customerId: number } | null>(null);
  const [selectedWarrantyType, setSelectedWarrantyType] = useState<'BASIC' | 'EXTENDED' | 'PREMIUM'>('BASIC');
  const [warrantyLoading, setWarrantyLoading] = useState(false);

  // Forms
  const [showNewLeadForm, setShowNewLeadForm] = useState(false);
  const [newLeadData, setNewLeadData] = useState({ customerId: user?.id || 1, source: 'WALK_IN', interestedModel: '', status: 'NEW', notes: '' });
  const [leadSubmitLoading, setLeadSubmitLoading] = useState(false);
  const [showNewQuoteForm, setShowNewQuoteForm] = useState(false);
  const [newQuoteData, setNewQuoteData] = useState({ customerId: user?.id || 1, vehicleId: 1, taxes: 0, fees: 0 });
  const [quoteSubmitLoading, setQuoteSubmitLoading] = useState(false);

  // Tab data via custom hook
  const {
    leads, setLeads,
    testDrives, setTestDrives,
    inventory,
    quotes, setQuotes,
    deals, setDeals,
    commissions,
    tabLoading,
    tabError,
  } = useSalesTabData(activeTab, user?.id);

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
        const available = data.filter((v: any) => v.status === 'AVAILABLE');
        if (available.length > 0) setNewQuoteData(prev => ({ ...prev, vehicleId: available[0].vehicleId }));
      }).catch(() => {});
  }, []);

  // Lead/test-drive handlers
  const { handleLeadSubmit, advanceLeadStatus, handleAssignToMe, confirmTestDrive } = makeLeadHandlers({
    leads, setLeads, newLeadData, setNewLeadData,
    setShowNewLeadForm, setLeadSubmitLoading, showFlash,
    userId: user?.id, customers, testDrives, setTestDrives,
  });

  // Deal/quote handlers
  const { handleQuoteSubmit, convertQuoteToDeal, approveDeal, rejectDeal, finalizeDeal } = makeDealHandlers({
    deals, setDeals, quotes, setQuotes, userId: user?.id, customers, allVehicles,
    setActiveTab, setWarrantyModal, setSelectedWarrantyType,
    newQuoteData, setNewQuoteData, setShowNewQuoteForm, setQuoteSubmitLoading, showFlash,
  });

  const handleAddWarranty = async () => {
    if (!warrantyModal) return;
    setWarrantyLoading(true);
    try {
      const today = new Date();
      const endDate = new Date(today);
      const years = selectedWarrantyType === 'BASIC' ? 1 : selectedWarrantyType === 'EXTENDED' ? 3 : 5;
      endDate.setFullYear(endDate.getFullYear() + years);
      const fmt = (d: Date) => d.toISOString().split('T')[0];
      await axios.post('http://localhost:8089/api/v1/inventory/warranties', {
        vehicleId:       warrantyModal.vehicleId,
        customerId:      warrantyModal.customerId,
        warrantyType:    selectedWarrantyType,
        startDate:       fmt(today),
        endDate:         fmt(endDate),
        mileageLimit:    selectedWarrantyType === 'BASIC' ? 20000 : selectedWarrantyType === 'EXTENDED' ? 60000 : 100000,
        coverageDetails: selectedWarrantyType === 'BASIC'
          ? 'Powertrain coverage — engine, transmission, drivetrain'
          : selectedWarrantyType === 'EXTENDED'
          ? 'Powertrain + electrical, A/C, suspension components'
          : 'Bumper-to-bumper comprehensive coverage including wear items',
      });
      showFlash('success', `${selectedWarrantyType} warranty added for Vehicle #${warrantyModal.vehicleId}.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || 'Could not save warranty — you can add it later from the Inventory module.');
    } finally {
      setWarrantyLoading(false);
      setWarrantyModal(null);
    }
  };

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
        make: get('Make'), model: get('Model'), year: get('Model Year'),
        bodyClass: get('Body Class'), engineCylinders: get('Engine Number of Cylinders'),
        fuelType: get('Fuel Type - Primary'), driveType: get('Drive Type'),
        trim: get('Trim'), manufacturer: get('Manufacturer Name'),
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

  const handleCreateTradeInQuote = async () => {
    if (!valuationResult) return;
    if (!tradeInCustomerId) { showFlash('error', 'Please select the customer.'); return; }
    if (!tradeInVehicleId)  { showFlash('error', 'Please select the vehicle the customer wants to purchase.'); return; }
    const multiplier = tradeInCondition === 'excellent' ? 1.15 : tradeInCondition === 'fair' ? 0.8 : 1.0;
    const adjustedValue = Math.round(valuationResult.estimatedTradeIn * multiplier);
    setTradeInQuoteLoading(true);
    try {
      const created = await axios.post('http://localhost:8089/api/sales/quotes', {
        customerId: tradeInCustomerId, vehicleId: tradeInVehicleId,
        tradeInDetails: {
          vin: valuationResult.vin, value: adjustedValue,
          year: valuationResult.year, make: valuationResult.make,
          model: valuationResult.model, condition: tradeInCondition,
        },
        taxes: { amount: 0 }, fees: { amount: 0 }, status: 'DRAFT',
      });
      const generated = await axios.post(`http://localhost:8089/api/sales/quotes/${created.data.quoteId}/generate`);
      setQuotes(prev => [...prev, generated.data]);
      showFlash('success', `Trade-in quote #${generated.data.quoteId} created. Trade-in allowance: $${adjustedValue.toLocaleString()} (${tradeInCondition}). Open Quote Builder to review.`);
    } catch (err: any) {
      showFlash('error', err?.response?.data?.message || err?.message || 'Failed to create trade-in quote.');
    } finally {
      setTradeInQuoteLoading(false);
    }
  };

  const newProspects = leads.filter(l => l.status === 'NEW');
  const contacted    = leads.filter(l => l.status === 'CONTACTED');
  const interested   = leads.filter(l => l.status === 'INTERESTED');
  const converted    = leads.filter(l => l.status === 'CONVERTED');

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
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
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

          {activeTab === 'leads' && (
            <LeadsTab
              leads={leads} testDrives={testDrives} customers={customers} tabLoading={tabLoading}
              showNewLeadForm={showNewLeadForm} setShowNewLeadForm={setShowNewLeadForm}
              newLeadData={newLeadData} setNewLeadData={setNewLeadData}
              leadSubmitLoading={leadSubmitLoading} handleLeadSubmit={handleLeadSubmit}
              advanceLeadStatus={advanceLeadStatus} handleAssignToMe={handleAssignToMe}
              currentUserId={user?.id} confirmTestDrive={confirmTestDrive}
              newProspects={newProspects} contacted={contacted} interested={interested} converted={converted}
            />
          )}

          {activeTab === 'inventory' && (
            <VehiclesTab inventory={inventory} tabLoading={tabLoading} />
          )}

          {activeTab === 'quotes' && (
            <QuotesTab
              quotes={quotes} customers={customers} allVehicles={allVehicles} tabLoading={tabLoading}
              showNewQuoteForm={showNewQuoteForm} setShowNewQuoteForm={setShowNewQuoteForm}
              newQuoteData={newQuoteData} setNewQuoteData={setNewQuoteData}
              quoteSubmitLoading={quoteSubmitLoading} handleQuoteSubmit={handleQuoteSubmit}
              convertQuoteToDeal={convertQuoteToDeal}
            />
          )}

          {activeTab === 'approvals' && (
            <DealsTab deals={deals} tabLoading={tabLoading}
              approveDeal={approveDeal} rejectDeal={rejectDeal} finalizeDeal={finalizeDeal} />
          )}

          {activeTab === 'commissions' && (
            <CommissionsTab commissions={commissions} tabLoading={tabLoading} />
          )}

          {activeTab === 'notifications' && (
            <NotificationsTab userId={user?.id} />
          )}

          {activeTab === 'valuation' && (
            <ValuationTab
              vinInput={vinInput} setVinInput={setVinInput}
              valuationResult={valuationResult} valuationLoading={valuationLoading} valuationError={valuationError}
              handleVinAppraise={handleVinAppraise} customers={customers} allVehicles={allVehicles}
              tradeInCustomerId={tradeInCustomerId} setTradeInCustomerId={setTradeInCustomerId}
              tradeInVehicleId={tradeInVehicleId} setTradeInVehicleId={setTradeInVehicleId}
              tradeInCondition={tradeInCondition} setTradeInCondition={setTradeInCondition}
              tradeInQuoteLoading={tradeInQuoteLoading} handleCreateTradeInQuote={handleCreateTradeInQuote}
            />
          )}

          {/* ── Warranty Offer Modal ─────────────────────────────────────────── */}
          <WarrantyModal
            warrantyModal={warrantyModal}
            selectedWarrantyType={selectedWarrantyType}
            setSelectedWarrantyType={setSelectedWarrantyType}
            warrantyLoading={warrantyLoading}
            handleAddWarranty={handleAddWarranty}
            onSkip={() => setWarrantyModal(null)}
          />

        </div>
      </div>
    </div>
  );
}
