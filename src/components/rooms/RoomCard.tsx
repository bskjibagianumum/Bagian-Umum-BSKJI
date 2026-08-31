import React from 'react';
import { Room } from '../../types';
import { Building2, Users, MapPin, Edit3, ShieldAlert, CheckCircle2, Calendar } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onEdit?: (room: Room) => void;
  onBook?: (room: Room) => void;
  onViewSchedule?: (room: Room) => void;
  canManage?: boolean;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onEdit,
  onBook,
  onViewSchedule,
  canManage = false,
}) => {
  const statusColors = {
    Aktif: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Tidak Aktif': 'bg-slate-100 text-slate-700 border-slate-200',
    'Dalam Perbaikan': 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-300">
      <div>
        {/* Photo Banner */}
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          <img
            src={room.foto}
            alt={room.nama_ruang}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full border shadow-xs ${
                statusColors[room.status]
              }`}
            >
              {room.status}
            </span>
          </div>
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl">
            Lantai {room.lantai}
          </div>
        </div>

        {/* Info Content */}
        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-black text-slate-900">{room.nama_ruang}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{room.lokasi}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-900 text-xs font-bold rounded-lg border border-blue-100">
              <Users className="w-3.5 h-3.5 text-blue-600" /> Kapasitas: {room.kapasitas} orang
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {room.keterangan}
          </p>

          {/* Fasilitas */}
          {room.fasilitas && room.fasilitas.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Fasilitas Utama
              </span>
              <div className="flex flex-wrap gap-1.5">
                {room.fasilitas.map((f, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg border border-slate-200/60"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {canManage && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(room)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          )}

          {onViewSchedule && (
            <button
              type="button"
              onClick={() => onViewSchedule(room)}
              className="px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Lihat Jadwal Ruangan Ini"
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Jadwal
            </button>
          )}
        </div>

        {onBook && room.status === 'Aktif' && (
          <button
            type="button"
            onClick={() => onBook(room)}
            className="flex-1 py-2 px-3.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs text-center cursor-pointer"
          >
            Pinjam Ruang →
          </button>
        )}
      </div>
    </div>
  );
};
