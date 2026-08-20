import React from 'react';
import { CalendarView } from '../components/calendar/CalendarView';

export const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <CalendarView />
    </div>
  );
};
