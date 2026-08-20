import React from 'react';
import { BookingStatus } from '../../types';
import { BOOKING_STATUS_META } from '../../constants/statuses';

interface BadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const StatusBadge: React.FC<BadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const meta = BOOKING_STATUS_META[status] || {
    label: status,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    dotClass: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider',
    md: 'px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
    lg: 'px-3 py-1 text-xs font-bold uppercase tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses[size]} ${meta.badgeClass} transition-colors shadow-xs`}
    >
      {showDot && (
        <span
          className={`inline-block w-2 h-2 rounded-full shrink-0 ${meta.dotClass}`}
        />
      )}
      <span className="whitespace-nowrap">{meta.label}</span>
    </span>
  );
};
