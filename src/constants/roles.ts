import { RoleId, User } from '../types';

export interface RoleMeta {
  id: RoleId;
  nama: string;
  deskripsi: string;
  badgeColor: string;
}

export const ROLE_META: Record<RoleId, RoleMeta> = {
  peminjam: {
    id: 'peminjam',
    nama: 'Peminjam',
    deskripsi: 'Pegawai yang mengajukan peminjaman ruang rapat',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  koordinator: {
    id: 'koordinator',
    nama: 'Koordinator Ruang Rapat',
    deskripsi: 'Pengelola ketersediaan dan fasilitas ruangan BSKJI',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  kabag_umum: {
    id: 'kabag_umum',
    nama: 'Kepala Bagian Umum',
    deskripsi: 'Pejabat pemberi persetujuan akhir dan locking reservasi',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  admin: {
    id: 'admin',
    nama: 'Administrator',
    deskripsi: 'Pengelola master data, user, unit, dan audit trail',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
  },
};

export const DEMO_USERS: User[] = [
  {
    id: 'usr_peminjam_01',
    nama: 'test peminjam',
    nip: '111111111111111111',
    email: 'budi.santoso@kemenperin.go.id',
    unit_id: 'unit_program',
    unit_nama: 'Bagian Umum',
    jabatan: 'Analis Kebijakan Ahli Muda',
    role_id: 'peminjam',
    status: 'Aktif',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_koordinator_01',
    nama: 'Erawan Kencana',
    nip: '197601122025211018',
    email: 'erawan_kencana@kemenperin.go.id',
    unit_id: 'unit_umum',
    unit_nama: 'Bagian Umum Sekretariat BSKJI',
    jabatan: 'Koordinator Urusan Internal dan Ruang Rapat',
    role_id: 'koordinator',
    status: 'Aktif',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr_kabag_01',
    nama: 'Achmad Taufik',
    nip: '198201192008031002',
    email: 'achmad_taufik@kemenperin.go.id',
    unit_id: 'unit_umum',
    unit_nama: 'Bagian Umum Sekretariat BSKJI',
    jabatan: 'Kepala Bagian Umum',
    role_id: 'kabag_umum',
    status: 'Aktif',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
  {
    id: 'Setiyo Jatmiko',
    nama: 'Admin BSKJI',
    nip: '198610142010121004',
    email: 'setiyo.jatmiko@kemenperin.go.id',
    unit_id: 'unit_sekretariat',
    unit_nama: 'Sekretariat BSKJI',
    jabatan: 'Admin',
    role_id: 'admin',
    status: 'Aktif',
    created_at: '2026-01-10T08:00:00Z',
    updated_at: '2026-01-10T08:00:00Z',
  },
];
