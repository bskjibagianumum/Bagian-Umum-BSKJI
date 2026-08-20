import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { RoomCard } from '../components/rooms/RoomCard';
import { RoomModal } from '../components/rooms/RoomModal';
import { Room } from '../types';
import { Plus, Search, DoorOpen, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RoomsPage: React.FC = () => {
  const { rooms } = useApp();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);

  const canManage = currentUser.role_id === 'admin' || currentUser.role_id === 'koordinator';

  const filteredRooms = rooms.filter((r) => {
    const matchesSearch =
      r.nama_ruang.toLowerCase().includes(search.toLowerCase()) ||
      r.lokasi.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleEditRoom = (room: Room) => {
    setRoomToEdit(room);
    setIsModalOpen(true);
  };

  const handleAddRoom = () => {
    setRoomToEdit(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight">
            Master Data Ruang Rapat
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lokasi, kapasitas, fasilitas, dan status operasional ruangan di Sekretariat BSKJI.
          </p>
        </div>

        {canManage && (
          <button
            onClick={handleAddRoom}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Tambah Ruangan Baru
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama ruangan atau lokasi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
        >
          <option value="ALL">Semua Status</option>
          <option value="Aktif">Aktif</option>
          <option value="Tidak Aktif">Tidak Aktif</option>
          <option value="Dalam Perbaikan">Dalam Perbaikan</option>
        </select>
      </div>

      {/* Room Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            canManage={canManage}
            onEdit={handleEditRoom}
            onBook={() => navigate('/bookings/new')}
          />
        ))}
      </div>

      {/* Add / Edit Room Modal */}
      <RoomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        roomToEdit={roomToEdit}
      />
    </div>
  );
};
