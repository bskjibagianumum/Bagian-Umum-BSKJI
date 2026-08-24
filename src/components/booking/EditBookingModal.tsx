import React, { useState, useEffect } from 'react';
import { Booking, Room } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { X, Save, Building2, Calendar, Clock, Users, FileText, AlertCircle } from 'lucide-react';
import { calculateDuration, getTodayDateString, isBackDate } from '../../utils/bookingUtils';

interface EditBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const EditBookingModal: React.FC<EditBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
}) => {
  const { rooms, updateBooking, addToast } = useApp();

  const [roomId, setRoomId] = useState(booking.room_id);
  const [tanggal, setTanggal] = useState(booking.tanggal);
  const [jamMulai, setJamMulai] = useState(booking.jam_mulai);
  const [jamSelesai, setJamSelesai] = useState(booking.jam_selesai);
  const [keperluan, setKeperluan] = useState(booking.keperluan);
  const [jumlahPeserta, setJumlahPeserta] = useState(booking.jumlah_peserta);
  const [keterangan, setKeterangan] = useState(booking.keterangan || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRoomId(booking.room_id);
      setTanggal(booking.tanggal);
      setJamMulai(booking.jam_mulai);
      setJamSelesai(booking.jam_selesai);
      setKeperluan(booking.keperluan);
      setJumlahPeserta(booking.jumlah_peserta);
      setKeterangan(booking.keterangan || '');
      setError('');
    }
  }, [isOpen, booking]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!keperluan.trim()) {
      setError('Keperluan / acara rapat wajib diisi.');
      return;
    }
    if (!tanggal) {
      setError('Tanggal peminjaman wajib dipilih.');
      return;
    }
    if (isBackDate(tanggal)) {
      setError('Tanggal peminjaman tidak boleh tanggal lampau (minimal hari ini).');
      return;
    }
    if (jamMulai >= jamSelesai) {
      setError('Jam selesai harus lebih akhir daripada jam mulai.');
      return;
    }

    const selectedRoom = rooms.find((r) => r.id === roomId);
    if (!selectedRoom) {
      setError('Ruangan tidak valid.');
      return;
    }

    if (jumlahPeserta > selectedRoom.kapasitas) {
      setError(`Jumlah peserta (${jumlahPeserta}) melebihi kapasitas ${selectedRoom.nama_ruang} (${selectedRoom.kapasitas} orang).`);
      return;
    }

    const durasi = calculateDuration(jamMulai, jamSelesai);

    const updated: Booking = {
      ...booking,
      room_id: selectedRoom.id,
      room_nama: selectedRoom.nama_ruang,
      room_lantai: selectedRoom.lantai,
      tanggal,
      jam_mulai: jamMulai,
      jam_selesai: jamSelesai,
      durasi,
      keperluan,
      jumlah_peserta: Number(jumlahPeserta),
      keterangan,
      updated_at: new Date().toISOString(),
    };

    updateBooking(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Ubah Data Peminjaman</h3>
              <p className="text-[11px] font-mono text-blue-700 font-bold">{booking.nomor_peminjaman}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Keperluan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Keperluan / Acara Rapat *</label>
            <input
              type="text"
              value={keperluan}
              onChange={(e) => setKeperluan(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
              placeholder="Contoh: Rapat Koordinasi Anggaran"
              required
            />
          </div>

          {/* Ruangan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Pilih Ruang Rapat *</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruang} (Kapasitas: {r.kapasitas} orang • {r.lantai})
                </option>
              ))}
            </select>
          </div>

          {/* Tanggal */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Tanggal Rapat *</label>
            <input
              type="date"
              min={getTodayDateString()}
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
              required
            />
          </div>

          {/* Waktu Mulai & Selesai */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jam Mulai *</label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">Jam Selesai *</label>
              <input
                type="time"
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
                required
              />
            </div>
          </div>

          {/* Jumlah Peserta */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Jumlah Peserta (Orang) *</label>
            <input
              type="number"
              min="1"
              max="200"
              value={jumlahPeserta}
              onChange={(e) => setJumlahPeserta(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
              required
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 block">Keterangan / Fasilitas Tambahan</label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs text-slate-900"
              placeholder="Contoh: Butuh proyektor dan snack"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan & Sinkronkan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
