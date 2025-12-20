import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
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
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [doctorSchedule, setDoctorSchedule] = useState<any>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const { addToast } = useToastContext();

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (doctorIdParam) {
      const doctor = doctors.find((d) => d.id === parseInt(doctorIdParam));
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorIdParam, doctors]);

  useEffect(() => {
    if (selectedDoctor) {
      loadAvailableDates();
    } else {
      setAvailableDates([]);
      setSelectedDate('');
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, selectedDate]);

  const loadAvailableDates = async () => {
    if (!selectedDoctor) return;
    try {
      // Fetch doctor's schedule
      const scheduleResponse = await authAPI.get(`/api/doctors/${selectedDoctor.id}/schedule`);
      const doctorScheduleData = scheduleResponse.data.schedule || {};

      console.log('📅 Doctor schedule for available dates:', doctorScheduleData);

      // Generate available dates for next 30 days based on schedule
      const availableDatesArray: string[] = [];
      const today = new Date();

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];
        const daySchedule = doctorScheduleData[dayOfWeek];

        // If doctor is available on this day of week, include the date
        if (daySchedule && daySchedule.available) {
          const dateString = date.toISOString().split('T')[0];
          availableDatesArray.push(dateString);
        }
      }

      console.log('✅ Available dates:', availableDatesArray);
      setAvailableDates(availableDatesArray);
    } catch (error) {
      console.error('❌ Failed to load available dates:', error);
      // If fetch fails, allow all dates
      const availableDatesArray: string[] = [];
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        availableDatesArray.push(dateString);
      }
      setAvailableDates(availableDatesArray);
    }
  };

  const loadDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get('/api/doctors');
      let allDoctors = response.data.doctors || [];

      // Convert backend doctor format to frontend format
      allDoctors = allDoctors.map((doc: any) => ({
        id: doc.id,
        name: doc.name || 'Unknown',
        specialization: doc.specialization || 'General',
        photoUrl: doc.profile_photo_url || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E`,
        rating: doc.rating || 4.5,
        clinic: doc.clinic || 'Medical Clinic',
        bio: doc.bio || 'Experienced healthcare professional',
        schedule: doc.schedule ? Object.entries(doc.schedule).map(([day, times]: [string, any]) => ({
          day: day.charAt(0).toUpperCase() + day.slice(1),
          start: Array.isArray(times) ? times[0]?.split('-')[0] : '09:00',
          end: Array.isArray(times) ? times[0]?.split('-')[1] : '17:00'
        })) : []
      }));

      setDoctors(allDoctors);
      if (doctorIdParam) {
        const doctor = allDoctors.find((d: Doctor) => d.id === parseInt(doctorIdParam));
        if (doctor) setSelectedDoctor(doctor);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      // Fetch doctor's schedule
      const scheduleResponse = await authAPI.get(`/api/doctors/${selectedDoctor.id}/schedule`);
      const doctorScheduleData = scheduleResponse.data.schedule || {};

      console.log('🔍 Full schedule response:', scheduleResponse.data);
      console.log('📋 Doctor schedule data:', doctorScheduleData);

      // setDoctorSchedule(doctorScheduleData);

      // Get day of week from selected date
      const date = new Date(selectedDate);
      const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][date.getDay()];

      console.log('📅 Selected date:', selectedDate, 'Day of week:', dayOfWeek);

      const daySchedule = doctorScheduleData[dayOfWeek];

      console.log('🗓️ Day schedule:', daySchedule);

      const slots: TimeSlot[] = [];

      // Check if doctor is available on this day
      if (daySchedule && daySchedule.available) {
        const startTime = daySchedule.startTime || '09:00';
        const endTime = daySchedule.endTime || '17:00';
        const breakStart = daySchedule.breakStart || '';
        const breakEnd = daySchedule.breakEnd || '';

        const startHour = parseInt(startTime.split(':')[0]);
        const startMin = parseInt(startTime.split(':')[1]);
        const endHour = parseInt(endTime.split(':')[0]);
        const endMin = parseInt(endTime.split(':')[1]);

        console.log('⏰ Start:', startTime, '| End:', endTime, '| Break:', breakStart, '-', breakEnd);

        // Parse break times - only if both are provided and non-empty
        const hasBreak = breakStart && breakStart.length > 0 && breakEnd && breakEnd.length > 0;

        let breakStartHour = null;
        let breakStartMin = null;
        let breakEndHour = null;
        let breakEndMin = null;

        if (hasBreak) {
          breakStartHour = parseInt(breakStart.split(':')[0]);
          breakStartMin = parseInt(breakStart.split(':')[1]);
          breakEndHour = parseInt(breakEnd.split(':')[0]);
          breakEndMin = parseInt(breakEnd.split(':')[1]);
        }

        console.log('🔔 Has break:', hasBreak, { breakStartHour, breakStartMin, breakEndHour, breakEndMin });

        // Generate time slots in 30-minute intervals
        let currentHour = startHour;
        let currentMin = startMin;

        while (currentHour < endHour || (currentHour === endHour && currentMin <= endMin)) {
          const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
          const currentTimeInMinutes = currentHour * 60 + currentMin;

          // Check if current time is during break
          let isDuringBreak = false;
          if (hasBreak && breakStartHour !== null && breakEndHour !== null && breakStartMin !== null && breakEndMin !== null) {
            const breakStartInMinutes = breakStartHour * 60 + breakStartMin;
            const breakEndInMinutes = breakEndHour * 60 + breakEndMin;

            isDuringBreak = currentTimeInMinutes >= breakStartInMinutes && currentTimeInMinutes < breakEndInMinutes;

            console.log(`  Time: ${currentTimeStr} (${currentTimeInMinutes}min) - Break: ${breakStartInMinutes}-${breakEndInMinutes}min - During break: ${isDuringBreak}`);
          }

          if (!isDuringBreak) {
            slots.push({
              time: currentTimeStr,
              available: true
            });
          }

          // Increment by 30 minutes
          currentMin += 30;
          if (currentMin >= 60) {
            currentMin = 0;
            currentHour += 1;
          }
        }
      } else {
        console.log('❌ Doctor not available on this day or no schedule');
      }

      console.log('✅ Final time slots:', slots);
      setTimeSlots(slots);

      if (slots.length === 0) {
        addToast('Doctor is not available on this date', 'info');
      }
    } catch (error) {
      console.error('❌ Failed to load time slots:', error);
      // Fallback to default slots if schedule fetch fails
      const slots: TimeSlot[] = [];
      for (let hour = 9; hour < 17; hour++) {
        slots.push({
          time: `${hour.toString().padStart(2, '0')}:00`,
          available: true
        });
        if (hour < 16) {
          slots.push({
            time: `${hour.toString().padStart(2, '0')}:30`,
            available: true
          });
        }
      }
      console.log('Using fallback slots:', slots);
      setTimeSlots(slots);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !user) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    console.log('🔑 Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'MISSING');
    console.log('👤 User in context:', user);

    setIsSubmitting(true);
    try {
      const response = await authAPI.post('/api/appointments', {
        doctor_id: selectedDoctor.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        reason: reason || undefined,
      });

      if (response.data.error) {
        addToast(response.data.error, 'error');
      } else {
        addToast('Appointment booked successfully!', 'success');
        navigate('/app/patient/appointments');
      }
    } catch (error: any) {
      console.error('Booking error:', error);
      addToast(error.response?.data?.error || error.message || 'Failed to book appointment', 'error');
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Book Appointment</h1>
        <p className="text-slate-600">Schedule your appointment with a doctor</p>
      </div>

      <form onSubmit={handleSubmit} className="bento-card space-y-6">
        {/* Doctor Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Doctor <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={selectedDoctor?.id || ''}
            onChange={(e) => {
              const doctor = doctors.find((d) => d.id === parseInt(e.target.value));
              setSelectedDoctor(doctor || null);
              setSelectedDate('');
              setSelectedTime('');
            }}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.id} value={doctor.id}>
                {doctor.name} - {doctor.specialization}
              </option>
            ))}
          </select>
          {selectedDoctor && (
            <div className="mt-3 p-4 bg-pastel-blue-50 rounded-lg space-y-2">
              <div className="flex items-start gap-3">
                <img
                  src={selectedDoctor.photoUrl}
                  alt={selectedDoctor.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{selectedDoctor.name}</p>
                  <p className="text-sm text-pastel-blue-600 font-medium">🏥 {selectedDoctor.specialization}</p>
                  <p className="text-sm text-slate-600">{selectedDoctor.clinic}</p>
                  {selectedDoctor.bio && (
                    <p className="text-sm text-slate-600 mt-1">{selectedDoctor.bio}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date Selection */}
        {selectedDoctor && (
          <DatePicker
            label={`Select Date${availableDates.length > 0 ? ' (Based on Doctor Availability)' : ''}`}
            value={selectedDate}
            onChange={setSelectedDate}
            required
            min={new Date().toISOString().split('T')[0]}
            availableDates={availableDates}
          />
        )}

        {/* Time Slot Selection */}
        {selectedDate && selectedDoctor && (
          <TimeSlotPicker
            label="Select Time"
            slots={timeSlots}
            selectedTime={selectedTime}
            onSelect={setSelectedTime}
          />
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Reason (Optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
            placeholder="Brief description of your visit..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/app/patient/appointments')}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !selectedDoctor || !selectedDate || !selectedTime}
            className="flex-1 px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Booking...' : 'Book Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
};

