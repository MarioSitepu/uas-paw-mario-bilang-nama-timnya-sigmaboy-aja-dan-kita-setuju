import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/mock/appointments.service';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user, dateFilter, statusFilter]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const filters: any = { doctorId: user!.id };
      if (statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      const all = await appointmentsService.getAll(filters);
      const filtered = all.filter((apt) => apt.date === dateFilter);
      setAppointments(filtered.sort((a, b) => a.time.localeCompare(b.time)));
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      await appointmentsService.updateStatus(appointmentId, newStatus);
      loadAppointments();
    } catch (error: any) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Schedule</h1>
        <p className="text-slate-600">Manage your appointments</p>
      </div>

      {/* Filters */}
      <div className="bento-card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <LoadingSkeleton key={i} className="h-64" />
          ))}
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments found"
          description={`No appointments for ${new Date(dateFilter).toLocaleDateString('id-ID')}`}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bento-card">
              <AppointmentCard appointment={appointment} showActions={false} />
              <div className="mt-4 pt-4 border-t border-slate-200 space-y-2">
                {appointment.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(appointment.id, 'confirmed')}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    Confirm
                  </button>
                )}
                {appointment.status === 'confirmed' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(appointment.id, 'completed')}
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Complete
                    </button>
                    <Link
                      to={`/app/doctor/appointments/${appointment.id}`}
                      className="flex-1 px-4 py-2 bg-pastel-blue-50 text-pastel-blue-700 rounded-lg font-medium hover:bg-pastel-blue-100 transition-colors text-center"
                    >
                      View
                    </Link>
                  </div>
                )}
                {appointment.status === 'completed' && (
                  <Link
                    to={`/app/doctor/appointments/${appointment.id}`}
                    className="w-full block px-4 py-2 bg-pastel-blue-500 text-white rounded-lg font-medium hover:bg-pastel-blue-600 transition-colors text-center"
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

