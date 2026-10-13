import React, { useState, useEffect } from 'react';
import { sessionsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Timer, LogOut, CheckCircle2, AlertCircle, RefreshCw, Car, MapPin, DollarSign } from 'lucide-react';

export const ActiveSessionsPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchActiveSessions();
  }, []);

  const fetchActiveSessions = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.getActive();
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load active sessions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminCheckOut = async (reservationId) => {
    if (!window.confirm('Record check-out for this parking session?')) return;
    setActionLoadingId(reservationId);
    setMessage(null);
    try {
      const res = await sessionsApi.checkOut(reservationId);
      setMessage({
        type: 'success',
        text: `Checked out session for ${res.data.slotNumber}. Billed $${res.data.totalAmount} for ${res.data.durationMinutes} mins.`,
      });
      fetchActiveSessions();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = [
    {
      header: 'Bay / Slot',
      accessor: 'slotNumber',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-extrabold text-white text-sm">Slot {row.slotNumber}</span>
          <p className="text-[10px] text-slate-400">{row.locationName}</p>
        </div>
      ),
    },
    {
      header: 'Vehicle Plate',
      accessor: 'vehicleRegistration',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 bg-slate-950 border border-slate-800 rounded">
          {row.vehicleRegistration}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white text-xs">{row.customerName}</p>
          <p className="text-[10px] text-slate-400">{row.customerEmail}</p>
        </div>
      ),
    },
    {
      header: 'Check-In Time',
      accessor: 'checkInTime',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-300">
          {new Date(row.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(row.checkInTime).toLocaleDateString()})
        </span>
      ),
    },
    {
      header: 'Hourly Rate',
      accessor: 'hourlyRate',
      sortable: true,
      render: (row) => <span className="font-bold text-white text-xs">${row.hourlyRate}/hr</span>,
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      render: () => <Badge status="ACTIVE">Occupying Bay</Badge>,
    },
    {
      header: 'Admin Actions',
      accessor: 'reservationId',
      render: (row) => (
        <button
          onClick={() => handleAdminCheckOut(row.reservationId)}
          disabled={actionLoadingId === row.reservationId}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Record Exit</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Live Bays</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Active Parking Sessions</h1>
          <p className="text-xs text-slate-400">Real-time vehicles currently checked in across all locations.</p>
        </div>

        <button
          onClick={fetchActiveSessions}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 self-start sm:self-center"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Live Sessions</span>
        </button>
      </div>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
            message.type === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-400'
              : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={sessions}
        searchPlaceholder="Search slot, license plate, or customer..."
        emptyMessage="No vehicles currently checked in."
      />
    </div>
  );
};

export default ActiveSessionsPage;
