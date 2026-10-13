import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { reservationsApi, sessionsApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  CalendarCheck,
  MapPin,
  Clock,
  Car,
  DollarSign,
  Printer,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  QrCode,
} from 'lucide-react';

export const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    setLoading(true);
    try {
      const res = await reservationsApi.getById(id);
      setReservation(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      await sessionsApi.checkIn(reservation.id);
      navigate('/customer/active-session');
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      await sessionsApi.checkOut(reservation.id);
      fetchReservation();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <span className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin inline-block mb-2" />
        <p className="text-xs">Loading reservation voucher...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-white">{error || 'Reservation not found'}</h3>
        <Link to="/customer/reservations" className="text-xs font-semibold text-emerald-400 underline">
          Back to Reservations
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top back button & print */}
      <div className="flex items-center justify-between">
        <Link
          to="/customer/reservations"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reservations</span>
        </Link>
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Voucher</span>
        </button>
      </div>

      {/* Main Voucher Card */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 print:border-black print:text-black print:bg-white">
        {/* Voucher Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Official Parking Pass</span>
            <h1 className="text-2xl font-black text-white mt-1">SmartPark Reservation Voucher</h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Ref: <strong className="text-white">{reservation.bookingReference}</strong>
            </p>
          </div>
          <div className="text-right space-y-1">
            <Badge status={reservation.status} className="text-sm px-3 py-1" />
            <p className="text-[10px] text-slate-400">Issued: {new Date(reservation.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Spot & Facility Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Parking Space</span>
            <h3 className="text-2xl font-black text-white">{reservation.slotNumber}</h3>
            <p className="text-xs text-slate-300">Level / Floor {reservation.floorNumber}</p>
            <p className="text-xs text-slate-400">{reservation.locationName}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Vehicle Assigned</span>
            <h3 className="text-xl font-bold font-mono text-emerald-400">{reservation.vehicleRegistration}</h3>
            <p className="text-xs text-slate-300 capitalize">{reservation.vehicleType?.replace('_', ' ')}</p>
            <p className="text-xs text-slate-400">Driver: {reservation.userFullName}</p>
          </div>
        </div>

        {/* Schedule & Duration Timeline */}
        <div className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Schedule & Access Times</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500">Reserved Start:</span>
              <p className="font-semibold text-white">{new Date(reservation.startTime).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Reserved End:</span>
              <p className="font-semibold text-white">{new Date(reservation.endTime).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-slate-500">Actual Check-In:</span>
              <p className="font-semibold text-emerald-400">
                {reservation.actualCheckIn ? new Date(reservation.actualCheckIn).toLocaleString() : 'Not Yet Checked In'}
              </p>
            </div>
            <div>
              <span className="text-slate-500">Actual Check-Out:</span>
              <p className="font-semibold text-blue-400">
                {reservation.actualCheckOut ? new Date(reservation.actualCheckOut).toLocaleString() : 'Active / Pending'}
              </p>
            </div>
          </div>
        </div>

        {/* Charges Breakdown */}
        <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Billing Summary</span>
            <p className="text-xs text-slate-300 mt-0.5">
              {reservation.finalAmount ? 'Final Calculated Charge' : 'Estimated Charge (Hourly Pro-Rated)'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-emerald-400">
              ${reservation.finalAmount || reservation.estimatedAmount}
            </p>
            <span className="text-[10px] text-slate-400 font-semibold">
              {reservation.status === 'COMPLETED' ? 'Paid In Full' : 'Pending Checkout'}
            </span>
          </div>
        </div>

        {/* Security Barcode Simulation */}
        <div className="pt-4 border-t border-slate-800 text-center space-y-2">
          <div className="h-10 mx-auto max-w-xs flex items-center justify-center space-x-1 opacity-70">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="h-full bg-white"
                style={{ width: `${(i % 3) + 1.5}px` }}
              />
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500 tracking-widest">{reservation.bookingReference}</p>
        </div>

        {/* Actions Bottom */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3 print:hidden">
          {reservation.status === 'CONFIRMED' && (
            <button
              onClick={handleCheckIn}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Check In Now</span>
            </button>
          )}

          {reservation.status === 'ACTIVE' && (
            <button
              onClick={handleCheckOut}
              disabled={actionLoading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Check Out & Pay</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
