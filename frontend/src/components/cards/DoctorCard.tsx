import React, { useState } from 'react';
import type { Doctor } from '../../types';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface DoctorCardProps {
  doctor: Doctor;
  showBookButton?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, showBookButton = true }) => {
  const [isScheduleExpanded, setIsScheduleExpanded] = useState(false);

  // Format schedule to show only available days with times
  const formatScheduleForDisplay = () => {
    if (!doctor.schedule || typeof doctor.schedule !== 'object') {
      return [];
    }

    return Object.entries(doctor.schedule)
      .map(([day, dayData]: [string, any]) => {
        // Check if day is available
        if (!dayData || dayData.available === false) {
          return null;
        }

        const dayName = day.charAt(0).toUpperCase() + day.slice(1);
        const startTime = dayData.startTime || '09:00';
        const endTime = dayData.endTime || '17:00';

        return {
          day: dayName,
          time: `${startTime}-${endTime}`
        };
      })
      .filter((item) => item !== null) as Array<{ day: string; time: string }>;
  };

  const scheduleDisplay = formatScheduleForDisplay();

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full">
      {/* Card Header with Blue Gradient */}
      <div className="h-24 bg-gradient-to-r from-blue-700 to-blue-900 relative">
        <div className="absolute inset-0 bg-white/5 opacity-30 pattern-grid-lg"></div>
      </div>

      {/* Content Container */}
      <div className="px-5 pb-5 flex-1 flex flex-col relative">
        {/* Avatar - Overlapping Header */}
        <div className="relative -mt-12 mb-3">
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md mx-auto sm:mx-0"
          />
        </div>

        {/* Doctor Info */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{doctor.name}</h3>
          <p className="text-sm font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-1 rounded-md mb-3">
            {doctor.specialization}
          </p>

          <div className="flex flex-col gap-2 mb-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-yellow-100 text-yellow-600">
                ⭐
              </span>
              <span className="font-bold text-slate-900">{doctor.rating}</span>
              <span className="text-slate-400">Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600">
                📍
              </span>
              <span className="font-medium">{doctor.clinic}</span>
            </div>
          </div>

          {doctor.bio && (
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
              {doctor.bio}
            </p>
          )}
        </div>

        {/* Schedule & Action - Pushed to bottom */}
        <div className="mt-auto space-y-3">
          {/* Schedule Dropdown */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-100 transition-colors group/schedule"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <span className="text-sm font-semibold text-slate-700">Available Schedule</span>
              </div>
              <ChevronDown
                size={16}
                className={`text-slate-500 transition-transform duration-300 ${isScheduleExpanded ? 'transform rotate-180' : 'group-hover/schedule:translate-y-0.5'
                  }`}
              />
            </button>

            {isScheduleExpanded && (
              <div className="px-4 py-3 bg-white border-t border-slate-200 space-y-2 animate-slide-down">
                {scheduleDisplay.length > 0 ? (
                  scheduleDisplay.map((sched, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs p-2 rounded-lg bg-blue-50/50 hover:bg-blue-50 transition-colors"
                    >
                      <span className="font-semibold text-slate-700">{sched.day}</span>
                      <span className="font-bold text-blue-600 bg-white px-2 py-0.5 rounded shadow-sm border border-blue-100">{sched.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 text-center py-2 italic">No schedule available</p>
                )}
              </div>
            )}
          </div>

          {showBookButton && (
            <Link
              to={`/app/patient/appointments/new?doctorId=${doctor.id}`}
              className="block w-full text-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-600/40 transition-all transform hover:-translate-y-0.5"
            >
              Book Appointment
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

