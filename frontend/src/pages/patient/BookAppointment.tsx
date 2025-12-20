import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import type { Doctor, TimeSlot } from '../../types';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimeSlotPicker } from '../../components/ui/TimeSlotPicker';
import { useToastContext } from '../../components/ui/Toast';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const BookAppointment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const doctorIdParam = searchParams.get('doctorId');

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastContext();



  const loadDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const { doctorsAPI } = await import('../../services/api');
      const response = await doctorsAPI.getAll();
      const rawDoctors = response.data.doctors || [];
      const allDoctors = rawDoctors.map((doc: any) => {
        // Keep original schedule for date generation
        const originalSchedule = doc.schedule;
        
        // Also create scheduleArray for display purposes
        let scheduleArray: any[] = [];
        if (doc.schedule && !Array.isArray(doc.schedule)) {
          const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
          scheduleArray = days.map(day => {
            const slot = doc.schedule[day];
            if (!slot || !slot.available) return null;
            return {
              day: day.charAt(0).toUpperCase() + day.slice(1),
              start: slot.startTime,
              end: slot.endTime
            };
          }).filter(Boolean);
        } else if (Array.isArray(doc.schedule)) {
          scheduleArray = doc.schedule;
        }
        return { ...doc, schedule: scheduleArray, originalSchedule };
      });
      setDoctors(allDoctors);
      if (doctorIdParam) {
        const doctor = allDoctors.find((d: Doctor) => d.id === parseInt(doctorIdParam));
        if (doctor) setSelectedDoctor(doctor);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [doctorIdParam]);

  // Generate available dates based on doctor schedule
  const generateAvailableDates = useCallback((doctor: Doctor | null): string[] => {
    if (!doctor) {
      return []; // If no doctor, return empty (will allow all future dates)
    }

    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get available days from schedule
    const availableDays: string[] = [];
    
    // Use originalSchedule if available (from loadDoctors), otherwise use schedule
    const scheduleObj = (doctor as any).originalSchedule || doctor.schedule;
    
    if (scheduleObj && typeof scheduleObj === 'object' && !Array.isArray(scheduleObj)) {
      Object.entries(scheduleObj).forEach(([day, dayData]: [string, any]) => {
        if (dayData && typeof dayData === 'object' && dayData.available === true) {
          // Normalize day name to lowercase
          const normalizedDay = day.toLowerCase();
          availableDays.push(normalizedDay);
        }
      });
    }

    if (availableDays.length === 0) {
      return []; // No available days - will allow all future dates if empty
    }

    // Generate dates for next 60 days
    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Get day name (0 = Sunday, 1 = Monday, etc.)
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[date.getDay()];
      
      // Check if this day is available in doctor's schedule
      if (availableDays.includes(dayName)) {
        // Format as YYYY-MM-DD using local timezone (not UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const dayNum = String(date.getDate()).padStart(2, '0');
        dates.push(`${year}-${month}-${dayNum}`);
      }
    }

    return dates;
  }, []);

  const loadTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) {
      setTimeSlots([]);
      setSelectedTime('');
      return;
    }
    try {
      setIsLoadingSlots(true);
      setSelectedTime(''); // Reset selected time when loading new slots
      const { doctorsAPI } = await import('../../services/api');
      const response = await doctorsAPI.getSlots(selectedDoctor.id, selectedDate);
      const slots = response.data || [];
      setTimeSlots(slots);
      
      // Show message if no slots available
      if (slots.length === 0) {
        addToast('Tidak ada jam tersedia pada tanggal yang dipilih', 'info');
      } else {
        const availableCount = slots.filter((s: TimeSlot) => s.available).length;
        if (availableCount === 0) {
          addToast('Semua jam pada tanggal ini sudah terisi', 'warning');
        }
      }
    } catch (error) {
      console.error('Failed to load time slots:', error);
      const errorMsg = (error as any)?.response?.data?.error || 'Gagal memuat jam yang tersedia';
      addToast(errorMsg, 'error');
      setTimeSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [selectedDate, selectedDoctor, addToast]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (doctorIdParam && doctors.length > 0) {
      // Need to ensure doctors are loaded before selecting
      const doctor = doctors.find((d) => d.id === parseInt(doctorIdParam));
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorIdParam, doctors]);

  // Generate available dates when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      const dates = generateAvailableDates(selectedDoctor);
      setAvailableDates(dates);
      // Reset selected date if current selection is not available
      if (selectedDate && dates.length > 0 && !dates.includes(selectedDate)) {
        setSelectedDate('');
        setSelectedTime('');
        setTimeSlots([]);
      }
    } else {
      setAvailableDates([]);
    }
  }, [selectedDoctor, generateAvailableDates]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      void loadTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [loadTimeSlots, selectedDate, selectedDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !user) {
      addToast('Mohon lengkapi semua field yang wajib diisi', 'error');
      return;
    }

    // Validate selected time is still available
    const selectedSlot = timeSlots.find(slot => slot.time === selectedTime);
    if (!selectedSlot || !selectedSlot.available) {
      addToast('Jam yang dipilih sudah tidak tersedia. Silakan pilih jam lain.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { appointmentsAPI } = await import('../../services/api');
      await appointmentsAPI.create({
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason: reason || undefined,
      });
      addToast('Janji temu berhasil dibuat!', 'success');
      navigate('/app/patient/appointments');
    } catch (error: unknown) {
      console.error(error);
      const msg = (error as any)?.response?.data?.error || (error as Error).message || 'Gagal membuat janji temu';
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Buat Janji Temu</h1>
        <p className="text-slate-600">Pilih dokter dan jadwalkan janji temu Anda</p>
      </div>

      <form onSubmit={handleSubmit} className="bento-card space-y-6">
        {/* Doctor Selection */}
        <div>
          <label htmlFor="doctor-select" className="block text-sm font-medium text-slate-700 mb-2">
            Pilih Dokter <span className="text-red-500">*</span>
          </label>
          <select
            id="doctor-select"
            name="doctor-select"
            required
            value={selectedDoctor?.id || ''}
            onChange={(e) => {
              const doctor = doctors.find((d) => d.id === parseInt(e.target.value));
              setSelectedDoctor(doctor || null);
              setSelectedDate('');
              setSelectedTime('');
              setTimeSlots([]);
            }}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">Pilih dokter...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          {selectedDoctor && (
            <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                {selectedDoctor.profile_photo_url && (
                  <img
                    src={selectedDoctor.profile_photo_url}
                    alt={selectedDoctor.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{selectedDoctor.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{selectedDoctor.specialization}</p>
                  {selectedDoctor.bio && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2">{selectedDoctor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Selection */}
        <DatePicker
          id="appointment-date"
          label="Pilih Tanggal"
          value={selectedDate}
          onChange={setSelectedDate}
          required
          min={new Date().toISOString().split('T')[0]}
          availableDates={selectedDoctor ? availableDates : []}
        />

        {/* Time Slot Selection */}
        {selectedDate && selectedDoctor && (
          <TimeSlotPicker
            label="Pilih Jam"
            slots={timeSlots}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
            isLoading={isLoadingSlots}
            selectedDate={selectedDate}
          />
        )}

        {/* Selected Appointment Summary */}
        {selectedDoctor && selectedDate && selectedTime && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-sm font-semibold text-green-800 mb-2">Ringkasan Janji Temu</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p><span className="font-medium">Dokter:</span> {selectedDoctor.name}</p>
              <p><span className="font-medium">Tanggal:</span> {(() => {
                const [year, month, day] = selectedDate.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
              })()}</p>
              <p><span className="font-medium">Jam:</span> {selectedTime} WIB</p>
            </div>
          </div>
        )}

        {/* Reason */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 mb-2">
            Alasan Kunjungan (Opsional)
          </label>
          <textarea
            id="reason"
            name="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
            placeholder="Jelaskan alasan kunjungan Anda (opsional)..."
          />
          <p className="mt-1 text-xs text-slate-500">Informasi ini akan membantu dokter mempersiapkan konsultasi</p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/app/patient/appointments')}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedTime || isLoadingSlots}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Memproses...</span>
              </>
            ) : (
              'Buat Janji Temu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

