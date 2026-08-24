import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { RefreshCw, Database, Shield, User as UserIcon, Server, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { resetDemoData, syncToFirebase, bookings, rooms, units, users, addToast } = useApp();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  if (!currentUser) return null;

  // Role Gate: Only Admin can access Settings & Reset Demo Data
  const isAdmin = currentUser.role_id === 'admin';

  const handleSyncFirebase = async () => {
    setIsSyncing(true);
    await syncToFirebase();
    setIsSyncing(false);
  };

  const handleConfirmReset = async () => {
    try {
      setIsResetting(true);
      await resetDemoData();
      addToast('success', 'Reset Berhasil', 'Seluruh data demo dan server database telah dikembalikan ke kondisi awal.');
    } catch (err) {
      console.error('Reset error:', err);
      addToast('error', 'Gagal Reset', 'Terjadi kesalahan saat mereset data server.');
    } finally {
      setIsResetting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl mx-auto flex items-center justify-center border border-amber-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Akses Terbatas</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Menu Pengaturan dan fitur Reset Data Demo hanya dapat diakses oleh akun dengan otoritas Administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" /> Pengaturan Sistem & Database
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Konfigurasi database server, status sinkronisasi, dan reset data demo (Khusus Administrator).
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold w-fit">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>Akses Otoritas: Administrator</span>
        </div>
      </div>

      {/* Profil Pengguna Aktif */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-blue-600" /> Profil Administrator Aktif
        </h3>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Nama Lengkap</span>
            <strong className="text-slate-900">{currentUser.nama}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">NIP</span>
            <strong className="font-mono text-slate-900">{currentUser.nip}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Jabatan</span>
            <strong className="text-slate-900">{currentUser.jabatan}</strong>
          </div>
          <div>
            <span className="text-slate-400 font-medium block text-[10px] uppercase">Unit Kerja</span>
            <strong className="text-slate-900">{currentUser.unit_nama}</strong>
          </div>
        </div>
      </div>

      {/* Ringkasan Master Data & Server Status */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Server className="w-4 h-4 text-indigo-600" /> Status Database & Sinkronisasi Server
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Total Peminjaman</span>
            <span className="text-lg font-black text-slate-900">{bookings.length}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Master Ruangan</span>
            <span className="text-lg font-black text-slate-900">{rooms.length}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Unit Kerja</span>
            <span className="text-lg font-black text-slate-900">{units.length}</span>
          </div>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-center">
            <span className="text-[11px] text-slate-500 font-medium block">Pengguna Terdaftar</span>
            <span className="text-lg font-black text-slate-900">{users.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/70 p-3 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Server terhubung dan tersinkronisasi online real-time untuk seluruh pengguna dan perangkat PC.</span>
        </div>
      </div>

      {/* Sinkronisasi Cloud Firebase */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-blue-600" /> Sinkronisasi Cloud Firestore (Firebase)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
            Pastikan seluruh data peminjaman, ruangan, unit kerja, notifikasi, dan log audit tersimpan secara permanen di database Firebase Firestore (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px] text-blue-700">sipr-5b16e</code>).
          </p>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleSyncFirebase}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Menyinkronkan ke Firebase...' : 'Sinkronkan Semua Data ke Database Firebase Sekarang'}
          </button>
        </div>
      </div>

      {/* Reset Data Demo dan State Management */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-rose-600" /> Reset Data Demo & State Management
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Fungsi ini akan mengembalikan seluruh data peminjaman, persetujuan, log audit, notifikasi, master ruangan, dan pengguna terdaftar di server database kembali ke kondisi awal demo Sekretariat BSKJI.
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isResetting}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Mereset Data Server...' : 'Reset Seluruh Data Demo ke Kondisi Awal'}
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Konfirmasi Reset Data Demo"
        message="Apakah Anda yakin ingin mereset seluruh data simulasi dan database server ke kondisi awal demo? Semua data peminjaman baru yang telah dibuat akan dihapus dan dikembalikan ke data awal default BSKJI."
        confirmLabel="Ya, Reset Data Demo"
        cancelLabel="Batalkan"
        isDangerous={true}
      />
    </div>
  );
};
