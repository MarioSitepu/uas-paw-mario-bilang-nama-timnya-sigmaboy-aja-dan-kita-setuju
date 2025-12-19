import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import type { Appointment } from '../../types';
import { AppointmentCard } from '../../components/cards/AppointmentCard';
import { LoadingSkeleton } from '../../components/ui/LoadingSkeleton';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAppointments = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const { appointmentsAPI } = await import('../../services/api');
      // Fetch all appointments (don't filter by status=pending only in API, let frontend filter)
      const response = await appointmentsAPI.getAll();

      const rawAppointments = response.data.appointments || [];
      const all: Appointment[] = rawAppointments.map((raw: any) => ({
        ...raw,
        id: raw.id,
        patientId: raw.patient_id,
        doctorId: raw.doctor_id,
        date: raw.appointment_date,
        time: raw.appointment_time,
        status: raw.status,
        reason: raw.reason,
        notes: raw.notes,
        doctor: raw.doctor ? {
          ...raw.doctor,
          id: raw.doctor.id,
          name: raw.doctor.name || 'Doctor',
          specialization: raw.doctor.specialization,
          photoUrl: raw.doctor.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.doctor.name || 'D')}&background=random`,
          clinic: raw.doctor.clinic || 'Clinic'
        } : undefined,
        patient: raw.patient ? {
          ...raw.patient,
          photoUrl: raw.patient.profile_photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(raw.patient.name || 'P')}&background=random`
        } : undefined
      }));

      // Filter for upcoming (pending/confirmed) and future/today dates
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

      const upcoming = all
        .filter((apt) => ['pending', 'confirmed'].includes(apt.status))
        .filter((apt) => {
          const todayStr = new Date().toISOString().split('T')[0];
          return apt.date >= todayStr;
        })
        .sort((a, b) => {
          if (a.date === b.date) return a.time.localeCompare(b.time);
          return a.date.localeCompare(b.date);
        })
        .slice(0, 3);
      setUpcomingAppointments(upcoming);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  const stats = [
    {
      label: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
      link: '/app/patient/appointments',
    },
    {
      label: 'Find Doctors',
      value: 'Browse',
      icon: Stethoscope,
      color: 'bg-green-500',
      link: '/app/patient/doctors',
    },
    {
      label: 'Book New',
      value: 'Appointment',
      icon: Plus,
      color: 'bg-purple-500',
      link: '/app/patient/appointments/new',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pastel-blue-600 to-pastel-blue-400">{user?.name}</span>!
          </h1>
          <p className="text-lg text-slate-600 font-medium">Your health journey is our priority. Here's your overview.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white rounded-full border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-sm font-semibold text-slate-700">System Online</span>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link
              key={idx}
              to={stat.link}
              className="group relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 group-hover:scale-110 transition-transform ${stat.color}`}></div>
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg group-hover:rotate-12 transition-transform`}>
                  <IconComponent size={32} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm font-semibold text-slate-400 group-hover:text-pastel-blue-600 transition-colors">
                Go to {stat.label.split(' ')[0]} →
              </div>
            </Link>
          );
        })}
      </div>

      {/* Upcoming Appointments */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pastel-blue-100 rounded-xl flex items-center justify-center text-xl">📅</div>
            <h2 className="text-2xl font-bold text-slate-800">Upcoming Appointments</h2>
          </div>
          <Link
            to="/app/patient/appointments"
            className="group flex items-center gap-2 text-pastel-blue-600 hover:text-pastel-blue-700 font-bold transition-all"
          >
            View All
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <LoadingSkeleton key={i} className="h-48 rounded-3xl" />
            ))}
          </div>
        ) : upcomingAppointments.length === 0 ? (
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-[2rem] p-12 text-center shadow-sm">
            <div className="max-w-md mx-auto space-y-6">
              <div className="text-6xl animate-bounce">📅</div>
              <h3 className="text-2xl font-bold text-slate-800">No upcoming appointments</h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Your schedule looks clear! Maintain your health by booking a routine checkup with our specialist doctors.
              </p>
              <Link
                to="/app/patient/appointments/new"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-blue text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              >
                <span>➕</span> Book Your Appointment
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                showActions={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
