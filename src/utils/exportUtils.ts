import { Booking } from '../types';

/**
 * Utility to download data as a CSV Excel-compatible file
 */
export function exportToCSV(filename: string, rows: Record<string, any>[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((fieldName) => {
          const val = row[fieldName] !== undefined ? String(row[fieldName]) : '';
          // Escape quotes and wrap string containing commas
          const escaped = val.replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\ufeff' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format bookings array into tabular rows for Excel export
 */
export function prepareBookingsExport(bookings: Booking[]) {
  return bookings.map((b) => ({
    'Nomor Peminjaman': b.nomor_peminjaman,
    'Nama Peminjam': b.peminjam_nama,
    NIP: b.peminjam_nip,
    'Unit Kerja': b.unit_nama,
    'Ruang Rapat': b.room_nama,
    Keperluan: b.keperluan,
    Tanggal: b.tanggal,
    'Jam Mulai': b.jam_mulai,
    'Jam Selesai': b.jam_selesai,
    'Jumlah Peserta': b.jumlah_peserta,
    Status: b.status,
    'Tanggal Pengajuan': b.created_at,
  }));
}

export function exportBookingsToCSV(bookings: Booking[], filename = 'Rekapitulasi_Peminjaman_BSKJI') {
  const rows = prepareBookingsExport(bookings);
  exportToCSV(filename, rows);
}

