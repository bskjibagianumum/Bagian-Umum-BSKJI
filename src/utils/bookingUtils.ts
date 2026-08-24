import { Booking, Room, RoomAvailabilityResult } from '../types';

/**
 * Checks if two time intervals on the same date overlap according to section I algorithm:
 * tanggal_baru == tanggal_lama AND jam_mulai_baru < jam_selesai_lama AND jam_selesai_baru > jam_mulai_lama
 */
export function isTimeOverlapping(
  date1: string,
  start1: string,
  end1: string,
  date2: string,
  start2: string,
  end2: string
): boolean {
  if (date1 !== date2) return false;

  // Convert HH:mm strings to numeric minutes from midnight for exact calculation
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const start1Mins = toMinutes(start1);
  const end1Mins = toMinutes(end1);
  const start2Mins = toMinutes(start2);
  const end2Mins = toMinutes(end2);

  return start1Mins < end2Mins && end1Mins > start2Mins;
}

/**
 * Active statuses that lock/occupy a room schedule or pending reservation
 */
export const LOCKING_STATUSES = [
  'MENUNGGU_PERSETUJUAN_ATASAN',
  'DISETUJUI_ATASAN',
  'MENUNGGU_PERSETUJUAN_KOORDINATOR',
  'DISETUJUI_KOORDINATOR',
  'MENUNGGU_PERSETUJUAN_KABAG',
  'DISETUJUI',
];

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function isBackDate(dateStr: string): boolean {
  if (!dateStr) return false;
  const today = getTodayDateString();
  return dateStr < today;
}

/**
 * Validates anti-double booking for a target room at date & time
 */
export function checkRoomAvailability(
  room: Room,
  date: string,
  startTime: string,
  endTime: string,
  participants: number,
  allBookings: Booking[],
  excludeBookingId?: string
): RoomAvailabilityResult {
  // 1. Status Ruangan = Aktif
  if (room.status !== 'Aktif') {
    return {
      room,
      is_available: false,
      reason: `Ruangan saat ini berkategori '${room.status}' dan tidak dapat dipinjam.`,
    };
  }

  // 2. Disallow back date
  if (isBackDate(date)) {
    return {
      room,
      is_available: false,
      reason: 'Tanggal peminjaman tidak boleh tanggal yang telah berlalu (back date).',
    };
  }

  // 3. Kapasitas >= Jumlah Peserta
  if (room.kapasitas < participants) {
    return {
      room,
      is_available: false,
      reason: `Kapasitas ruangan (${room.kapasitas} orang) tidak mencukupi untuk ${participants} peserta.`,
    };
  }

  // 3. Check for double booking overlap with existing active/reserved bookings
  const conflictingBooking = allBookings.find((b) => {
    if (b.id === excludeBookingId) return false;
    if (b.room_id !== room.id) return false;
    if (!LOCKING_STATUSES.includes(b.status)) return false;

    return isTimeOverlapping(
      date,
      startTime,
      endTime,
      b.tanggal,
      b.jam_mulai,
      b.jam_selesai
    );
  });

  if (conflictingBooking) {
    return {
      room,
      is_available: false,
      reason: `Bentrok dengan agenda '${conflictingBooking.keperluan}' (${conflictingBooking.jam_mulai} - ${conflictingBooking.jam_selesai} WIB).`,
      conflicting_booking: conflictingBooking,
    };
  }

  return {
    room,
    is_available: true,
  };
}

const ROMAN_MONTHS = [
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

/**
 * Returns month in Roman numeral (1 -> I, 8 -> VIII, 12 -> XII)
 */
export function getRomanMonth(monthNumber: number): string {
  return ROMAN_MONTHS[monthNumber - 1] || 'I';
}

/**
 * Generate unique booking registration number in (nomor surat)/BSKJI.1/RT/RR/BULAN(dalam romawi)/tahun format
 * Contoh: 0001/BSKJI.1/RT/RR/VIII/2026
 */
export function generateBookingNumber(existingBookings: Booking[]): string {
  const now = new Date();
  const year = now.getFullYear();
  const romanMonth = ROMAN_MONTHS[now.getMonth()] || 'I';

  const suffix = `/BSKJI.1/RT/RR/${romanMonth}/${year}`;

  let maxSeq = 0;
  existingBookings.forEach((b) => {
    if (!b.nomor_peminjaman) return;
    const match = b.nomor_peminjaman.match(/^(\d+)\//);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  });

  if (maxSeq === 0) {
    maxSeq = existingBookings.length;
  }

  const nextSeq = maxSeq + 1;
  const seqPadded = String(nextSeq).padStart(4, '0');

  return `${seqPadded}${suffix}`;
}

/**
 * Calculates duration string between HH:mm start and end times
 */
export function calculateDuration(startTime: string, endTime: string): string {
  if (!startTime || !endTime) return '-';
  const [h1, m1] = startTime.split(':').map(Number);
  const [h2, m2] = endTime.split(':').map(Number);

  let totalMins = h2 * 60 + m2 - (h1 * 60 + m1);
  if (totalMins <= 0) return 'Jam tidak valid';

  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} Jam ${mins} Menit`;
  } else if (hours > 0) {
    return `${hours} Jam`;
  } else {
    return `${mins} Menit`;
  }
}

/**
 * Formats YYYY-MM-DD string to Indonesian long date e.g. "12 Agustus 2026"
 */
export function formatIndonesianDate(dateStr: string): string {
  if (!dateStr) return '-';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  return `${d} ${monthNames[m - 1]} ${y}`;
}

export function formatIndonesianDateTime(isoStr: string): string {
  if (!isoStr) return '-';
  const date = new Date(isoStr);
  const d = date.getDate();
  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  const m = monthNames[date.getMonth()];
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${d} ${m} ${y} ${hh}.${mm} WIB`;
}
