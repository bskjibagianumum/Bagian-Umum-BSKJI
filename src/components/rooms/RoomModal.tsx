import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Room } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { DoorOpen, Building, Users, Image as ImageIcon, Plus, X } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomToEdit: Room | null;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  roomToEdit,
}) => {
  const { saveRoom } = useApp();

  const [namaRuang, setNamaRuang] = useState('');
  const [lokasi, setLokasi] = useState('');
  const [lantai, setLantai] = useState(1);
  const [kapasitas, setKapasitas] = useState(20);
  const [status, setStatus] = useState<'Aktif' | 'Tidak Aktif' | 'Dalam Perbaikan'>('Aktif');
  const [keterangan, setKeterangan] = useState('');
  const [foto, setFoto] = useState('');
  const [fasilitas, setFasilitas] = useState<string[]>([]);
  const [newFacilityInput, setNewFacilityInput] = useState('');

  useEffect(() => {
    if (roomToEdit) {
      setNamaRuang(roomToEdit.nama_ruang);
      setLokasi(roomToEdit.lokasi);
      setLantai(roomToEdit.lantai);
      setKapasitas(roomToEdit.kapasitas);
      setStatus(roomToEdit.status);
      setKeterangan(roomToEdit.keterangan);
      setFoto(roomToEdit.foto);
      setFasilitas(roomToEdit.fasilitas || []);
    } else {
      setNamaRuang('');
      setLokasi('Gedung Utama BSKJI - Lantai 2');
      setLantai(2);
      setKapasitas(20);
      setStatus('Aktif');
      setKeterangan('');
      setFoto('https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&w=800&q=80');
      setFasilitas([]);
    }
  }, [roomToEdit, isOpen]);

  const handleAddFacility = () => {
    if (newFacilityInput.trim()) {
      setFasilitas([...fasilitas, newFacilityInput.trim()]);
      setNewFacilityInput('');
    }
  };

  const handleRemoveFacility = (index: number) => {
    setFasilitas(fasilitas.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!namaRuang) return;

    const roomData: Room = {
      id: roomToEdit ? roomToEdit.id : `room_${Date.now()}`,
      nama_ruang: namaRuang,
      lokasi,
      lantai,
      kapasitas,
      status,
      keterangan,
      foto,
      fasilitas,
      created_at: roomToEdit ? roomToEdit.created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    saveRoom(roomData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={roomToEdit ? 'Edit Master Data Ruangan' : 'Tambah Ruang Rapat Baru'}
      subtitle="Kelola fasilitas, lokasi, kapasitas, dan status operasional ruangan."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Nama Ruangan *
            </label>
            <input
              type="text"
              required
              value={namaRuang}
              onChange={(e) => setNamaRuang(e.target.value)}
              placeholder="e.g. Ruang Rapat Sinergi"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Status Operasional *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
              <option value="Dalam Perbaikan">Dalam Perbaikan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Lokasi / Gedung *
            </label>
            <input
              type="text"
              required
              value={lokasi}
              onChange={(e) => setLokasi(e.target.value)}
              placeholder="e.g. Gedung Utama BSKJI - Lantai 2"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Lantai *
              </label>
              <input
                type="number"
                min={1}
                required
                value={lantai}
                onChange={(e) => setLantai(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Kapasitas (Orang) *
              </label>
              <input
                type="number"
                min={1}
                required
                value={kapasitas}
                onChange={(e) => setKapasitas(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fasilitas */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Daftar Fasilitas
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFacilityInput}
              onChange={(e) => setNewFacilityInput(e.target.value)}
              placeholder="Tambah fasilitas e.g. Video Conference Zoom"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-xl"
            />
            <button
              type="button"
              onClick={handleAddFacility}
              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {fasilitas.map((f, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-xs px-2.5 py-1 rounded-lg border border-slate-200"
              >
                {f}
                <button
                  type="button"
                  onClick={() => handleRemoveFacility(idx)}
                  className="text-slate-400 hover:text-rose-600 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* URL Foto & Keterangan */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            URL Foto Ruangan
          </label>
          <input
            type="url"
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Keterangan Ruangan
          </label>
          <textarea
            rows={2}
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
          >
            Simpan Ruangan
          </button>
        </div>
      </form>
    </Modal>
  );
};
