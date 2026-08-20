import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { History, Search, ShieldCheck } from 'lucide-react';

export const AuditTrailPage: React.FC = () => {
  const { auditTrail } = useApp();
  const [search, setSearch] = useState('');

  const filteredLogs = auditTrail.filter(
    (log) =>
      log.user_nama.toLowerCase().includes(search.toLowerCase()) ||
      log.aksi.toLowerCase().includes(search.toLowerCase()) ||
      log.modul.toLowerCase().includes(search.toLowerCase()) ||
      log.keterangan.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Cari nama pengguna, aksi, atau keterangan log..."
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
                <th className="p-3.5">Aksi / Event</th>
                <th className="p-3.5">Modul</th>
                <th className="p-3.5">Keterangan / Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {new Date(log.created_at).toLocaleString('id-ID')}
                  </td>
                  <td className="p-3.5">
                    <strong className="text-slate-900 block">{log.user_nama}</strong>
                    <span className="text-[10px] text-slate-400">Role: {log.user_role}</span>
                  </td>
                  <td className="p-3.5 font-bold text-blue-800">{log.aksi}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px]">
                      {log.modul}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-700">{log.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
