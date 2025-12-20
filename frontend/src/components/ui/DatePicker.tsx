import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  className?: string;
  label?: string;
  required?: boolean;
  id?: string;
  availableDates?: string[]; // Array of dates in YYYY-MM-DD format that ARE available
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  className = '',
  label,
  required = false,
  id: _id,
  availableDates = [],
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const minDate = min ? new Date(min) : new Date();
  const maxDate = max ? new Date(max) : null;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateAvailable = (dateStr: string) => {
    return availableDates.includes(dateStr);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Parse YYYY-MM-DD format to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handlePrevMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    if (newDate >= minDate) {
      setCurrentMonth(newDate);
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    if (!maxDate || newDate <= maxDate) {
      setCurrentMonth(newDate);
    }
  };

  const handleDateClick = (day: number) => {
    // Use local date to avoid timezone issues
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const selectedDate = new Date(year, month, day);
    
    // Format as YYYY-MM-DD using local timezone (not UTC)
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const clickedDate = new Date(year, month, day);
    clickedDate.setHours(0, 0, 0, 0);
    
    if (clickedDate < today) {
      return; // Don't allow past dates
    }
    
    // If availableDates is provided, check if date is in the list
    // Otherwise, allow any future date
    if (availableDates.length > 0) {
      if (isDateAvailable(dateStr)) {
        onChange(dateStr);
        setShowCalendar(false);
      }
    } else {
      onChange(dateStr);
      setShowCalendar(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthYear = currentMonth.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Display Selected Date */}
        <button
          type="button"
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 transition-all text-left bg-white hover:bg-slate-50"
        >
          <span className="text-slate-700">
            {value ? formatDate(value) : 'Select a date...'}
          </span>
        </button>

        {/* Calendar Dropdown */}
        {showCalendar && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <h3 className="font-semibold text-slate-800 text-center flex-1">
                {monthYear}
              </h3>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-slate-600 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-10" />;
                }

                // Use local date to avoid timezone issues
                const year = currentMonth.getFullYear();
                const month = currentMonth.getMonth();
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                // Check if date is in the past
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const clickedDate = new Date(year, month, day);
                clickedDate.setHours(0, 0, 0, 0);
                const isPast = clickedDate < today;
                
                const isSelected = value === dateStr;
                // Disable if past or if availableDates is provided and date is not in the list
                const isDisabled = isPast || (availableDates.length > 0 && !isDateAvailable(dateStr));

                // If disabled and not past, make it completely blank (not clickable)
                if (isDisabled && !isPast && availableDates.length > 0) {
                  return (
                    <div
                      key={day}
                      className="h-10 rounded text-sm text-slate-300 flex items-center justify-center"
                    >
                      {day}
                    </div>
                  );
                }

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      h-10 rounded text-sm font-medium transition-colors
                      ${isSelected
                        ? 'bg-pastel-blue-500 text-white'
                        : isDisabled
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-pastel-blue-50 text-slate-700 hover:bg-pastel-blue-200 cursor-pointer'
                      }
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            {/* Info Text */}
            <p className="text-xs text-slate-500 mt-3 text-center">
              Only blue dates are available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

