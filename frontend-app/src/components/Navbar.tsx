import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, List, LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const ROLE_DASHBOARD: Record<string, string> = {
  ADMIN: '/admin',
  CUSTOMER: '/customer',
  SALES_CONSULTANT: '/sales',
  SERVICE_ADVISOR: '/service',
  TECHNICIAN: '/tech',
  PARTS_MANAGER: '/parts',
  FINANCE_OFFICER: '/finance',
  AUDITOR: '/reports',
};

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Admin Panel',
  CUSTOMER: 'My Portal',
  SALES_CONSULTANT: 'Sales Console',
  SERVICE_ADVISOR: 'Service Console',
  TECHNICIAN: 'TechBay',
  PARTS_MANAGER: 'Parts Console',
  FINANCE_OFFICER: 'Finance Console',
  AUDITOR: 'Reports',
};

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashboardPath = user?.role ? ROLE_DASHBOARD[user.role] : null;
  const dashboardLabel = user?.role ? ROLE_LABEL[user.role] : null;

  return (
    <header className="w-full flex flex-col shadow-lg relative z-50">
      {/* Top bar */}
      <div className="bg-black text-gray-300 text-sm flex justify-between items-center pl-4 md:pl-12 pr-0 h-10 overflow-hidden">
        <div className="flex-1 overflow-hidden whitespace-nowrap relative flex items-center h-full mr-4 md:mr-8">
          <div className="inline-block animate-marquee text-brand-yellow font-medium tracking-wide">
            ✦ Your Trusted Automotive Partner — Specializing in Sales, Service, and Premium Finance ✦
          </div>
        </div>

        <div className="flex items-center h-full shrink-0">
          <div className="hidden lg:flex items-center space-x-6 pr-6">
            <div className="flex items-center space-x-2">
              <Mail size={14} className="text-brand-red" />
              <span>email: <span className="text-white">info@example.com</span></span>
            </div>
            <div className="w-px h-4 bg-gray-600" />
            <div className="flex items-center space-x-2">
              <Phone size={14} className="text-brand-red" />
              <span className="text-white">+91-1234567890</span>
            </div>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center h-full">
              <div className="hidden lg:flex items-center px-4 text-xs text-gray-300 border-r border-gray-700 h-full">
                <User size={13} className="mr-1 text-brand-yellow" />
                <span className="text-white font-medium">{user?.name}</span>
                <span className="ml-1 text-gray-500">({user?.role?.replace(/_/g, ' ')})</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center px-5 h-full text-sm font-semibold text-white bg-brand-red hover:opacity-90 transition-colors"
              >
                <LogOut size={14} className="mr-2" />
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="bg-brand-red text-white flex items-center justify-center px-6 h-full font-semibold hover:opacity-90 transition-colors"
            >
              <List size={16} className="mr-2" />
              ADMIN
            </Link>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-[#020617] px-4 md:px-12 py-4 flex justify-between items-center border-b border-white/[0.07]">
        <Link to="/" className="flex items-center space-x-2 group">
          <span className="font-black text-xl tracking-widest text-white group-hover:text-brand-yellow transition-colors duration-150">
            AUTOCONNECT
          </span>
        </Link>

        <nav className="hidden lg:flex space-x-8 text-sm font-bold text-gray-400 tracking-wide items-center">
          <Link to="/" className="text-brand-yellow hover:text-yellow-300 transition-colors">HOME</Link>
          {isAuthenticated && dashboardPath && (
            <Link
              to={dashboardPath}
              className="hover:text-white transition-colors flex items-center gap-1.5 hover:bg-white/5 px-3 py-1.5 rounded-lg"
            >
              <LayoutDashboard size={15} />
              {dashboardLabel}
            </Link>
          )}
          {isAuthenticated && <NotificationBell />}
          {!isAuthenticated && (
            <>
              <Link to="/login" className="hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">LOGIN</Link>
              <Link
                to="/register"
                className="bg-brand-yellow text-gray-900 px-5 py-1.5 rounded-lg font-bold hover:bg-yellow-400 active:scale-[0.97] transition-all duration-150 shadow-sm"
              >
                REGISTER
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
