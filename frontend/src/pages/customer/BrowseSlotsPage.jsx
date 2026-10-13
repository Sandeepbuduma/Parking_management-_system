import React, { useState, useEffect } from 'react';
import { locationsApi, slotsApi } from '../../services/api';
import FloorLayout from '../../components/parking/FloorLayout';
import ReservationModal from '../../components/parking/ReservationModal';
import { MapPin, RefreshCw, SquareParking, CheckCircle2 } from 'lucide-react';

export const BrowseSlotsPage = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotForBooking, setSelectedSlotForBooking] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (selectedLocationId) {
      fetchSlots(selectedLocationId);
    }
  }, [selectedLocationId]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await locationsApi.getActive();
      setLocations(res.data);
      if (res.data.length > 0) {
        setSelectedLocationId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async (locId) => {
    try {
      const res = await locationsApi.getSlots(locId);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to load slots', err);
    }
  };

  const currentLocation = locations.find((l) => l.id === selectedLocationId);

  const handleSelectSlot = (slot) => {
    setSelectedSlotForBooking(slot);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Slot Explorer</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Find & Reserve Parking Spots</h1>
          <p className="text-xs text-slate-400">Click any available (green) slot to book your space.</p>
        </div>

        {/* Location selector dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Location:</label>
          <select
            value={selectedLocationId || ''}
            onChange={(e) => setSelectedLocationId(Number(e.target.value))}
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.availableSlots} free)
              </option>
            ))}
          </select>

          <button
            onClick={() => selectedLocationId && fetchSlots(selectedLocationId)}
            title="Refresh slots"
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Floor Layout */}
      <FloorLayout
        slots={slots}
        onSelectSlot={handleSelectSlot}
        selectedSlot={selectedSlotForBooking}
        totalFloors={currentLocation?.totalFloors || 1}
      />

      {/* Reservation Dialog */}
      {selectedSlotForBooking && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSlotForBooking(null);
          }}
          slot={selectedSlotForBooking}
          onReservationSuccess={() => {
            fetchSlots(selectedLocationId);
          }}
        />
      )}
    </div>
  );
};

export default BrowseSlotsPage;
