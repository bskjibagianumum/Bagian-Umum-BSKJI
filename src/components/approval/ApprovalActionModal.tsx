import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Booking } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle2, XCircle, AlertCircle, MessageSquare, ShieldCheck } from 'lucide-react';
import { formatIndonesianDate } from '../../utils/bookingUtils';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  actionType: 'APPROVE' | 'REJECT';
  level: 'KOORDINATOR' | 'KABAG';
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  booking,
  actionType,
  level,
}) => {
  const { approveBooking, rejectBooking } = useApp();
  const [catatan, setCatatan] = useState('');
  const [error, setError] = useState('');

  if (!booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (actionType === 'REJECT' && (!catatan || catatan.trim() === '')) {
      setError('Alasan penolakan wajib diisi untuk memproses penolakan.');
      return;
    }

    if (actionType === 'APPROVE') {
      approveBooking(booking.id, catatan, level);
    } else {
      rejectBooking(booking.id, catatan, level);
    }

    setCatatan('');
    onClose();
  };

  const levelLabels = {
    KOORDINATOR: 'Koordinator Ruang Rapat',
    KABAG: 'Kepala Bagian Umum',
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${actionType === 'APPROVE' ? 'Setujui' : 'Tolak'} Pengajuan Peminjaman`}
      subtitle={`Level Persetujuan: ${levelLabels[level]} (${booking.nomor_peminjaman})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Booking Brief Summary */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
          <div className="flex justify-between font-mono text-blue-700 font-bold">
            <span>{booking.nomor_peminjaman}</span>
            <span>{booking.room_nama}</span>
          </div>
          <p className="font-bold text-slate-900">{booking.keperluan}</p>
          <p className="text-slate-500">
            Peminjam: <strong>{booking.peminjam_nama}</strong> ({booking.unit_nama})
          </p>
          <p className="text-slate-500">
            Waktu: {formatIndonesianDate(booking.tanggal)} • {booking.jam_mulai} - {booking.jam_selesai} WIB
          </p>
        </div>

        {/* Warning Alert for Final Kabag Approval */}
        {actionType === 'APPROVE' && level === 'KABAG' && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Persetujuan ini merupakan persetujuan akhir. Ruang <strong>{booking.room_nama}</strong> akan langsung di-reserve dan sistem akan mengunci jadwal dari bentrok.
            </p>
          </div>
        )}

        {/* Catatan Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Catatan / Alasan {actionType === 'REJECT' && <span className="text-rose-500">* (Wajib)</span>}
          </label>
          <div className="relative">
            <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => {
                setCatatan(e.target.value);
                setError('');
              }}
              placeholder={
                actionType === 'APPROVE'
                  ? 'Catatan tambahan (opsional), e.g. Disetujui, koordinasi dengan teknisi BMN.'
                  : 'Alasan penolakan (wajib diisi), e.g. Ruangan digunakan untuk rapat pimpinan kementerian.'
              }
              className={`w-full pl-9 pr-3 py-2 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                error ? 'border-rose-300 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
          </div>
          {error && (
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>

          <button
            type="submit"
            className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
              actionType === 'APPROVE'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {actionType === 'APPROVE' ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Konfirmasi Setujui
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" /> Konfirmasi Tolak
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
