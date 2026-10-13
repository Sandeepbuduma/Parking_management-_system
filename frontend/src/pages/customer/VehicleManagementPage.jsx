import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../../services/api';
import Modal from '../../components/common/Modal';
import { Car, Bike, Zap, Plus, Trash2, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';

export const VehicleManagementPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    registrationNumber: '',
    vehicleType: 'FOUR_WHEELER',
    make: '',
    model: '',
    color: '',
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getMy();
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingVehicle(null);
    setFormData({
      registrationNumber: '',
      vehicleType: 'FOUR_WHEELER',
      make: '',
      model: '',
      color: '',
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v) => {
    setEditingVehicle(v);
    setFormData({
      registrationNumber: v.registrationNumber,
      vehicleType: v.vehicleType,
      make: v.make || '',
      model: v.model || '',
      color: v.color || '',
    });
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehiclesApi.delete(id);
      setMessage({ type: 'success', text: 'Vehicle deleted successfully.' });
      fetchVehicles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cannot delete vehicle linked to existing bookings.' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await vehiclesApi.update(editingVehicle.id, formData);
        setMessage({ type: 'success', text: 'Vehicle updated successfully!' });
      } else {
        await vehiclesApi.add(formData);
        setMessage({ type: 'success', text: 'Vehicle registered successfully!' });
      }
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Operation failed.' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Garage</span>
          <h1 className="text-2xl font-black text-white mt-0.5">My Registered Vehicles</h1>
          <p className="text-xs text-slate-400">Add and manage your cars, motorcycles, and electric vehicles.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-center shadow-lg shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
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
        <div className="p-16 text-center text-slate-400">Loading vehicles...</div>
      ) : vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.map((v) => {
            const Icon = v.vehicleType === 'TWO_WHEELER' ? Bike : v.vehicleType === 'EV' ? Zap : Car;

            return (
              <div
                key={v.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition shadow-xl space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-slate-950 text-emerald-400 border border-slate-800">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 capitalize">
                      {v.vehicleType.replace('_', ' ')}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-mono font-black text-white">{v.registrationNumber}</h3>
                    <p className="text-xs text-slate-300 font-medium mt-1">
                      {v.make || 'Standard'} {v.model || 'Model'}
                    </p>
                    <p className="text-[11px] text-slate-500">Color: {v.color || 'Unspecified'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEdit(v)}
                    className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-2 text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/20 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
          <Car className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Vehicles Registered</h3>
          <p className="text-xs text-slate-400">Register your vehicle plate to reserve parking slots smoothly.</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition inline-block mt-2"
          >
            Register Vehicle
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVehicle ? 'Edit Vehicle' : 'Register Vehicle'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Plate / Registration Number</label>
            <input
              type="text"
              required
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value.toUpperCase() })}
              placeholder="e.g. CA-9922-TX"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Vehicle Classification</label>
            <select
              value={formData.vehicleType}
              onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            >
              <option value="FOUR_WHEELER">4-Wheeler (Car / SUV)</option>
              <option value="TWO_WHEELER">2-Wheeler (Motorcycle / Scooter)</option>
              <option value="EV">Electric Vehicle (EV)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Make</label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="Tesla, Toyota..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Model</label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="Model 3, Camry..."
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Color</label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              placeholder="Midnight Silver, White..."
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
            />
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
              {editingVehicle ? 'Update Vehicle' : 'Register Vehicle'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VehicleManagementPage;
