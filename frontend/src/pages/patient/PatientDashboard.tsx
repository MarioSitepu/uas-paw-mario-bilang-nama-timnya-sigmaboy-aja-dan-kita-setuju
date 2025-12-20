import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, Stethoscope, FileText, Bell } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell';
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
      color: 'bg-indigo-500',
      link: '/app/patient/appointments/new',
    },
    {
      label: 'Medical Records',
      value: 'Records',
      icon: FileText,
      color: 'bg-purple-500',
      link: '/app/patient/records',
    },
    {
      label: 'Notifications',
      value: 'All Read',
      icon: Bell,
      color: 'bg-amber-500',
      link: '#',
      isNotification: true
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Similar to Landing Page */}
      <section className="relative overflow-hidden">
        {/* Background with Gradient */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 via-transparent to-transparent"></div>
          {/* Floating particles effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${20 + i * 8}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${3 + i * 0.4}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <div className="mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse shadow-lg"></div>
                <span className="text-sm font-semibold text-blue-100">Sistem Online</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                <span className="block bg-gradient-to-r from-white via-blue-50 to-white bg-clip-text text-transparent">
                  Selamat Datang Kembali,
                </span>
                <span className="block mt-2">{user?.name}!</span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-50 mb-6 max-w-2xl font-medium">
                Perjalanan kesehatan Anda adalah prioritas kami. Berikut ringkasan aktivitas Anda.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="backdrop-blur-xl bg-white/15 border border-white/20 rounded-2xl p-6 shadow-xl">
                <div className="text-3xl font-extrabold text-white mb-1">{upcomingAppointments.length}</div>
                <div className="text-sm text-blue-100 font-medium">Janji Mendatang</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="space-y-8 animate-in fade-in duration-700">

          {/* Stats Bento Grid - Glassmorphism Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, idx) => {
              const IconComponent = stat.icon;
              const isNotification = 'isNotification' in stat && stat.isNotification;

              const content = (
                <>
                  <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-20 group-hover:scale-125 transition-transform duration-500 ${stat.color}`}></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                    </div>
                    <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 group-hover:scale-110 transition-all duration-300`}>
                      {isNotification ? <NotificationBell /> : <IconComponent size={28} className="text-white" />}
                    </div>
                  </div>
                  {!isNotification && (
                    <div className="mt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                      Lihat {stat.label.split(' ')[0]} →
                    </div>
                  )}
                </>
              );

              if (isNotification) {
                return (
                  <div
                    key={idx}
                    className="group relative overflow-visible backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={idx}
                  to={stat.link}
                  className="group relative overflow-hidden backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 hover:bg-white/90 transition-all duration-500"
                >
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Upcoming Appointments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-2xl shadow-lg">📅</div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Janji Temu Mendatang</h2>
                  <p className="text-sm text-slate-500">Jadwal konsultasi Anda</p>
                </div>
              </div>
              <Link
                to="/app/patient/appointments"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                Lihat Semua
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
              <div className="backdrop-blur-xl bg-white/80 border border-white/20 rounded-3xl p-12 text-center shadow-xl">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="text-6xl animate-bounce">📅</div>
                  <h3 className="text-2xl font-bold text-slate-800">Belum Ada Janji Temu</h3>
                  <p className="text-slate-600 leading-relaxed text-lg">
                    Jadwal Anda masih kosong! Jaga kesehatan Anda dengan membuat janji temu rutin dengan dokter spesialis kami.
                  </p>
                  <Link
                    to="/app/patient/appointments/new"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    <span>➕</span> Buat Janji Temu
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
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.6; }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
