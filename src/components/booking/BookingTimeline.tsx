import React from 'react';
import { Booking } from '../../types';
import { BOOKING_STATUS_META } from '../../constants/statuses';
import { formatIndonesianDateTime } from '../../utils/bookingUtils';
import { CheckCircle2, Clock, XCircle, AlertCircle, UserCheck } from 'lucide-react';

interface BookingTimelineProps {
  booking: Booking;
}

export const BookingTimeline: React.FC<BookingTimelineProps> = ({ booking }) => {
  const koordinatorApproval = booking.approvals.find((a) => a.level_approval === 'KOORDINATOR');
  const kabagApproval = booking.approvals.find((a) => a.level_approval === 'KABAG');

  const stages = [
    {
      stage: 'PEMINJAM',
      title: 'Pengajuan Dibuat oleh Peminjam',
      subtitle: `${booking.peminjam_nama} (${booking.peminjam_nip}) - ${booking.unit_nama}`,
      time: formatIndonesianDateTime(booking.created_at),
      status: 'DONE',
      note: null,
    },
    {
      stage: 'KOORDINATOR',
      title: 'Verifikasi Ketersediaan oleh Koordinator Ruang',
      subtitle: koordinatorApproval
        ? `${koordinatorApproval.approver_nama} (${koordinatorApproval.approver_jabatan})`
        : 'Menunggu verifikasi Koordinator Ruang',
      time: koordinatorApproval
        ? formatIndonesianDateTime(koordinatorApproval.approved_at)
        : null,
      status: koordinatorApproval
        ? koordinatorApproval.status === 'DISETUJUI'
          ? 'DONE'
          : 'REJECTED'
        : booking.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR'
        ? 'PENDING'
        : booking.status === 'DIBATALKAN'
        ? 'CANCELLED'
        : 'WAITING',
      note: koordinatorApproval?.catatan || null,
    },
    {
      stage: 'KABAG',
      title: 'Persetujuan Akhir dan Locking Reservasi oleh Kabag Umum',
      subtitle: kabagApproval
        ? `${kabagApproval.approver_nama} (${kabagApproval.approver_jabatan})`
        : 'Menunggu persetujuan akhir Kabag Umum',
      time: kabagApproval ? formatIndonesianDateTime(kabagApproval.approved_at) : null,
      status: kabagApproval
        ? kabagApproval.status === 'DISETUJUI'
          ? 'DONE'
          : 'REJECTED'
        : booking.status === 'MENUNGGU_PERSETUJUAN_KABAG'
        ? 'PENDING'
        : booking.status === 'DIBATALKAN'
        ? 'CANCELLED'
        : 'WAITING',
      note: kabagApproval?.catatan || null,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-blue-600" /> Timeline Alur Persetujuan (Workflow History)
      </h3>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {stages.map((st, idx) => {
          let icon = <Clock className="w-4 h-4 text-slate-400" />;
          let circleBg = 'bg-slate-100 text-slate-400 ring-4 ring-white';

          if (st.status === 'DONE') {
            icon = <CheckCircle2 className="w-4 h-4 text-white" />;
            circleBg = 'bg-emerald-600 text-white ring-4 ring-emerald-100';
          } else if (st.status === 'PENDING') {
            icon = <Clock className="w-4 h-4 text-amber-600 animate-spin" />;
            circleBg = 'bg-amber-100 text-amber-700 ring-4 ring-amber-50';
          } else if (st.status === 'REJECTED') {
            icon = <XCircle className="w-4 h-4 text-white" />;
            circleBg = 'bg-rose-600 text-white ring-4 ring-rose-100';
          }

          return (
            <div key={idx} className="relative flex items-start gap-4">
              <div
                className={`absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${circleBg}`}
              >
                {icon}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-900">{st.title}</h4>
                  {st.time && (
                    <span className="text-[11px] font-mono text-slate-500">{st.time}</span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-0.5">{st.subtitle}</p>

                {st.note && (
                  <div className="mt-2.5 p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block text-[11px]">
                      Catatan / Alasan:
                    </span>
                    <p className="italic text-slate-600 mt-0.5">"{st.note}"</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
