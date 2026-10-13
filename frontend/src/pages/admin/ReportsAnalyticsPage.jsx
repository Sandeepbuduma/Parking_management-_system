import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp, Layers, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const ReportsAnalyticsPage = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [revRes, occRes, statsRes] = await Promise.all([
        dashboardApi.getRevenueReport(),
        dashboardApi.getOccupancyReport(),
        dashboardApi.getAdminStats(),
      ]);
      setRevenueData(revRes.data);
      setOccupancyData(occRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Business Intelligence</span>
        <h1 className="text-2xl font-black text-white mt-0.5">Parking Reports & Utilization Analytics</h1>
        <p className="text-xs text-slate-400">Real-time facility utilization and revenue generation breakdown.</p>
      </div>

      {/* KPI Performance Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">System Occupancy Rate</span>
          <p className="text-3xl font-black text-white">{stats?.occupancyRate ?? 0}%</p>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 pt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Optimal parking efficiency</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">Total Slot Fleet</span>
          <p className="text-3xl font-black text-white">{stats?.totalSlots ?? 0}</p>
          <p className="text-[11px] text-slate-400 pt-1">
            {stats?.availableSlots ?? 0} available bays right now
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs text-slate-400">Total Processed Bookings</span>
          <p className="text-3xl font-black text-emerald-400">{stats?.totalReservations ?? 0}</p>
          <p className="text-[11px] text-slate-400 pt-1">
            Across all customer accounts
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Analytics */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Daily Revenue Flow
            </h3>
            <p className="text-xs text-slate-400">Daily totals calculated from confirmed and completed checkouts</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#colorRev2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Facility Capacity Utilization */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-400" />
              Capacity & Occupancy by Facility
            </h3>
            <p className="text-xs text-slate-400">Occupied vs Vacant spaces per parking structure</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="locationName" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="occupiedSlots" name="Occupied Bays" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availableSlots" name="Available Bays" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Facility Performance Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Facility Utilization Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="pb-3">Facility Name</th>
                <th className="pb-3">Total Bays</th>
                <th className="pb-3">Occupied</th>
                <th className="pb-3">Available</th>
                <th className="pb-3">Occupancy Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {occupancyData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 font-bold text-white">{item.locationName}</td>
                  <td className="py-3 font-semibold">{item.totalSlots}</td>
                  <td className="py-3 text-red-400 font-semibold">{item.occupiedSlots}</td>
                  <td className="py-3 text-emerald-400 font-semibold">{item.availableSlots}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, item.occupancyRate)}%` }}
                        />
                      </div>
                      <span className="font-bold text-white">{item.occupancyRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalyticsPage;
