import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import type { Appointment } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilters, setStatusFilters] = useState({
    pending: true,
    confirmed: true,
    completed: false,
  });

  useEffect(() => {
    if (user?.id) {
      loadAllAppointments();
    }
  }, [user]);

  const loadAllAppointments = async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.get('/api/appointments');
      let all = response.data.appointments || [];
      
      console.log('📋 DoctorDashboard - Raw appointments from API:', all);
      
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
      
      console.log('📋 DoctorDashboard - Transformed appointments:', all);
      
      // Filter out cancelled appointments
      const activeApts = all.filter((apt: Appointment) => apt.status !== 'cancelled');
      console.log('📋 DoctorDashboard - After filtering cancelled appointments:', activeApts);
      
      // Sort all appointments by date and time (newest first - descending)
      const sortedApts = activeApts.sort((a: Appointment, b: Appointment) => {
        const dateCompare = b.date.localeCompare(a.date);
        return dateCompare !== 0 ? dateCompare : b.time.localeCompare(a.time);
      });
      
      setAllAppointments(sortedApts);
      
      // Calculate upcoming appointments (pending and confirmed, not today or past)
      const today = new Date().toISOString().split('T')[0];
      const upcomingApts = sortedApts.filter(
        (apt: Appointment) => apt.date >= today && ['pending', 'confirmed'].includes(apt.status)
      );
      setUpcomingAppointments(upcomingApts);
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

  // Filter appointments based on selected statuses
  const filteredAppointments = allAppointments.filter(apt => 
    statusFilters[apt.status as keyof typeof statusFilters]
  );

  // Calculate pending and confirmed counts for upcoming appointments
  const upcomingPendingCount = upcomingAppointments.filter(apt => apt.status === 'pending').length;
  const upcomingConfirmedCount = upcomingAppointments.filter(apt => apt.status === 'confirmed').length;

  const stats = [
    {
      label: "Upcoming Appointments",
      value: upcomingAppointments.length,
      details: [
        { label: 'Pending', count: upcomingPendingCount },
        { label: 'Confirmed', count: upcomingConfirmedCount },
      ],
      icon: '📅',
      color: 'bg-blue-500',
    },
    {
      label: 'View Schedule',
      value: 'Schedule',
      icon: '📋',
      color: 'bg-green-500',
      link: '/app/doctor/schedule',
    },
    {
      label: 'Manage Availability',
      value: 'Settings',
      icon: '⚙️',
      color: 'bg-cyan-500',
      link: '/app/doctor/schedule-settings',
    },
    {
      label: 'Medical Records',
      value: 'Records',
      icon: '📝',
      color: 'bg-purple-500',
      link: '/app/doctor/records',
    },
    {
      label: 'Edit Profile',
      value: 'Profile',
      icon: '👤',
      color: 'bg-orange-500',
      link: '/app/profile',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Welcome, Dr. {user?.name}!
        </h1>
        <p className="text-slate-600">Here's your schedule overview</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <Link
            key={idx}
            to={stat.link || '#'}
            className="bento-card group hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mb-2">{stat.value}</p>
                {/* Bulletpoints for Upcoming Appointments */}
                {stat.details && (
                  <div className="space-y-1">
                    {stat.details.map((detail: any, i: number) => (
                      <p key={i} className="text-xs text-slate-600">
                        • {detail.label}: <span className="font-semibold">{detail.count}</span>
                      </p>
                    ))}
                  </div>
                )}
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl text-white`}>
                {stat.icon}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* All Appointments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">All Appointments</h2>
          <Link
            to="/app/doctor/schedule"
            className="text-pastel-blue-600 hover:underline font-medium"
          >
            View Schedule
          </Link>
        </div>

        {/* Status Filter Checkboxes */}
        <div className="mb-4 p-4 bg-slate-50 rounded-lg flex flex-wrap gap-6">
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-48" />
            ))}
          </div>
        ) : filteredAppointments.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No appointments"
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
    </div>
  );
};

