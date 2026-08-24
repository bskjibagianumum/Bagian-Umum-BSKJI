import React from 'react';
import { calculateDuration, getTodayDateString } from '../../utils/bookingUtils';
import {
  FileText,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';

export interface Step2FormData {
  keperluan: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  jumlah_peserta: number;
  keterangan: string;
}

interface Step2Props {
  formData: Step2FormData;
  onChange: (field: keyof Step2FormData, value: any) => void;
  errors: Record<string, string>;
}

export const BookingFormStep2: React.FC<Step2Props> = ({
  formData,
  onChange,
  errors,
}) => {
  const duration = calculateDuration(formData.jam_mulai, formData.jam_selesai);
  const minDate = getTodayDateString();

  return (
    <div className="space-y-4">
      {/* Keperluan Rapat */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Nama / Keperluan Rapat <span className="text-rose-500">*</span>
        </label>
        <div className="relative">
          <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <textarea
            rows={2}
            value={formData.keperluan}
            onChange={(e) => onChange('keperluan', e.target.value)}
            placeholder="Contoh: Rapat Koordinasi Program dan Evaluasi Triwulan III 2026"
            className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
              errors.keperluan ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
            }`}
          />
        </div>
        {errors.keperluan && (
          <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> {errors.keperluan}
          </p>
        )}
      </div>

      {/* Tanggal & Waktu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tanggal */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Tanggal Rapat <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              min={minDate}
              value={formData.tanggal}
              onChange={(e) => onChange('tanggal', e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.tanggal ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            *Tidak dapat memilih tanggal lampau (minimal hari ini: {minDate})
          </p>
          {errors.tanggal && (
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.tanggal}
            </p>
          )}
        </div>

        {/* Jam Mulai */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Jam Mulai <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="time"
              value={formData.jam_mulai}
              onChange={(e) => onChange('jam_mulai', e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.jam_mulai ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.jam_mulai && (
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.jam_mulai}
            </p>
          )}
        </div>

        {/* Jam Selesai */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Jam Selesai <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="time"
              value={formData.jam_selesai}
              onChange={(e) => onChange('jam_selesai', e.target.value)}
              className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.jam_selesai ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.jam_selesai && (
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.jam_selesai}
            </p>
          )}
        </div>
      </div>

      {/* Durasi Info & Jumlah Peserta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Durasi Otomatis
          </label>
          <div className="px-3 py-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold text-blue-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{duration}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Jumlah Peserta (Orang) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Users className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min={1}
              max={150}
              value={formData.jumlah_peserta}
              onChange={(e) => onChange('jumlah_peserta', parseInt(e.target.value) || 0)}
              className={`w-full pl-9 pr-3 py-2.5 text-xs bg-white border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                errors.jumlah_peserta ? 'border-rose-300 bg-rose-50/30' : 'border-slate-300'
              }`}
            />
          </div>
          {errors.jumlah_peserta && (
            <p className="text-[11px] text-rose-600 font-medium mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {errors.jumlah_peserta}
            </p>
          )}
        </div>
      </div>

      {/* Keterangan Tambahan */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
          Keterangan / Fasilitas Khusus (Opsional)
        </label>
        <div className="relative">
          <MessageSquare className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <textarea
            rows={2}
            value={formData.keterangan}
            onChange={(e) => onChange('keterangan', e.target.value)}
            placeholder="Contoh: Membutuhkan fasilitas Zoom Hybrid, microphone wireless 4 unit, dan laptop connector."
            className="w-full pl-9 pr-3 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
