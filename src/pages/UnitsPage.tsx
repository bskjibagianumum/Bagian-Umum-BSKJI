import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Building, Hash } from 'lucide-react';

export const UnitsPage: React.FC = () => {
  const { units } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Master Data Unit Kerja / Bagian
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar unit kerja internal di bawah Sekretariat BSKJI Kementerian Perindustrian.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="p-3.5">Kode Unit</th>
                <th className="p-3.5">Nama Unit Kerja</th>
                <th className="p-3.5">Deskripsi / Fungsi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {units.map((unit) => (
                <tr key={unit.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-blue-700">{unit.kode_unit}</td>
                  <td className="p-3.5 font-bold text-slate-900">{unit.nama_unit}</td>
                  <td className="p-3.5 text-slate-600">{unit.keterangan || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
