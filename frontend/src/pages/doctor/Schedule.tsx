import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { Appointment, AppointmentStatus } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const Schedule: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    confirmed: true,
    completed: false,
  });
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get('/api/appointments');
      let all = response.data.appointments || [];
      
      console.log('📅 Doctor Schedule - Raw appointments from API:', all);
      
      // Transform backend format to frontend format
      all = all.map((apt: any) => ({
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
      }));
      
      console.log('📅 Doctor Schedule - Transformed appointments:', all);
      
      // Filter out cancelled appointments
      let filtered = all.filter((apt: Appointment) => apt.status !== 'cancelled');
      
      // Sort by date and time (newest first)
      const sorted = filtered.sort((a: Appointment, b: Appointment) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
      });
      
      setAppointments(sorted);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatusFilter = (status: 'pending' | 'confirmed' | 'completed') => {
    setStatusFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  // Filter appointments based on selected statuses and date
  let filteredAppointments = appointments.filter(apt => 
    statusFilters[apt.status as keyof typeof statusFilters]
  );

  // Apply date filter
  if (dateFilter === 'specific' && selectedDate) {
    filteredAppointments = filteredAppointments.filter(apt => apt.date === selectedDate);
  }

  const handleStatusUpdate = async (appointmentId: number, newStatus: AppointmentStatus) => {
    try {
      await authAPI.put(`/api/appointments/${appointmentId}`, {
        status: newStatus,
      });
      loadAppointments();
    } catch (error: any) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">My Schedule</h1>
        <p className="text-slate-600">View all your appointments</p>
      </div>

      {/* Status Filter Checkboxes */}
      <div className="bento-card">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Filter by Status</label>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={statusFilters.pending}
                onChange={() => toggleStatusFilter('pending')}
                className="w-4 h-4 rounded border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Pending</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={statusFilters.confirmed}
                onChange={() => toggleStatusFilter('confirmed')}
                className="w-4 h-4 rounded border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Confirmed</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={statusFilters.completed}
                onChange={() => toggleStatusFilter('completed')}
                className="w-4 h-4 rounded border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Completed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bento-card">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Filter by Date</label>
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dateFilter"
                value="all"
                checked={dateFilter === 'all'}
                onChange={() => setDateFilter('all')}
                className="w-4 h-4 border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">All Dates</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dateFilter"
                value="specific"
                checked={dateFilter === 'specific'}
                onChange={() => setDateFilter('specific')}
                className="w-4 h-4 border-slate-300 text-pastel-blue-500 focus:ring-pastel-blue-500"
              />
              <span className="text-sm font-medium text-slate-700">Select Specific Date</span>
            </label>
            {dateFilter === 'specific' && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pastel-blue-500 focus:border-pastel-blue-500 ml-6"
              />
            )}
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
      ) : filteredAppointments.length === 0 ? (
        <EmptyState
          icon="📅"
          title="No appointments found"
          description="No appointments match the selected filters"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map((appointment) => (
            <Link
              key={appointment.id}
              to={`/app/doctor/appointments/${appointment.id}`}
              className="no-underline"
            >
              <AppointmentCard
                appointment={appointment}
                userRole="doctor"
                showActions={false}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

