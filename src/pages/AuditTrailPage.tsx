import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { History, Search, ShieldCheck } from 'lucide-react';
import { formatIndonesianDateTime } from '../utils/bookingUtils';

export const AuditTrailPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [search, setSearch] = useState('');

  const logsList = auditLogs || [];

  const filteredLogs = logsList.filter(
    (log) =>
      (log.user_nama && log.user_nama.toLowerCase().includes(search.toLowerCase())) ||
      (log.aktivitas && log.aktivitas.toLowerCase().includes(search.toLowerCase())) ||
      (log.nomor_peminjaman && log.nomor_peminjaman.toLowerCase().includes(search.toLowerCase())) ||
      (log.role && log.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Audit Trail dan Log Aktivitas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pencatatan rekam jejak aktivitas sistem secara transparan dan akuntabel.
          </p>
        </div>
        <div className="px-3.5 py-1.5 bg-blue-50 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> System Integrity Logged
        </div>
      </div>

      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pengguna, aktivitas, atau nomor peminjaman..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Waktu / Timestamp</th>
                <th className="p-3.5">Pengguna</th>
                <th className="p-3.5">Aktivitas / Event</th>
                <th className="p-3.5">No. Peminjaman</th>
                <th className="p-3.5">Detail Perubahan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-xs text-slate-400">
                    Tidak ada catatan log aktivitas yang cocok.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">
                      {log.timestamp ? formatIndonesianDateTime(log.timestamp) : '-'}
                    </td>
                    <td className="p-3.5">
                      <strong className="text-slate-900 block">{log.user_nama}</strong>
                      <span className="text-[10px] text-slate-400">Role: {log.role}</span>
                    </td>
                    <td className="p-3.5 font-bold text-blue-800">{log.aktivitas}</td>
                    <td className="p-3.5">
                      {log.nomor_peminjaman ? (
                        <span className="bg-slate-100 text-blue-700 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                          {log.nomor_peminjaman}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">-</span>
                      )}
                    </td>
                    <td className="p-3.5 text-slate-700">{log.data_baru || log.data_lama || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
