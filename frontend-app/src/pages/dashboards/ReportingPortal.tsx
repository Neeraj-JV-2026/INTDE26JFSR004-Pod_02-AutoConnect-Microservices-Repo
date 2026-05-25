import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, TrendingUp, Download, Calendar, FileSpreadsheet, Loader2, Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationsPanel from '../../components/NotificationsPanel';

export default function ReportingPortal() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('kpi');
  
  const [kpiData, setKpiData] = useState({ revenue: 0, unitsSold: 0, serviceROs: 0 });
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (activeTab === 'kpi') {
      Promise.all([
        axios.get('http://localhost:8089/api/finance/invoices').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/inventory/vehicles').catch(() => ({ data: [] })),
        axios.get('http://localhost:8089/api/appointments').catch(() => ({ data: { data: [] } }))
      ]).then(([invoicesRes, vehiclesRes, appointmentsRes]) => {
        const invoices = invoicesRes.data || [];
        const veh = vehiclesRes.data || [];
        const appts = appointmentsRes.data?.data || [];
        
        const revenue = invoices
          .filter((i: any) => i.status === 'PAID')
          .reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);
          
        const unitsSold = veh.filter((v: any) => v.status === 'SOLD').length;
        const serviceROs = appts.length;

        setKpiData({ revenue, unitsSold, serviceROs });
      }).finally(() => setLoading(false));
    } else if (activeTab === 'sales') {
      axios.get('http://localhost:8089/api/sales/deals').then(res => setDeals(res.data)).catch(() => setDeals([])).finally(() => setLoading(false));
    } else if (activeTab === 'service') {
      axios.get('http://localhost:8089/api/appointments').then(res => setAppointments(res.data.data || res.data)).catch(() => setAppointments([])).finally(() => setLoading(false));
    } else if (activeTab === 'scheduled') {
      axios.get('http://localhost:8089/api/inventory/vehicles').then(res => setVehicles(res.data)).catch(() => setVehicles([])).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [activeTab]);

  const tabs = [
    { id: 'kpi', name: 'Executive KPIs', icon: BarChart3 },
    { id: 'sales', name: 'Sales Analytics', icon: PieChart },
    { id: 'scheduled', name: 'Inventory Analytics', icon: Calendar },
    { id: 'service', name: 'Service Revenue', icon: TrendingUp },
    { id: 'exports', name: 'Custom Reports', icon: FileSpreadsheet },
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col justify-center items-center">
                  <BarChart3 className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Sales vs Target Chart</p>
                  <p className="text-xs text-gray-400 mt-1">Visualizing data points...</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80 flex flex-col justify-center items-center">
                  <PieChart className="w-16 h-16 text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Revenue by Department</p>
                  <p className="text-xs text-gray-400 mt-1">Visualizing data points...</p>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Service Revenue & RO Analytics</h1>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appt ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500"><Loader2 className="w-6 h-6 animate-spin mx-auto"/></td></tr>
                    ) : appointments.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No service appointments.</td></tr>
                    ) : appointments.map((a: any) => (
                      <tr key={a.appointmentId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">APT-{a.appointmentId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.serviceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(a.scheduledAt || a.appointmentDate || Date.now()).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{a.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <NotificationsPanel userId={user?.id} theme="light" />
          )}

          {activeTab === 'exports' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Custom Report Builder</h1>
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center">
                <FileSpreadsheet className="w-16 h-16 text-purple-200 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Build Custom Export</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Select data sources and date ranges to generate a custom CSV export of AutoConnect data.</p>
                <button className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700">Start Report Wizard</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
