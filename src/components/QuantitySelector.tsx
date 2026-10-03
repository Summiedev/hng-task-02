import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  compact?: boolean;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({ value, onChange, max = 99, label = 'Quantity', compact = false }) => (
  <div className={`inline-flex items-center border border-[#cfc4b3] bg-[#fffaf2] ${compact ? 'h-9' : 'h-12'}`} aria-label={label}>
    <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="flex h-full w-9 items-center justify-center text-[#4d5649] transition hover:bg-[#eee6d9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]" aria-label={`Decrease ${label}`}>
      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
    <span className={`${compact ? 'w-7 text-xs' : 'w-9 text-sm'} text-center font-bold`} aria-live="polite">{value}</span>
    <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="flex h-full w-9 items-center justify-center text-[#4d5649] transition hover:bg-[#eee6d9] disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b8472e]" aria-label={`Increase ${label}`}>
      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
    </button>
  </div>
);
