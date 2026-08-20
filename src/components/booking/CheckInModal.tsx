import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircle2, Clock, LogOut, Search, Building2 } from 'lucide-react';
import { formatIndonesianDate } from '../../utils/bookingUtils';

interface CheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ isOpen, onClose }) => {
  const { bookings, checkInBooking, checkOutBooking } = useApp();
  const { currentUser } = useAuth();
  const [selectedBookingId, setSelectedBookingId] = useState<string>('');
  const [manualCode, setManualCode] = useState('');

  // Filter approved or checked-in bookings eligible for check-in / check-out
  const activeBookings = bookings.filter((b) => {
    if (currentUser?.role_id === 'peminjam' && b.user_id !== currentUser.id) {
      return false;
    }
    return b.status === 'DISETUJUI' || (b.status === 'SELESAI' && b.check_in?.checked_in_at);
  });

  const matchedBooking =
    bookings.find((b) => b.id === selectedBookingId) ||
    bookings.find(
      (b) => b.nomor_peminjaman.toLowerCase() === manualCode.trim().toLowerCase()
    );

  const handleCheckIn = () => {
    if (matchedBooking) {
      checkInBooking(matchedBooking.id);
    }
  };

  const handleCheckOut = () => {
    if (matchedBooking) {
      checkOutBooking(matchedBooking.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-In / Check-Out Penggunaan Ruangan"
      subtitle="Pilih nomor peminjaman untuk melakukan Check-In dan Check-Out penggunaan ruangan."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Quick Selector Dropdown or Manual Search */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih atau Input Nomor Peminjaman
          </label>
          <div className="flex gap-2">
            <select
              value={selectedBookingId}
              onChange={(e) => {
                setSelectedBookingId(e.target.value);
                setManualCode('');
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">-- Pilih dari Jadwal Disetujui --</option>
              {activeBookings.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nomor_peminjaman} - {b.room_nama} ({b.tanggal} {b.jam_mulai})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Matched Booking Result Details */}
        {matchedBooking ? (
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
            {/* Information */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Keperluan Rapat
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">
                    {matchedBooking.keperluan}
                  </h4>
                </div>
                <span className="px-2.5 py-1 bg-blue-100 text-blue-800 font-mono font-bold text-xs rounded-lg shrink-0">
                  {matchedBooking.nomor_peminjaman}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Ruangan</span>
                  <span className="font-semibold text-slate-800">
                    {matchedBooking.room_nama}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Peminjam</span>
                  <span className="font-semibold text-slate-800">
                    {matchedBooking.peminjam_nama}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Tanggal</span>
                  <span>{formatIndonesianDate(matchedBooking.tanggal)}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Waktu</span>
                  <span>
                    {matchedBooking.jam_mulai} - {matchedBooking.jam_selesai} WIB
                  </span>
                </div>
              </div>

              {/* Check-In Timestamps Status */}
              <div className="pt-2 border-t border-slate-200 space-y-1">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Status Check-In:{' '}
                    {matchedBooking.check_in?.checked_in_at ? (
                      <strong className="text-emerald-700">
                        Sudah Check-In ({new Date(matchedBooking.check_in.checked_in_at).toLocaleTimeString()})
                      </strong>
                    ) : (
                      <span className="text-amber-600 font-medium">Belum Check-In</span>
                    )}
                  </span>
                </div>
                {matchedBooking.check_in?.checked_out_at && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <LogOut className="w-3.5 h-3.5 text-teal-600" />
                    <span>
                      Status Check-Out:{' '}
                      <strong className="text-teal-700">
                        Sudah Check-Out ({new Date(matchedBooking.check_in.checked_out_at).toLocaleTimeString()})
                      </strong>
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex gap-2">
                {!matchedBooking.check_in?.checked_in_at ? (
                  <button
                    onClick={handleCheckIn}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> [CHECK-IN SEKARANG]
                  </button>
                ) : !matchedBooking.check_in?.checked_out_at ? (
                  <button
                    onClick={handleCheckOut}
                    className="flex-1 py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> [CHECK-OUT SEKARANG]
                  </button>
                ) : (
                  <div className="p-2 bg-emerald-100 text-emerald-800 text-center font-bold rounded-xl w-full">
                    ✓ Rapat Telah Selesai
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Building2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Silakan pilih peminjaman disetujui di atas.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sistem akan mencatat log timestamp check-in / check-out.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
