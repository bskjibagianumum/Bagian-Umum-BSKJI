import React, { useState } from 'react';
import { Booking } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { StatusBadge } from '../common/Badge';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  Building2,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalendarView: React.FC = () => {
  const { bookings, rooms } = useApp();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('ALL');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 7, 12)); // August 2026 default

  // Filter bookings by selected room
  const filteredBookings = bookings.filter((b) => {
    if (selectedRoomId !== 'ALL' && b.room_id !== selectedRoomId) return false;
    return true;
  });

  // Navigate month
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  // Helper to format month header
  const monthYearStr = currentDate.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Build Month Grid matrix
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysGrid.push(d);
  }

  return (
    <div className="space-y-4">
      {/* Calendar Controls Top Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Month Navigator */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900 capitalize">
              {monthYearStr}
            </h2>
            <p className="text-xs text-slate-500">Jadwal Penggunaan Ruang Rapat BSKJI</p>
          </div>

          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date(2026, 7, 12))}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Hari Ini
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: View Modes + Room Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Room Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedRoomId}
              onChange={(e) => setSelectedRoomId(e.target.value)}
              className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-none"
            >
              <option value="ALL">Semua Ruang Rapat</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruang}
                </option>
              ))}
            </select>
          </div>

          {/* View Modes Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'month' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Bulan
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'week' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Minggu
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                viewMode === 'day' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Hari
            </button>
          </div>
        </div>
      </div>

      {/* MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Days Header */}
          <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200 text-center py-2.5 text-xs font-bold text-slate-600">
            <div>Minggu</div>
            <div>Senin</div>
            <div>Selasa</div>
            <div>Rabu</div>
            <div>Kamis</div>
            <div>Jumat</div>
            <div>Sabtu</div>
          </div>

          {/* Days Matrix */}
          <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
            {daysGrid.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={idx} className="bg-slate-50/40 p-2 min-h-[100px]" />;
              }

              const formattedDay = String(dayNum).padStart(2, '0');
              const formattedMonth = String(month + 1).padStart(2, '0');
              const dateStr = `${year}-${formattedMonth}-${formattedDay}`;

              // Get bookings on this date
              const dayBookings = filteredBookings.filter((b) => b.tanggal === dateStr);
              const isToday = dayNum === 12 && month === 7 && year === 2026;

              return (
                <div
                  key={idx}
                  className={`p-2 min-h-[110px] flex flex-col justify-start transition-colors hover:bg-slate-50/80 ${
                    isToday ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isToday
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-700 bg-slate-100'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="text-[10px] font-bold text-blue-600">
                        {dayBookings.length} Rapat
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mt-1 overflow-y-auto max-h-[100px]">
                    {dayBookings.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="p-1.5 rounded-lg bg-blue-50 border border-blue-200/80 hover:bg-blue-100 cursor-pointer transition-colors text-[11px]"
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-blue-900">
                          <span>
                            {b.jam_mulai} - {b.jam_selesai}
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 truncate leading-tight mt-0.5">
                          {b.keperluan}
                        </p>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {b.room_nama}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* WEEK OR DAY VIEW LIST */}
      {(viewMode === 'week' || viewMode === 'day') && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Agenda Kegiatan Terjadwal ({filteredBookings.length})
          </h3>

          <div className="space-y-3">
            {filteredBookings.map((b) => (
              <div
                key={b.id}
                onClick={() => navigate(`/bookings/${b.id}`)}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      {b.nomor_peminjaman}
                    </span>
                    <StatusBadge status={b.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{b.keperluan}</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" /> {b.room_nama}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {b.tanggal} (
                      {b.jam_mulai} - {b.jam_selesai} WIB)
                    </span>
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" /> {b.peminjam_nama}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="inline-block px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100">
                    Lihat Detail →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
