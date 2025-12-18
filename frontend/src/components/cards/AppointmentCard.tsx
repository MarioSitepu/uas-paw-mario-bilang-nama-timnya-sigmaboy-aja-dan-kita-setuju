import React from 'react';
import type { Appointment } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { Link } from 'react-router-dom';

interface AppointmentCardProps {
  appointment: Appointment;
  showActions?: boolean;
  userRole?: 'patient' | 'doctor';
  onAction?: (action: string, appointmentId: number) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  showActions = false,
  userRole = 'patient',
  onAction,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canReschedule = ['pending', 'confirmed'].includes(appointment.status);
  const canCancel = ['pending', 'confirmed'].includes(appointment.status);

  // For patients: show doctor info
  // For doctors: show patient info
  const isPatientView = userRole === 'patient';
  const personName = isPatientView ? appointment.doctor?.name : appointment.patient?.name;
  const personTitle = isPatientView 
    ? appointment.doctor?.specialization 
    : `Patient ID: ${appointment.patientId}`;

  // Debug logging
  if (!isPatientView) {
    console.log('🔍 Doctor view - appointment:', appointment);
    console.log('🔍 Doctor view - patient data:', appointment.patient);
    console.log('🔍 Doctor view - personName:', personName);
  }

  return (
    <div className="bento-card">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">
            {isPatientView ? `Dr. ${personName}` : personName}
          </h3>
          <p className="text-sm text-pastel-blue-600 font-medium">
            {personTitle}
          </p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="space-y-2 mb-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span>{formatDate(appointment.date)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🕐</span>
          <span>{appointment.time}</span>
        </div>
        {appointment.reason && (
          <div className="flex items-start gap-2">
            <span>💬</span>
            <span className="flex-1">{appointment.reason}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 pt-4 border-t border-slate-200">
          <Link
            to={`/app/${isPatientView ? 'patient' : 'doctor'}/appointments/${appointment.id}`}
            className="flex-1 text-center px-4 py-2 bg-pastel-blue-50 text-pastel-blue-700 rounded-lg font-medium hover:bg-pastel-blue-100 transition-colors"
          >
            View Details
          </Link>
          {canReschedule && (
            <button
              onClick={() => onAction?.('reschedule', appointment.id)}
              className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-medium hover:bg-yellow-100 transition-colors"
            >
              Reschedule
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onAction?.('cancel', appointment.id)}
              className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
};

