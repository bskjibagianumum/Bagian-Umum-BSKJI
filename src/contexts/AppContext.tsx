import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import {
  Booking,
  Room,
  Unit,
  User,
  AppNotification,
  AuditLog,
  BookingStatus,
} from '../types';
import { DataService } from '../services/dataService';
import { useAuth } from './AuthContext';
import { generateBookingNumber, calculateDuration } from '../utils/bookingUtils';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

interface AppContextType {
  bookings: Booking[];
  rooms: Room[];
  units: Unit[];
  users: User[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  unreadNotificationCount: number;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toast
  toasts: ToastMessage[];
  addToast: (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => void;
  removeToast: (id: string) => void;

  // Operations
  createBooking: (
    bookingData: Omit<
      Booking,
      'id' | 'nomor_peminjaman' | 'status' | 'created_at' | 'updated_at' | 'approvals'
    >
  ) => Booking;
  approveBooking: (bookingId: string, catatan: string, level: 'KOORDINATOR' | 'KABAG') => void;
  rejectBooking: (bookingId: string, catatan: string, level: 'KOORDINATOR' | 'KABAG') => void;
  cancelBooking: (bookingId: string, alasan: string) => void;
  checkInBooking: (bookingId: string) => void;
  checkOutBooking: (bookingId: string) => void;
  saveRoom: (room: Room) => void;
  saveUser: (user: User) => void;
  saveUnit: (unit: Unit) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const dataService = DataService.getInstance();

  const [bookings, setBookings] = useState<Booking[]>(() => dataService.getBookings());
  const [rooms, setRooms] = useState<Room[]>(() => dataService.getRooms());
  const [units, setUnits] = useState<Unit[]>(() => dataService.getUnits());
  const [users, setUsers] = useState<User[]>(() => dataService.getUsers());
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    dataService.getNotifications(currentUser?.id)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => dataService.getAuditLogs());

  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync notifications when current user changes (e.g. login, switch role, logout)
  useEffect(() => {
    setNotifications(dataService.getNotifications(currentUser?.id));
  }, [currentUser, dataService]);

  // Subscribe to DataService updates
  useEffect(() => {
    const unsubscribe = dataService.subscribe(() => {
      setBookings(dataService.getBookings());
      setRooms(dataService.getRooms());
      setUnits(dataService.getUnits());
      setUsers(dataService.getUsers());
      setNotifications(dataService.getNotifications(currentUser?.id));
      setAuditLogs(dataService.getAuditLogs());
    });
    return unsubscribe;
  }, [currentUser, dataService]);

  const addToast = useCallback(
    (type: 'success' | 'error' | 'info' | 'warning', title: string, message: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);

      // Auto dismiss after 4.5s
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const createBooking = (
    bookingData: Omit<
      Booking,
      'id' | 'nomor_peminjaman' | 'status' | 'created_at' | 'updated_at' | 'approvals'
    >
  ): Booking => {
    const nomor_peminjaman = generateBookingNumber(bookings);
    const durasi =
      bookingData.durasi ||
      calculateDuration(bookingData.jam_mulai, bookingData.jam_selesai);

    const newBooking: Booking = {
      ...bookingData,
      id: `bk_${Date.now()}`,
      nomor_peminjaman,
      durasi,
      status: 'MENUNGGU_PERSETUJUAN_KOORDINATOR',
      approvals: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      dataService.addBooking(newBooking, currentUser);
      addToast(
        'success',
        'Pengajuan Berhasil Dikirim',
        `Nomor peminjaman ${newBooking.nomor_peminjaman} siap diproses oleh Koordinator Ruangan.`
      );
    } catch (e: any) {
      addToast('error', 'Gagal Membuat Pengajuan', e.message || 'Terjadi kesalahan sistem.');
    }

    return newBooking;
  };

  const approveBooking = (
    bookingId: string,
    catatan: string,
    level: 'KOORDINATOR' | 'KABAG'
  ) => {
    try {
      let targetStatus: BookingStatus;
      if (level === 'KOORDINATOR') {
        targetStatus = 'MENUNGGU_PERSETUJUAN_KABAG';
      } else {
        targetStatus = 'DISETUJUI'; // Final approval & reservation lock
      }

      dataService.updateBookingStatus(bookingId, targetStatus, currentUser, catatan, level);
      addToast(
        'success',
        'Persetujuan Berhasil',
        `Pengajuan berhasil disetujui pada tahap ${level}.`
      );
    } catch (e: any) {
      addToast('error', 'Gagal Menyetujui', e.message || 'Terjadi kesalahan sistem.');
    }
  };

  const rejectBooking = (
    bookingId: string,
    catatan: string,
    level: 'KOORDINATOR' | 'KABAG'
  ) => {
    if (!catatan || catatan.trim() === '') {
      addToast('warning', 'Alasan Penolakan Wajib', 'Alasan penolakan wajib diisi untuk menolak pengajuan.');
      return;
    }

    try {
      let targetStatus: BookingStatus;
      if (level === 'KOORDINATOR') {
        targetStatus = 'DITOLAK_KOORDINATOR';
      } else {
        targetStatus = 'DITOLAK_KABAG';
      }

      dataService.updateBookingStatus(bookingId, targetStatus, currentUser, catatan, level);
      addToast('info', 'Pengajuan Ditolak', `Pengajuan telah ditolak pada tahap ${level}.`);
    } catch (e: any) {
      addToast('error', 'Gagal Menolak', e.message || 'Terjadi kesalahan sistem.');
    }
  };

  const cancelBooking = (bookingId: string, alasan: string) => {
    try {
      dataService.cancelBooking(bookingId, currentUser, alasan);
      addToast('info', 'Pengajuan Dibatalkan', 'Pengajuan peminjaman berhasil dibatalkan.');
    } catch (e: any) {
      addToast('error', 'Gagal Membatalkan', e.message);
    }
  };

  const checkInBooking = (bookingId: string) => {
    try {
      dataService.checkInBooking(bookingId, currentUser);
      addToast('success', 'Check-In Berhasil', 'Anda telah berhasil check-in di ruang rapat.');
    } catch (e: any) {
      addToast('error', 'Gagal Check-In', e.message);
    }
  };

  const checkOutBooking = (bookingId: string) => {
    try {
      dataService.checkOutBooking(bookingId, currentUser);
      addToast('success', 'Check-Out Berhasil', 'Status peminjaman ruang rapat kini menjadi Selesai.');
    } catch (e: any) {
      addToast('error', 'Gagal Check-Out', e.message);
    }
  };

  const saveRoom = (room: Room) => {
    try {
      dataService.saveRoom(room, currentUser);
      addToast('success', 'Data Ruangan Disimpan', `Ruang ${room.nama_ruang} berhasil diperbarui.`);
    } catch (e: any) {
      addToast('error', 'Gagal Menyimpan Ruang', e.message);
    }
  };

  const saveUser = (user: User) => {
    try {
      dataService.saveUser(user, currentUser);
      addToast('success', 'Data Pengguna Disimpan', `Pengguna ${user.nama} berhasil diperbarui.`);
    } catch (e: any) {
      addToast('error', 'Gagal Menyimpan Pengguna', e.message);
    }
  };

  const saveUnit = (unit: Unit) => {
    try {
      dataService.saveUnit(unit, currentUser);
      addToast('success', 'Data Unit Disimpan', `Unit ${unit.nama_unit} berhasil diperbarui.`);
    } catch (e: any) {
      addToast('error', 'Gagal Menyimpan Unit', e.message);
    }
  };

  const markNotificationRead = (id: string) => {
    dataService.markNotificationAsRead(id);
  };

  const markAllNotificationsRead = () => {
    if (currentUser) {
      dataService.markAllNotificationsAsRead(currentUser.id);
      addToast('info', 'Notifikasi Dibaca', 'Seluruh notifikasi telah ditandai dibaca.');
    }
  };

  const resetDemoData = async () => {
    await dataService.resetDemoData();
  };

  const unreadNotificationCount = notifications.filter((n) => !n.status_baca).length;

  return (
    <AppContext.Provider
      value={{
        bookings,
        rooms,
        units,
        users,
        notifications,
        auditLogs,
        unreadNotificationCount,

        searchQuery,
        setSearchQuery,

        toasts,
        addToast,
        removeToast,

        createBooking,
        approveBooking,
        rejectBooking,
        cancelBooking,
        checkInBooking,
        checkOutBooking,
        saveRoom,
        saveUser,
        saveUnit,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
