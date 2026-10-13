import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { dashboardApi, reservationsApi, sessionsApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  CalendarCheck,
  Timer,
  Car,
  Receipt,
  SquareParking,
  ArrowRight,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentReservations, setRecentReservations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, resRes, sessionRes] = await Promise.all([
        dashboardApi.getCustomerStats(),
        reservationsApi.getMy(),
        sessionsApi.getHistory(),
      ]);

      setStats(statsRes.data);
      setRecentReservations(resRes.data.slice(0, 5));

      // Check if there is an active (not checked out) session
      const ongoing = sessionRes.data.find((s) => !s.checkOutTime);
      setActiveSession(ongoing || null);
    } catch (err) {
      console.error('Failed to load customer dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Driver Dashboard</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Manage your vehicles, reserve smart parking slots, and monitor live parking sessions.
          </p>
        </div>

        <Link
          to="/customer/slots"
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 self-start sm:self-center shrink-0"
        >
          <SquareParking className="w-4 h-4" />
          <span>Find Parking Spot</span>
        </Link>
      </div>

      {/* Active Session Alert (If currently parked) */}
      {activeSession && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
              <Timer className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Active Parking Session</span>
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                Slot {activeSession.slotNumber} • {activeSession.locationName}
              </h3>
              <p className="text-xs text-slate-300">
                Vehicle: <strong className="text-white">{activeSession.vehicleRegistration}</strong> • Checked In:{' '}
                {new Date(activeSession.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <Link
            to="/customer/active-session"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 self-start md:self-center shrink-0 shadow-md shadow-blue-600/20"
          >
            <span>Live Monitor & Check Out</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reservations"
          value={stats?.totalReservations ?? 0}
          icon={CalendarCheck}
          color="emerald"
          subtitle="All historical bookings"
        />
        <StatCard
          title="Active / Confirmed"
          value={stats?.activeReservations ?? 0}
          icon={Timer}
          color="blue"
          subtitle="Ongoing or upcoming"
        />
        <StatCard
          title="Registered Vehicles"
          value={stats?.totalVehicles ?? 0}
          icon={Car}
          color="purple"
          subtitle="Available for parking"
        />
        <StatCard
          title="Total Spent"
          value={`$${stats?.totalSpent ? Number(stats.totalSpent).toFixed(2) : '0.00'}`}
          icon={Receipt}
          color="amber"
          subtitle="Completed sessions"
        />
      </div>

      {/* Recent Reservations Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Recent Reservations</h2>
            <p className="text-xs text-slate-400">Your most recent parking bookings and statuses</p>
          </div>
          <Link
            to="/customer/reservations"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Facility & Slot</th>
                  <th className="pb-3">Vehicle</th>
                  <th className="pb-3">Start Time</th>
                  <th className="pb-3">Estimated Fee</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40">
                    <td className="py-3 font-mono font-bold text-white">{res.bookingReference}</td>
                    <td className="py-3">
                      <p className="font-semibold text-white">{res.slotNumber} (Floor {res.floorNumber})</p>
                      <p className="text-[10px] text-slate-400">{res.locationName}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-mono text-slate-200">{res.vehicleRegistration}</span>
                    </td>
                    <td className="py-3 text-slate-300">
                      {new Date(res.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 font-semibold text-emerald-400">
                      ${res.finalAmount || res.estimatedAmount}
                    </td>
                    <td className="py-3">
                      <Badge status={res.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/customer/reservations/${res.id}`}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <CalendarCheck className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">You have no reservations yet.</p>
            <Link
              to="/customer/slots"
              className="inline-block px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Book your first spot
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
