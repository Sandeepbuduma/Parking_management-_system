import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationsApi, slotsApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FloorLayout from '../../components/parking/FloorLayout';
import ReservationModal from '../../components/parking/ReservationModal';
import { MapPin, Clock, Layers, ArrowLeft, RefreshCw, Car } from 'lucide-react';
import Badge from '../../components/common/Badge';

export const LocationsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
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
    setLoadingLocations(true);
    try {
      const res = await locationsApi.getActive();
      setLocations(res.data);
      if (res.data.length > 0) {
        setSelectedLocationId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoadingLocations(false);
    }
  };

  const fetchSlots = async (locId) => {
    setLoadingSlots(true);
    try {
      const res = await locationsApi.getSlots(locId);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const currentLocation = locations.find((l) => l.id === selectedLocationId);

  const handleSelectSlot = (slot) => {
    if (!isAuthenticated) {
      // Redirect to login with return path
      navigate('/login?redirect=/locations');
      return;
    }
    setSelectedSlotForBooking(slot);
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Interactive Bay Finder</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Parking Locations & Slot Layout</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select a facility below to inspect live floor vacancy and reserve available spots.
        </p>
      </div>

      {/* Location Selection Tabs */}
      <div className="flex flex-wrap gap-3">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocationId(loc.id)}
            className={`p-4 rounded-xl border text-left transition flex-1 min-w-[260px] ${
              selectedLocationId === loc.id
                ? 'bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-sm font-bold text-white truncate">{loc.name}</h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                {loc.availableSlots} Available
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
              {loc.address}
            </p>
            <div className="mt-2 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>{loc.totalFloors} Floors</span>
              <span>Hours: {loc.openingTime} - {loc.closingTime}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Location Details Card */}
      {currentLocation && (
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-400" />
              {currentLocation.name}
            </h2>
            <p className="text-xs text-slate-400">{currentLocation.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                {currentLocation.address}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                Operating: {currentLocation.openingTime} - {currentLocation.closingTime}
              </span>
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Total Floors: {currentLocation.totalFloors}
              </span>
            </div>
          </div>

          <button
            onClick={() => fetchSlots(selectedLocationId)}
            className="self-start md:self-center px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSlots ? 'animate-spin' : ''}`} />
            <span>Refresh Availability</span>
          </button>
        </div>
      )}

      {/* Interactive Floor Layout */}
      {loadingSlots ? (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-400">Loading interactive parking layout...</p>
        </div>
      ) : (
        <FloorLayout
          slots={slots}
          onSelectSlot={handleSelectSlot}
          selectedSlot={selectedSlotForBooking}
          totalFloors={currentLocation?.totalFloors || 1}
        />
      )}

      {/* Reservation Modal */}
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

export default LocationsPage;
