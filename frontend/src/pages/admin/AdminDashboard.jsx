import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi } from '../../services/api';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import {
  SquareParking,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Users,
  Car,
  Timer,
  Radio,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, revRes, occRes, logsRes] = await Promise.all([
        dashboardApi.getAdminStats(),
        dashboardApi.getRevenueReport(),
        dashboardApi.getOccupancyReport(),
        dashboardApi.getAuditLogs(),
      ]);

      setStats(statsRes.data);
      setRevenueData(revRes.data);
      setOccupancyData(occRes.data);
      setAuditLogs(logsRes.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const pieColors = ['#10b981', '#3b82f6', '#8b5cf6'];
  const vehicleTypePieData = stats?.slotsByVehicleType
    ? [
        { name: '4-Wheelers', value: stats.slotsByVehicleType['FOUR_WHEELER'] || 0 },
        { name: '2-Wheelers', value: stats.slotsByVehicleType['TWO_WHEELER'] || 0 },
        { name: 'EV Bays', value: stats.slotsByVehicleType['EV'] || 0 },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-slate-900 border border-purple-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">System Monitoring</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">Administrator Overview</h1>
          <p className="text-xs text-slate-300 mt-1">
            Real-time status of parking bays, active reservations, revenue collections, and IoT sensors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Link
            to="/admin/sensor-simulator"
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Simulate Sensor</span>
          </Link>
          <Link
            to="/admin/slots"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Manage Slots</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Parking Slots"
          value={stats?.totalSlots ?? 0}
          icon={SquareParking}
          color="blue"
          subtitle={`${stats?.totalLocations ?? 0} active locations`}
        />
        <StatCard
          title="Available Slots"
          value={stats?.availableSlots ?? 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle={`${stats?.occupancyRate ?? 0}% occupancy rate`}
        />
        <StatCard
          title="Occupied / Reserved"
          value={(stats?.occupiedSlots ?? 0) + (stats?.reservedSlots ?? 0)}
          icon={Car}
          color="red"
          subtitle={`${stats?.occupiedSlots ?? 0} active, ${stats?.reservedSlots ?? 0} reserved`}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue ? Number(stats.totalRevenue).toFixed(2) : '0.00'}`}
          icon={DollarSign}
          color="amber"
          subtitle="Collected payments"
        />
      </div>

      {/* Second Row Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Active Sessions</p>
          <p className="text-xl font-bold text-white mt-1">{stats?.activeSessions ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Total Customers</p>
          <p className="text-xl font-bold text-white mt-1">{stats?.totalCustomers ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Registered Vehicles</p>
          <p className="text-xl font-bold text-white mt-1">{stats?.totalVehicles ?? 0}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
          <p className="text-xs text-slate-400">Slots In Maintenance</p>
          <p className="text-xl font-bold text-slate-400 mt-1">{stats?.maintenanceSlots ?? 0}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 lg:col-span-2 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Revenue Collections (Last 7 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily transaction volume</p>
            </div>
            <Link to="/admin/payments" className="text-xs text-emerald-400 hover:underline">
              View All
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vehicle Type Distribution Pie Chart */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Bays by Vehicle Type</h3>
            <p className="text-xs text-slate-400">Capacity breakdown</p>
          </div>

          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={vehicleTypePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {vehicleTypePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {vehicleTypePieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: pieColors[idx] }} />
                  <span>{item.name}</span>
                </span>
                <span className="font-bold text-white">{item.value} slots</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Facility Occupancy Bar Chart & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy per Location */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white">Occupancy by Facility</h3>
            <p className="text-xs text-slate-400">Available vs Occupied slots</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="locationName" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="occupiedSlots" name="Occupied" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="availableSlots" name="Available" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">System Audit Trail</h3>
              <p className="text-xs text-slate-400">Recent administrator & sensor actions</p>
            </div>
            <Link to="/admin/profile" className="text-xs text-emerald-400 hover:underline">
              View Log
            </Link>
          </div>

          <div className="space-y-2.5">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-emerald-400">{log.action}</span>
                  <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-300 mt-1 line-clamp-1">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
