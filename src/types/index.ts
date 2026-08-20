export type RoleId = 'peminjam' | 'koordinator' | 'kabag_umum' | 'admin';

export interface User {
  id: string;
  nama: string;
  nip: string;
  email: string;
  unit_id: string;
  unit_nama: string;
  jabatan: string;
  role_id: RoleId;
  status: 'Aktif' | 'Nonaktif';
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  nama_unit: string;
  kode_unit: string;
  kepala_unit?: string;
}

export interface Room {
  id: string;
  nama_ruang: string;
  lokasi: string;
  lantai: number;
  kapasitas: number;
  fasilitas: string[];
  status: 'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan';
  keterangan: string;
  foto: string;
  created_at: string;
  updated_at: string;
}

export type BookingStatus =
  | 'DRAFT'
  | 'MENUNGGU_PERSETUJUAN_KOORDINATOR'
  | 'DISETUJUI_KOORDINATOR'
  | 'DITOLAK_KOORDINATOR'
  | 'MENUNGGU_PERSETUJUAN_KABAG'
  | 'DISETUJUI'
  | 'DITOLAK_KABAG'
  | 'DIBATALKAN'
  | 'SELESAI';

export interface ApprovalHistory {
  id: string;
  booking_id: string;
  approver_id: string;
  approver_nama: string;
  approver_nip: string;
  approver_jabatan: string;
  level_approval: 'KOORDINATOR' | 'KABAG';
  status: 'DISETUJUI' | 'DITOLAK';
  catatan: string;
  approved_at: string;
}

export interface CheckInLog {
  checked_in_at?: string;
  checked_in_by?: string;
  checked_out_at?: string;
  checked_out_by?: string;
}

export interface Booking {
  id: string;
  nomor_peminjaman: string;
  user_id: string;
  peminjam_nama: string;
  peminjam_nip: string;
  peminjam_jabatan: string;
  unit_id: string;
  unit_nama: string;
  room_id: string;
  room_nama: string;
  keperluan: string;
  tanggal: string; // YYYY-MM-DD
  jam_mulai: string; // HH:mm
  jam_selesai: string; // HH:mm
  durasi: string; // e.g., "2 Jam 30 Menit"
  jumlah_peserta: number;
  keterangan?: string;
  status: BookingStatus;
  approvals: ApprovalHistory[];
  check_in?: CheckInLog;
  created_at: string;
  updated_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  booking_id: string;
  judul: string;
  pesan: string;
  status_baca: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_nama: string;
  role: string;
  aktivitas: string;
  booking_id?: string;
  nomor_peminjaman?: string;
  data_lama?: string;
  data_baru?: string;
  timestamp: string;
  ip_address?: string;
}

export interface TimeSlotAvailability {
  jam_mulai: string;
  jam_selesai: string;
  is_available: boolean;
  conflicting_booking?: Booking;
}

export interface RoomAvailabilityResult {
  room: Room;
  is_available: boolean;
  reason?: string;
  conflicting_booking?: Booking;
}
