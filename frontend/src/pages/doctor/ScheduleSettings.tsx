import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToastContext } from '../../components/ui/Toast';
import { authAPI } from '../../services/api';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

interface DaySchedule {
  available: boolean;
  startTime: string;
  endTime: string;
  breakStart: string;
  breakEnd: string;
}

interface ScheduleData {
  [day: string]: DaySchedule;
}

interface TimePickerState {
  isOpen: boolean;
  day: string | null;
  field: string | null;
}

const TimePickerModal: React.FC<{
  isOpen: boolean;
  currentTime: string;
  onSelect: (time: string) => void;
  onClear: () => void;
  onClose: () => void;
}> = ({ isOpen, currentTime, onSelect, onClear, onClose }) => {
  const [hours, setHours] = useState('00');
  const [minutes, setMinutes] = useState('00');
  const [showHourDropdown, setShowHourDropdown] = useState(false);
  const [showMinuteDropdown, setShowMinuteDropdown] = useState(false);

  useEffect(() => {
    if (currentTime && currentTime.includes(':')) {
      const [h, m] = currentTime.split(':');
      setHours(h);
      setMinutes(m);
    } else {
      // Default to 00:00 when opening without time
      setHours('00');
      setMinutes('00');
    }
    setShowHourDropdown(false);
    setShowMinuteDropdown(false);
  }, [currentTime, isOpen]);

  if (!isOpen) return null;

  const handleSelect = () => {
    const timeString = `${hours}:${minutes}`;
    onSelect(timeString);
    onClose();
  };

  const handleHourInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === '') {
      setHours('');
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num <= 23) {
      setHours(String(num).padStart(2, '0'));
    }
  };

  const handleMinuteInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (value === '') {
      setMinutes('');
      return;
    }
    const num = parseInt(value);
    if (!isNaN(num) && num >= 0 && num <= 59) {
      setMinutes(String(num).padStart(2, '0'));
    }
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Select Time</h3>
        
        <div className="flex gap-4 justify-center mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-2">Hours</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={hours}
                onChange={handleHourInputChange}
                onClick={() => setShowHourDropdown(!showHourDropdown)}
                placeholder="HH"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 text-center cursor-pointer font-medium"
                maxLength={2}
              />
              {showHourDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {hourOptions.map((hour) => (
                    <button
                      key={hour}
                      onClick={() => {
                        setHours(hour);
                        setShowHourDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-center hover:bg-pastel-blue-100 transition ${
                        hours === hour ? 'bg-pastel-blue-200 font-semibold' : ''
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-600 mb-2">Minutes</label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={minutes}
                onChange={handleMinuteInputChange}
                onClick={() => setShowMinuteDropdown(!showMinuteDropdown)}
                placeholder="MM"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 text-center cursor-pointer font-medium"
                maxLength={2}
              />
              {showMinuteDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                  {minuteOptions.map((minute) => (
                    <button
                      key={minute}
                      onClick={() => {
                        setMinutes(minute);
                        setShowMinuteDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-center hover:bg-pastel-blue-100 transition ${
                        minutes === minute ? 'bg-pastel-blue-200 font-semibold' : ''
                      }`}
                    >
                      {minute}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSelect}
            className="flex-1 px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition"
          >
            Select
          </button>
          <button
            onClick={() => {
              onClear();
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-400 transition"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg font-medium hover:bg-slate-100 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export const ScheduleSettings: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToastContext();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedBreakTime, setExpandedBreakTime] = useState<string | null>(null);
  const [timePicker, setTimePicker] = useState<TimePickerState>({
    isOpen: false,
    day: null,
    field: null,
  });
  const [schedule, setSchedule] = useState<ScheduleData>({
    monday: { available: true, startTime: '08:00', endTime: '16:00', breakStart: '', breakEnd: '' },
    tuesday: { available: true, startTime: '08:00', endTime: '16:00', breakStart: '', breakEnd: '' },
    wednesday: { available: true, startTime: '08:00', endTime: '16:00', breakStart: '', breakEnd: '' },
    thursday: { available: true, startTime: '08:00', endTime: '16:00', breakStart: '', breakEnd: '' },
    friday: { available: true, startTime: '08:00', endTime: '16:00', breakStart: '', breakEnd: '' },
    saturday: { available: false, startTime: '', endTime: '', breakStart: '', breakEnd: '' },
    sunday: { available: false, startTime: '', endTime: '', breakStart: '', breakEnd: '' },
  });

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get(`/api/doctors/${user?.doctor_profile?.id}/schedule`);
      console.log('📅 Schedule loaded:', response.data);

      // Convert from backend format if needed
      const backendSchedule = response.data.schedule || {};
      if (Object.keys(backendSchedule).length > 0) {
        setSchedule(backendSchedule);
      }
    } catch (error) {
      console.error('Failed to load schedule:', error);
      addToast('Failed to load schedule', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDayToggle = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        available: !prev[day].available
      }
    }));
  };

  const handleTimeChange = (day: string, field: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const openTimePicker = (day: string, field: string) => {
    setTimePicker({
      isOpen: true,
      day,
      field,
    });
  };

  const closeTimePicker = () => {
    setTimePicker({
      isOpen: false,
      day: null,
      field: null,
    });
  };

  const handleTimeSelect = (time: string) => {
    if (timePicker.day && timePicker.field) {
      handleTimeChange(timePicker.day, timePicker.field, time);
    }
  };

  const handleTimeClear = () => {
    if (timePicker.day && timePicker.field) {
      handleTimeChange(timePicker.day, timePicker.field, '');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Validate schedule before saving
      for (const [day, dayData] of Object.entries(schedule)) {
        // If day is available, start and end times are required
        if (dayData.available) {
          if (!dayData.startTime || !dayData.startTime.trim()) {
            addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Start time is required`, 'error');
            return;
          }
          if (!dayData.endTime || !dayData.endTime.trim()) {
            addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: End time is required`, 'error');
            return;
          }
          
          // If break start is set, break end must also be set
          const hasBreakStart = dayData.breakStart && dayData.breakStart.trim().length > 0;
          const hasBreakEnd = dayData.breakEnd && dayData.breakEnd.trim().length > 0;
          
          if (hasBreakStart && !hasBreakEnd) {
            addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Break end time is required when break start is set`, 'error');
            return;
          }
          
          if (hasBreakEnd && !hasBreakStart) {
            addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Break start time is required when break end is set`, 'error');
            return;
          }
          
          // Validate break time is within working hours
          if (hasBreakStart && hasBreakEnd) {
            const startTime = dayData.startTime;
            const endTime = dayData.endTime;
            const breakStart = dayData.breakStart;
            const breakEnd = dayData.breakEnd;
            
            if (breakStart < startTime) {
              addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Break start time (${breakStart}) cannot be before working hours start (${startTime})`, 'error');
              return;
            }
            
            if (breakEnd > endTime) {
              addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Break end time (${breakEnd}) cannot be after working hours end (${endTime})`, 'error');
              return;
            }
            
            if (breakStart >= breakEnd) {
              addToast(`${day.charAt(0).toUpperCase() + day.slice(1)}: Break start time must be before break end time`, 'error');
              return;
            }
          }
        }
      }
      
      // Clean up schedule - ensure breakStart and breakEnd are truly empty if not set
      const cleanedSchedule = Object.entries(schedule).reduce((acc, [day, dayData]) => {
        acc[day] = {
          available: dayData.available,
          startTime: dayData.available ? dayData.startTime : '',
          endTime: dayData.available ? dayData.endTime : '',
          breakStart: dayData.available && dayData.breakStart ? dayData.breakStart : '',
          breakEnd: dayData.available && dayData.breakEnd ? dayData.breakEnd : ''
        };
        return acc;
      }, {} as ScheduleData);

      console.log('💾 Saving cleaned schedule:', cleanedSchedule);

      const response = await authAPI.put(
        `/api/doctors/${user?.doctor_profile?.id}/schedule`,
        { schedule: cleanedSchedule }
      );
      console.log('✅ Schedule updated:', response.data);
      addToast('Schedule updated successfully', 'success');
    } catch (error) {
      console.error('Failed to update schedule:', error);
      addToast('Failed to update schedule', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const formatTimeDisplay = (time24: string) => {
    if (!time24 || !time24.includes(':')) return 'Not set';
    return time24;  // Display as-is in 24-hour format (HH:MM)
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Availability Schedule</h1>
        <p className="text-slate-600">Set when you're available to see patients</p>
      </div>

      <TimePickerModal
        isOpen={timePicker.isOpen}
        currentTime={
          timePicker.day && timePicker.field && typeof timePicker.day === 'string' && typeof timePicker.field === 'string'
            ? (schedule[timePicker.day]?.[timePicker.field as keyof DaySchedule] as string) || ''
            : ''
        }
        onSelect={handleTimeSelect}
        onClear={handleTimeClear}
        onClose={closeTimePicker}
      />

      <div className="bento-card space-y-6">
        {dayNames.map((dayName) => {
          const dayKey = dayName.toLowerCase();
          const dayData = schedule[dayKey] || { available: false, startTime: '', endTime: '', breakStart: '', breakEnd: '' };

          return (
            <div key={dayKey} className="pb-6 border-b border-slate-200 last:border-b-0">
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dayData.available}
                    onChange={() => handleDayToggle(dayKey)}
                    className="w-4 h-4 rounded border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
                  />
                  <span className="text-lg font-semibold text-slate-800 min-w-24">{dayName}</span>
                </label>
              </div>

              {dayData.available && (
                <div className="space-y-4 ml-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Start Time
                      </label>
                      <button
                        onClick={() => openTimePicker(dayKey, 'startTime')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 cursor-pointer text-left bg-white hover:bg-slate-50 transition"
                      >
                        {formatTimeDisplay(dayData.startTime)}
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        End Time
                      </label>
                      <button
                        onClick={() => openTimePicker(dayKey, 'endTime')}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 cursor-pointer text-left bg-white hover:bg-slate-50 transition"
                      >
                        {formatTimeDisplay(dayData.endTime)}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setExpandedBreakTime(expandedBreakTime === dayKey ? null : dayKey)}
                      className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 font-medium transition"
                    >
                      <span className={`transform transition-transform ${expandedBreakTime === dayKey ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                      Break Time (Optional)
                    </button>
                    
                    {expandedBreakTime === dayKey && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            Break Start
                          </label>
                          <button
                            onClick={() => openTimePicker(dayKey, 'breakStart')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 cursor-pointer text-left bg-white hover:bg-slate-50 transition"
                          >
                            {formatTimeDisplay(dayData.breakStart)}
                          </button>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">
                            Break End
                          </label>
                          <button
                            onClick={() => openTimePicker(dayKey, 'breakEnd')}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pastel-blue-500 cursor-pointer text-left bg-white hover:bg-slate-50 transition"
                          >
                            {formatTimeDisplay(dayData.breakEnd)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-3 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Schedule'}
        </button>
      </div>
    </div>
  );
};
