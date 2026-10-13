import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', subtitle, className = '' }) => {
  const colorMap = {
    emerald: 'from-emerald-500/10 to-transparent border-emerald-500/30 text-emerald-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/30 text-blue-400',
    amber: 'from-amber-500/10 to-transparent border-amber-500/30 text-amber-400',
    red: 'from-red-500/10 to-transparent border-red-500/30 text-red-400',
    purple: 'from-purple-500/10 to-transparent border-purple-500/30 text-purple-400',
  };

  const currentTheme = colorMap[color] || colorMap.emerald;

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-slate-800/60 p-5 backdrop-blur-sm transition-all duration-200 hover:border-slate-600 bg-gradient-to-br ${currentTheme} ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mt-1 text-2xl font-bold tracking-tight text-white">{value}</h3>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-slate-900/60 p-3 ring-1 ring-white/10">
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
