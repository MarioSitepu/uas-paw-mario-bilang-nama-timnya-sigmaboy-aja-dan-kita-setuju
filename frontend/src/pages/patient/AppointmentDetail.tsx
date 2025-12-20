import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { Appointment, TimeSlot } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { DatePicker } from '../../components/ui/DatePicker';
import { TimeSlotPicker } from '../../components/ui/TimeSlotPicker';
import { useToastContext } from '../../components/ui/Toast';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const action = searchParams.get('action');

  const { user } = useAuth();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastContext();

  useEffect(() => {
    if (id) {
      loadAppointment();
    }
  }, [id]);

  useEffect(() => {
    if (action === 'cancel') {
      setShowCancelModal(true);
    } else if (action === 'reschedule') {
      setShowRescheduleModal(true);
    }
  }, [action]);

  useEffect(() => {
    if (showRescheduleModal && appointment?.doctorId && rescheduleDate) {
      loadTimeSlots();
    }
  }, [showRescheduleModal, appointment?.doctorId, rescheduleDate]);

  const loadAppointment = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const response = await authAPI.get(`/api/appointments/${id}`);
      const apt = response.data.appointment;
      
      // Transform backend format to frontend format
      const appointment: Appointment = {
        id: apt.id,
        doctorId: apt.doctor_id,
        patientId: apt.patient_id,
        date: apt.appointment_date,
        time: apt.appointment_time,
        status: apt.status,
        reason: apt.reason,
        createdAt: apt.created_at || new Date().toISOString(),
        doctor: apt.doctor,
        patient: apt.patient,
      };

      if (appointment && appointment.patientId === user?.id) {
        setAppointment(appointment);
        // Set initial reschedule date/time from current appointment
        setRescheduleDate(appointment.date);
        setRescheduleTime(appointment.time);
      } else {
        addToast('Appointment not found', 'error');
        navigate('/app/patient/appointments');
      }
    } catch (error) {
      console.error('Failed to load appointment:', error);
      addToast('Failed to load appointment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimeSlots = async () => {
    if (!appointment?.doctorId || !rescheduleDate) return;
    try {
      const { doctorsAPI } = await import('../../services/api');
      const response = await doctorsAPI.getSlots(appointment.doctorId, rescheduleDate);
      const slots = response.data || [];
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      addToast('Gagal memuat jam yang tersedia', 'error');
    }
  };

  const handleCancel = async () => {
    if (!appointment) {
      console.log('❌ No appointment to cancel');
      return;
    }
    console.log('=== CANCEL APPOINTMENT START ===');
    console.log('🗑️ Cancelling appointment ID:', appointment.id);
    setIsSubmitting(true);
    try {
      const url = `/api/appointments/${appointment.id}`;
      console.log('📤 Sending DELETE request to:', url);
      const response = await authAPI.delete(url);
      console.log('✅ Delete request successful!');
      console.log('✅ Response status:', response.status);
      console.log('✅ Response data:', response.data);
      
      addToast('Appointment cancelled successfully', 'success');
      setShowCancelModal(false);
      
      // Wait a moment for the toast to show, then redirect
      console.log('⏳ Waiting 800ms before redirect...');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('🔄 NOW redirecting to /app/patient/appointments');
      navigate('/app/patient/appointments');
      console.log('=== CANCEL APPOINTMENT COMPLETE ===');
    } catch (error: any) {
      console.error('=== CANCEL APPOINTMENT ERROR ===');
      console.error('❌ Full error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      addToast(error.response?.data?.error || 'Failed to cancel appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment || !rescheduleDate || !rescheduleTime) {
      console.log('❌ Missing required fields:', { appointment: !!appointment, rescheduleDate, rescheduleTime });
      addToast('Please select date and time', 'error');
      return;
    }
    console.log('=== RESCHEDULE APPOINTMENT START ===');
    console.log('📅 Rescheduling appointment ID:', appointment.id);
    console.log('📅 New date:', rescheduleDate);
    console.log('⏰ New time:', rescheduleTime);
    setIsSubmitting(true);
    try {
      const url = `/api/appointments/${appointment.id}`;
      const payload = {
        appointment_date: rescheduleDate,
        appointment_time: rescheduleTime,
      };
      console.log('📤 Sending PUT request to:', url);
      console.log('📤 Payload:', payload);
      
      const response = await authAPI.put(url, payload);
      console.log('✅ Reschedule successful!');
      console.log('✅ Response:', response.data);
      
      addToast('Appointment rescheduled successfully', 'success');
      setShowRescheduleModal(false);
      
      // Wait a moment for the toast to show, then redirect
      console.log('⏳ Waiting 800ms before redirect...');
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log('🔄 NOW redirecting to /app/patient/appointments');
      navigate('/app/patient/appointments');
      console.log('=== RESCHEDULE APPOINTMENT COMPLETE ===');
    } catch (error: any) {
      console.error('=== RESCHEDULE APPOINTMENT ERROR ===');
      console.error('❌ Full error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error data:', error.response?.data);
      addToast(error.response?.data?.error || 'Failed to reschedule appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto">
        <LoadingSkeleton className="h-96" />
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Appointment Details</h1>
          <p className="text-slate-600">View and manage your appointment</p>
        </div>
        <button
          onClick={() => navigate('/app/patient/appointments')}
          className="px-4 py-2 text-slate-600 hover:text-slate-800"
        >
          ← Back
        </button>
      </div>

      <div className="bento-card space-y-6">
        {/* Status */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Status</h2>
          <StatusBadge status={appointment.status} />
        </div>

        {/* Doctor Info */}
        {appointment.doctor && (
          <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
            <img
              src={appointment.doctor.profile_photo_url || appointment.doctor.photoUrl || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23475569' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='12' cy='7' r='4'/%3E%3C/svg%3E`}
              alt={appointment.doctor.name}
              className="w-20 h-20 rounded-full border-2 border-white shadow-md object-cover"
            />
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-slate-800">{appointment.doctor.name}</h3>
              <p className="text-pastel-blue-600 font-medium">{appointment.doctor.specialization}</p>
              <p className="text-sm text-slate-600 mt-1">{appointment.doctor.clinic}</p>
            </div>
          </div>
        )}

        {/* Appointment Details */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Date</label>
            <p className="text-lg text-slate-800">
              {new Date(appointment.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Time</label>
            <p className="text-lg text-slate-800">{appointment.time}</p>
          </div>
          {appointment.reason && (
            <div>
              <label className="text-sm font-medium text-slate-600">Reason</label>
              <p className="text-lg text-slate-800">{appointment.reason}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {(canReschedule || canCancel) && (
          <div className="flex gap-4 pt-4 border-t border-slate-200">
            {canReschedule && (
              <button
                onClick={() => setShowRescheduleModal(true)}
                className="flex-1 px-6 py-3 bg-yellow-50 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition-colors"
              >
                Reschedule
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex-1 px-6 py-3 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Appointment"
      >
        <p className="mb-6 text-slate-600">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => setShowCancelModal(false)}
            className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            No, Keep It
          </button>
          <button
            onClick={handleCancel}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Appointment"
        size="lg"
      >
        <div className="space-y-4">
          <DatePicker
            label="Select New Date"
            value={rescheduleDate}
            onChange={setRescheduleDate}
            required
            min={new Date().toISOString().split('T')[0]}
          />
          {rescheduleDate && appointment.doctorId && (
            <TimeSlotPicker
              label="Select New Time"
              slots={timeSlots}
              selectedTime={rescheduleTime}
              onSelect={setRescheduleTime}
              selectedDate={rescheduleDate}
            />
          )}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={isSubmitting || !rescheduleDate || !rescheduleTime}
              className="flex-1 px-6 py-3 bg-gradient-blue text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Rescheduling...' : 'Reschedule'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

