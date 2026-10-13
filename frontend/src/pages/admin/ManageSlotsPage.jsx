import React, { useState, useEffect } from 'react';
import { slotsApi, locationsApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { SquareParking, Plus, Edit2, Trash2, Filter, Layers, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ManageSlotsPage = () => {
  const [slots, setSlots] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    locationId: '',
    slotNumber: '',
    floorNumber: 1,
    vehicleType: 'FOUR_WHEELER',
    hourlyRate: '20.00',
    status: 'AVAILABLE',
  });

  useEffect(() => {
    fetchLocationsAndSlots();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedLocationId, selectedStatus, selectedType]);

  const fetchLocationsAndSlots = async () => {
    setLoading(true);
    try {
      const locRes = await locationsApi.getAll();
      setLocations(locRes.data);
      const slotRes = await slotsApi.getFiltered();
      setSlots(slotRes.data);
    } catch (err) {
      console.error('Failed to load slots', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSlots = async () => {
    try {
      const params = {};
      if (selectedLocationId) params.locationId = selectedLocationId;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedType) params.vehicleType = selectedType;
      const res = await slotsApi.getFiltered(params);
      setSlots(res.data);
    } catch (err) {
      console.error('Failed to filter slots', err);
    }
  };

  const handleOpenAdd = () => {
    setEditingSlot(null);
    setForm({
      locationId: locations[0]?.id || '',
      slotNumber: '',
      floorNumber: 1,
      vehicleType: 'FOUR_WHEELER',
      hourlyRate: '20.00',
      status: 'AVAILABLE',
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);
    setForm({
      locationId: slot.locationId,
      slotNumber: slot.slotNumber,
      floorNumber: slot.floorNumber,
      vehicleType: slot.vehicleType,
      hourlyRate: String(slot.hourlyRate),
      status: slot.status,
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this parking slot?')) return;
    try {
      await slotsApi.delete(id);
      setMessage({ type: 'success', text: 'Slot removed successfully.' });
      fetchSlots();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cannot delete slot with active reservations.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        locationId: Number(form.locationId),
        floorNumber: Number(form.floorNumber),
        hourlyRate: Number(form.hourlyRate),
      };

      if (editingSlot) {
        await slotsApi.update(editingSlot.id, payload);
        setMessage({ type: 'success', text: 'Slot updated successfully!' });
      } else {
        await slotsApi.create(payload);
        setMessage({ type: 'success', text: 'Slot created successfully!' });
      }
      setIsModalOpen(false);
      fetchSlots();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Bay Inventory</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Parking Slot Management</h1>
          <p className="text-xs text-slate-400">Manage individual parking bays, rates, and occupancy states.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slot</span>
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

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-wrap items-center gap-3">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Filter by:
        </span>

        <select
          value={selectedLocationId}
          onChange={(e) => setSelectedLocationId(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="">All Facilities</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="">All Vehicle Types</option>
          <option value="FOUR_WHEELER">4-Wheeler</option>
          <option value="TWO_WHEELER">2-Wheeler</option>
          <option value="EV">Electric Vehicle (EV)</option>
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">AVAILABLE (Green)</option>
          <option value="OCCUPIED">OCCUPIED (Red)</option>
          <option value="RESERVED">RESERVED (Amber)</option>
          <option value="MAINTENANCE">MAINTENANCE (Gray)</option>
        </select>
      </div>

      {/* Slots Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">Slot Number</th>
                <th className="px-4 py-3.5">Facility Location</th>
                <th className="px-4 py-3.5">Floor</th>
                <th className="px-4 py-3.5">Vehicle Type</th>
                <th className="px-4 py-3.5">Hourly Rate</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {slots.length > 0 ? (
                slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3.5 font-bold font-mono text-white text-sm">{slot.slotNumber}</td>
                    <td className="px-4 py-3.5 text-slate-200">{slot.locationName}</td>
                    <td className="px-4 py-3.5">Floor {slot.floorNumber}</td>
                    <td className="px-4 py-3.5 capitalize">{slot.vehicleType.replace('_', ' ')}</td>
                    <td className="px-4 py-3.5 font-bold text-emerald-400">${slot.hourlyRate}/hr</td>
                    <td className="px-4 py-3.5">
                      <Badge status={slot.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(slot)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                        title="Edit slot"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(slot.id)}
                        className="p-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 rounded-lg transition"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-slate-500">
                    No parking slots found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSlot ? 'Edit Parking Slot' : 'Add Parking Slot'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Location</label>
            <select
              value={form.locationId}
              onChange={(e) => setForm({ ...form, locationId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              required
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} (Max floors: {loc.totalFloors})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Slot Identifier</label>
              <input
                type="text"
                required
                value={form.slotNumber}
                onChange={(e) => setForm({ ...form, slotNumber: e.target.value.toUpperCase() })}
                placeholder="e.g. A-101"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Floor Level</label>
              <input
                type="number"
                min="1"
                required
                value={form.floorNumber}
                onChange={(e) => setForm({ ...form, floorNumber: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Type</label>
              <select
                value={form.vehicleType}
                onChange={(e) => setForm({ ...form, vehicleType: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="FOUR_WHEELER">4-Wheeler (Car/SUV)</option>
                <option value="TWO_WHEELER">2-Wheeler (Bike)</option>
                <option value="EV">Electric Vehicle (EV)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Hourly Rate ($)</label>
              <input
                type="number"
                step="0.50"
                min="0"
                required
                value={form.hourlyRate}
                onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="AVAILABLE">AVAILABLE (Green)</option>
              <option value="OCCUPIED">OCCUPIED (Red)</option>
              <option value="RESERVED">RESERVED (Amber)</option>
              <option value="MAINTENANCE">MAINTENANCE (Disabled/Gray)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition"
            >
              {editingSlot ? 'Update Slot' : 'Create Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageSlotsPage;
