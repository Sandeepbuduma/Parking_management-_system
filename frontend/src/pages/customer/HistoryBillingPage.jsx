import React, { useState, useEffect } from 'react';
import { paymentsApi, sessionsApi } from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Badge from '../../components/common/Badge';
import { Receipt, DollarSign, Calendar, Clock, CreditCard, CheckCircle2 } from 'lucide-react';

export const HistoryBillingPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await paymentsApi.getMy();
      setPayments(res.data);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

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
      header: 'Amount Paid',
      accessor: 'amount',
      sortable: true,
      render: (row) => (
        <span className="font-extrabold text-white text-xs">${Number(row.amount).toFixed(2)}</span>
      ),
    },
    {
      header: 'Payment Method',
      accessor: 'paymentMethod',
      sortable: true,
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
          <span>{row.paymentMethod}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'paymentStatus',
      sortable: true,
      render: (row) => <Badge status={row.paymentStatus} />,
    },
    {
      header: 'Date & Time',
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
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Financial Records</span>
          <h1 className="text-2xl font-black text-white mt-0.5">Parking History & Billing</h1>
          <p className="text-xs text-slate-400">Review all past transactions, fees, and receipts.</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-right self-start sm:self-center">
          <span className="text-[10px] uppercase font-bold text-slate-400">Lifetime Parking Spend</span>
          <p className="text-xl font-black text-emerald-400">${totalPaid.toFixed(2)}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payments}
        searchPlaceholder="Search by transaction or booking reference..."
        emptyMessage="No billing records found."
      />
    </div>
  );
};

export default HistoryBillingPage;
