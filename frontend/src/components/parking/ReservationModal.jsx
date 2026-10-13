import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { vehiclesApi, reservationsApi } from '../../services/api';
import { Calendar, Clock, DollarSign, Car, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

export const ReservationModal = ({ isOpen, onClose, slot, onReservationSuccess }) => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddVehicle, setShowAddVehicle] = useState(false);

  // New vehicle inline form states
  const [newReg, setNewReg] = useState('');
  const [newMake, setNewMake] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newColor, setNewColor] = useState('');
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Setup default start and end times when modal opens
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setShowAddVehicle(false);
      const now = new Date();
      // Start 5 minutes from now
      now.setMinutes(now.getMinutes() + 5);
      const startIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      // End 2 hours after start
      const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const endIso = new Date(end.getTime() - end.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setStartTime(startIso);
      setEndTime(endIso);

      fetchVehicles();
    }
  }, [isOpen, slot]);

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getMy();
      setVehicles(res.data);
      // Auto-select first matching vehicle if available
      if (slot && res.data.length > 0) {
        const matching = res.data.find((v) => v.vehicleType === slot.vehicleType);
        if (matching) {
          setSelectedVehicleId(matching.id);
        } else {
          setSelectedVehicleId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    }
  };

  const handleCreateVehicle = async (e) => {
    e.preventDefault();
    if (!newReg.trim()) return;
    setSavingVehicle(true);
    setError(null);
    try {
      const res = await vehiclesApi.add({
        registrationNumber: newReg.trim().toUpperCase(),
        vehicleType: slot?.vehicleType || 'FOUR_WHEELER',
        make: newMake.trim(),
        model: newModel.trim(),
        color: newColor.trim(),
      });
      setVehicles((prev) => [...prev, res.data]);
      setSelectedVehicleId(res.data.id);
      setShowAddVehicle(false);
      setNewReg('');
      setNewMake('');
      setNewModel('');
      setNewColor('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle');
    } finally {
      setSavingVehicle(false);
    }
  };

  // Calculate live billing duration & price
  const billingEstimate = useMemo(() => {
    if (!startTime || !endTime || !slot) return { hours: 0, total: '0.00' };

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) return { hours: 0, total: '0.00', invalid: true };

    const diffMinutes = Math.max(0, (end - start) / (1000 * 60));
    const hours = Math.max(1, Math.ceil(diffMinutes / 60));
    const total = (Number(slot.hourlyRate) * hours).toFixed(2);

    return { hours, total, diffMinutes, invalid: false };
  }, [startTime, endTime, slot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      setError('Please select or register a vehicle');
      return;
    }
    if (billingEstimate.invalid) {
      setError('End time must be after start time');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        vehicleId: Number(selectedVehicleId),
        slotId: slot.id,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const res = await reservationsApi.create(payload);
      if (onReservationSuccess) {
        onReservationSuccess(res.data);
      }
      onClose();
      navigate('/customer/reservations');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reserve parking slot. Please try another time.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!slot) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reserve Parking Slot" maxWidth="max-w-xl">
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-red-400 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Selected Slot Overview Banner */}
      <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-5 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">Selected Spot</span>
          <h4 className="text-xl font-bold text-white mt-0.5">{slot.slotNumber}</h4>
          <p className="text-xs text-slate-400">
            Floor {slot.floorNumber} • {slot.locationName || 'Main Facility'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400">Rate</span>
          <p className="text-xl font-bold text-emerald-400">${slot.hourlyRate}/hr</p>
          <span className="text-[10px] text-slate-400 capitalize">{slot.vehicleType?.replace('_', ' ')}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vehicle Selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-emerald-400" />
              Select Vehicle
            </label>
            <button
              type="button"
              onClick={() => setShowAddVehicle(!showAddVehicle)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              {showAddVehicle ? 'Select Existing' : 'Add New Vehicle'}
            </button>
          </div>

          {!showAddVehicle ? (
            <div>
              {vehicles.length > 0 ? (
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose a Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registrationNumber} ({v.make} {v.model}) - {v.vehicleType}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center justify-between">
                  <span>No vehicles registered yet.</span>
                  <button
                    type="button"
                    onClick={() => setShowAddVehicle(true)}
                    className="font-bold underline text-amber-400 hover:text-white"
                  >
                    Add One Now
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Quick Add Vehicle Form */
            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl space-y-3">
              <p className="text-xs font-semibold text-white">Add New Vehicle</p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Plate Number (e.g. CA-1234)"
                  value={newReg}
                  onChange={(e) => setNewReg(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
                <input
                  type="text"
                  placeholder="Make (e.g. Toyota)"
                  value={newMake}
                  onChange={(e) => setNewMake(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Model (e.g. Camry)"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
                <input
                  type="text"
                  placeholder="Color (e.g. Black)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <button
                type="button"
                onClick={handleCreateVehicle}
                disabled={savingVehicle || !newReg.trim()}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition"
              >
                {savingVehicle ? 'Saving Vehicle...' : 'Save & Select Vehicle'}
              </button>
            </div>
          )}
        </div>

        {/* Date Time Range Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Start Time
            </label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              End Time
            </label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        {/* Estimated Charges Card */}
        <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Estimated Duration:</span>
            <p className="text-sm font-semibold text-white">
              {billingEstimate.hours} hr(s)
            </p>
            <span className="text-[10px] text-slate-500">Min 1 hr rounded billing rule</span>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400">Total Estimated Fee:</span>
            <p className="text-2xl font-black text-emerald-400">
              ${billingEstimate.total}
            </p>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || billingEstimate.invalid || !selectedVehicleId}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Confirm Reservation
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationModal;
