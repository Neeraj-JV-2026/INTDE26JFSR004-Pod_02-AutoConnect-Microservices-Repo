import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, TrendingUp, Calendar, FileSpreadsheet, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';
import {
  KPITab,
  SalesAnalyticsTab,
  InventoryAnalyticsTab,
  ServiceRevenueTab,
  CustomReportsTab,
} from './ReportingPortalTabs';

const GW = 'http://localhost:8089';

const TABS = [
  { id: 'kpi',           name: 'Executive KPIs',      icon: BarChart3 },
  { id: 'sales',         name: 'Sales Analytics',      icon: PieChart },
  { id: 'scheduled',     name: 'Inventory Analytics',  icon: Calendar },
  { id: 'service',       name: 'Service Revenue',       icon: TrendingUp },
  { id: 'custom',        name: 'Custom Reports',        icon: FileSpreadsheet },
  { id: 'notifications', name: 'Notifications',         icon: Bell },
];

export default function ReportingPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kpi');

  // Tab data
  const [kpiData, setKpiData]           = useState({ revenue: 0, unitsSold: 0, serviceROs: 0 });
  const [vehicles, setVehicles]         = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [deals, setDeals]               = useState<any[]>([]);
  const [invoices, setInvoices]         = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loading, setLoading]           = useState(false);

  // Custom report builder state
  const [rptType, setRptType]     = useState('SALES');
  const [rptFrom, setRptFrom]     = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [rptTo, setRptTo]         = useState(new Date().toISOString().slice(0, 10));
  const [reportResult, setReportResult]   = useState<any[] | null>(null);
  const [reportColumns, setReportColumns] = useState<{ key: string; label: string }[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg]         = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'kpi') {
      Promise.all([
        axios.get(`${GW}/api/finance/invoices`).catch(() => ({ data: [] })),
        axios.get(`${GW}/api/inventory/vehicles`).catch(() => ({ data: [] })),
        axios.get(`${GW}/api/appointments`).catch(() => ({ data: { data: [] } })),
      ]).then(([invRes, vehRes, apptRes]) => {
        const inv  = invRes.data || [];
        const veh  = vehRes.data || [];
        const apts = apptRes.data?.data || [];
        setInvoices(inv);
        setVehicles(veh);
        setAppointments(apts);
        setKpiData({
          revenue:    inv.filter((i: any) => i.status === 'PAID').reduce((s: number, i: any) => s + (i.totalAmount || 0), 0),
          unitsSold:  veh.filter((v: any) => v.status === 'SOLD').length,
          serviceROs: apts.length,
        });
      }).finally(() => setLoading(false));

    } else if (activeTab === 'sales') {
      axios.get(`${GW}/api/sales/deals`)
        .then(res => setDeals(res.data))
        .catch(() => setDeals([]))
        .finally(() => setLoading(false));

    } else if (activeTab === 'service') {
      Promise.all([
        axios.get(`${GW}/api/appointments`).catch(() => ({ data: { data: [] } })),
        axios.get(`${GW}/api/finance/invoices`).catch(() => ({ data: [] })),
      ]).then(([apptRes, invRes]) => {
        setAppointments(apptRes.data?.data || apptRes.data || []);
        setInvoices(invRes.data || []);
      }).finally(() => setLoading(false));

    } else if (activeTab === 'scheduled') {
      axios.get(`${GW}/api/inventory/vehicles`)
        .then(res => setVehicles(res.data))
        .catch(() => setVehicles([]))
        .finally(() => setLoading(false));

    } else if (activeTab === 'custom') {
      axios.get(`${GW}/api/finance/reports`)
        .then(res => setSavedReports(res.data || []))
        .catch(() => setSavedReports([]))
        .finally(() => setLoading(false));

    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportMsg(null);
    setReportResult(null);
    // Persist best-effort
    axios.post(`${GW}/api/finance/reports`, {
      type: rptType, filters: JSON.stringify({ from: rptFrom, to: rptTo }), generatedBy: user?.id ?? 1,
    }).catch(() => {});

    try {
      let rows: any[] = [];
      let cols: { key: string; label: string }[] = [];

      if (rptType === 'SALES') {
        const res = await axios.get(`${GW}/api/sales/deals`).catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [{ key: 'dealId', label: 'Deal ID' }, { key: 'quoteId', label: 'Quote ID' },
                { key: 'status', label: 'Status' }, { key: 'finalPrice', label: 'Final Price ($)' }];
      } else if (rptType === 'SERVICE') {
        const res = await axios.get(`${GW}/api/appointments`).catch(() => ({ data: { data: [] } }));
        rows = res.data?.data || res.data || [];
        cols = [{ key: 'appointmentId', label: 'Appt ID' }, { key: 'serviceType', label: 'Service Type' },
                { key: 'status', label: 'Status' }, { key: 'scheduledAt', label: 'Date' }];
      } else if (rptType === 'FINANCE') {
        const res = await axios.get(`${GW}/api/finance/invoices`).catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [{ key: 'invoiceId', label: 'Invoice ID' }, { key: 'totalAmount', label: 'Total Amount ($)' },
                { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Created At' }];
      } else if (rptType === 'PARTS') {
        const res = await axios.get(`${GW}/api/v1/inventory/parts`).catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [{ key: 'partId', label: 'Part ID' }, { key: 'description', label: 'Description' },
                { key: 'partNumber', label: 'Part Number' }, { key: 'cost', label: 'Cost ($)' }];
      }

      setReportResult(rows);
      setReportColumns(cols);
      setReportMsg({ text: `Report generated — ${rows.length} record(s) found.`, ok: true });
      const savedRes = await axios.get(`${GW}/api/finance/reports`).catch(() => ({ data: [] }));
      setSavedReports(savedRes.data || []);
    } catch {
      setReportMsg({ text: 'Could not generate report. Please try again.', ok: false });
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-purple-950 text-purple-100 flex-shrink-0">
        <div className="p-6 border-b border-purple-900">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
            Insights &amp; BI
          </h2>
          <p className="text-xs text-purple-300 mt-2">Auditor: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                activeTab === tab.id
                  ? 'bg-purple-900 text-purple-400 border-l-4 border-purple-400 font-medium'
                  : 'hover:bg-purple-900 hover:text-white'
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
          {activeTab === 'kpi' && (
            <KPITab kpiData={kpiData} loading={loading} invoices={invoices} vehicles={vehicles} appointments={appointments} />
          )}
          {activeTab === 'sales' && (
            <SalesAnalyticsTab deals={deals} loading={loading} />
          )}
          {activeTab === 'scheduled' && (
            <InventoryAnalyticsTab vehicles={vehicles} loading={loading} />
          )}
          {activeTab === 'service' && (
            <ServiceRevenueTab appointments={appointments} invoices={invoices} loading={loading} />
          )}
          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}
          {activeTab === 'custom' && (
            <CustomReportsTab
              rptType={rptType}
              setRptType={v => { setRptType(v); setReportResult(null); setReportMsg(null); }}
              rptFrom={rptFrom} setRptFrom={setRptFrom}
              rptTo={rptTo} setRptTo={setRptTo}
              reportResult={reportResult} reportColumns={reportColumns}
              reportLoading={reportLoading} reportMsg={reportMsg}
              handleGenerateReport={handleGenerateReport}
              loading={loading} savedReports={savedReports}
            />
          )}
        </div>
      </div>
    </div>
  );
}
