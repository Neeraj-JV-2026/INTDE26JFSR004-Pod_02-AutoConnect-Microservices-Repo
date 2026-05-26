import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, FileSpreadsheet, Loader2, Bell, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';

function downloadCSV(filename: string, rows: any[], columns: { key: string; label: string }[]) {
  const header = columns.map(c => c.label).join(',');
  const body = rows.map(row => columns.map(c => `"${String(row[c.key] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = [header, ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportingPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kpi');
  
  const [kpiData, setKpiData] = useState({ revenue: 0, unitsSold: 0, serviceROs: 0 });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [savedReports, setSavedReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Custom Reports controlled state
  const [rptType, setRptType] = useState('SALES');
  const [rptFrom, setRptFrom] = useState(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
  const [rptTo, setRptTo] = useState(new Date().toISOString().slice(0, 10));
  const [reportResult, setReportResult] = useState<any[] | null>(null);
  const [reportColumns, setReportColumns] = useState<{ key: string; label: string }[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportMsg, setReportMsg] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'kpi') {
      Promise.all([
        axios.get('http://localhost:8089/api/finance/invoices').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/inventory/vehicles').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/appointments').catch(() => ({ data: { data: [] } }))
      ]).then(([invoicesRes, vehiclesRes, appointmentsRes]) => {
        const inv = invoicesRes.data || [];
        const veh = vehiclesRes.data || [];
        const appts = appointmentsRes.data?.data || [];

        setInvoices(inv);
        setVehicles(veh);
        setAppointments(appts);

        const revenue = inv
          .filter((i: any) => i.status === 'PAID')
          .reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

        const unitsSold = veh.filter((v: any) => v.status === 'SOLD').length;
        const serviceROs = appts.length;

        setKpiData({ revenue, unitsSold, serviceROs });
      }).finally(() => setLoading(false));
    } else if (activeTab === 'sales') {
      axios.get('http://localhost:8089/api/sales/deals').then(res => setDeals(res.data)).catch(() => setDeals([])).finally(() => setLoading(false));
    } else if (activeTab === 'service') {
      Promise.all([
        axios.get('http://localhost:8089/api/appointments').catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:8089/api/finance/invoices').catch(() => ({ data: [] })),
      ]).then(([apptRes, invRes]) => {
        setAppointments(apptRes.data?.data || apptRes.data || []);
        setInvoices(invRes.data || []);
      }).finally(() => setLoading(false));
    } else if (activeTab === 'scheduled') {
      axios.get('http://localhost:8089/api/inventory/vehicles').then(res => setVehicles(res.data)).catch(() => setVehicles([])).finally(() => setLoading(false));
    } else if (activeTab === 'custom') {
      axios.get('http://localhost:8089/api/finance/reports')
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

    // Persist to backend (best-effort — don't block if it fails)
    axios.post('http://localhost:8089/api/finance/reports', {
      type: rptType, filters: JSON.stringify({ from: rptFrom, to: rptTo }), generatedBy: user?.id ?? 1,
    }).catch(() => {});

    try {
      let rows: any[] = [];
      let cols: { key: string; label: string }[] = [];

      if (rptType === 'SALES') {
        const res = await axios.get('http://localhost:8089/api/sales/deals').catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [
          { key: 'dealId', label: 'Deal ID' }, { key: 'quoteId', label: 'Quote ID' },
          { key: 'status', label: 'Status' }, { key: 'finalPrice', label: 'Final Price ($)' },
        ];
      } else if (rptType === 'SERVICE') {
        const res = await axios.get('http://localhost:8089/api/appointments').catch(() => ({ data: { data: [] } }));
        rows = res.data?.data || res.data || [];
        cols = [
          { key: 'appointmentId', label: 'Appt ID' }, { key: 'serviceType', label: 'Service Type' },
          { key: 'status', label: 'Status' }, { key: 'scheduledAt', label: 'Date' },
        ];
      } else if (rptType === 'FINANCE') {
        const res = await axios.get('http://localhost:8089/api/finance/invoices').catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [
          { key: 'invoiceId', label: 'Invoice ID' }, { key: 'totalAmount', label: 'Total Amount ($)' },
          { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Created At' },
        ];
      } else if (rptType === 'PARTS') {
        const res = await axios.get('http://localhost:8089/api/v1/inventory/parts').catch(() => ({ data: [] }));
        rows = res.data || [];
        cols = [
          { key: 'partId', label: 'Part ID' }, { key: 'description', label: 'Description' },
          { key: 'partNumber', label: 'Part Number' }, { key: 'cost', label: 'Cost ($)' },
        ];
      }

      setReportResult(rows);
      setReportColumns(cols);
      setReportMsg({ text: `Report generated — ${rows.length} record(s) found.`, ok: true });

      // Refresh saved reports list
      const savedRes = await axios.get('http://localhost:8089/api/finance/reports').catch(() => ({ data: [] }));
      setSavedReports(savedRes.data || []);
    } catch {
      setReportMsg({ text: 'Could not generate report. Please try again.', ok: false });
    } finally {
      setReportLoading(false);
    }
  };

  const tabs = [
    { id: 'kpi', name: 'Executive KPIs', icon: BarChart3 },
    { id: 'sales', name: 'Sales Analytics', icon: PieChart },
    { id: 'scheduled', name: 'Inventory Analytics', icon: Calendar },
    { id: 'service', name: 'Service Revenue', icon: TrendingUp },
    { id: 'custom', name: 'Custom Reports', icon: FileSpreadsheet },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="w-64 bg-purple-950 text-purple-100 flex-shrink-0">
        <div className="p-6 border-b border-purple-900">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-2 text-purple-400" />
            Insights & BI
          </h2>
          <p className="text-xs text-purple-300 mt-2">Auditor: {user?.name || 'User'}</p>
        </div>
        <nav className="mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
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

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'kpi' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Executive KPI Dashboard</h1>
                <div className="flex space-x-2">
                  <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
                    <Download className="w-4 h-4 mr-2" /> PDF
                  </button>
                  <button className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center">
                    <Download className="w-4 h-4 mr-2" /> CSV
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Gross Revenue (MTD)</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : `$${(kpiData.revenue / 1000).toFixed(1)}k`}
                  </h3>
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Live Data</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Units Sold (MTD)</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : kpiData.unitsSold}
                  </h3>
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Live Data</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">Service ROs (MTD)</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin"/> : kpiData.serviceROs}
                  </h3>
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> Live Data</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm font-medium text-gray-500">CSAT Score</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">4.8/5.0</h3>
                  <p className="text-xs text-green-600 font-medium mt-2 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> +0.2 vs last month</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-2">
                <button
                  onClick={() => downloadCSV('kpi-report.csv', [
                    { metric: 'Total Revenue', value: invoices.reduce((s:number, i:any) => s + (i.totalAmount || 0), 0) },
                    { metric: 'Total Vehicles', value: vehicles.length },
                    { metric: 'Vehicles Sold', value: vehicles.filter((v:any) => v.status === 'SOLD').length },
                    { metric: 'Total Appointments', value: appointments.length },
                  ], [{ key: 'metric', label: 'Metric' }, { key: 'value', label: 'Value' }])}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" /> Export CSV
                </button>
                <button
                  onClick={() => window.print()}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 flex items-center"
                >
                  <FileText className="w-4 h-4 mr-2" /> Print / PDF
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fleet Status Breakdown — CSS bar chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-500" /> Fleet Status Breakdown
                  </h3>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-purple-400" /></div>
                  ) : (
                    <div className="space-y-4">
                      {[
                        { status: 'AVAILABLE', color: 'bg-emerald-500' },
                        { status: 'SOLD',      color: 'bg-red-500' },
                        { status: 'IN_SERVICE', color: 'bg-blue-500' },
                        { status: 'RESERVED',  color: 'bg-amber-400' },
                      ].map(({ status, color }) => {
                        const count = vehicles.filter((v: any) => v.status === status).length;
                        const pct   = vehicles.length > 0 ? Math.round((count / vehicles.length) * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span className="font-medium">{status}</span>
                              <span>{count} unit{count !== 1 ? 's' : ''} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div className={`h-3 rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                      <p className="text-xs text-gray-400 pt-1">Total fleet: {vehicles.length} vehicles</p>
                    </div>
                  )}
                </div>

                {/* Revenue by Invoice Status — CSS bar chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-5 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-purple-500" /> Revenue by Invoice Status
                  </h3>
                  {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-7 h-7 animate-spin text-purple-400" /></div>
                  ) : (() => {
                    const statusDefs = [
                      { s: 'PAID',    color: 'bg-emerald-500' },
                      { s: 'PENDING', color: 'bg-amber-400' },
                      { s: 'OVERDUE', color: 'bg-red-500' },
                      { s: 'DRAFT',   color: 'bg-gray-300' },
                    ];
                    const totals = statusDefs.map(({ s }) =>
                      invoices.filter((i: any) => i.status === s).reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0)
                    );
                    const maxTotal = Math.max(...totals, 1);
                    return (
                      <div className="space-y-4">
                        {statusDefs.map(({ s, color }, idx) => (
                          <div key={s}>
                            <div className="flex justify-between text-xs text-gray-600 mb-1">
                              <span className="font-medium">{s}</span>
                              <span>${totals[idx].toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-3">
                              <div className={`h-3 rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.round((totals[idx] / maxTotal) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                        <p className="text-xs text-gray-400 pt-1">
                          Grand total: ${invoices.reduce((s: number, i: any) => s + (i.totalAmount || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sales' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Sales Analytics</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                   <h3 className="text-lg font-bold text-gray-800">Recent Deal Performance</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-white">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deal ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gross Profit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : deals.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No deals data available.</td></tr>
                    ) : deals.map((d: any) => (
                      <tr key={d.dealId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">DL-{d.dealId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">Veh #{d.vehicleId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">${d.finalPrice?.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                           <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{d.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end mt-3">
                <button onClick={() => downloadCSV('sales-report.csv', deals, [
                  {key:'dealId',label:'Deal ID'},{key:'quoteId',label:'Quote ID'},
                  {key:'salesPersonId',label:'Salesperson ID'},{key:'status',label:'Status'}
                ])} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-green-700 flex items-center">
                  <Download className="w-4 h-4 mr-1"/> Export CSV
                </button>
              </div>
            </div>
          )}

          {activeTab === 'scheduled' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Analytics</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">Total Fleet Size</h3>
                    <p className="text-3xl font-bold text-purple-700">{vehicles.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-2">Fleet Value</h3>
                    <p className="text-3xl font-bold text-purple-700">${vehicles.reduce((sum, v) => sum + (v.basePrice || 0), 0).toLocaleString()}</p>
                 </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Make & Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : vehicles.length === 0 ? (
                      <tr><td colSpan={3} className="px-6 py-8 text-center text-gray-500">No inventory data.</td></tr>
                    ) : vehicles.map((v: any) => (
                      <tr key={v.vehicleId || v.vin} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{v.make} {v.model}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{v.year}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            v.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                            v.status === 'SOLD' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{v.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Revenue & RO Analytics</h1>

              {/* Revenue summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Total Service ROs</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{loading ? '…' : appointments.length}</p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Service Revenue (Invoiced)</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {loading ? '…' : `$${invoices
                      .filter((i: any) => i.relatedEntityType === 'WORK_ORDER')
                      .reduce((s: number, i: any) => s + (i.totalAmount || 0), 0)
                      .toLocaleString()}`}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500">Paid / Total Service Invoices</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? '…' : `${invoices.filter((i: any) => i.relatedEntityType === 'WORK_ORDER' && i.status === 'PAID').length} / ${invoices.filter((i: any) => i.relatedEntityType === 'WORK_ORDER').length}`}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appt ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No service appointments.</td></tr>
                    ) : appointments.map((a: any) => {
                      const apptId = a.appId ?? a.appointmentId;
                      // Match invoices by customerId + WORK_ORDER type (best available join without WO data)
                      const custInvoices = invoices.filter((inv: any) =>
                        inv.customerId === a.customerId && inv.relatedEntityType === 'WORK_ORDER'
                      );
                      const revenue = custInvoices.reduce((s: number, inv: any) => s + (inv.totalAmount || 0), 0);
                      return (
                        <tr key={apptId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">APT-{apptId}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.serviceType}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.scheduledAt || a.appointmentDate || Date.now()).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              a.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              a.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-600'
                            }`}>{a.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                            {revenue > 0
                              ? <span className="text-emerald-600">${revenue.toLocaleString()}</span>
                              : <span className="text-gray-400">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" limit={5} />
          )}

          {activeTab === 'custom' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>

              {/* ── Builder ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Generate Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                    <select
                      value={rptType}
                      onChange={e => { setRptType(e.target.value); setReportResult(null); setReportMsg(null); }}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border bg-white"
                    >
                      <option value="SALES">Sales Report</option>
                      <option value="SERVICE">Service Revenue</option>
                      <option value="FINANCE">Finance Summary</option>
                      <option value="PARTS">Parts Inventory</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                    <input
                      type="date"
                      value={rptFrom}
                      onChange={e => setRptFrom(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                    <input
                      type="date"
                      value={rptTo}
                      onChange={e => setRptTo(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm px-4 py-2 border"
                    />
                  </div>
                </div>

                {reportMsg && (
                  <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${reportMsg.ok ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    {reportMsg.text}
                  </div>
                )}

                <div className="flex justify-end mt-4 space-x-3">
                  <button
                    disabled={reportLoading}
                    onClick={handleGenerateReport}
                    className="bg-purple-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-purple-800 disabled:opacity-50 flex items-center"
                  >
                    {reportLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating…</> : 'Generate & Save'}
                  </button>
                  {reportResult && reportResult.length > 0 && (
                    <button
                      onClick={() => downloadCSV(`${rptType.toLowerCase()}-report.csv`, reportResult, reportColumns)}
                      className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center"
                    >
                      <Download className="w-4 h-4 mr-2" /> Export CSV
                    </button>
                  )}
                  <button
                    onClick={() => window.print()}
                    className="bg-gray-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-gray-800 flex items-center"
                  ><FileText className="w-4 h-4 mr-2" />Print PDF</button>
                </div>
              </div>

              {/* ── Report Results ── */}
              {reportResult !== null && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">{rptType} Report Results</h3>
                    <span className="text-sm text-gray-500">{reportResult.length} record(s)</span>
                  </div>
                  {reportResult.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No records found for the selected period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            {reportColumns.map(col => (
                              <th key={col.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportResult.map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {reportColumns.map(col => (
                                <td key={col.key} className="px-6 py-3 whitespace-nowrap text-gray-800">
                                  {row[col.key] != null ? String(row[col.key]) : '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── Saved Reports ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">Saved Reports</h3>
                {loading ? (
                  <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400" /></div>
                ) : savedReports.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No saved reports yet. Generate one above.</p>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead>
                      <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Scope</th>
                        <th className="py-2 pr-4">Generated By</th>
                        <th className="py-2">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {savedReports.map((r: any) => (
                        <tr key={r.id || r.reportId} className="hover:bg-gray-50">
                          <td className="py-2 pr-4 font-medium">RPT-{r.id || r.reportId}</td>
                          <td className="py-2 pr-4">
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">{r.scope || r.type}</span>
                          </td>
                          <td className="py-2 pr-4 text-gray-500">User #{r.generatedBy}</td>
                          <td className="py-2 text-gray-500">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
