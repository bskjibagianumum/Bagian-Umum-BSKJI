import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Search,
  Filter,
  FileText,
  Calendar,
  Building2,
  ChevronRight,
  PlusCircle,
  XCircle,
  Printer,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndonesianDate } from '../utils/bookingUtils';

export const BookingsListPage: React.FC = () => {
  const { bookings, rooms, cancelBooking } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');
  const [cancelModalBookingId, setCancelModalBookingId] = useState<string | null>(null);

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    // Role peminjam strictly only sees their own bookings
    if (currentUser.role_id === 'peminjam' && b.user_id !== currentUser.id) {
      return false;
    }

    const matchesSearch =
      b.nomor_peminjaman.toLowerCase().includes(search.toLowerCase()) ||
      b.peminjam_nama.toLowerCase().includes(search.toLowerCase()) ||
      b.keperluan.toLowerCase().includes(search.toLowerCase()) ||
      b.unit_nama.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      selectedStatus === 'ALL' || b.status === selectedStatus;

    const matchesRoom = selectedRoom === 'ALL' || b.room_id === selectedRoom;

    return matchesSearch && matchesStatus && matchesRoom;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Daftar Pengajuan Peminjaman Ruang Rapat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role_id === 'peminjam'
              ? 'Daftar seluruh riwayat pengajuan peminjaman Anda di lingkungan Sekretariat BSKJI.'
              : 'Daftar seluruh riwayat pengajuan peminjaman di lingkungan Sekretariat BSKJI.'}
          </p>
        </div>
        <button
          onClick={() => navigate('/bookings/new')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" /> Ajukan Peminjaman Baru
        </button>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor peminjaman, peminjam, atau keperluan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="MENUNGGU_PERSETUJUAN_ATASAN">Menunggu Atasan</option>
            <option value="MENUNGGU_PERSETUJUAN_KOORDINATOR">Menunggu Koordinator</option>
            <option value="MENUNGGU_PERSETUJUAN_KABAG">Menunggu Kabag</option>
            <option value="DISETUJUI">Disetujui (Locked)</option>
            <option value="SELESAI">Selesai</option>
            <option value="DITOLAK_ATASAN">Ditolak Atasan</option>
            <option value="DITOLAK_KOORDINATOR">Ditolak Koordinator</option>
            <option value="DITOLAK_KABAG">Ditolak Kabag</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </select>

          {/* Room Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">Semua Ruangan</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama_ruang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pengajuan Ditemukan"
            description="Tidak ada data peminjaman yang cocok dengan filter pencarian Anda."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nomor / Peminjam</th>
                  <th className="p-3.5">Keperluan Rapat</th>
                  <th className="p-3.5">Tanggal dan Jam</th>
                  <th className="p-3.5">Ruang Rapat</th>
                  <th className="p-3.5">Status Workflow</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-blue-700 block">
                        {b.nomor_peminjaman}
                      </span>
                      <span className="font-bold text-slate-900">{b.peminjam_nama}</span>
                      <span className="text-[10px] text-slate-400 block">{b.unit_nama}</span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-bold text-slate-800 leading-snug line-clamp-2">
                        {b.keperluan}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {b.jumlah_peserta} Peserta
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <strong>{formatIndonesianDate(b.tanggal)}</strong>
                      <span className="block text-[11px] font-mono text-slate-500">
                        {b.jam_mulai} - {b.jam_selesai} WIB
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-800">{b.room_nama}</td>
                    <td className="p-3.5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-lg transition-colors"
                      >
                        Detail →
                      </button>

                      {/* Cancel option for creator if still pending */}
                      {b.user_id === currentUser.id &&
                        b.status.startsWith('MENUNGGU') && (
                          <button
                            onClick={() => setCancelModalBookingId(b.id)}
                            className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 font-bold rounded-lg transition-colors"
                            title="Batalkan Pengajuan"
                          >
                            <XCircle className="w-4 h-4 inline" />
                          </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Cancel Modal */}
      <ConfirmDialog
        isOpen={cancelModalBookingId !== null}
        onClose={() => setCancelModalBookingId(null)}
        onConfirm={() => {
          if (cancelModalBookingId) {
            cancelBooking(cancelModalBookingId, 'Dibatalkan oleh peminjam.');
            setCancelModalBookingId(null);
          }
        }}
        title="Konfirmasi Pembatalan Pengajuan"
        message="Apakah Anda yakin ingin membatalkan pengajuan peminjaman ruangan ini? Pembatalan tidak dapat diurungkan."
        isDangerous
      />
    </div>
  );
};
