import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { DataService } from '../services/dataService';
import { RoleId } from '../types';
import { ROLE_META } from '../constants/roles';
import {
  Building2,
  ShieldCheck,
  ArrowLeft,
  UserPlus,
  User,
  Lock,
  Briefcase,
  Building,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { KemenperinLogo } from '../components/common/KemenperinLogo';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const dataService = DataService.getInstance();

  const units = dataService.getUnits();

  const [formData, setFormData] = useState({
    nama: '',
    nip: '',
    unit_id: units[0]?.id || '',
    jabatan: '',
    role_id: 'peminjam' as RoleId,
    password: '',
    confirmPassword: '',
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validations
    if (!formData.nama.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }

    const cleanNip = formData.nip.trim();
    if (!cleanNip || !/^\d{10,20}$/.test(cleanNip)) {
      setErrorMsg('NIP wajib diisi dengan angka (10-20 digit).');
      return;
    }

    if (!formData.unit_id) {
      setErrorMsg('Silakan pilih Unit Kerja.');
      return;
    }

    if (!formData.jabatan.trim()) {
      setErrorMsg('Jabatan pegawai wajib diisi.');
      return;
    }

    if (!formData.password) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password minimal terdiri dari 6 karakter.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    setIsSubmitting(true);

    const selectedUnit = units.find((u) => u.id === formData.unit_id);

    const res = register({
      nama: formData.nama.trim(),
      nip: cleanNip,
      email: `${cleanNip}@kemenperin.go.id`,
      unit_id: formData.unit_id,
      unit_nama: selectedUnit ? selectedUnit.nama_unit : 'BSKJI Kemenperin',
      jabatan: formData.jabatan.trim(),
      role_id: formData.role_id,
    });

    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('Pendaftaran akun berhasil! Mengalihkan ke Dashboard...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } else {
      setErrorMsg(res.message || 'Gagal mendaftarkan akun baru.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans antialiased relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Branding */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 z-10">
        <KemenperinLogo size="lg" showText lightText />
        <Link
          to="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Kembali ke Login</span>
        </Link>
      </div>

      {/* Register Form Card */}
      <div className="w-full max-w-2xl mx-auto my-6 z-10 space-y-6">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 text-blue-400 font-black flex items-center justify-center mx-auto border border-blue-500/30 shadow-inner">
              <UserPlus className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              Pendaftaran Akun Pegawai BSKJI
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Lengkapi formulir di bawah ini untuk mengaktifkan akun peminjaman ruang rapat Anda.
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 text-red-300 text-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-start gap-3 text-emerald-300 text-xs animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nama Lengkap */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Nama Lengkap *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nama"
                    placeholder="Contoh: Ahmad Fauzi"
                    value={formData.nama}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* NIP */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  NIP Pegawai (18 Digit) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nip"
                    placeholder="199205102020011005"
                    value={formData.nip}
                    onChange={handleChange}
                    maxLength={18}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-mono"
                    required
                  />
                  <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jabatan */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Jabatan Pegawai *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="jabatan"
                    placeholder="Contoh: Analis Jasa Industri"
                    value={formData.jabatan}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Unit Kerja */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Unit Kerja *
                </label>
                <div className="relative">
                  <select
                    name="unit_id"
                    value={formData.unit_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                        {u.nama_unit}
                      </option>
                    ))}
                  </select>
                  <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password Akun *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    placeholder="Minimal 6 Karakter"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Konfirmasi Password *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Ulangi Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isSubmitting ? 'Mendaftarkan Akun...' : 'Daftarkan Akun Pegawai'}</span>
            </button>
          </form>

          {/* Back to Login Link */}
          <div className="text-center pt-2 border-t border-slate-700/60">
            <span className="text-xs text-slate-400">Sudah memiliki akun terdaftar? </span>
            <Link
              to="/login"
              className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline"
            >
              Masuk di sini
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-500 py-2 z-10">
        © 2026 Bagian Umum Sekretariat BSKJI Kementerian Perindustrian Republik Indonesia.
      </div>
    </div>
  );
};
