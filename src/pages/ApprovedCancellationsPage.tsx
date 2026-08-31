import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import {
  Ban,
  Trash2,
  Search,
  Building2,
  Calendar,
  Clock,
  User as UserIcon,
  AlertTriangle,
  FileText,
  CheckCircle2,
  X,
  Layers,
  History,
  ShieldAlert,
  ArrowRight,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndonesianDate } from '../utils/bookingUtils';
import { Booking } from '../types';

export const ApprovedCancellationsPage: React.FC = () => {
  const { bookings, rooms, cancelBooking, deleteBooking } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'APPROVED' | 'CANCELLED'>('APPROVED');
  const [search, setSearch] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string>('ALL');

  // Cancel Modal State
  const [cancelModalState, setCancelModalState] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    alasan: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    booking: null,
    alasan: '',
    isSubmitting: false,
  });

  // Delete Modal State
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    booking: Booking | null;
    alasan: string;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    booking: null,
    alasan: '',
    isSubmitting: false,
  });

  if (!currentUser) return null;

  // Quick preset reasons for cancellation
  const PRESET_REASONS = [
    'Ruangan dialihkan untuk rapat mendadak Pimpinan / Menteri',
    'Perubahan jadwal atau agenda kedinasan mendesak',
    'Kegiatan dibatalkan oleh unit kerja pemohon',
    'Kegiatan dialihkan menjadi pertemuan daring (Zoom/Online)',
    'Pemeliharaan / perbaikan fasilitas ruangan',
  ];

  // Filter approved and cancelled bookings
  const approvedBookings = bookings.filter((b) => b.status === 'DISETUJUI');
  const cancelledBookings = bookings.filter((b) => b.status === 'DIBATALKAN');

  const currentDataset = activeTab === 'APPROVED' ? approvedBookings : cancelledBookings;

  const filteredBookings = currentDataset.filter((b) => {
    const matchesSearch =
      b.nomor_peminjaman.toLowerCase().includes(search.toLowerCase()) ||
      b.peminjam_nama.toLowerCase().includes(search.toLowerCase()) ||
      b.peminjam_nip.toLowerCase().includes(search.toLowerCase()) ||
      b.keperluan.toLowerCase().includes(search.toLowerCase()) ||
      b.unit_nama.toLowerCase().includes(search.toLowerCase()) ||
      b.room_nama.toLowerCase().includes(search.toLowerCase());

    const matchesRoom = selectedRoom === 'ALL' || b.room_id === selectedRoom;

    return matchesSearch && matchesRoom;
  });

  const handleOpenCancelModal = (booking: Booking) => {
    setCancelModalState({
      isOpen: true,
      booking,
      alasan: '',
      isSubmitting: false,
    });
  };

  const handleConfirmCancel = () => {
    if (!cancelModalState.booking) return;
    if (!cancelModalState.alasan.trim()) {
      alert('Mohon masukkan alasan pembatalan pengajuan.');
      return;
    }

    setCancelModalState((prev) => ({ ...prev, isSubmitting: true }));
    cancelBooking(cancelModalState.booking.id, cancelModalState.alasan.trim());
    setCancelModalState({
      isOpen: false,
      booking: null,
      alasan: '',
      isSubmitting: false,
    });
  };

  const handleOpenDeleteModal = (booking: Booking) => {
    setDeleteModalState({
      isOpen: true,
      booking,
      alasan: '',
      isSubmitting: false,
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.booking) return;

    setDeleteModalState((prev) => ({ ...prev, isSubmitting: true }));
    deleteBooking(deleteModalState.booking.id, deleteModalState.alasan.trim());
    setDeleteModalState({
      isOpen: false,
      booking: null,
      alasan: '',
      isSubmitting: false,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <Ban className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight">
                Pembatalan & Penghapusan Pengajuan
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Wewenang khusus Kepala Bagian Umum untuk membatalkan atau menghapus pengajuan yang telah disetujui.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200">
            <span>Disetujui Aktif: </span>
            <span className="text-blue-700 font-extrabold">{approvedBookings.length}</span>
          </div>
          <div className="px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-bold text-slate-700 border border-slate-200">
            <span>Dibatalkan: </span>
            <span className="text-rose-600 font-extrabold">{cancelledBookings.length}</span>
          </div>
        </div>
      </div>

      {/* Role Authority Notice Card */}
      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-start gap-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-amber-950">
            Hak Diskresi Pimpinan (Kepala Bagian Umum)
          </p>
          <p className="leading-relaxed text-amber-800 text-[11px]">
            Pengajuan yang berstatus <strong>DISETUJUI</strong> mengunci jadwal ruangan. Jika Anda melakukan{' '}
            <strong>Pembatalan</strong> atau <strong>Penghapusan</strong>, jadwal ruangan pada tanggal & waktu tersebut akan otomatis dibebaskan kembali, pemohon akan menerima notifikasi resmi, dan seluruh aktivitas akan tercatat pada Audit Trail.
          </p>
        </div>
      </div>

      {/* Tabs & Search Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab('APPROVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'APPROVED'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengajuan Disetujui ({approvedBookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('CANCELLED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'CANCELLED'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-rose-600" />
            <span>Riwayat Dibatalkan ({cancelledBookings.length})</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 flex-1 sm:max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor, peminjam, unit, atau keperluan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Semua Ruang</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nama_ruang}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table / List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBookings.length === 0 ? (
          <EmptyState
            title={
              activeTab === 'APPROVED'
                ? 'Tidak Ada Pengajuan Disetujui'
                : 'Belum Ada Riwayat Pembatalan'
            }
            description={
              activeTab === 'APPROVED'
                ? 'Saat ini tidak ada pengajuan peminjaman ruangan yang berstatus Disetujui.'
                : 'Belum ada pengajuan peminjaman yang dibatalkan oleh pimpinan.'
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nomor / Peminjam</th>
                  <th className="p-3.5">Keperluan Rapat</th>
                  <th className="p-3.5">Tanggal & Waktu</th>
                  <th className="p-3.5">Ruang Rapat</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Tindakan Kabag Umum</th>
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
                      <span className="text-[10px] text-slate-500 block">
                        NIP: {b.peminjam_nip} • {b.unit_nama}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <p className="font-bold text-slate-800 leading-snug line-clamp-2">
                        {b.keperluan}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        {b.jumlah_peserta} Orang Peserta
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <strong className="block text-slate-900">
                        {formatIndonesianDate(b.tanggal)}
                      </strong>
                      <span className="text-[11px] font-mono text-slate-500">
                        {b.jam_mulai} - {b.jam_selesai} WIB
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        {b.room_nama}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={b.status} size="sm" />
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                        title="Lihat Detail Pengajuan"
                      >
                        Detail
                      </button>

                      {/* Action buttons for Kabag Umum */}
                      {b.status === 'DISETUJUI' && (
                        <>
                          <button
                            onClick={() => handleOpenCancelModal(b)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                            title="Batalkan Pengajuan yang Telah Disetujui"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Batalkan</span>
                          </button>

                          <button
                            onClick={() => handleOpenDeleteModal(b)}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-2xs inline-flex items-center gap-1"
                            title="Hapus Pengajuan Secara Permanen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </>
                      )}

                      {/* If already cancelled, Kabag can still delete the record if necessary */}
                      {b.status === 'DIBATALKAN' && (
                        <button
                          onClick={() => handleOpenDeleteModal(b)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                          title="Hapus Arsip Pengajuan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Arsip</span>
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

      {/* ================= CANCEL MODAL ================= */}
      {cancelModalState.isOpen && cancelModalState.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-amber-50 border-b border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-amber-950">
                <div className="p-2 bg-amber-600 text-white rounded-xl">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Batalkan Pengajuan Disetujui
                  </h3>
                  <p className="text-[11px] text-amber-800">
                    Nomor: {cancelModalState.booking.nomor_peminjaman}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setCancelModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Summary Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-bold text-slate-900">
                    {cancelModalState.booking.peminjam_nama} ({cancelModalState.booking.unit_nama})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ruangan:</span>
                  <span className="font-bold text-blue-700">
                    {cancelModalState.booking.room_nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal & Jam:</span>
                  <span className="font-bold text-slate-800">
                    {formatIndonesianDate(cancelModalState.booking.tanggal)} (
                    {cancelModalState.booking.jam_mulai} - {cancelModalState.booking.jam_selesai} WIB)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Keperluan:</span>
                  <span className="font-bold text-slate-800 text-right max-w-xs truncate">
                    {cancelModalState.booking.keperluan}
                  </span>
                </div>
              </div>

              {/* Warning */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Status pengajuan ini akan berubah menjadi <strong>DIBATALKAN</strong>. Jadwal ruangan akan langsung dibebaskan dan notifikasi pembatalan akan dikirimkan ke peminjam.
                </p>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Alasan Pembatalan / Diskresi Pimpinan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan alasan pembatalan pengajuan peminjaman ruangan..."
                  value={cancelModalState.alasan}
                  onChange={(e) =>
                    setCancelModalState((prev) => ({ ...prev, alasan: e.target.value }))
                  }
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />

                {/* Preset Suggestions */}
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Pilih Cepat Alasan Umum:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_REASONS.map((reason, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() =>
                          setCancelModalState((prev) => ({ ...prev, alasan: reason }))
                        }
                        className="px-2.5 py-1 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 text-[10px] font-medium rounded-lg transition-colors cursor-pointer text-left"
                      >
                        + {reason}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setCancelModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                disabled={!cancelModalState.alasan.trim() || cancelModalState.isSubmitting}
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Ban className="w-4 h-4" />
                <span>Konfirmasi Batalkan Pengajuan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE MODAL ================= */}
      {deleteModalState.isOpen && deleteModalState.booking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-rose-50 border-b border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-rose-950">
                <div className="p-2 bg-rose-600 text-white rounded-xl">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Hapus Pengajuan Peminjaman
                  </h3>
                  <p className="text-[11px] text-rose-700">
                    Nomor: {deleteModalState.booking.nomor_peminjaman}
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDeleteModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Summary Card */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Peminjam:</span>
                  <span className="font-bold text-slate-900">
                    {deleteModalState.booking.peminjam_nama} ({deleteModalState.booking.unit_nama})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ruangan:</span>
                  <span className="font-bold text-blue-700">
                    {deleteModalState.booking.room_nama}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal:</span>
                  <span className="font-bold text-slate-800">
                    {formatIndonesianDate(deleteModalState.booking.tanggal)}
                  </span>
                </div>
              </div>

              {/* Danger Warning */}
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-[11px] text-rose-900">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <p>
                  <strong>PERINGATAN:</strong> Tindakan ini akan <strong>menghapus permanen</strong> data pengajuan peminjaman ini dari database dan membebaskan jadwal ruangan. Aksi ini tidak dapat diurungkan.
                </p>
              </div>

              {/* Optional reason */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Alasan Penghapusan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Duplikasi data / Pembatalan resmi pimpinan"
                  value={deleteModalState.alasan}
                  onChange={(e) =>
                    setDeleteModalState((prev) => ({ ...prev, alasan: e.target.value }))
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() =>
                  setDeleteModalState((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={deleteModalState.isSubmitting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Permanen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
