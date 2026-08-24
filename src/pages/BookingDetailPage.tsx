import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { BookingTimeline } from '../components/booking/BookingTimeline';
import { ApprovalActionModal } from '../components/approval/ApprovalActionModal';
import { EditBookingModal } from '../components/booking/EditBookingModal';
import {
  FileText,
  Calendar,
  Clock,
  Building2,
  User as UserIcon,
  Users,
  Printer,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building,
  Edit3,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/bookingUtils';

export const BookingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bookings, checkInBooking, checkOutBooking } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [approvalModalState, setApprovalModalState] = useState<{
    isOpen: boolean;
    actionType: 'APPROVE' | 'REJECT';
    level: 'KOORDINATOR' | 'KABAG';
  }>({
    isOpen: false,
    actionType: 'APPROVE',
    level: 'KOORDINATOR',
  });

  const booking = bookings.find((b) => b.id === id);

  if (!currentUser) return null;

  if (!booking) {
    return (
      <div className="p-12 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Data Peminjaman Tidak Ditemukan</h2>
        <button
          onClick={() => navigate('/bookings')}
          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          Kembali ke Daftar Pengajuan
        </button>
      </div>
    );
  }

  // Permissions to edit booking data
  const canEdit =
    currentUser.role_id === 'admin' ||
    currentUser.role_id === 'koordinator' ||
    (currentUser.id === booking.user_id && booking.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR');

  // Check if current user is active approver for this booking's current status
  const canApproveKoordinator =
    (currentUser.role_id === 'koordinator' || currentUser.role_id === 'admin') &&
    booking.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR';

  const canApproveKabag =
    (currentUser.role_id === 'kabag_umum' || currentUser.role_id === 'admin') &&
    booking.status === 'MENUNGGU_PERSETUJUAN_KABAG';

  const openApprovalModal = (
    actionType: 'APPROVE' | 'REJECT',
    level: 'KOORDINATOR' | 'KABAG'
  ) => {
    setApprovalModalState({ isOpen: true, actionType, level });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => setIsEditOpen(true)}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-blue-600" /> Ubah Data Peminjaman
            </button>
          )}

          {booking.status === 'DISETUJUI' && (
            <button
              onClick={() => navigate(`/bukti/${booking.id}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Bukti Peminjaman
            </button>
          )}
        </div>
      </div>

      {/* Main Detail Header Card */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {booking.nomor_peminjaman}
              </span>
              <StatusBadge status={booking.status} />
            </div>
            <h1 className="text-lg font-black text-slate-900 mt-2">{booking.keperluan}</h1>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-500">
            <span>Dibuat pada:</span>
            <p className="font-mono font-bold text-slate-800">
              {new Date(booking.created_at).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* APPROVAL ACTION BANNER FOR CURRENT USER */}
        {(canApproveKoordinator || canApproveKabag) && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-600 text-white rounded-xl shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-950">
                  Perlu Tindak Lanjut Persetujuan Anda
                </h4>
                <p className="text-[11px] text-amber-800">
                  Silakan evaluasi detail pengajuan di bawah ini, kemudian berikan persetujuan atau penolakan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canApproveKoordinator && (
                <>
                  <button
                    onClick={() => openApprovalModal('APPROVE', 'KOORDINATOR')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> [SETUJUI KOORDINATOR]
                  </button>
                  <button
                    onClick={() => openApprovalModal('REJECT', 'KOORDINATOR')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> [TOLAK KOORDINATOR]
                  </button>
                </>
              )}

              {canApproveKabag && (
                <>
                  <button
                    onClick={() => openApprovalModal('APPROVE', 'KABAG')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" /> [SETUJUI KABAG UMUM]
                  </button>
                  <button
                    onClick={() => openApprovalModal('REJECT', 'KABAG')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> [TOLAK KABAG UMUM]
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2-Column Detail Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Column 1 & 2: Particulars */}
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Ruang Rapat
                </span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-blue-600" /> {booking.room_nama}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Tanggal dan Waktu
                </span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" /> {formatIndonesianDate(booking.tanggal)}
                </p>
                <p className="font-mono text-slate-600 text-[11px]">
                  {booking.jam_mulai} - {booking.jam_selesai} WIB
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Data Peminjam
                </span>
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <UserIcon className="w-4 h-4 text-blue-600" /> {booking.peminjam_nama}
                </p>
                <p className="text-[11px] text-slate-500">
                  NIP: {booking.peminjam_nip} • {booking.unit_nama}
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Jumlah Peserta
                </span>
                <p className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" /> {booking.jumlah_peserta} Orang
                </p>
              </div>
            </div>

            {booking.keterangan && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Keterangan / Fasilitas Tambahan
                </span>
                <p className="text-slate-700 italic">"{booking.keterangan}"</p>
              </div>
            )}
          </div>

          {/* Column 3: Check-in status & Tiket */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Nomor Tiket Peminjaman
              </span>
              <span className="font-mono text-xs font-bold text-slate-800">
                {booking.nomor_peminjaman}
              </span>
            </div>

            {booking.check_in?.checked_in_at ? (
              <div className="p-2 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl w-full">
                ✓ Check-In Logged ({new Date(booking.check_in.checked_in_at).toLocaleTimeString()})
              </div>
            ) : (
              booking.status === 'DISETUJUI' && (
                <button
                  onClick={() => checkInBooking(booking.id)}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  [CHECK-IN SEKARANG]
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Workflow Timeline Section */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <BookingTimeline booking={booking} />
      </div>

      {/* Approval Action Modal */}
      <ApprovalActionModal
        isOpen={approvalModalState.isOpen}
        onClose={() => setApprovalModalState((prev) => ({ ...prev, isOpen: false }))}
        booking={booking}
        actionType={approvalModalState.actionType}
        level={approvalModalState.level}
      />

      {/* Edit Booking Modal */}
      <EditBookingModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        booking={booking}
      />
    </div>
  );
};
