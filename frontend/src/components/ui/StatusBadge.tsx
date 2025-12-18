import React from 'react';
import type { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    },
    confirmed: {
      label: 'Confirmed',
      className: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-800 border-green-200',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-red-100 text-red-800 border-red-200',
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.label}
    </span>
  );
};

