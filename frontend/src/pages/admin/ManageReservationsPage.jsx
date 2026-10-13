import React, { useState, useEffect } from 'react';
import { reservationsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { CalendarCheck, Edit2, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ManageReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetReservation, setTargetReservation] = useState(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, [selectedStatus]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedStatus) params.status = selectedStatus;
      const res = await reservationsApi.getAllAdmin(params);
      setReservations(res.data);
    } catch (err) {
      console.error('Failed to load reservations', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenStatusModal = (res) => {
    setTargetReservation(res);
    setNewStatus(res.status);
    setMessage(null);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await reservationsApi.updateStatusAdmin(targetReservation.id, { status: newStatus });
      setMessage({ type: 'success', text: `Updated status to ${newStatus}` });
      setIsModalOpen(false);
      fetchReservations();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    }
  };

  const columns = [
    {
      header: 'Booking Ref',
      accessor: 'bookingReference',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs">{row.bookingReference}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'userFullName',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white text-xs">{row.userFullName}</p>
          <p className="text-[10px] text-slate-400">{row.userEmail}</p>
        </div>
      ),
    },
    {
      header: 'Facility & Slot',
      accessor: 'slotNumber',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-white text-xs">Slot {row.slotNumber} (F{row.floorNumber})</span>
          <p className="text-[10px] text-slate-400">{row.locationName}</p>
        </div>
      ),
    },
    {
      header: 'Vehicle',
      accessor: 'vehicleRegistration',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-mono font-bold text-emerald-400 text-xs">{row.vehicleRegistration}</span>
          <span className="text-[10px] text-slate-400 block capitalize">{row.vehicleType}</span>
        </div>
      ),
    },
    {
      header: 'Start / End',
      accessor: 'startTime',
      sortable: true,
      render: (row) => (
        <div className="text-[11px] text-slate-300">
          <p>{new Date(row.startTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
          <p className="text-slate-500">to {new Date(row.endTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p>
        </div>
      ),
    },
    {
      header: 'Charges',
      accessor: 'estimatedAmount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-emerald-400 text-xs">
          ${row.finalAmount || row.estimatedAmount}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'Action',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={() => handleOpenStatusModal(row)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
          title="Update Status"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Bookings Control</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Reservations Management</h1>
          <p className="text-xs text-slate-400">Search, filter, inspect, and update customer reservations.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
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

      <DataTable
        columns={columns}
        data={reservations}
        searchPlaceholder="Search customer, vehicle, or reference..."
        emptyMessage="No reservations found."
      />

      {/* Status Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Override Reservation Status"
      >
        {targetReservation && (
          <form onSubmit={handleUpdateStatus} className="space-y-4">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <p>Reference: <strong className="text-white">{targetReservation.bookingReference}</strong></p>
              <p>Customer: <strong className="text-white">{targetReservation.userFullName}</strong></p>
              <p>Slot: <strong className="text-white">{targetReservation.slotNumber}</strong></p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white"
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="ACTIVE">ACTIVE (Check-in)</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
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
                Confirm Status
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ManageReservationsPage;
