import React, { useState, useEffect } from 'react';
import { slotsApi, sensorApi, dashboardApi } from '../../services/api';
import Badge from '../../components/common/Badge';
import {
  Radio,
  Car,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export const SensorSimulatorPage = () => {
  const [slots, setSlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [message, setMessage] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchSlotsAndLogs();
  }, []);

  const fetchSlotsAndLogs = async () => {
    setLoading(true);
    try {
      const [slotRes, logsRes] = await Promise.all([
        slotsApi.getFiltered(),
        dashboardApi.getAuditLogs(),
      ]);
      setSlots(slotRes.data);
      if (slotRes.data.length > 0 && !selectedSlotId) {
        setSelectedSlotId(slotRes.data[0].id.toString());
      }
      setAuditLogs(logsRes.data.filter((l) => l.action.includes('SENSOR')).slice(0, 10));
    } catch (err) {
      console.error('Failed to load slots or logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (occupied) => {
    if (!selectedSlotId) return;
    setSimulating(true);
    setMessage(null);
    try {
      const res = await sensorApi.simulate({
        slotId: Number(selectedSlotId),
        occupied: occupied,
      });

      setMessage({
        type: 'success',
        text: `Simulated ultrasonic event sent for Slot ${res.data.slotNumber}: set to ${res.data.status}`,
      });

      // Update local slots state
      setSlots((prev) =>
        prev.map((s) => (s.id === res.data.id ? res.data : s))
      );

      // Refresh audit logs
      const logsRes = await dashboardApi.getAuditLogs();
      setAuditLogs(logsRes.data.filter((l) => l.action.includes('SENSOR')).slice(0, 10));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Simulation event failed',
      });
    } finally {
      setSimulating(false);
    }
  };

  const targetSlot = slots.find((s) => s.id === Number(selectedSlotId));

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-start gap-3">
        <Radio className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-0.5 text-xs">
          <h4 className="font-bold text-amber-300 uppercase tracking-wide">
            Simulated Sensor Mode (Development & College Demo)
          </h4>
          <p className="text-amber-200/80 leading-relaxed">
            This module simulates telemetry pulses from IoT ultrasonic sensors or camera AI detection nodes.
            Occupancy updates directly synchronize with MySQL database tables while protecting existing active customer reservations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Controls Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Sensor Pulse Injector</span>
            <h2 className="text-xl font-black text-white mt-0.5">Simulate Telemetry</h2>
            <p className="text-xs text-slate-400">Trigger vehicle arrival or departure events.</p>
          </div>

          {message && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                message.type === 'error'
                  ? 'bg-red-950/40 border-red-500/40 text-red-400'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400'
              }`}
            >
              {message.type === 'error' ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
              <span>{message.text}</span>
            </div>
          )}

          {/* Slot Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Target Parking Bay</label>
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.slotNumber} ({s.locationName} - F{s.floorNumber}) - [{s.status}]
                </option>
              ))}
            </select>
          </div>

          {/* Target Slot Status Card */}
          {targetSlot && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">Current Sensor Reading:</span>
                <Badge status={targetSlot.status} />
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p>Location: <strong className="text-white">{targetSlot.locationName}</strong></p>
                <p>Floor: <strong className="text-white">Floor {targetSlot.floorNumber}</strong></p>
                <p>Vehicle Class: <strong className="text-white">{targetSlot.vehicleType}</strong></p>
              </div>
            </div>
          )}

          {/* Action Trigger Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              disabled={simulating || !selectedSlotId || targetSlot?.status === 'MAINTENANCE'}
              onClick={() => handleSimulate(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Car className="w-4 h-4" />
              <span>Trigger Vehicle Arrival (OCCUPIED - Red)</span>
            </button>

            <button
              type="button"
              disabled={simulating || !selectedSlotId || targetSlot?.status === 'MAINTENANCE'}
              onClick={() => handleSimulate(false)}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Trigger Vehicle Departure (VACANT - Green)</span>
            </button>
          </div>
        </div>

        {/* Live Slot Grid Preview */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 lg:col-span-2 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Sensor Grid Matrix
              </h3>
              <p className="text-xs text-slate-400">Click any bay in the grid to target it for simulation</p>
            </div>
            <button
              onClick={fetchSlotsAndLogs}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
              title="Refresh Grid"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[460px] overflow-y-auto p-1">
            {slots.map((slot) => {
              const isSelected = slot.id === Number(selectedSlotId);
              const colorClass =
                slot.status === 'AVAILABLE'
                  ? 'border-emerald-500/50 bg-emerald-950/20 text-emerald-400'
                  : slot.status === 'OCCUPIED'
                  ? 'border-red-500/50 bg-red-950/20 text-red-400'
                  : slot.status === 'RESERVED'
                  ? 'border-amber-500/50 bg-amber-950/20 text-amber-400'
                  : 'border-slate-700 bg-slate-950/40 text-slate-500';

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setSelectedSlotId(slot.id.toString())}
                  className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between h-24 ${colorClass} ${
                    isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105' : 'hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{slot.slotNumber}</span>
                    <span className="text-[10px] opacity-80">F{slot.floorNumber}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider block">{slot.status}</span>
                    <span className="text-[9px] opacity-70 truncate block">{slot.locationName}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sensor Event Logs Trail */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">Recent Simulated Sensor Events Log</h3>
          <p className="text-xs text-slate-400">Audit trail of occupancy transitions injected into the system</p>
        </div>

        {auditLogs.length > 0 ? (
          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-bold text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-300">{log.description}</span>
                </div>
                <span className="text-slate-500 text-[11px] shrink-0">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-6">No sensor events recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default SensorSimulatorPage;
