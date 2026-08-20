import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  iconBgColor?: string;
  iconTextColor?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBgColor = 'bg-blue-50',
  iconTextColor = 'text-blue-600',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-between transition-all ${
        onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md' : ''
      }`}
    >
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900">{value}</span>
        </div>
        {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-lg ${iconBgColor} ${iconTextColor} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};
