import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Bell, CheckCheck, Trash2, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">Notifikasi System</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pemberitahuan perubahan status peminjaman dan tindak lanjut workflow.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" /> Tandai Semua Dibaca
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">Belum ada notifikasi.</div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.booking_id) navigate(`/bookings/${notif.booking_id}`);
              }}
              className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                !notif.status_baca ? 'bg-blue-50/40' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{notif.judul}</h4>
                  {!notif.status_baca && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.pesan}</p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {new Date(notif.created_at).toLocaleString('id-ID')}
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
