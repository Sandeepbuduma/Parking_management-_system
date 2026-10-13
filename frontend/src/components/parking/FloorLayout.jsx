import React, { useState, useMemo } from 'react';
import SlotCard from './SlotCard';
import { Layers, Filter, CheckCircle2, AlertCircle, Clock, Ban } from 'lucide-react';

export const FloorLayout = ({
  slots = [],
  onSelectSlot,
  selectedSlot = null,
  totalFloors = 1,
}) => {
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedVehicleType, setSelectedVehicleType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Compute floor numbers dynamically if not provided
  const floors = useMemo(() => {
    const floorSet = new Set(slots.map((s) => s.floorNumber));
    return Array.from(floorSet).sort((a, b) => a - b);
  }, [slots]);

  // Status statistics for legend
  const stats = useMemo(() => {
    return {
      available: slots.filter((s) => s.status === 'AVAILABLE').length,
      occupied: slots.filter((s) => s.status === 'OCCUPIED').length,
      reserved: slots.filter((s) => s.status === 'RESERVED').length,
      maintenance: slots.filter((s) => s.status === 'MAINTENANCE').length,
      total: slots.length,
    };
  }, [slots]);

  // Filter slots
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const matchFloor = selectedFloor === 'ALL' || slot.floorNumber === Number(selectedFloor);
      const matchType = selectedVehicleType === 'ALL' || slot.vehicleType === selectedVehicleType;
      const matchStatus = selectedStatus === 'ALL' || slot.status === selectedStatus;
      return matchFloor && matchType && matchStatus;
    });
  }, [slots, selectedFloor, selectedVehicleType, selectedStatus]);

  // Group by floor for rendering
  const groupedByFloor = useMemo(() => {
    const groups = {};
    filteredSlots.forEach((slot) => {
      const f = slot.floorNumber;
      if (!groups[f]) groups[f] = [];
      groups[f].push(slot);
    });
    return groups;
  }, [filteredSlots]);

  return (
    <div className="space-y-6">
      {/* Visual Status Legend & Live Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
            selectedStatus === 'AVAILABLE'
              ? 'bg-emerald-500/20 border-emerald-500/50'
              : 'border-slate-800 hover:bg-slate-900'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-emerald-500" />
          <div className="text-left">
            <p className="text-xs text-slate-400">Available</p>
            <p className="text-sm font-bold text-emerald-400">{stats.available} slots</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
          className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
            selectedStatus === 'OCCUPIED'
              ? 'bg-red-500/20 border-red-500/50'
              : 'border-slate-800 hover:bg-slate-900'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-red-500" />
          <div className="text-left">
            <p className="text-xs text-slate-400">Occupied</p>
            <p className="text-sm font-bold text-red-400">{stats.occupied} slots</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'RESERVED' ? 'ALL' : 'RESERVED')}
          className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
            selectedStatus === 'RESERVED'
              ? 'bg-amber-500/20 border-amber-500/50'
              : 'border-slate-800 hover:bg-slate-900'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="text-left">
            <p className="text-xs text-slate-400">Reserved</p>
            <p className="text-sm font-bold text-amber-400">{stats.reserved} slots</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatus(selectedStatus === 'MAINTENANCE' ? 'ALL' : 'MAINTENANCE')}
          className={`flex items-center gap-3 p-2.5 rounded-lg border transition ${
            selectedStatus === 'MAINTENANCE'
              ? 'bg-slate-500/20 border-slate-500/50'
              : 'border-slate-800 hover:bg-slate-900'
          }`}
        >
          <span className="w-3 h-3 rounded-full bg-slate-500" />
          <div className="text-left">
            <p className="text-xs text-slate-400">Disabled</p>
            <p className="text-sm font-bold text-slate-400">{stats.maintenance} slots</p>
          </div>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl">
        {/* Floor selection buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" /> Floor:
          </span>
          <button
            onClick={() => setSelectedFloor('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              selectedFloor === 'ALL'
                ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Floors
          </button>
          {floors.map((fl) => (
            <button
              key={fl}
              onClick={() => setSelectedFloor(fl.toString())}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedFloor === fl.toString()
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Floor {fl}
            </button>
          ))}
        </div>

        {/* Vehicle Type selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Type:
          </span>
          <select
            value={selectedVehicleType}
            onChange={(e) => setSelectedVehicleType(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="ALL">All Vehicle Types</option>
            <option value="FOUR_WHEELER">4-Wheeler (Car/SUV)</option>
            <option value="TWO_WHEELER">2-Wheeler (Bike/Scooter)</option>
            <option value="EV">Electric Vehicle (EV)</option>
          </select>
        </div>
      </div>

      {/* Grid of Slots Grouped by Floors */}
      {Object.keys(groupedByFloor).length > 0 ? (
        Object.keys(groupedByFloor)
          .sort((a, b) => Number(a) - Number(b))
          .map((floorNum) => (
            <div key={floorNum} className="p-5 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-white text-base">Level / Floor {floorNum}</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {groupedByFloor[floorNum].length} slots on this floor
                </span>
              </div>

              {/* Parking Bay Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {groupedByFloor[floorNum].map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    onSelect={onSelectSlot}
                    isSelected={selectedSlot?.id === slot.id}
                  />
                ))}
              </div>
            </div>
          ))
      ) : (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-xl">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-300">No Parking Slots Match Filter Criteria</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting the floor, vehicle type, or status filters.</p>
        </div>
      )}
    </div>
  );
};

export default FloorLayout;
