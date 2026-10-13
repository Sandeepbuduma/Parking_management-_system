import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sessionsApi, reservationsApi } from '../../services/api';
import { Timer, Car, MapPin, DollarSign, LogOut, CheckCircle2, AlertCircle, Clock, SquareParking } from 'lucide-react';

export const ActiveSessionPage = () => {
  const navigate = useNavigate();
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  useEffect(() => {
    fetchActiveSession();
  }, []);

  const fetchActiveSession = async () => {
    setLoading(true);
    try {
      const res = await sessionsApi.getHistory();
      const ongoing = res.data.find((s) => !s.checkOutTime);
      setActiveSession(ongoing || null);
    } catch (err) {
      console.error('Failed to load active session', err);
    } finally {
      setLoading(false);
    }
  };

  // Stopwatch timer interval
  useEffect(() => {
    if (!activeSession || !activeSession.checkInTime) return;

    const checkInDate = new Date(activeSession.checkInTime);

    const updateTimer = () => {
      const now = new Date();
      const diffSecs = Math.max(0, Math.floor((now - checkInDate) / 1000));
      setElapsedSeconds(diffSecs);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const handleCheckOut = async () => {
    if (!activeSession) return;
    setCheckingOut(true);
    try {
      const res = await sessionsApi.checkOut(activeSession.reservationId);
      setCheckoutSuccess(res.data);
      setActiveSession(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTimer = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentHoursBilled = Math.max(1, Math.ceil(elapsedSeconds / 3600));
  const currentFeeEstimate = activeSession
    ? (Number(activeSession.hourlyRate) * currentHoursBilled).toFixed(2)
    : '0.00';

  if (loading) {
    return (
      <div className="p-16 text-center text-slate-400">
        <Timer className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
        <p className="text-xs">Checking active parking session...</p>
      </div>
    );
  }

  // If session just ended
  if (checkoutSuccess) {
    return (
      <div className="max-w-lg mx-auto p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Exit Completed</span>
          <h2 className="text-2xl font-black text-white mt-1">Checked Out Successfully</h2>
          <p className="text-xs text-slate-400 mt-1">Your parking session has ended and payment was recorded.</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Total Duration:</span>
            <span className="font-bold text-white">{checkoutSuccess.durationMinutes} minutes</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Hourly Rate:</span>
            <span className="font-bold text-white">${checkoutSuccess.hourlyRate}/hr</span>
          </div>
          <div className="flex justify-between text-slate-400 pt-2 border-t border-slate-800 text-sm">
            <span className="font-bold text-white">Final Paid Amount:</span>
            <span className="font-black text-emerald-400">${checkoutSuccess.totalAmount}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customer/history"
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            View Billing Receipt
          </Link>
          <Link
            to="/customer/dashboard"
            className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/30"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // If no active session
  if (!activeSession) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
          <Timer className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-white">No Active Parking Session</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          You currently have no parked vehicle session. If you have an upcoming confirmed booking, click Check-In on arrival.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            to="/customer/reservations"
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
          >
            Check Confirmed Bookings
          </Link>
          <Link
            to="/customer/slots"
            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
          >
            Find & Reserve Spot
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Real-Time Telemetry</span>
        <h1 className="text-2xl font-black text-white mt-0.5">Active Parking Session</h1>
        <p className="text-xs text-slate-400">Live duration and ongoing fee accumulation.</p>
      </div>

      {/* Stopwatch Hero Widget */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/30 shadow-2xl text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
          <span>Vehicle Currently Occupying Bay</span>
        </div>

        {/* Big Digital Clock */}
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Elapsed Parking Time</span>
          <div className="text-5xl sm:text-7xl font-mono font-black tracking-tight text-white drop-shadow-md">
            {formatTimer(elapsedSeconds)}
          </div>
          <p className="text-xs text-slate-400">
            Checked in at {new Date(activeSession.checkInTime).toLocaleTimeString()}
          </p>
        </div>

        {/* Real-time Meter Grid */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">Current Billing Hours</span>
            <p className="text-2xl font-black text-white mt-1">{currentHoursBilled} hr(s)</p>
            <span className="text-[10px] text-slate-500">Min 1 hr pro-rated</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400">Accumulated Total</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">${currentFeeEstimate}</p>
            <span className="text-[10px] text-slate-500">${activeSession.hourlyRate}/hr rate</span>
          </div>
        </div>

        {/* Spot Details */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-left text-xs">
          <div>
            <span className="text-slate-400">Spot & Location:</span>
            <h4 className="font-bold text-white text-sm">Slot {activeSession.slotNumber}</h4>
            <p className="text-slate-400 text-[11px]">{activeSession.locationName}</p>
          </div>
          <div className="text-right">
            <span className="text-slate-400">Vehicle:</span>
            <h4 className="font-bold font-mono text-emerald-400 text-sm">{activeSession.vehicleRegistration}</h4>
            <p className="text-slate-400 text-[11px]">Booking: {activeSession.bookingReference}</p>
          </div>
        </div>

        {/* Big Check-Out Button */}
        <button
          onClick={handleCheckOut}
          disabled={checkingOut}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2.5 disabled:opacity-50"
        >
          {checkingOut ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogOut className="w-5 h-5" />
          )}
          <span>Exit Facility & Check Out (Pay ${currentFeeEstimate})</span>
        </button>
      </div>
    </div>
  );
};

export default ActiveSessionPage;
