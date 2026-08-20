import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Printer, ArrowLeft, Building2, CheckCircle2 } from 'lucide-react';
import { formatIndonesianDate, formatIndonesianDateTime } from '../utils/bookingUtils';
import { KemenperinLogo } from '../components/common/KemenperinLogo';

export const BuktiPeminjamanPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { bookings } = useApp();
  const navigate = useNavigate();

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Data bukti peminjaman tidak ditemukan.
      </div>
    );
  }

  const koordinatorApproval = booking.approvals.find((a) => a.level_approval === 'KOORDINATOR');
  const kabagApproval = booking.approvals.find((a) => a.level_approval === 'KABAG');

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> CETAK DOKUMEN / SIMPAN PDF
        </button>
      </div>

      {/* OFFICIAL PRINTABLE DOCUMENT PAPER CARD */}
      <div className="bg-white p-8 sm:p-12 rounded-2xl border border-slate-300 shadow-xl space-y-6 text-slate-900 font-sans print:border-none print:shadow-none print:p-0">
        {/* KOP SURAT RESMI */}
        <div className="flex items-center gap-4 pb-4 border-b-4 border-slate-900">
          <KemenperinLogo size="xl" />
          <div className="text-center flex-1">
            <h3 className="text-xs font-bold tracking-widest uppercase text-slate-700">
              KEMENTERIAN PERINDUSTRIAN REPUBLIK INDONESIA
            </h3>
            <h2 className="text-sm font-black uppercase text-slate-900 tracking-tight mt-0.5">
              BADAN STANDARDISASI DAN KEBIJAKAN JASA INDUSTRI
            </h2>
            <p className="text-xs font-bold uppercase text-blue-900 mt-0.5">
              SEKRETARIAT BSKJI
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Jl. Gatot Subroto Kav. 52-53 Jakarta Selatan 12950 • Telp: (021) 5255509 • Web: bskji.kemenperin.go.id
            </p>
          </div>
        </div>

        {/* DOCUMENT TITLE & NOMOR */}
        <div className="text-center space-y-1">
          <h1 className="text-base font-black underline uppercase tracking-wider text-slate-900">
            BUKTI PEMINJAMAN RUANG RAPAT
          </h1>
          <p className="text-xs font-mono font-bold text-blue-800">
            Nomor: {booking.nomor_peminjaman}
          </p>
        </div>

        {/* SUMMARY CONTENT GRID */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="space-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Nama / Keperluan Rapat
              </span>
              <p className="font-bold text-slate-900 text-sm leading-snug">
                {booking.keperluan}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-700 pt-1 border-t border-slate-200/80">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Ruang Rapat Terkunci
                </span>
                <strong className="text-slate-900">{booking.room_nama}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Jumlah Peserta
                </span>
                <strong>{booking.jumlah_peserta} Orang</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Tanggal Pelaksanaan
                </span>
                <strong>{formatIndonesianDate(booking.tanggal)}</strong>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Waktu / Durasi
                </span>
                <strong>
                  {booking.jam_mulai} - {booking.jam_selesai} WIB
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* PEMINJAM DETAILS */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            I. Identitas Peminjam
          </h4>
          <table className="w-full text-left border-collapse text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500 font-medium w-36">Nama Lengkap</td>
                <td className="py-1.5 font-bold text-slate-900">: {booking.peminjam_nama}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500 font-medium">NIP</td>
                <td className="py-1.5 font-mono font-semibold text-slate-900">: {booking.peminjam_nip}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-1.5 text-slate-500 font-medium">Unit Kerja / Bagian</td>
                <td className="py-1.5 font-semibold text-slate-900">: {booking.unit_nama}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* PERSETUJUAN OFFICIAL STAMPS GRID */}
        <div className="space-y-2 text-xs">
          <h4 className="font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
            II. Status Verifikasi dan Persetujuan Sesuai Alur Workflow
          </h4>

          <div className="grid grid-cols-2 gap-4 pt-2 text-center text-[11px]">
            {/* Stamp Koordinator */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Koordinator Ruang
              </span>
              <div className="h-12 flex items-center justify-center">
                {koordinatorApproval ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DIVERIFIKASI
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">MENUNGGU</span>
                )}
              </div>
              <p className="font-bold text-slate-800 truncate">
                {koordinatorApproval?.approver_nama || '-'}
              </p>
            </div>

            {/* Stamp Kabag Umum */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="font-bold text-slate-600 uppercase text-[10px] block">
                Kepala Bagian Umum
              </span>
              <div className="h-12 flex items-center justify-center">
                {kabagApproval ? (
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5" /> DISETUJUI AKHIR
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">MENUNGGU</span>
                )}
              </div>
              <p className="font-bold text-slate-800 truncate">
                {kabagApproval?.approver_nama || '-'}
              </p>
            </div>
          </div>
        </div>

        {/* KETENTUAN PENGGUNAAN RUANGAN */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
          <p className="font-bold text-slate-900 uppercase">Ketentuan Penggunaan Ruang Rapat:</p>
          <ol className="list-decimal list-inside space-y-0.5 leading-relaxed">
            <li>Tunjukkan dokumen bukti peminjaman ini kepada Koordinator Ruang Rapat Sekretariat BSKJI.</li>
            <li>Menjaga kebersihan, ketertiban, dan keutuhan fasilitas peralatan rapat.</li>
            <li>Mematikan AC, proyektor, dan lampu ruangan setelah selesai digunakan.</li>
          </ol>
        </div>

        {/* FOOTER SIGNATURE TIMESTAMP */}
        <div className="pt-4 flex justify-between text-[10px] text-slate-400 border-t border-slate-200">
          <span>Dokumen ini diterbitkan secara otomatis oleh Sistem Informasi Peminjaman Ruang Rapat BSKJI.</span>
          <span className="font-mono">TGL CETAK: {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};
