import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  MapPin,
  SquareParking,
  CalendarCheck,
  Timer,
  Car,
  Receipt,
  Bell,
  User,
  Users,
  Radio,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/slots', label: 'Find Parking', icon: SquareParking },
    { to: '/customer/reservations', label: 'My Bookings', icon: CalendarCheck },
    { to: '/customer/active-session', label: 'Live Session', icon: Timer },
    { to: '/customer/vehicles', label: 'My Vehicles', icon: Car },
    { to: '/customer/history', label: 'Billing & History', icon: Receipt },
    { to: '/customer/notifications', label: 'Notifications', icon: Bell },
    { to: '/customer/profile', label: 'My Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/locations', label: 'Locations', icon: MapPin },
    { to: '/admin/slots', label: 'Parking Slots', icon: SquareParking },
    { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
    { to: '/admin/sessions', label: 'Active Sessions', icon: Timer },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/vehicles', label: 'Vehicles', icon: Car },
    { to: '/admin/payments', label: 'Transactions', icon: Receipt },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
    { to: '/admin/sensor-simulator', label: 'IoT Sensor Sim', icon: Radio },
    { to: '/admin/profile', label: 'Admin Profile', icon: User },
  ];

  const links = isAdmin ? adminLinks : customerLinks;

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-600/30">
              <SquareParking className="w-5 h-5" />
            </div>
            <div className="truncate">
              <span className="font-bold text-white text-base tracking-tight">Smart<span className="text-emerald-400">Park</span></span>
              <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-500">
                {isAdmin ? 'Admin Console' : 'Customer Portal'}
              </p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="mx-auto w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <SquareParking className="w-5 h-5" />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition ${isCollapsed ? 'mx-auto' : ''}`}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                } ${isCollapsed ? 'justify-center' : ''}`
              }
              title={isCollapsed ? link.label : ''}
            >
              <Icon className="w-5 h-5 shrink-0 transition group-hover:scale-110" />
              {!isCollapsed && <span className="truncate">{link.label}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400 shrink-0">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
