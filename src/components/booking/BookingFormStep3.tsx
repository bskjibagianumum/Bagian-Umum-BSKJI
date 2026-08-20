import React from 'react';
import { Room, RoomAvailabilityResult } from '../../types';
import { checkRoomAvailability, formatIndonesianDate } from '../../utils/bookingUtils';
import { useApp } from '../../contexts/AppContext';
import {
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface Step3Props {
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jumlahPeserta: number;
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onSuggestAlternativeTime?: (newStart: string, newEnd: string) => void;
}

export const BookingFormStep3: React.FC<Step3Props> = ({
  tanggal,
  jamMulai,
  jamSelesai,
  jumlahPeserta,
  selectedRoomId,
  onSelectRoom,
  onSuggestAlternativeTime,
}) => {
  const { rooms, bookings } = useApp();

  // Evaluate availability for ALL master rooms
  const availabilityResults: RoomAvailabilityResult[] = rooms.map((room) =>
    checkRoomAvailability(
      room,
      tanggal,
      jamMulai,
      jamSelesai,
      jumlahPeserta,
      bookings
    )
  );

  const availableRooms = availabilityResults.filter((r) => r.is_available);
  const unavailableRooms = availabilityResults.filter((r) => !r.is_available);

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="text-[10px] font-bold text-blue-300 uppercase tracking-wider block">
            Parameter Pencarian Otomatis
          </span>
          <p className="text-xs font-bold mt-0.5">
            {formatIndonesianDate(tanggal)} • {jamMulai} - {jamSelesai} WIB ({jumlahPeserta} Peserta)
          </p>
        </div>
        <div className="px-3 py-1 bg-blue-600/80 rounded-xl text-[11px] font-bold text-blue-100 flex items-center gap-1.5 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Anti-Double Booking Active</span>
        </div>
      </div>

      {/* SECTION 1: RUANG TERSEDIA */}
      <div>
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          RUANG TERSEDIA ({availableRooms.length})
        </h3>

        {availableRooms.length === 0 ? (
          <div className="p-6 bg-rose-50/80 border border-rose-200 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                ⚠ Tidak ada ruangan yang tersedia pada tanggal dan waktu yang dipilih.
              </h4>
              <p className="text-xs text-rose-700 max-w-md mx-auto mt-1 leading-relaxed">
                Seluruh ruangan aktif yang memenuhi kapasitas saat ini telah digunakan atau mengalami bentrok jadwal.
              </p>
            </div>

            {/* Alternatif Waktu Suggestion Box */}
            <div className="pt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => onSuggestAlternativeTime && onSuggestAlternativeTime('13:00', '16:00')}
                className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-rose-600" /> Coba Sesi Siang (13.00 - 16.00 WIB)
              </button>
              <button
                type="button"
                onClick={() => onSuggestAlternativeTime && onSuggestAlternativeTime('08:00', '10:00')}
                className="px-3 py-1.5 bg-white border border-rose-300 text-rose-800 text-xs font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-rose-600" /> Coba Sesi Pagi (08.00 - 10.00 WIB)
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableRooms.map(({ room }) => {
              const isSelected = selectedRoomId === room.id;

              return (
                <div
                  key={room.id}
                  onClick={() => onSelectRoom(room.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="relative h-32 rounded-xl overflow-hidden mb-3 bg-slate-100">
                      <img
                        src={room.foto}
                        alt={room.nama_ruang}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                        Tersedia
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-tight">
                      {room.nama_ruang}
                    </h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{room.lokasi}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-700 font-medium mt-2">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                        <Users className="w-3 h-3 text-blue-600" /> Kapasitas: {room.kapasitas} orang
                      </span>
                    </div>

                    {/* Facilities pill tags */}
                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {room.fasilitas.slice(0, 4).map((f, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          {f}
                        </span>
                      ))}
                      {room.fasilitas.length > 4 && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md">
                          +{room.fasilitas.length - 4} lagi
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRoom(room.id);
                      }}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Ruang Terpilih
                        </>
                      ) : (
                        <>
                          [Gunakan Ruang Ini] <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: RUANG TIDAK TERSEDIA / BENTROK */}
      {unavailableRooms.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            Ruangan Tidak Tersedia / Bentrok Jadwal ({unavailableRooms.length})
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {unavailableRooms.map(({ room, reason, conflicting_booking }) => (
              <div
                key={room.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl opacity-75"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">{room.nama_ruang}</h5>
                    <p className="text-[11px] text-slate-500">{room.lokasi}</p>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md shrink-0">
                    Kapasitas {room.kapasitas} orang
                  </span>
                </div>

                <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200 rounded-lg text-[11px] text-amber-900 leading-snug">
                  ⚠ {reason}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
