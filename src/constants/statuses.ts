import { BookingStatus } from '../types';

export interface StatusMeta {
  code: BookingStatus;
  label: string;
  badgeClass: string;
  dotClass: string;
  description: string;
}

export const BOOKING_STATUS_META: Record<BookingStatus, StatusMeta> = {
  DRAFT: {
    code: 'DRAFT',
    label: 'Draft',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotClass: 'bg-slate-400',
    description: 'Pengajuan belum dikirim',
  },
  MENUNGGU_PERSETUJUAN_KOORDINATOR: {
    code: 'MENUNGGU_PERSETUJUAN_KOORDINATOR',
    label: 'Menunggu Persetujuan Koordinator',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-300',
    dotClass: 'bg-indigo-500 animate-pulse',
    description: 'Menunggu verifikasi ketersediaan oleh Koordinator Ruang',
  },
  DISETUJUI_KOORDINATOR: {
    code: 'DISETUJUI_KOORDINATOR',
    label: 'Disetujui Koordinator',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-300',
    dotClass: 'bg-blue-500',
    description: 'Telah diverifikasi oleh Koordinator Ruang',
  },
  DITOLAK_KOORDINATOR: {
    code: 'DITOLAK_KOORDINATOR',
    label: 'Ditolak Koordinator',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
    description: 'Pengajuan ditolak oleh Koordinator Ruang',
  },
  MENUNGGU_PERSETUJUAN_KABAG: {
    code: 'MENUNGGU_PERSETUJUAN_KABAG',
    label: 'Menunggu Persetujuan Kabag Umum',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-300',
    dotClass: 'bg-purple-500 animate-pulse',
    description: 'Menunggu persetujuan akhir oleh Kepala Bagian Umum',
  },
  DISETUJUI: {
    code: 'DISETUJUI',
    label: 'Disetujui (Ter-reserve)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold',
    dotClass: 'bg-emerald-500',
    description: 'Disetujui akhir dan jadwal ruang telah terkunci/ter-reserve',
  },
  DITOLAK_KABAG: {
    code: 'DITOLAK_KABAG',
    label: 'Ditolak Kabag Umum',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
    description: 'Pengajuan ditolak oleh Kepala Bagian Umum',
  },
  DIBATALKAN: {
    code: 'DIBATALKAN',
    label: 'Dibatalkan',
    badgeClass: 'bg-gray-100 text-gray-700 border-gray-300',
    dotClass: 'bg-gray-400',
    description: 'Pengajuan dibatalkan oleh peminjam',
  },
  SELESAI: {
    code: 'SELESAI',
    label: 'Selesai',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-300',
    dotClass: 'bg-teal-500',
    description: 'Kegiatan rapat telah selesai dilaksanakan',
  },
};

export const WORKFLOW_STAGES = [
  { level: 'PEMINJAM', name: 'Pengajuan dibuat' },
  { level: 'KOORDINATOR', name: 'Verifikasi Koordinator Ruang' },
  { level: 'KABAG', name: 'Persetujuan Kepala Bagian Umum' },
];
