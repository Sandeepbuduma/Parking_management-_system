import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../services/api';
import { Bell, Menu, User, LogOut, Radio } from 'lucide-react';
import Badge from '../components/common/Badge';

export const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchUnread();
  }, [location.pathname]);

  const fetchUnread = async () => {
    try {
      const res = await notificationsApi.getMy();
      const unread = res.data.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      // Ignore if not logged in yet
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          isCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-sm font-semibold text-white">
                {isAdmin ? 'System Administrator Portal' : 'Smart Parking Customer Portal'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Connected to <span className="text-emerald-400 font-medium">smart_parking_db</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Simulation pill indicator for Admin */}
            {isAdmin && (
              <Link
                to="/admin/sensor-simulator"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-900/40 transition"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                <span>IoT Sim Active</span>
              </Link>
            )}

            {/* Notification Bell */}
            <Link
              to={isAdmin ? '/admin/dashboard' : '/customer/notifications'}
              className="relative p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-800">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-emerald-400">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white">{user?.fullName}</p>
                <span className="text-[10px] text-slate-400">{user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Route Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
