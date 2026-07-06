'use client';

import { Minus, Plus } from 'lucide-react';

export interface Occupancy {
  adults: number;
  children: number;
  babies: number;
}

interface OccupancySelectorProps {
  value: Occupancy;
  onChange: (value: Occupancy) => void;
}

// Hotel occupancy rule: a room holds either 2 adults + up to 2 kids, or 3 adults + up to 1 kid.
const MAX_CHILDREN_BY_ADULTS: Record<number, number> = { 2: 2, 3: 1 };
const MAX_BABIES = 4;

function Stepper({ value, min, max, onDecrement, onIncrement }: {
  value: number;
  min: number;
  max: number;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-lg px-2 py-1.5">
      <button
        type="button"
        onClick={onDecrement}
        disabled={value <= min}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="font-bold text-slate-900">{value}</span>
      <button
        type="button"
        onClick={onIncrement}
        disabled={value >= max}
        className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export default function OccupancySelector({ value, onChange }: OccupancySelectorProps) {
  const { adults, children, babies } = value;
  const maxChildren = MAX_CHILDREN_BY_ADULTS[adults] ?? 0;

  const setAdults = (nextAdults: number) => {
    const nextMaxChildren = MAX_CHILDREN_BY_ADULTS[nextAdults] ?? 0;
    onChange({ adults: nextAdults, children: Math.min(children, nextMaxChildren), babies });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-500 uppercase">Adultes</label>
        <div className="flex gap-2">
          {[2, 3].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => setAdults(n)}
              className={`flex-1 px-3 py-2 rounded-lg border font-bold text-sm cursor-pointer ${
                adults === n
                  ? 'border-blue-600 bg-blue-50 text-blue-600'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-blue-300'
              }`}
            >
              {n} adultes
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Enfants (max {maxChildren})</label>
          <Stepper
            value={children}
            min={0}
            max={maxChildren}
            onDecrement={() => onChange({ adults, children: Math.max(0, children - 1), babies })}
            onIncrement={() => onChange({ adults, children: Math.min(maxChildren, children + 1), babies })}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-500 uppercase">Bébés</label>
          <Stepper
            value={babies}
            min={0}
            max={MAX_BABIES}
            onDecrement={() => onChange({ adults, children, babies: Math.max(0, babies - 1) })}
            onIncrement={() => onChange({ adults, children, babies: Math.min(MAX_BABIES, babies + 1) })}
          />
        </div>
      </div>
      <p className="text-[11px] text-slate-400 font-medium leading-snug">
        Une chambre accueille 2 adultes + 2 enfants max, ou 3 adultes + 1 enfant max. Les bébés ne sont pas comptabilisés dans cette occupation.
      </p>
    </div>
  );
}
