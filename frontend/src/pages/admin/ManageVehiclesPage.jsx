import React, { useState, useEffect } from 'react';
import { vehiclesApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import { Car, Bike, Zap, User } from 'lucide-react';

export const ManageVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await vehiclesApi.getAll();
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to load all vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'License Plate',
      accessor: 'registrationNumber',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg">
          {row.registrationNumber}
        </span>
      ),
    },
    {
      header: 'Owner',
      accessor: 'userFullName',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-white">
          <User className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.userFullName}</span>
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: 'vehicleType',
      sortable: true,
      render: (row) => {
        const Icon = row.vehicleType === 'TWO_WHEELER' ? Bike : row.vehicleType === 'EV' ? Zap : Car;
        return (
          <span className="inline-flex items-center gap-1 text-xs text-slate-300">
            <Icon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="capitalize">{row.vehicleType.replace('_', ' ')}</span>
          </span>
        );
      },
    },
    {
      header: 'Make & Model',
      accessor: 'make',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-300">
          {row.make || 'Standard'} {row.model || ''}
        </span>
      ),
    },
    {
      header: 'Color',
      accessor: 'color',
      render: (row) => <span className="text-xs text-slate-400">{row.color || 'N/A'}</span>,
    },
    {
      header: 'Registered On',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Fleet Inventory</span>
        <h1 className="text-2xl font-black text-white mt-0.5">All Registered Vehicles</h1>
        <p className="text-xs text-slate-400">Database of customer vehicles registered across all accounts.</p>
      </div>

      <DataTable
        columns={columns}
        data={vehicles}
        searchPlaceholder="Search license plate, owner, or make..."
        emptyMessage="No vehicles registered in system."
      />
    </div>
  );
};

export default ManageVehiclesPage;
