import React, { useState, useEffect } from 'react';
import { dashboardApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Users, UserCheck, UserX, Mail, Phone, Calendar } from 'lucide-react';

export const ManageCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await dashboardApi.getCustomers();
      setCustomers(res.data);
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await dashboardApi.toggleCustomerStatus(id);
      setCustomers((prev) => prev.map((c) => (c.id === id ? res.data : c)));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const columns = [
    {
      header: 'Customer ID',
      accessor: 'id',
      sortable: true,
      render: (row) => <span className="font-mono text-slate-400 text-xs">#{row.id}</span>,
    },
    {
      header: 'Full Name',
      accessor: 'fullName',
      sortable: true,
      render: (row) => <span className="font-bold text-white text-xs">{row.fullName}</span>,
    },
    {
      header: 'Email',
      accessor: 'email',
      sortable: true,
      render: (row) => (
        <span className="text-slate-300 text-xs flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400" />
          {row.email}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: 'phone',
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {row.phone || 'Not provided'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'enabled',
      sortable: true,
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
            row.enabled
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-red-500/20 text-red-400 border-red-500/40'
          }`}
        >
          {row.enabled ? 'Active Account' : 'Suspended'}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      accessor: 'createdAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Account Actions',
      accessor: 'id',
      render: (row) => (
        <button
          onClick={() => handleToggleStatus(row.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
            row.enabled
              ? 'bg-red-950/40 hover:bg-red-900/50 text-red-400 border border-red-500/20'
              : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {row.enabled ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          <span>{row.enabled ? 'Suspend' : 'Activate'}</span>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">User Directory</span>
        <h1 className="text-2xl font-black text-white mt-0.5">Registered Customers</h1>
        <p className="text-xs text-slate-400">Review all registered customer accounts and toggle access status.</p>
      </div>

      <DataTable
        columns={columns}
        data={customers}
        searchPlaceholder="Search customer name or email..."
        emptyMessage="No customer accounts registered."
      />
    </div>
  );
};

export default ManageCustomersPage;
