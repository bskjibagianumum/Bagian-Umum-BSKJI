import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { BookingFormStep1 } from '../components/booking/BookingFormStep1';
import { BookingFormStep2, Step2FormData } from '../components/booking/BookingFormStep2';
import { BookingFormStep3 } from '../components/booking/BookingFormStep3';
import { UserCheck, FileText, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateDuration } from '../utils/bookingUtils';

export const NewBookingPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { createBooking, rooms } = useApp();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [formData, setFormData] = useState<Step2FormData>({
    keperluan: '',
    tanggal: '2026-08-14', // default future date
    jam_mulai: '09:00',
    jam_selesai: '11:30',
    jumlah_peserta: 15,
    keterangan: '',
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (field: keyof Step2FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.keperluan.trim()) {
      errs.keperluan = 'Keperluan rapat wajib diisi.';
    }
    if (!formData.tanggal) {
      errs.tanggal = 'Tanggal rapat wajib dipilih.';
    }
    if (!formData.jam_mulai) {
      errs.jam_mulai = 'Jam mulai wajib diisi.';
    }
    if (!formData.jam_selesai) {
      errs.jam_selesai = 'Jam selesai wajib diisi.';
    } else if (formData.jam_selesai <= formData.jam_mulai) {
      errs.jam_selesai = 'Jam selesai harus lebih akhir dari jam mulai.';
    }
    if (!formData.jumlah_peserta || formData.jumlah_peserta <= 0) {
      errs.jumlah_peserta = 'Jumlah peserta harus lebih dari 0.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (validateStep2()) {
        setCurrentStep(3);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep === 2) setCurrentStep(1);
    if (currentStep === 3) setCurrentStep(2);
  };

  const handleSubmitBooking = () => {
    if (!selectedRoomId) return;

    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (!selectedRoom) return;

    const newBooking = createBooking({
      user_id: currentUser.id,
      peminjam_nama: currentUser.nama,
      peminjam_nip: currentUser.nip,
      peminjam_jabatan: currentUser.jabatan,
      unit_id: currentUser.unit_id,
      unit_nama: currentUser.unit_nama,
      keperluan: formData.keperluan,
      tanggal: formData.tanggal,
      jam_mulai: formData.jam_mulai,
      jam_selesai: formData.jam_selesai,
      durasi: calculateDuration(formData.jam_mulai, formData.jam_selesai),
      jumlah_peserta: formData.jumlah_peserta,
      keterangan: formData.keterangan,
      room_id: selectedRoom.id,
      room_nama: selectedRoom.nama_ruang,
    });

    if (newBooking?.id) {
      navigate(`/bookings/${newBooking.id}`);
    } else {
      navigate('/bookings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Formulir Pengajuan Peminjaman Ruang Rapat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lengkapi data peminjaman di bawah ini. Sistem akan memeriksa ketersediaan ruangan secara real-time.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 text-blue-800 text-xs font-bold rounded-xl border border-blue-200 flex items-center gap-1.5 shrink-0">
          <ShieldCheck className="w-4 h-4 text-blue-600" /> Workflow Standard Operasional Prosedur BSKJI
        </div>
      </div>

      {/* Wizard Progress Steps Indicator */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2">
          {/* Step 1 */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              currentStep === 1
                ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold'
                : currentStep > 1
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 1
                  ? 'bg-blue-600 text-white'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </div>
            <div className="hidden sm:block text-xs">
              <span className="block text-[10px] uppercase tracking-wider opacity-80">Langkah 1</span>
              <span>Data Peminjam</span>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              currentStep === 2
                ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold'
                : currentStep > 2
                ? 'border-emerald-200 bg-emerald-50/50 text-emerald-900 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 2
                  ? 'bg-blue-600 text-white'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </div>
            <div className="hidden sm:block text-xs">
              <span className="block text-[10px] uppercase tracking-wider opacity-80">Langkah 2</span>
              <span>Detail Rapat</span>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
              currentStep === 3
                ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold'
                : 'border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </div>
            <div className="hidden sm:block text-xs">
              <span className="block text-[10px] uppercase tracking-wider opacity-80">Langkah 3</span>
              <span>Pilih Ruangan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card Content */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        {currentStep === 1 && <BookingFormStep1 user={currentUser} />}

        {currentStep === 2 && (
          <BookingFormStep2
            formData={formData}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {currentStep === 3 && (
          <BookingFormStep3
            tanggal={formData.tanggal}
            jamMulai={formData.jam_mulai}
            jamSelesai={formData.jam_selesai}
            jumlahPeserta={formData.jumlah_peserta}
            selectedRoomId={selectedRoomId}
            onSelectRoom={(roomId) => setSelectedRoomId(roomId)}
            onSuggestAlternativeTime={(newStart, newEnd) => {
              setFormData((prev) => ({
                ...prev,
                jam_mulai: newStart,
                jam_selesai: newEnd,
              }));
            }}
          />
        )}

        {/* Navigation Buttons Bar */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
          ) : (
            <div />
          )}

          {currentStep < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              Lanjut Ke Cek Ketersediaan <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={!selectedRoomId}
              onClick={handleSubmitBooking}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-all flex items-center gap-2 ${
                selectedRoomId
                  ? 'bg-emerald-600 hover:bg-emerald-700 cursor-pointer'
                  : 'bg-slate-300 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" /> KIRIM PENGAJUAN PEMINJAMAN
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
