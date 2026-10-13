import React, { useState, useEffect } from 'react';
import { locationsApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import { MapPin, Plus, Edit2, Trash2, Clock, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ManageLocationsPage = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    name: '',
    address: '',
    description: '',
    totalFloors: 1,
    openingTime: '06:00',
    closingTime: '23:00',
    active: true,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await locationsApi.getAll();
      setLocations(res.data);
    } catch (err) {
      console.error('Failed to load locations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingLoc(null);
    setForm({
      name: '',
      address: '',
      description: '',
      totalFloors: 1,
      openingTime: '06:00',
      closingTime: '23:00',
      active: true,
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingLoc(loc);
    setForm({
      name: loc.name,
      address: loc.address,
      description: loc.description || '',
      totalFloors: loc.totalFloors,
      openingTime: loc.openingTime || '06:00',
      closingTime: loc.closingTime || '23:00',
      active: loc.active,
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete or deactivate this location?')) return;
    try {
      await locationsApi.delete(id);
      setMessage({ type: 'success', text: 'Location deleted or deactivated successfully.' });
      fetchLocations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Action failed.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoc) {
        await locationsApi.update(editingLoc.id, form);
        setMessage({ type: 'success', text: 'Location updated successfully!' });
      } else {
        await locationsApi.create(form);
        setMessage({ type: 'success', text: 'Location created successfully!' });
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Infrastructure</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Parking Locations Management</h1>
          <p className="text-xs text-slate-400">Configure parking garages, total floors, and operational hours.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Location</span>
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

      {loading ? (
        <div className="p-16 text-center text-slate-400">Loading locations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{loc.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {loc.address}
                    </p>
                  </div>
                  <Badge status={loc.active ? 'AVAILABLE' : 'MAINTENANCE'}>
                    {loc.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                  {loc.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Floors</p>
                    <p className="text-base font-bold text-white">{loc.totalFloors}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <p className="text-[10px] text-slate-400">Total Bays</p>
                    <p className="text-base font-bold text-white">{loc.totalSlots}</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                    <p className="text-[10px] text-emerald-400">Available</p>
                    <p className="text-base font-bold text-emerald-400">{loc.availableSlots}</p>
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hours: {loc.openingTime} - {loc.closingTime}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(loc)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(loc.id)}
                  className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove / Deactivate</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Location Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLoc ? 'Edit Parking Location' : 'Add Parking Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Facility Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Downtown Central Plaza"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Address</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="e.g. 100 Main St, City"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Facility features, access instructions..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Floors</label>
              <input
                type="number"
                min="1"
                required
                value={form.totalFloors}
                onChange={(e) => setForm({ ...form, totalFloors: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Opens</label>
              <input
                type="text"
                value={form.openingTime}
                onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                placeholder="06:00"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Closes</label>
              <input
                type="text"
                value={form.closingTime}
                onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                placeholder="23:30"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeToggle"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <label htmlFor="activeToggle" className="text-xs text-slate-300 font-medium">
              Location is Active & Open for Reservations
            </label>
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
              {editingLoc ? 'Save Changes' : 'Create Location'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageLocationsPage;
