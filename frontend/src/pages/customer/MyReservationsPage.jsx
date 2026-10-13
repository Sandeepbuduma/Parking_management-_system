import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { reservationsApi, sessionsApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  CalendarCheck,
  Timer,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  LogOut,
  MapPin,
  Car,
  Clock,
  RefreshCw,
} from 'lucide-react';

export const MyReservationsPage = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await reservationsApi.getMy();
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (reservationId) => {
    setActionLoadingId(reservationId);
    setMessage(null);
    try {
      await sessionsApi.checkIn(reservationId);
      navigate('/customer/active-session');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-in failed' });
      setActionLoadingId(null);
    }
  };

  const handleCheckOut = async (reservationId) => {
    setActionLoadingId(reservationId);
    setMessage(null);
    try {
      await sessionsApi.checkOut(reservationId);
      setMessage({ type: 'success', text: 'Checked out successfully! Parking fee paid.' });
      fetchReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Check-out failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    setActionLoadingId(reservationId);
    setMessage(null);
    try {
      await reservationsApi.cancel(reservationId);
      setMessage({ type: 'success', text: 'Reservation cancelled successfully.' });
      fetchReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cancellation failed' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredList = reservations.filter((r) => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Driver Portal</span>
          <h1 className="text-2xl font-black text-white mt-0.5">My Parking Reservations</h1>
          <p className="text-xs text-slate-400">Check-in upon arrival, check-out when leaving, or cancel upcoming bookings.</p>
        </div>

        <Link
          to="/customer/slots"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center shadow-lg shadow-emerald-600/20"
        >
          <CalendarCheck className="w-4 h-4" />
          <span>New Reservation</span>
        </Link>
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
            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {['ALL', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((status) => (
          <button
            key={status}
            onClick={() => setActiveFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              activeFilter === status
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Reservations Table */}
      {loading ? (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading your reservations...</p>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((res) => (
            <div
              key={res.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-slate-300">{res.bookingReference}</span>
                  <Badge status={res.status} />
                </div>

                <div className="space-y-2">
                  <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Slot</span>
                      <h4 className="text-lg font-black text-white">{res.slotNumber}</h4>
                      <p className="text-[11px] text-slate-400">Floor {res.floorNumber}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Fee</span>
                      <p className="text-lg font-black text-emerald-400">
                        ${res.finalAmount || res.estimatedAmount}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        {res.finalAmount ? 'Final Billed' : 'Estimated'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 pt-1">
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{res.locationName}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Car className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{res.vehicleRegistration} ({res.vehicleType})</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>
                        {new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(res.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                {res.status === 'CONFIRMED' && (
                  <>
                    <button
                      onClick={() => handleCheckIn(res.id)}
                      disabled={actionLoadingId === res.id}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Check In</span>
                    </button>
                    <button
                      onClick={() => handleCancel(res.id)}
                      disabled={actionLoadingId === res.id}
                      className="py-2 px-3 bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/40 font-semibold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  </>
                )}

                {res.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleCheckOut(res.id)}
                    disabled={actionLoadingId === res.id}
                    className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Check Out & Pay</span>
                  </button>
                )}

                <Link
                  to={`/customer/reservations/${res.id}`}
                  className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition"
                  title="View Voucher"
                >
                  <Eye className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <CalendarCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-white">No Reservations Found</h3>
          <p className="text-xs text-slate-400">There are no bookings matching the "{activeFilter}" filter.</p>
        </div>
      )}
    </div>
  );
};

export default MyReservationsPage;
