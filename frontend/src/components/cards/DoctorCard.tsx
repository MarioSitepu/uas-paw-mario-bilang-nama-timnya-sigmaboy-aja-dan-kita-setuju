import React, { useState } from 'react';
import type { Doctor } from '../../types';
import { Link } from 'react-router-dom';
import { ChevronDown, MessageCircle } from 'lucide-react';

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
    <div className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 flex flex-col h-full hover:-translate-y-1">
      {/* Compact Card Header */}
      <div className="h-16 bg-gradient-to-r from-blue-700 to-blue-900 relative">
        <div className="absolute inset-0 bg-white/5 opacity-30 pattern-grid-lg"></div>
      </div>

      {/* Content Container */}
      <div className="px-4 pb-4 flex-1 flex flex-col relative">
        {/* Avatar - Compact Overlap */}
        <div className="relative -mt-8 mb-2 flex justify-between items-end">
          <img
            src={doctor.photoUrl}
            alt={doctor.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-md bg-white"
          />
          <span className="flex items-center gap-1 text-xs font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg mb-1">
            ⭐ {doctor.rating}
          </span>
        </div>

        {/* Doctor Info */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-900 leading-tight mb-1">{doctor.name}</h3>
          <p className="text-sm font-medium text-slate-500 mb-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            {doctor.specialization}
          </p>

          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <span>📍</span>
            <span className="truncate">{doctor.clinic}</span>
          </div>

          {doctor.bio && (
            <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">
              {doctor.bio}
            </p>
          )}
        </div>

        {/* Schedule & Action */}
        <div className="mt-auto space-y-2">
          {/* Schedule Dropdown - Compact */}
          <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
            <button
              onClick={() => setIsScheduleExpanded(!isScheduleExpanded)}
              className="w-full px-3 py-2 flex items-center justify-between hover:bg-slate-100 transition-colors group/schedule"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">📅</span>
                <span className="text-xs font-semibold text-slate-700">Schedule</span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-500 transition-transform duration-300 ${isScheduleExpanded ? 'transform rotate-180' : 'group-hover/schedule:translate-y-0.5'
                  }`}
              />
            </button>

            {isScheduleExpanded && (
              <div className="px-3 py-2 bg-white border-t border-slate-200 space-y-1 animate-slide-down">
                {scheduleDisplay.length > 0 ? (
                  scheduleDisplay.map((sched, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-[10px] p-1.5 rounded bg-blue-50/30"
                    >
                      <span className="font-semibold text-slate-700">{sched.day}</span>
                      <span className="font-bold text-blue-600">{sched.time}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-400 text-center italic">None available</p>
                )}
              </div>
            )}
          </div>

          {showBookButton && (
            <div className="space-y-2">
              <Link
                to={`/app/patient/appointments/new?doctorId=${doctor.id}`}
                className="block w-full text-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-bold text-sm shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
              >
                Book
              </Link>
              
              <Link
                to={`/app/patient/chat/${doctor.user_id || doctor.userId}`}
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-lg font-bold text-sm shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle size={16} />
                Message
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

