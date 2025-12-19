import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doctorsService } from '../../services/mock/doctors.service';
import { appointmentsService } from '../../services/mock/appointments.service';
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

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const loadDoctors = useCallback(async () => {
    try {
      setIsLoading(true);
      const allDoctors = await doctorsService.getAll();
      setDoctors(allDoctors);
      if (doctorIdParam) {
        const doctor = allDoctors.find((d) => d.id === parseInt(doctorIdParam));
        if (doctor) setSelectedDoctor(doctor);
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
    } finally {
      setIsLoading(false);
    }
  }, [doctorIdParam]);

  const loadTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      const slots = await appointmentsService.getAvailableTimeSlots(selectedDoctor.id, selectedDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
    }
  }, [selectedDate, selectedDoctor]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

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
      void loadTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [loadTimeSlots, selectedDate, selectedDoctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !selectedDate || !selectedTime || !user) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await appointmentsService.create({
        doctorId: selectedDoctor.id,
        patientId: user.id,
        date: selectedDate,
        time: selectedTime,
        reason: reason || undefined,
      });
      addToast('Appointment booked successfully!', 'success');
      navigate('/app/patient/appointments');
    } catch (error: unknown) {
      addToast(getErrorMessage(error, 'Failed to book appointment'), 'error');
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
            <div className="mt-3 p-4 bg-pastel-blue-50 rounded-lg">
              <p className="font-medium text-slate-800">{selectedDoctor.name}</p>
              <p className="text-sm text-slate-600">{selectedDoctor.specialization}</p>
              <p className="text-sm text-slate-600">{selectedDoctor.clinic}</p>
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

