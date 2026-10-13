import React from 'react';

const colorStyles = {
  AVAILABLE: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  RESERVED: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  OCCUPIED: 'bg-red-500/15 text-red-400 border border-red-500/30',
  MAINTENANCE: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',

  CONFIRMED: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  ACTIVE: 'bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse',
  COMPLETED: 'bg-slate-500/15 text-slate-300 border border-slate-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
  PENDING: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  EXPIRED: 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/30',

  PAID: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  ADMIN: 'bg-purple-500/15 text-purple-400 border border-purple-500/30',
  CUSTOMER: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
};

export const Badge = ({ status, children, className = '' }) => {
  const normStatus = (status || '').toUpperCase();
  const style = colorStyles[normStatus] || 'bg-slate-800 text-slate-300 border border-slate-700';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${style} ${className}`}>
      {children || status}
    </span>
  );
};

export default Badge;
