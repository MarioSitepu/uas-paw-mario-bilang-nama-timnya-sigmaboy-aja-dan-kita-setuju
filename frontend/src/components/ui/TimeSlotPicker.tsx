import React from 'react';
import type { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelect: (time: string) => void;
  className?: string;
  label?: string;
  isLoading?: boolean;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedTime,
  onSelect,
  className = '',
  label,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 bg-slate-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
        <p className="text-sm text-slate-500 py-4">No available time slots</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => slot.available && onSelect(slot.time)}
            disabled={!slot.available}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${
                selectedTime === slot.time
                  ? 'bg-pastel-blue-500 text-white shadow-md'
                  : slot.available
                  ? 'bg-white text-slate-700 border border-slate-300 hover:border-pastel-blue-500 hover:bg-pastel-blue-50'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              }
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
};

