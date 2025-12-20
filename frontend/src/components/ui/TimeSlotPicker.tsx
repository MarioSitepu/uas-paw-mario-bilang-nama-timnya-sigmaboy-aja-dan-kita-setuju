import React from 'react';
import type { TimeSlot } from '../../types';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

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
  const availableSlots = slots.filter(slot => slot.available);
  const unavailableSlots = slots.filter(slot => !slot.available);

  if (isLoading) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
        <div className="flex items-center gap-2 text-slate-500 py-4">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          <span className="text-sm">Memuat jam yang tersedia...</span>
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className={className}>
        {label && <label className="block text-sm font-medium text-slate-700 mb-2">{label}</label>}
        <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 text-center">
          <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-700 mb-1">Tidak ada jam tersedia</p>
          <p className="text-xs text-slate-500">Silakan pilih tanggal lain atau dokter lain</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label} <span className="text-red-500">*</span>
        </label>
      )}
      
      {/* Info jumlah slot tersedia */}
      {availableSlots.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span>{availableSlots.length} jam tersedia</span>
          {unavailableSlots.length > 0 && (
            <span className="text-slate-400">• {unavailableSlots.length} sudah terisi</span>
          )}
        </div>
      )}

      {/* Grid slot waktu */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.available;
          
          return (
            <button
              key={slot.time}
              type="button"
              onClick={() => isAvailable && onSelect(slot.time)}
              disabled={!isAvailable}
              className={`
                relative px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                flex items-center justify-center gap-1
                ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 scale-105 ring-2 ring-blue-500 ring-offset-2'
                    : isAvailable
                    ? 'bg-white text-slate-700 border-2 border-slate-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md hover:scale-105 active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed border-2 border-slate-200 opacity-60'
                }
              `}
              title={isAvailable ? `Pilih jam ${slot.time}` : `Jam ${slot.time} sudah terisi`}
            >
              {isSelected && <CheckCircle2 className="w-4 h-4" />}
              {!isAvailable && !isSelected && <XCircle className="w-4 h-4" />}
              <span className={isSelected ? 'font-bold' : ''}>{slot.time}</span>
            </button>
          );
        })}
      </div>

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-600"></div>
          <span>Terpilih</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-white border-2 border-slate-300"></div>
          <span>Tersedia</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border-2 border-slate-200"></div>
          <span>Terisi</span>
        </div>
      </div>
    </div>
  );
};

