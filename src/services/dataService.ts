import {
  Booking,
  Room,
  Unit,
  User,
  AppNotification,
  AuditLog,
  ApprovalHistory,
  BookingStatus,
} from '../types';
import {
  INITIAL_BOOKINGS,
  INITIAL_ROOMS,
  INITIAL_UNITS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../constants/initialData';
import { DEMO_USERS } from '../constants/roles';
import { db } from '../lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

const STORAGE_KEYS = {
  BOOKINGS: 'bskji_bookings_v5',
  ROOMS: 'bskji_rooms_v5',
  UNITS: 'bskji_units_v5',
  USERS: 'bskji_users_v5',
  NOTIFICATIONS: 'bskji_notifications_v5',
  AUDIT_LOGS: 'bskji_audit_logs_v5',
};

// Generic storage loader with fallback to initial data
function loadFromStorage<T>(key: string, initialData: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Error loading key ${key} from localStorage:`, e);
  }
  return initialData;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving key ${key} to localStorage:`, e);
  }
}

export class DataService {
  private static instance: DataService;

  private bookings: Booking[];
  private rooms: Room[];
  private units: Unit[];
  private users: User[];
  private notifications: AppNotification[];
  private auditLogs: AuditLog[];

  private listeners: (() => void)[] = [];
  private pollTimer: any = null;
  private isFirestoreInitialized = false;

  private constructor() {
    this.bookings = loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
    this.rooms = loadFromStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
    this.units = loadFromStorage(STORAGE_KEYS.UNITS, INITIAL_UNITS);
    this.users = loadFromStorage(STORAGE_KEYS.USERS, DEMO_USERS);
    this.notifications = loadFromStorage(
      STORAGE_KEYS.NOTIFICATIONS,
      INITIAL_NOTIFICATIONS
    );
    this.auditLogs = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);

    // Initial fetch from server API
    this.fetchFromServer();

    // Initialize real-time Firestore listeners
    this.initFirestoreSync();

    // Start background sync polling every 4 seconds as redundant backup
    if (typeof window !== 'undefined') {
      this.pollTimer = setInterval(() => {
        this.fetchFromServer(true);
      }, 4000);
    }
  }

  public static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Set up real-time bidirectional sync with Cloud Firestore
   */
  private initFirestoreSync(): void {
    try {
      // 1. Listen to Bookings
      onSnapshot(
        collection(db, 'bookings'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Booking[] = [];
            snapshot.forEach((d) => list.push(d.data() as Booking));
            this.bookings = list.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
            this.notify();
          } else if (!this.isFirestoreInitialized) {
            this.seedFirestoreInitialData();
          }
        },
        (error) => {
          console.warn('Firestore bookings snapshot error:', error);
        }
      );

      // 2. Listen to Rooms
      onSnapshot(
        collection(db, 'rooms'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Room[] = [];
            snapshot.forEach((d) => list.push(d.data() as Room));
            this.rooms = list;
            saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
            this.notify();
          }
        },
        (error) => {
          console.warn('Firestore rooms snapshot error:', error);
        }
      );

      // 3. Listen to Units
      onSnapshot(
        collection(db, 'units'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: Unit[] = [];
            snapshot.forEach((d) => list.push(d.data() as Unit));
            this.units = list;
            saveToStorage(STORAGE_KEYS.UNITS, this.units);
            this.notify();
          }
        },
        (error) => {
          console.warn('Firestore units snapshot error:', error);
        }
      );

      // 4. Listen to Users
      onSnapshot(
        collection(db, 'users'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: User[] = [];
            snapshot.forEach((d) => list.push(d.data() as User));
            this.users = list;
            saveToStorage(STORAGE_KEYS.USERS, this.users);
            this.notify();
          }
        },
        (error) => {
          console.warn('Firestore users snapshot error:', error);
        }
      );

      // 5. Listen to Notifications
      onSnapshot(
        collection(db, 'notifications'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AppNotification[] = [];
            snapshot.forEach((d) => list.push(d.data() as AppNotification));
            this.notifications = list.sort(
              (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
            this.notify();
          }
        },
        (error) => {
          console.warn('Firestore notifications snapshot error:', error);
        }
      );

      // 6. Listen to Audit Logs
      onSnapshot(
        collection(db, 'auditLogs'),
        (snapshot) => {
          if (!snapshot.empty) {
            const list: AuditLog[] = [];
            snapshot.forEach((d) => list.push(d.data() as AuditLog));
            this.auditLogs = list.sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            );
            saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
            this.notify();
          }
        },
        (error) => {
          console.warn('Firestore auditLogs snapshot error:', error);
        }
      );

      this.isFirestoreInitialized = true;
    } catch (e) {
      console.warn('Could not initialize Firestore listeners:', e);
    }
  }

  /**
   * Seed Firestore collections with initial baseline data if empty
   */
  private async seedFirestoreInitialData(): Promise<void> {
    try {
      const batch = writeBatch(db);

      INITIAL_BOOKINGS.forEach((b) => {
        batch.set(doc(db, 'bookings', b.id), b);
      });
      INITIAL_ROOMS.forEach((r) => {
        batch.set(doc(db, 'rooms', r.id), r);
      });
      INITIAL_UNITS.forEach((u) => {
        batch.set(doc(db, 'units', u.id), u);
      });
      DEMO_USERS.forEach((usr) => {
        batch.set(doc(db, 'users', usr.id), usr);
      });
      INITIAL_NOTIFICATIONS.forEach((n) => {
        batch.set(doc(db, 'notifications', n.id), n);
      });
      INITIAL_AUDIT_LOGS.forEach((a) => {
        batch.set(doc(db, 'auditLogs', a.id), a);
      });

      await batch.commit();
      console.log('Initial data successfully seeded to Firestore.');
    } catch (err) {
      console.warn('Seeding Firestore initial data failed:', err);
    }
  }

  /**
   * Fetch complete data snapshot from server API
   */
  public async fetchFromServer(silent: boolean = false): Promise<void> {
    try {
      const res = await fetch('/api/data');
      if (!res.ok) return;
      const json = await res.json();
      if (json && json.success && json.data) {
        const { bookings, rooms, units, users, notifications, auditLogs } = json.data;

        let hasChanges = false;
        if (JSON.stringify(this.bookings) !== JSON.stringify(bookings)) {
          this.bookings = bookings || [];
          saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
          hasChanges = true;
        }
        if (JSON.stringify(this.rooms) !== JSON.stringify(rooms)) {
          this.rooms = rooms || [];
          saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
          hasChanges = true;
        }
        if (JSON.stringify(this.units) !== JSON.stringify(units)) {
          this.units = units || [];
          saveToStorage(STORAGE_KEYS.UNITS, this.units);
          hasChanges = true;
        }
        if (JSON.stringify(this.users) !== JSON.stringify(users)) {
          this.users = users || [];
          saveToStorage(STORAGE_KEYS.USERS, this.users);
          hasChanges = true;
        }
        if (JSON.stringify(this.notifications) !== JSON.stringify(notifications)) {
          this.notifications = notifications || [];
          saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
          hasChanges = true;
        }
        if (JSON.stringify(this.auditLogs) !== JSON.stringify(auditLogs)) {
          this.auditLogs = auditLogs || [];
          saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
          hasChanges = true;
        }

        if (hasChanges) {
          this.notify();
        }
      }
    } catch (e) {
      if (!silent) {
        console.warn('Could not sync with server API:', e);
      }
    }
  }

  // --- GETTERS ---
  public getBookings(): Booking[] {
    return [...this.bookings];
  }

  public getRooms(): Room[] {
    return [...this.rooms];
  }

  public getUnits(): Unit[] {
    return [...this.units];
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public getNotifications(userId?: string): AppNotification[] {
    if (!userId) return [];
    return this.notifications.filter((n) => n.user_id === userId);
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- BOOKING OPERATIONS ---
  public addBooking(booking: Booking, user: User): void {
    // 1. Update local immediately
    this.bookings = [booking, ...this.bookings];
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    // Submitter notification
    const userNotif: AppNotification = {
      id: `notif_${Date.now()}_${user.id}`,
      user_id: user.id,
      booking_id: booking.id,
      judul: 'Pengajuan Berhasil Dikirim',
      pesan: `Pengajuan peminjaman ${booking.nomor_peminjaman} (${booking.room_nama}) berhasil diajukan dan sedang menunggu verifikasi Koordinator.`,
      status_baca: false,
      created_at: new Date().toISOString(),
    };
    this.addNotification(userNotif);

    // Coordinator notifications
    const koordinators = this.users.filter((u) => u.role_id === 'koordinator');
    koordinators.forEach((k) => {
      this.addNotification({
        id: `notif_${Date.now()}_${k.id}`,
        user_id: k.id,
        booking_id: booking.id,
        judul: 'Pengajuan Baru Menunggu Verifikasi',
        pesan: `${user.nama} mengajukan peminjaman ${booking.room_nama} untuk keperluan ${booking.keperluan} pada tanggal ${booking.tanggal}.`,
        status_baca: false,
        created_at: new Date().toISOString(),
      });
    });

    // Audit log
    const audit: AuditLog = {
      id: `aud_${Date.now()}`,
      user_id: user.id,
      user_nama: user.nama,
      role: user.role_id,
      aktivitas: 'Membuat Pengajuan Peminjaman Ruang',
      booking_id: booking.id,
      nomor_peminjaman: booking.nomor_peminjaman,
      data_lama: '-',
      data_baru: `Status: ${booking.status}, Ruang: ${booking.room_nama}`,
      timestamp: new Date().toISOString(),
      ip_address: '10.14.22.100',
    };
    this.addAuditLog(audit);

    this.notify();

    // 2. Persist to Firestore
    try {
      setDoc(doc(db, 'bookings', booking.id), booking).catch((err) =>
        console.warn('Firestore setDoc booking error:', err)
      );
    } catch (e) {
      console.warn('Firestore sync error:', e);
    }

    // 3. Persist to server API
    fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking, user }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error persisting booking to server:', err));
  }

  public updateBookingStatus(
    bookingId: string,
    newStatus: BookingStatus,
    approver: User,
    catatan: string,
    level: 'KOORDINATOR' | 'KABAG'
  ): void {
    const bookingIndex = this.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) return;

    const oldBooking = this.bookings[bookingIndex];
    const approval: ApprovalHistory = {
      id: `app_${Date.now()}`,
      booking_id: bookingId,
      approver_id: approver.id,
      approver_nama: approver.nama,
      approver_nip: approver.nip,
      approver_jabatan: approver.jabatan,
      level_approval: level,
      status: newStatus.startsWith('DITOLAK') ? 'DITOLAK' : 'DISETUJUI',
      catatan,
      approved_at: new Date().toISOString(),
    };

    const updatedBooking: Booking = {
      ...oldBooking,
      status: newStatus,
      approvals: [...oldBooking.approvals, approval],
      updated_at: new Date().toISOString(),
    };

    this.bookings[bookingIndex] = updatedBooking;
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    // Audit Log
    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: approver.id,
      user_nama: approver.nama,
      role: approver.role_id,
      aktivitas: `Persetujuan Level ${level} -> ${newStatus}`,
      booking_id: bookingId,
      nomor_peminjaman: oldBooking.nomor_peminjaman,
      data_lama: `Status: ${oldBooking.status}`,
      data_baru: `Status: ${newStatus}, Catatan: ${catatan}`,
      timestamp: new Date().toISOString(),
      ip_address: '10.14.22.102',
    });

    // Notification to Peminjam
    const notifTitle =
      newStatus === 'DISETUJUI'
        ? 'Pengajuan Disetujui Akhir'
        : newStatus === 'MENUNGGU_PERSETUJUAN_KABAG'
        ? 'Pengajuan Disetujui Koordinator'
        : 'Pengajuan Peminjaman Ditolak';

    const notifDesc =
      newStatus === 'DISETUJUI'
        ? `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah disetujui akhir oleh Kabag Umum.`
        : newStatus === 'MENUNGGU_PERSETUJUAN_KABAG'
        ? `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah disetujui Koordinator dan diteruskan ke Kabag Umum.`
        : `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah ditolak pada tahap ${level}. Catatan: ${catatan || '-'}`;

    this.addNotification({
      id: `notif_${Date.now()}_${oldBooking.user_id}`,
      user_id: oldBooking.user_id,
      booking_id: bookingId,
      judul: notifTitle,
      pesan: notifDesc,
      status_baca: false,
      created_at: new Date().toISOString(),
    });

    // If approved by Koordinator, notify Kabag
    if (newStatus === 'MENUNGGU_PERSETUJUAN_KABAG') {
      const kabags = this.users.filter((u) => u.role_id === 'kabag_umum');
      kabags.forEach((kb) => {
        this.addNotification({
          id: `notif_${Date.now()}_${kb.id}`,
          user_id: kb.id,
          booking_id: bookingId,
          judul: 'Persetujuan Akhir Kabag Umum',
          pesan: `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) diverifikasi Koordinator & menunggu persetujuan akhir Anda.`,
          status_baca: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    // If decided by Kabag, also notify Koordinator
    if (level === 'KABAG') {
      const koordinators = this.users.filter((u) => u.role_id === 'koordinator');
      koordinators.forEach((k) => {
        this.addNotification({
          id: `notif_${Date.now()}_${k.id}`,
          user_id: k.id,
          booking_id: bookingId,
          judul: `Status Akhir Pengajuan ${oldBooking.nomor_peminjaman}`,
          pesan: `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah ${newStatus === 'DISETUJUI' ? 'disetujui' : 'ditolak'} oleh Kabag Umum.`,
          status_baca: false,
          created_at: new Date().toISOString(),
        });
      });
    }

    this.notify();

    // Firestore update
    try {
      setDoc(doc(db, 'bookings', bookingId), updatedBooking).catch((err) =>
        console.warn('Firestore update booking error:', err)
      );
    } catch (e) {
      console.warn('Firestore update status error:', e);
    }

    // Server API update
    fetch(`/api/bookings/${bookingId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newStatus, approver, catatan, level }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error updating status on server:', err));
  }

  public cancelBooking(bookingId: string, user: User, alasan: string): void {
    const bookingIndex = this.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) return;

    const oldBooking = this.bookings[bookingIndex];
    if (oldBooking.status === 'DISETUJUI') {
      throw new Error('Pengajuan yang telah disetujui akhir tidak dapat dibatalkan secara langsung.');
    }

    const updatedBooking: Booking = {
      ...oldBooking,
      status: 'DIBATALKAN',
      updated_at: new Date().toISOString(),
    };

    this.bookings[bookingIndex] = updatedBooking;
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: user.id,
      user_nama: user.nama,
      role: user.role_id,
      aktivitas: 'Membatalkan Pengajuan Peminjaman',
      booking_id: bookingId,
      nomor_peminjaman: oldBooking.nomor_peminjaman,
      data_lama: `Status: ${oldBooking.status}`,
      data_baru: `Status: DIBATALKAN, Alasan: ${alasan}`,
      timestamp: new Date().toISOString(),
      ip_address: '10.14.22.100',
    });

    const koordinators = this.users.filter((u) => u.role_id === 'koordinator');
    koordinators.forEach((k) => {
      this.addNotification({
        id: `notif_${Date.now()}_${k.id}`,
        user_id: k.id,
        booking_id: bookingId,
        judul: 'Peminjaman Dibatalkan',
        pesan: `${user.nama} membatalkan peminjaman ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}). Alasan: ${alasan}`,
        status_baca: false,
        created_at: new Date().toISOString(),
      });
    });

    this.notify();

    // Firestore update
    try {
      setDoc(doc(db, 'bookings', bookingId), updatedBooking).catch((err) =>
        console.warn('Firestore cancel booking error:', err)
      );
    } catch (e) {
      console.warn('Firestore cancel error:', e);
    }

    fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, alasan }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error cancelling booking on server:', err));
  }

  public checkInBooking(bookingId: string, user: User): void {
    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return;

    this.bookings[idx] = {
      ...this.bookings[idx],
      check_in: {
        ...this.bookings[idx].check_in,
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.nama,
      },
      updated_at: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: user.id,
      user_nama: user.nama,
      role: user.role_id,
      aktivitas: 'Check-In Penggunaan Ruang Rapat',
      booking_id: bookingId,
      nomor_peminjaman: this.bookings[idx].nomor_peminjaman,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'bookings', bookingId), this.bookings[idx]).catch((err) =>
        console.warn('Firestore checkIn error:', err)
      );
    } catch (e) {
      console.warn('Firestore checkIn error:', e);
    }

    fetch(`/api/bookings/${bookingId}/check-in`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error check-in on server:', err));
  }

  public checkOutBooking(bookingId: string, user: User): void {
    const idx = this.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) return;

    this.bookings[idx] = {
      ...this.bookings[idx],
      status: 'SELESAI',
      check_in: {
        ...this.bookings[idx].check_in,
        checked_out_at: new Date().toISOString(),
        checked_out_by: user.nama,
      },
      updated_at: new Date().toISOString(),
    };

    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: user.id,
      user_nama: user.nama,
      role: user.role_id,
      aktivitas: 'Check-Out dan Menyelesaikan Peminjaman',
      booking_id: bookingId,
      nomor_peminjaman: this.bookings[idx].nomor_peminjaman,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'bookings', bookingId), this.bookings[idx]).catch((err) =>
        console.warn('Firestore checkOut error:', err)
      );
    } catch (e) {
      console.warn('Firestore checkOut error:', e);
    }

    fetch(`/api/bookings/${bookingId}/check-out`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error check-out on server:', err));
  }

  // --- ROOM OPERATIONS ---
  public saveRoom(room: Room, user: User): void {
    const idx = this.rooms.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      this.rooms[idx] = room;
    } else {
      this.rooms.push(room);
    }
    saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: user.id,
      user_nama: user.nama,
      role: user.role_id,
      aktivitas: idx >= 0 ? 'Mengubah Master Data Ruangan' : 'Menambah Master Data Ruangan Baru',
      data_baru: `Ruang: ${room.nama_ruang}, Status: ${room.status}`,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'rooms', room.id), room).catch((err) =>
        console.warn('Firestore saveRoom error:', err)
      );
    } catch (e) {
      console.warn('Firestore saveRoom error:', e);
    }

    fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ room, user }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error saving room on server:', err));
  }

  // --- USER OPERATIONS ---
  public registerUser(
    newUser: Omit<User, 'id' | 'status' | 'created_at' | 'updated_at'> & { id?: string }
  ): { success: boolean; message?: string; user?: User } {
    const cleanNip = newUser.nip.trim();
    const cleanEmail = newUser.email.trim().toLowerCase();

    // Check local
    const existing = this.users.find(
      (u) => u.nip === cleanNip || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.nip === cleanNip) {
        return { success: false, message: 'NIP sudah terdaftar dalam sistem.' };
      }
      return { success: false, message: 'Email sudah terdaftar dalam sistem.' };
    }

    const createdUser: User = {
      ...newUser,
      id: newUser.id || `usr_${Date.now()}`,
      nip: cleanNip,
      email: cleanEmail,
      status: 'Aktif',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.push(createdUser);
    saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: createdUser.id,
      user_nama: createdUser.nama,
      role: createdUser.role_id,
      aktivitas: 'Pendaftaran Akun Mandiri Pegawai',
      data_baru: `Nama: ${createdUser.nama}, NIP: ${createdUser.nip}, Role: ${createdUser.role_id}`,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'users', createdUser.id), createdUser).catch((err) =>
        console.warn('Firestore registerUser error:', err)
      );
    } catch (e) {
      console.warn('Firestore registerUser error:', e);
    }

    // Persist to server
    fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: createdUser }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error registering user on server:', err));

    return { success: true, user: createdUser };
  }

  public saveUser(userObj: User, adminUser: User): void {
    const idx = this.users.findIndex((u) => u.id === userObj.id);
    if (idx >= 0) {
      this.users[idx] = userObj;
    } else {
      this.users.push(userObj);
    }
    saveToStorage(STORAGE_KEYS.USERS, this.users);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: adminUser.id,
      user_nama: adminUser.nama,
      role: adminUser.role_id,
      aktivitas: idx >= 0 ? 'Mengubah Data Pengguna' : 'Menambah Pengguna Baru',
      data_baru: `Nama: ${userObj.nama}, Role: ${userObj.role_id}`,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'users', userObj.id), userObj).catch((err) =>
        console.warn('Firestore saveUser error:', err)
      );
    } catch (e) {
      console.warn('Firestore saveUser error:', e);
    }

    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: userObj, adminUser }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error saving user on server:', err));
  }

  // --- UNIT OPERATIONS ---
  public saveUnit(unitObj: Unit, adminUser: User): void {
    const idx = this.units.findIndex((u) => u.id === unitObj.id);
    if (idx >= 0) {
      this.units[idx] = unitObj;
    } else {
      this.units.push(unitObj);
    }
    saveToStorage(STORAGE_KEYS.UNITS, this.units);

    this.addAuditLog({
      id: `aud_${Date.now()}`,
      user_id: adminUser.id,
      user_nama: adminUser.nama,
      role: adminUser.role_id,
      aktivitas: idx >= 0 ? 'Mengubah Data Unit Kerja' : 'Menambah Unit Kerja Baru',
      data_baru: `Unit: ${unitObj.nama_unit}`,
      timestamp: new Date().toISOString(),
    });

    this.notify();

    try {
      setDoc(doc(db, 'units', unitObj.id), unitObj).catch((err) =>
        console.warn('Firestore saveUnit error:', err)
      );
    } catch (e) {
      console.warn('Firestore saveUnit error:', e);
    }

    fetch('/api/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unit: unitObj, user: adminUser }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.data) {
          this.syncFromPayload(json.data);
        }
      })
      .catch((err) => console.error('Error saving unit on server:', err));
  }

  // --- NOTIFICATIONS & AUDIT ---
  public markNotificationAsRead(notifId: string): void {
    const idx = this.notifications.findIndex((n) => n.id === notifId);
    if (idx >= 0) {
      this.notifications[idx].status_baca = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      this.notify();

      try {
        setDoc(doc(db, 'notifications', notifId), this.notifications[idx]).catch((err) =>
          console.warn('Firestore markNotificationAsRead error:', err)
        );
      } catch (e) {
        console.warn('Firestore markNotificationAsRead error:', e);
      }

      fetch(`/api/notifications/${notifId}/read`, { method: 'PUT' }).catch(() => {});
    }
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.notifications = this.notifications.map((n) =>
      n.user_id === userId ? { ...n, status_baca: true } : n
    );
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();

    try {
      this.notifications
        .filter((n) => n.user_id === userId)
        .forEach((n) => {
          setDoc(doc(db, 'notifications', n.id), n).catch(() => {});
        });
    } catch (e) {
      console.warn('Firestore markAllNotificationsAsRead error:', e);
    }

    fetch('/api/notifications/read-all', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    }).catch(() => {});
  }

  private addNotification(notif: AppNotification): void {
    this.notifications = [notif, ...this.notifications];
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    try {
      setDoc(doc(db, 'notifications', notif.id), notif).catch((err) =>
        console.warn('Firestore addNotification error:', err)
      );
    } catch (e) {
      console.warn('Firestore addNotification error:', e);
    }
  }

  private addAuditLog(log: AuditLog): void {
    this.auditLogs = [log, ...this.auditLogs];
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    try {
      setDoc(doc(db, 'auditLogs', log.id), log).catch((err) =>
        console.warn('Firestore addAuditLog error:', err)
      );
    } catch (e) {
      console.warn('Firestore addAuditLog error:', e);
    }
  }

  public async resetDemoData(): Promise<void> {
    this.bookings = INITIAL_BOOKINGS;
    this.rooms = INITIAL_ROOMS;
    this.units = INITIAL_UNITS;
    this.users = DEMO_USERS;
    this.notifications = INITIAL_NOTIFICATIONS;
    this.auditLogs = INITIAL_AUDIT_LOGS;

    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
    saveToStorage(STORAGE_KEYS.UNITS, this.units);
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);

    this.notify();

    // Reset Firestore collections with fresh baseline
    try {
      await this.seedFirestoreInitialData();
    } catch (err) {
      console.warn('Firestore reset seeding error:', err);
    }

    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          this.syncFromPayload(json.data);
        }
      }
    } catch (e) {
      console.warn('Reset server request failed:', e);
    }
  }

  private syncFromPayload(data: any): void {
    if (!data) return;
    let changed = false;
    if (data.bookings) {
      this.bookings = data.bookings;
      saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
      changed = true;
    }
    if (data.rooms) {
      this.rooms = data.rooms;
      saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
      changed = true;
    }
    if (data.units) {
      this.units = data.units;
      saveToStorage(STORAGE_KEYS.UNITS, this.units);
      changed = true;
    }
    if (data.users) {
      this.users = data.users;
      saveToStorage(STORAGE_KEYS.USERS, this.users);
      changed = true;
    }
    if (data.notifications) {
      this.notifications = data.notifications;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
      changed = true;
    }
    if (data.auditLogs) {
      this.auditLogs = data.auditLogs;
      saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
      changed = true;
    }
    if (changed) {
      this.notify();
    }
  }
}
