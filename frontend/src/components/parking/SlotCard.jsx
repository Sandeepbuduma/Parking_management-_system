import React from 'react';
import { Car, Bike, Zap, AlertTriangle, Clock, CheckCircle2, Ban } from 'lucide-react';

const statusConfig = {
  AVAILABLE: {
    border: 'border-emerald-500/50 hover:border-emerald-400',
    bg: 'bg-emerald-950/20 hover:bg-emerald-950/40',
    indicator: 'bg-emerald-500',
    text: 'text-emerald-400',
    badge: 'Available',
    icon: CheckCircle2,
    badgeBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  },
  OCCUPIED: {
    border: 'border-red-500/50 hover:border-red-400',
    bg: 'bg-red-950/20',
    indicator: 'bg-red-500',
    text: 'text-red-400',
    badge: 'Occupied',
    icon: Car,
    badgeBg: 'bg-red-500/20 text-red-400 border-red-500/40',
  },
  RESERVED: {
    border: 'border-amber-500/50 hover:border-amber-400',
    bg: 'bg-amber-950/20',
    indicator: 'bg-amber-500',
    text: 'text-amber-400',
    badge: 'Reserved',
    icon: Clock,
    badgeBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  MAINTENANCE: {
    border: 'border-slate-600/60',
    bg: 'bg-slate-900/60 opacity-60',
    indicator: 'bg-slate-500',
    text: 'text-slate-400',
    badge: 'Disabled',
    icon: Ban,
    badgeBg: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
  },
};

export const SlotCard = ({ slot, onSelect, isSelected = false, showLocation = false }) => {
  const cfg = statusConfig[slot.status] || statusConfig.MAINTENANCE;

  const VehicleIcon =
    slot.vehicleType === 'TWO_WHEELER'
      ? Bike
      : slot.vehicleType === 'EV'
      ? Zap
      : Car;

  const isClickable = slot.status === 'AVAILABLE' && onSelect;

  return (
    <div
      onClick={() => isClickable && onSelect(slot)}
      className={`relative rounded-xl border p-4 transition-all duration-200 select-none ${cfg.border} ${cfg.bg} ${
        isClickable ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]' : 'cursor-default'
      } ${isSelected ? 'ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-900' : ''}`}
    >
      {/* Top Header: Slot Number & Status Pill */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${cfg.indicator} animate-pulse`} />
          <h4 className="font-bold text-base text-white tracking-wide">{slot.slotNumber}</h4>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${cfg.badgeBg}`}>
          {cfg.badge}
        </span>
      </div>

      {/* Middle info */}
      <div className="space-y-1.5 text-xs text-slate-300">
        {showLocation && slot.locationName && (
          <p className="text-slate-400 truncate">
            <span className="text-slate-500">Location:</span> {slot.locationName}
          </p>
        )}
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-200 font-medium">
            <VehicleIcon className="w-3.5 h-3.5 text-emerald-400" />
            {slot.vehicleType === 'TWO_WHEELER' ? '2-Wheeler' : slot.vehicleType === 'EV' ? 'EV Charging' : '4-Wheeler'}
          </span>
          <span className="text-slate-400">Floor {slot.floorNumber}</span>
        </div>
      </div>

      {/* Bottom Rate & Action */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-base font-extrabold text-white">${slot.hourlyRate}</span>
          <span className="text-[10px] text-slate-400"> / hr</span>
        </div>
        {isClickable ? (
          <button
            type="button"
            className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            Reserve
          </button>
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">
            {slot.status === 'AVAILABLE' ? 'Selectable' : 'Unavailable'}
          </span>
        )}
      </div>
    </div>
  );
};

export default SlotCard;
