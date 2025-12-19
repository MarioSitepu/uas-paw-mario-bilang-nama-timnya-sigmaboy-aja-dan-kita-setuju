import React from 'react';

interface DatePickerProps {
  id?: string;
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  min,
  max,
  className = '',
  label,
  required = false,
}) => {
  // Set min to today if not provided
  const minDate = min || new Date().toISOString().split('T')[0];
  const inputId = id || (label ? `date-picker-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id={inputId}
        name={inputId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={minDate}
        max={max}
        required={required}
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all"
      />
    </div>
  );
};

