import React from 'react';
import type { TimeSlot } from '../../types';

interface TimeSlotPickerProps {
  slots: TimeSlot[];
  selectedTime?: string;
  onSelect: (time: string) => void;
  className?: string;
  label?: string;
  isLoading?: boolean;
  selectedDate?: string; // To check if time has passed for today
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  slots,
  selectedTime,
  onSelect,
  className = '',
  label,
  isLoading = false,
  selectedDate,
}) => {
  // Check if a time slot has passed (for today only)
  const isTimePast = (time: string): boolean => {
    if (!selectedDate) return false;
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);
    
    return slotTime < now;
  };
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
        {slots.map((slot) => {
          const isPast = isTimePast(slot.time);
          const isDisabled = !slot.available || isPast;
          
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => !isDisabled && onSelect(slot.time)}
              disabled={isDisabled}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  selectedTime === slot.time
                    ? 'bg-pastel-blue-500 text-white shadow-md'
                    : isDisabled
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-pastel-blue-500 hover:bg-pastel-blue-50'
                }
              `}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};

