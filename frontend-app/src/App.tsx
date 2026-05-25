import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerPortal from './pages/dashboards/CustomerPortal';
import SalesConsole from './pages/dashboards/SalesConsole';
import ServiceAdvisorConsole from './pages/dashboards/ServiceAdvisorConsole';
import TechnicianConsole from './pages/dashboards/TechnicianConsole';
import PartsManagerConsole from './pages/dashboards/PartsManagerConsole';
import FinanceDashboard from './pages/dashboards/FinanceDashboard';
import AdminPanel from './pages/dashboards/AdminPanel';
import ReportingPortal from './pages/dashboards/ReportingPortal';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected role-based routes */}
            <Route path="/customer" element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerPortal />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute allowedRoles={['SALES_CONSULTANT', 'ADMIN']}>
                <SalesConsole />
              </ProtectedRoute>
            } />
            <Route path="/service" element={
              <ProtectedRoute allowedRoles={['SERVICE_ADVISOR', 'ADMIN']}>
                <ServiceAdvisorConsole />
              </ProtectedRoute>
            } />
            <Route path="/tech" element={
              <ProtectedRoute allowedRoles={['TECHNICIAN', 'ADMIN']}>
                <TechnicianConsole />
              </ProtectedRoute>
            } />
            <Route path="/parts" element={
              <ProtectedRoute allowedRoles={['PARTS_MANAGER', 'ADMIN']}>
                <PartsManagerConsole />
              </ProtectedRoute>
            } />
            <Route path="/finance" element={
              <ProtectedRoute allowedRoles={['FINANCE_OFFICER', 'ADMIN']}>
                <FinanceDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="/reports" element={
              <ProtectedRoute allowedRoles={['AUDITOR', 'ADMIN']}>
                <ReportingPortal />
              </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
