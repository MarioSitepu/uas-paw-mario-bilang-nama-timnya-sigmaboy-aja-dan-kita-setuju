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
    if (selectedDoctor && selectedDate) {
      loadTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, selectedDate]);

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
        photoUrl: doc.photoUrl || 'https://via.placeholder.com/200?text=' + (doc.name || 'Doctor'),
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
      // For now, generate default time slots (9 AM - 5 PM in 1-hour intervals)
      // In production, this could fetch from backend API
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
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
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
        <DatePicker
          label="Select Date"
          value={selectedDate}
          onChange={setSelectedDate}
          required
          min={new Date().toISOString().split('T')[0]}
        />

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

