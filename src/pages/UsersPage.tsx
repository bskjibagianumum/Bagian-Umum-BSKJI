import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { ROLE_META } from '../constants/roles';
import { User, RoleId } from '../types';
import { Users, UserPlus, RefreshCw, X, CheckCircle2, ShieldCheck, Mail, Building, Briefcase, Search } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { users, units, saveUser, syncToFirebase, addToast } = useApp();
  const { currentUser } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    email: '',
    unit_id: units[0]?.id || '',
    jabatan: '',
    role_id: 'peminjam' as RoleId,
  });
  const [formError, setFormError] = useState('');

  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    await syncToFirebase();
    setIsSyncing(false);
  };

  const handleOpenAddModal = () => {
    setFormData({
      nama: '',
      nip: '',
      email: '',
      unit_id: units[0]?.id || '',
      jabatan: '',
      role_id: 'peminjam',
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleSubmitNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim() || !formData.nip.trim() || !formData.jabatan.trim()) {
      setFormError('Nama, NIP, dan Jabatan wajib diisi.');
      return;
    }

    const cleanNip = formData.nip.trim();
    if (users.some((u) => u.nip === cleanNip)) {
      setFormError('NIP sudah terdaftar dalam sistem.');
      return;
    }

    const selectedUnit = units.find((u) => u.id === formData.unit_id);
    const email = formData.email.trim() || `${cleanNip}@kemenperin.go.id`;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      nama: formData.nama.trim(),
      nip: cleanNip,
      email: email.toLowerCase(),
      unit_id: formData.unit_id,
      unit_nama: selectedUnit ? selectedUnit.nama_unit : 'BSKJI Kemenperin',
      jabatan: formData.jabatan.trim(),
      role_id: formData.role_id,
      status: 'Aktif',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveUser(newUser);
    setIsAddModalOpen(false);
  };

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.nama.toLowerCase().includes(q) ||
      u.nip.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.unit_nama.toLowerCase().includes(q) ||
      u.jabatan.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Pengguna dan Role Access
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar akun pegawai terdaftar dan terintegrasi langsung dengan database Firebase Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSyncFirebase}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Sinkronkan seluruh data pengguna ke Firebase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan ke Firebase'}</span>
          </button>

          {currentUser?.role_id === 'admin' && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tambah Pengguna</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Cari berdasarkan nama, NIP, email, jabatan, atau unit kerja..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-slate-900 bg-transparent placeholder-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Table */}
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
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                    Tidak ditemukan pengguna yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const meta = ROLE_META[u.role_id] || {
                    nama: u.role_id,
                    badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
                  };
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <strong className="text-slate-900 block font-bold">{u.nama}</strong>
                        <span className="font-mono text-[11px] text-slate-500">NIP: {u.nip}</span>
                      </td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3.5 font-medium text-slate-800">{u.jabatan}</td>
                      <td className="p-3.5 text-slate-700">{u.unit_nama}</td>
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${meta.badgeColor}`}
                        >
                          {meta.nama}
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {u.status || 'Aktif'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Akun Pengguna Baru</h3>
                  <p className="text-[11px] text-slate-500">Tersimpan otomatis ke Firebase Firestore</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewUser} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nama Lengkap *</label>
                <input
                  type="text"
                  placeholder="Contoh: Hendra Wijaya"
                  value={formData.nama}
                  onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">NIP (Nomor Induk Pegawai) *</label>
                  <input
                    type="text"
                    placeholder="198501012010011001"
                    value={formData.nip}
                    onChange={(e) => setFormData((prev) => ({ ...prev, nip: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Email Dinas</label>
                  <input
                    type="email"
                    placeholder="email@kemenperin.go.id"
                    value={formData.email}
                    onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Jabatan *</label>
                  <input
                    type="text"
                    placeholder="Analis Kebijakan"
                    value={formData.jabatan}
                    onChange={(e) => setFormData((prev) => ({ ...prev, jabatan: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Unit Kerja *</label>
                  <select
                    value={formData.unit_id}
                    onChange={(e) => setFormData((prev) => ({ ...prev, unit_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nama_unit}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Peran / Role Otorisasi *</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData((prev) => ({ ...prev, role_id: e.target.value as RoleId }))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="peminjam">Peminjam (Pegawai BSKJI)</option>
                  <option value="koordinator">Koordinator Tata Usaha & Rumah Tangga</option>
                  <option value="kabag_umum">Kepala Bagian Umum</option>
                  <option value="admin">Administrator Sistem</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Simpan Pengguna ke Firebase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
