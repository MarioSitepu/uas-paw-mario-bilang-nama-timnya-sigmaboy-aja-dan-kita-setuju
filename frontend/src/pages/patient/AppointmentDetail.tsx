import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
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
  }, [showRescheduleModal, appointment, rescheduleDate]);

  const loadAppointment = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const apt = await appointmentsService.getById(parseInt(id));
      if (apt && apt.patientId === user?.id) {
        setAppointment(apt);
        if (showRescheduleModal) {
          setRescheduleDate(apt.date);
          setRescheduleTime(apt.time);
        }
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
      const slots = await appointmentsService.getAvailableTimeSlots(appointment.doctorId, rescheduleDate);
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
    }
  };

  const handleCancel = async () => {
    if (!appointment) return;
    setIsSubmitting(true);
    try {
      await appointmentsService.cancel(appointment.id);
      addToast('Appointment cancelled successfully', 'success');
      setShowCancelModal(false);
      navigate('/app/patient/appointments');
    } catch (error: any) {
      addToast(error.message || 'Failed to cancel appointment', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReschedule = async () => {
    if (!appointment || !rescheduleDate || !rescheduleTime) {
      addToast('Please select date and time', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      await appointmentsService.reschedule(appointment.id, rescheduleDate, rescheduleTime);
      addToast('Appointment rescheduled successfully', 'success');
      setShowRescheduleModal(false);
      loadAppointment();
    } catch (error: any) {
      addToast(error.message || 'Failed to reschedule appointment', 'error');
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
              src={appointment.doctor.photoUrl}
              alt={appointment.doctor.name}
              className="w-20 h-20 rounded-full border-2 border-white shadow-md"
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

