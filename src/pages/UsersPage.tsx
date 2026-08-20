import React from 'react';
import { useApp } from '../contexts/AppContext';
import { ROLE_META } from '../constants/roles';
import { Users, Shield } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Manajemen Pengguna dan Role Access
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar akun pengguna terdaftar beserta peran otorisasi dalam sistem.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Nama dan NIP</th>
                <th className="p-3.5">Email / Username</th>
                <th className="p-3.5">Jabatan</th>
                <th className="p-3.5">Unit Kerja</th>
                <th className="p-3.5">Role System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const meta = ROLE_META[u.role_id];
                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <strong className="text-slate-900 block">{u.nama}</strong>
                      <span className="font-mono text-[11px] text-slate-400">NIP: {u.nip}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">{u.email}</td>
                    <td className="p-3.5 font-medium text-slate-800">{u.jabatan}</td>
                    <td className="p-3.5 text-slate-700">{u.unit_nama}</td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${meta.badgeColor}`}
                      >
                        {meta.nama}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
