import React from 'react';
import { User } from '../../types';
import { User as UserIcon, Shield, Building, CreditCard } from 'lucide-react';

interface Step1Props {
  user: User;
}

export const BookingFormStep1: React.FC<Step1Props> = ({ user }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center gap-3">
        <UserIcon className="w-5 h-5 text-blue-600 shrink-0" />
        <p className="text-xs text-blue-900 leading-relaxed">
          Data peminjam otomatis terisi berdasarkan profil akun pengguna aktif yang sedang login.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nama Peminjam
          </label>
          <div className="relative">
            <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value={user.nama}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-100/90 border border-slate-200 rounded-xl font-bold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            NIP
          </label>
          <div className="relative">
            <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value={user.nip}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-100/90 border border-slate-200 rounded-xl font-mono font-semibold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Jabatan
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value={user.jabatan}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-100/90 border border-slate-200 rounded-xl font-semibold text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Unit Kerja / Bagian
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              readOnly
              value={user.unit_nama}
              className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-100/90 border border-slate-200 rounded-xl font-semibold text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
