import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { CalendarView } from '../components/calendar/CalendarView';
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DoorOpen,
  Users as UsersIcon,
  Building,
  TrendingUp,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatIndonesianDate } from '../utils/bookingUtils';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { bookings, rooms, users } = useApp();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const role = currentUser.role_id;

  // Filter bookings for peminjam
  const myBookings = bookings.filter((b) => b.user_id === currentUser.id);

  // Stats calculation based on user role
  const totalSubmissions = role === 'peminjam' ? myBookings.length : bookings.length;

  const pendingApprovals = (role === 'peminjam' ? myBookings : bookings).filter((b) => {
    if (role === 'atasan') return b.status === 'MENUNGGU_PERSETUJUAN_ATASAN';
    if (role === 'koordinator') return b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR';
    if (role === 'kabag_umum') return b.status === 'MENUNGGU_PERSETUJUAN_KABAG';
    return b.status.startsWith('MENUNGGU');
  }).length;

  const approvedCount = (role === 'peminjam' ? myBookings : bookings).filter(
    (b) => b.status === 'DISETUJUI' || b.status === 'SELESAI'
  ).length;

  const rejectedCount = (role === 'peminjam' ? myBookings : bookings).filter((b) =>
    b.status.startsWith('DITOLAK')
  ).length;

  // Approvals queue for Atasan/Koordinator/Kabag
  const pendingQueue = bookings.filter((b) => {
    if (role === 'atasan') return b.status === 'MENUNGGU_PERSETUJUAN_ATASAN';
    if (role === 'koordinator') return b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR';
    if (role === 'kabag_umum') return b.status === 'MENUNGGU_PERSETUJUAN_KABAG';
    return b.status.startsWith('MENUNGGU');
  });

  // Upcoming nearest approved booking
  const upcomingBooking = (role === 'peminjam' ? myBookings : bookings).find(
    (b) => b.status === 'DISETUJUI'
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="p-5 rounded-xl bg-slate-900 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-900/80 text-blue-200 text-[10px] font-bold border border-blue-700/60 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Hak Akses: {currentUser.jabatan}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Selamat Datang, {currentUser.nama}
          </h1>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            Sistem Informasi Peminjaman Ruang Rapat BSKJI – Kementerian Perindustrian.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/bookings/new')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-blue-900/50 transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Ajukan Peminjaman Baru
          </button>
        </div>
      </div>

      {/* STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Pengajuan"
          value={totalSubmissions}
          subtitle="Datael peminjaman di sistem"
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
          onClick={() => navigate('/bookings')}
        />
        <StatCard
          title="Menunggu Persetujuan"
          value={pendingApprovals}
          subtitle="Perlu tindak lanjut approval"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
          onClick={() => navigate(role === 'peminjam' ? '/bookings' : '/approvals')}
        />
        <StatCard
          title="Disetujui (Ter-reserve)"
          value={approvedCount}
          subtitle="Jadwal ruangan terkunci"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
          onClick={() => navigate('/bookings')}
        />
        <StatCard
          title="Pengajuan Ditolak"
          value={rejectedCount}
          subtitle="Disertai alasan penolakan"
          icon={XCircle}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
          onClick={() => navigate('/bookings')}
        />
      </div>

      {/* DASHBOARD PEMINJAM SPECIFIC */}
      {role === 'peminjam' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Upcoming Schedule & Recent Submissions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Jadwal Terdekat Card */}
            {upcomingBooking && (
              <div className="p-5 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl shadow-md border border-emerald-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-800/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                    Jadwal Rapat Terdekat Anda
                  </span>
                  <StatusBadge status={upcomingBooking.status} size="sm" />
                </div>
                <h3 className="text-base font-bold leading-tight">{upcomingBooking.keperluan}</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-emerald-100">
                  <div>
                    <span className="text-[10px] text-emerald-300/80 block">Ruangan</span>
                    <strong>{upcomingBooking.room_nama}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-300/80 block">Waktu</span>
                    <strong>
                      {formatIndonesianDate(upcomingBooking.tanggal)} ({upcomingBooking.jam_mulai} WIB)
                    </strong>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => navigate(`/bookings/${upcomingBooking.id}`)}
                    className="px-3.5 py-1.5 bg-white text-emerald-900 text-xs font-bold rounded-xl hover:bg-emerald-100 transition-colors"
                  >
                    Cetak Bukti Peminjaman →
                  </button>
                </div>
              </div>
            )}

            {/* Riwayat Pengajuan Saya */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800">Riwayat Pengajuan Peminjaman Saya</h3>
                <button
                  onClick={() => navigate('/bookings')}
                  className="text-[11px] text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-2">
                {myBookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-1">
                    <p className="font-semibold text-slate-700">Belum ada riwayat peminjaman.</p>
                    <p className="text-slate-400">Silakan ajukan peminjaman ruang rapat baru melalui tombol di atas.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {myBookings.slice(0, 5).map((b) => (
                      <div
                        key={b.id}
                        onClick={() => navigate(`/bookings/${b.id}`)}
                        className="py-2.5 px-3 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3 rounded-lg"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {b.nomor_peminjaman}
                            </span>
                            <StatusBadge status={b.status} size="sm" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">{b.keperluan}</p>
                          <p className="text-[11px] text-slate-500 truncate">
                            {b.room_nama} • {formatIndonesianDate(b.tanggal)} ({b.jam_mulai} - {b.jam_selesai} WIB)
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Master Ruangan Overview */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Status Ruangan Hari Ini</h3>
              <div className="space-y-2.5">
                {rooms.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 border border-gray-100 rounded-lg flex items-center justify-between gap-2 bg-gray-50/50"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-700">{r.nama_ruang}</h4>
                      <p className="text-[10px] text-slate-500">
                        Kapasitas {r.kapasitas} orang • Lantai {r.lantai}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        r.status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {r.status === 'Aktif' ? 'TERSEDIA' : r.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD ATASAN / KOORDINATOR / KABAG SPECIFIC (Persetujuan Queue) */}
      {(role === 'atasan' || role === 'koordinator' || role === 'kabag_umum') && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Antrean Pengajuan Menunggu Persetujuan Anda ({pendingQueue.length})
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Verifikasi dan berikan persetujuan atau penolakan sesuai kewenangan.
                </p>
              </div>
              <button
                onClick={() => navigate('/approvals')}
                className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Halaman Persetujuan Lengkap →
              </button>
            </div>

            {pendingQueue.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-gray-50/50 rounded-b-xl">
                ✓ Tidak ada pengajuan yang membutuhkan persetujuan Anda saat ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b border-gray-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Nomor / Peminjam</th>
                      <th className="px-4 py-3">Keperluan Rapat</th>
                      <th className="px-4 py-3">Tanggal dan Waktu</th>
                      <th className="px-4 py-3">Ruangan</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pendingQueue.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-mono font-bold text-slate-900 block text-[11px]">
                            {b.nomor_peminjaman}
                          </span>
                          <span className="font-bold text-slate-800">{b.peminjam_nama}</span>
                          <span className="text-[10px] text-slate-400 block">{b.unit_nama}</span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800 max-w-xs">{b.keperluan}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatIndonesianDate(b.tanggal)}
                          <span className="block text-[10px] text-slate-400 font-mono">
                            {b.jam_mulai} - {b.jam_selesai} WIB
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{b.room_nama}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => navigate(`/bookings/${b.id}`)}
                            className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors text-[11px]"
                          >
                            Tinjau dan Proses
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
      )}

      {/* DASHBOARD ADMINISTRATOR SPECIFIC */}
      {role === 'admin' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title="Total Pengguna System"
            value={users.length}
            subtitle="Kelola akun dan hak akses role"
            icon={UsersIcon}
            iconBgColor="bg-purple-50"
            iconTextColor="text-purple-600"
            onClick={() => navigate('/users')}
          />
          <StatCard
            title="Total Ruang Rapat"
            value={rooms.length}
            subtitle="Kelola master data ruangan"
            icon={DoorOpen}
            iconBgColor="bg-indigo-50"
            iconTextColor="text-indigo-600"
            onClick={() => navigate('/rooms')}
          />
          <StatCard
            title="Audit Logs"
            value="100% Active"
            subtitle="Pencatatan aktivitas terintegrasi"
            icon={TrendingUp}
            iconBgColor="bg-teal-50"
            iconTextColor="text-teal-600"
            onClick={() => navigate('/audit-trail')}
          />
        </div>
      )}

      {/* FULL CALENDAR OVERVIEW ON DASHBOARD */}
      <div className="pt-4">
        <CalendarView />
      </div>
    </div>
  );
};
