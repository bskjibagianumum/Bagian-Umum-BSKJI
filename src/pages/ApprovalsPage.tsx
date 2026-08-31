import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { CheckSquare, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndonesianDate } from '../utils/bookingUtils';

export const ApprovalsPage: React.FC = () => {
  const { bookings } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role_id;

  // Filter pending queue matching current role
  const pendingBookings = bookings.filter((b) => {
    if (role === 'koordinator') return b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR';
    if (role === 'kabag_umum') return b.status === 'MENUNGGU_PERSETUJUAN_KABAG';
    if (role === 'admin') {
      return (
        b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR' ||
        b.status === 'MENUNGGU_PERSETUJUAN_KABAG'
      );
    }
    return false;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Antrean Persetujuan Peminjaman
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pengajuan yang membutuhkan evaluasi dan persetujuan dari hak akses role Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(role === 'kabag_umum' || role === 'admin') && (
            <button
              onClick={() => navigate('/cancellations')}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-xl border border-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Pembatalan Pengajuan Disetujui →</span>
            </button>
          )}

          <div className="px-3.5 py-1.5 bg-blue-50 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4 text-blue-600" /> Role Aktif: {currentUser.jabatan}
          </div>
        </div>
      </div>

      {/* Approvals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {pendingBookings.length === 0 ? (
          <EmptyState
            title="Tidak Ada Pengajuan Menunggu Persetujuan"
            description="Saat ini seluruh antrean persetujuan pada level Anda telah selesai diproses."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Nomor / Peminjam</th>
                  <th className="p-3.5">Keperluan Rapat</th>
                  <th className="p-3.5">Tanggal dan Waktu</th>
                  <th className="p-3.5">Ruang Rapat</th>
                  <th className="p-3.5">Status Persetujuan</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-blue-700 block">
                        {b.nomor_peminjaman}
                      </span>
                      <span className="font-bold text-slate-900">{b.peminjam_nama}</span>
                      <span className="text-[10px] text-slate-400 block">{b.unit_nama}</span>
                    </td>
                    <td className="p-3.5 max-w-xs font-bold text-slate-800 leading-snug">
                      {b.keperluan}
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
                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                      >
                        Tinjau dan Proses →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
