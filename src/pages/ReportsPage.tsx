import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/Badge';
import { exportBookingsToCSV } from '../utils/exportUtils';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { formatIndonesianDate } from '../utils/bookingUtils';

export const ReportsPage: React.FC = () => {
  const { bookings, rooms, units } = useApp();

  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-31');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Filter bookings based on period and options
  const filteredBookings = bookings.filter((b) => {
    const isWithinDate =
      (!startDate || b.tanggal >= startDate) && (!endDate || b.tanggal <= endDate);
    const matchesRoom = selectedRoom === 'ALL' || b.room_id === selectedRoom;
    const matchesUnit = selectedUnit === 'ALL' || b.unit_nama === selectedUnit;
    const matchesStatus = selectedStatus === 'ALL' || b.status === selectedStatus;

    return isWithinDate && matchesRoom && matchesUnit && matchesStatus;
  });

  // Calculate stats
  const totalCount = filteredBookings.length;
  const approvedCount = filteredBookings.filter((b) => b.status === 'DISETUJUI' || b.status === 'SELESAI').length;
  const rejectedCount = filteredBookings.filter((b) => b.status.startsWith('DITOLAK')).length;
  const pendingCount = filteredBookings.filter((b) => b.status.startsWith('MENUNGGU')).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Laporan dan Rekapitulasi Peminjaman Ruang Rapat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Analisis penggunaan fasilitas ruangan di lingkungan Sekretariat BSKJI.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => exportBookingsToCSV(filteredBookings)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV / Excel
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Cetak Laporan
          </button>
        </div>
      </div>

      {/* Filter Parameters */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-blue-600" /> Filter Parameter Laporan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Ruang Rapat
            </label>
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
            >
              <option value="ALL">Semua Ruangan</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama_ruang}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Unit Kerja
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
            >
              <option value="ALL">Semua Unit Kerja</option>
              {units.map((u) => (
                <option key={u.id} value={u.nama_unit}>
                  {u.nama_unit}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
              Status Peminjaman
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl font-semibold"
            >
              <option value="ALL">Semua Status</option>
              <option value="DISETUJUI">Disetujui</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK_ATASAN">Ditolak Atasan</option>
              <option value="DITOLAK_KOORDINATOR">Ditolak Koordinator</option>
              <option value="DITOLAK_KABAG">Ditolak Kabag</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Peminjaman"
          value={totalCount}
          subtitle="Sesuai filter periode"
          icon={FileText}
          iconBgColor="bg-blue-50"
          iconTextColor="text-blue-600"
        />
        <StatCard
          title="Disetujui / Selesai"
          value={approvedCount}
          subtitle="Reservasi berhasil"
          icon={CheckCircle2}
          iconBgColor="bg-emerald-50"
          iconTextColor="text-emerald-600"
        />
        <StatCard
          title="Ditolak"
          value={rejectedCount}
          subtitle="Tidak memenuhi syarat"
          icon={XCircle}
          iconBgColor="bg-rose-50"
          iconTextColor="text-rose-600"
        />
        <StatCard
          title="Dalam Proses Workflow"
          value={pendingCount}
          subtitle="Menunggu persetujuan"
          icon={Clock}
          iconBgColor="bg-amber-50"
          iconTextColor="text-amber-600"
        />
      </div>

      {/* Reports Table View */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nomor Peminjaman</th>
                <th className="p-3.5">Tanggal dan Jam</th>
                <th className="p-3.5">Peminjam dan Unit Kerja</th>
                <th className="p-3.5">Ruang Rapat</th>
                <th className="p-3.5">Keperluan Rapat</th>
                <th className="p-3.5">Status Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-700">
                    {b.nomor_peminjaman}
                  </td>
                  <td className="p-3.5 text-slate-700">
                    <strong>{formatIndonesianDate(b.tanggal)}</strong>
                    <span className="block text-[11px] font-mono text-slate-500">
                      {b.jam_mulai} - {b.jam_selesai} WIB
                    </span>
                  </td>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block">{b.peminjam_nama}</strong>
                    <span className="text-[11px] text-slate-500">{b.unit_nama}</span>
                  </td>
                  <td className="p-3.5 font-bold text-slate-800">{b.room_nama}</td>
                  <td className="p-3.5 font-medium text-slate-800 max-w-xs">{b.keperluan}</td>
                  <td className="p-3.5">
                    <StatusBadge status={b.status} size="sm" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
