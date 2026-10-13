import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Receipt, DollarSign, CreditCard, ShieldCheck } from 'lucide-react';

export const BillingTransactionsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.getAllAdmin();
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load admin payments', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCollected = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const columns = [
    {
      header: 'Txn Reference',
      accessor: 'transactionReference',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-white text-xs">{row.transactionReference}</span>
      ),
    },
    {
      header: 'Booking Ref',
      accessor: 'bookingReference',
      sortable: true,
      render: (row) => (
        <span className="font-mono text-emerald-400 text-xs">{row.bookingReference}</span>
      ),
    },
    {
      header: 'Customer',
      accessor: 'customerName',
      sortable: true,
      render: (row) => <span className="font-semibold text-white text-xs">{row.customerName}</span>,
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-emerald-400 text-xs">${Number(row.amount).toFixed(2)}</span>
      ),
    },
    {
      header: 'Method',
      accessor: 'paymentMethod',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-300 flex items-center gap-1.5">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      sortable: true,
      render: (row) => <Badge status={row.paymentStatus} />,
    },
    {
      header: 'Payment Date',
      accessor: 'paidAt',
      sortable: true,
      render: (row) => (
        <span className="text-xs text-slate-400">
          {new Date(row.paidAt || row.createdAt).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Finance & Auditing</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Billing & Transaction Records</h1>
          <p className="text-xs text-slate-400">Complete audit log of customer parking payments and fee settlements.</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-right self-start sm:self-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Total System Revenue</span>
          <p className="text-2xl font-black text-emerald-400">${totalCollected.toFixed(2)}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search by transaction reference or customer..."
        emptyMessage="No payments recorded."
      />
    </div>
  );
};

export default BillingTransactionsPage;
