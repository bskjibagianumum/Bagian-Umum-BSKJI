import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import {
  INITIAL_BOOKINGS,
  INITIAL_ROOMS,
  INITIAL_UNITS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from "./src/constants/initialData";
import { DEMO_USERS } from "./src/constants/roles";
import {
  Booking,
  Room,
  Unit,
  User,
  AppNotification,
  AuditLog,
  ApprovalHistory,
  BookingStatus,
} from "./src/types";

interface ServerDatabase {
  bookings: Booking[];
  rooms: Room[];
  units: Unit[];
  users: User[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "bskji_db.json");

function getDefaultData(): ServerDatabase {
  return {
    bookings: INITIAL_BOOKINGS,
    rooms: INITIAL_ROOMS,
    units: INITIAL_UNITS,
    users: DEMO_USERS,
    notifications: INITIAL_NOTIFICATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
  };
}

function loadDatabase(): ServerDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : INITIAL_BOOKINGS,
        rooms: Array.isArray(parsed.rooms) ? parsed.rooms : INITIAL_ROOMS,
        units: Array.isArray(parsed.units) ? parsed.units : INITIAL_UNITS,
        users: Array.isArray(parsed.users) ? parsed.users : DEMO_USERS,
        notifications: Array.isArray(parsed.notifications) ? parsed.notifications : INITIAL_NOTIFICATIONS,
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : INITIAL_AUDIT_LOGS,
      };
    }
  } catch (err) {
    console.error("Error reading database file, initializing defaults:", err);
  }

  const initial = getDefaultData();
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: ServerDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing to database file:", err);
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory cache backed by persistent file
  let db: ServerDatabase = loadDatabase();

  // API Health Check
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      system: "Sistem Informasi Peminjaman Ruang Rapat - Sekretariat BSKJI",
      timestamp: new Date().toISOString(),
      counts: {
        bookings: db.bookings.length,
        users: db.users.length,
        rooms: db.rooms.length,
      },
    });
  });

  // GET FULL DATA SNAPSHOT
  app.get("/api/data", (req, res) => {
    res.json({
      success: true,
      data: db,
    });
  });

  // BOOKINGS: CREATE
  app.post("/api/bookings", (req, res) => {
    const { booking, user } = req.body as { booking: Booking; user: User };
    if (!booking || !user) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    db.bookings = [booking, ...db.bookings];

    // Submitter notification
    const userNotif: AppNotification = {
      id: `notif_${Date.now()}_${user.id}`,
      user_id: user.id,
      booking_id: booking.id,
      judul: "Pengajuan Berhasil Dikirim",
      pesan: `Pengajuan peminjaman ${booking.nomor_peminjaman} (${booking.room_nama}) berhasil diajukan dan sedang menunggu verifikasi Koordinator.`,
      status_baca: false,
      created_at: new Date().toISOString(),
    };
    db.notifications = [userNotif, ...db.notifications];

    // Coordinator notifications
    const koordinators = db.users.filter((u) => u.role_id === "koordinator");
    koordinators.forEach((k) => {
      db.notifications = [
        {
          id: `notif_${Date.now()}_${k.id}`,
          user_id: k.id,
          booking_id: booking.id,
          judul: "Pengajuan Baru Menunggu Verifikasi",
          pesan: `${user.nama} mengajukan peminjaman ${booking.room_nama} untuk keperluan ${booking.keperluan} pada tanggal ${booking.tanggal}.`,
          status_baca: false,
          created_at: new Date().toISOString(),
        },
        ...db.notifications,
      ];
    });

    // Audit log
    db.auditLogs = [
      {
        id: `aud_${Date.now()}`,
        user_id: user.id,
        user_nama: user.nama,
        role: user.role_id,
        aktivitas: "Membuat Pengajuan Peminjaman Ruang",
        booking_id: booking.id,
        nomor_peminjaman: booking.nomor_peminjaman,
        data_lama: "-",
        data_baru: `Status: ${booking.status}, Ruang: ${booking.room_nama}`,
        timestamp: new Date().toISOString(),
        ip_address: req.ip || "10.14.22.100",
      },
      ...db.auditLogs,
    ];

    saveDatabase(db);
    res.json({ success: true, booking, data: db });
  });

  // BOOKINGS: UPDATE GENERAL DETAILS
  app.put("/api/bookings/:id", (req, res) => {
    const bookingId = req.params.id;
    const { updatedBooking, user } = req.body as { updatedBooking: Booking; user: User };

    if (!updatedBooking) {
      return res.status(400).json({ success: false, message: "Missing updated booking payload" });
    }

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    const finalBooking = { ...updatedBooking, updated_at: new Date().toISOString() };
    if (idx === -1) {
      db.bookings = [finalBooking, ...db.bookings];
    } else {
      db.bookings[idx] = finalBooking;
    }

    if (user) {
      db.auditLogs = [
        {
          id: `aud_${Date.now()}`,
          user_id: user.id,
          user_nama: user.nama,
          role: user.role_id,
          aktivitas: "Memperbarui Data Peminjaman Ruang",
          booking_id: bookingId,
          nomor_peminjaman: finalBooking.nomor_peminjaman,
          data_lama: "-",
          data_baru: `Ruang: ${finalBooking.room_nama}, Tanggal: ${finalBooking.tanggal}, Jam: ${finalBooking.jam_mulai}-${finalBooking.jam_selesai}`,
          timestamp: new Date().toISOString(),
          ip_address: req.ip || "10.14.22.100",
        },
        ...db.auditLogs,
      ];
    }

    saveDatabase(db);
    res.json({ success: true, booking: finalBooking, data: db });
  });

  // BOOKINGS: UPDATE STATUS (APPROVAL / REJECTION)
  app.put("/api/bookings/:id/status", (req, res) => {
    const bookingId = req.params.id;
    const { newStatus, approver, catatan, level } = req.body as {
      newStatus: BookingStatus;
      approver: User;
      catatan: string;
      level: "KOORDINATOR" | "KABAG";
    };

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const oldBooking = db.bookings[idx];
    const approval: ApprovalHistory = {
      id: `app_${Date.now()}`,
      booking_id: bookingId,
      approver_id: approver.id,
      approver_nama: approver.nama,
      approver_nip: approver.nip,
      approver_jabatan: approver.jabatan,
      level_approval: level,
      status: newStatus.startsWith("DITOLAK") ? "DITOLAK" : "DISETUJUI",
      catatan,
      approved_at: new Date().toISOString(),
    };

    const updatedBooking: Booking = {
      ...oldBooking,
      status: newStatus,
      approvals: [...oldBooking.approvals, approval],
      updated_at: new Date().toISOString(),
    };
    db.bookings[idx] = updatedBooking;

    // Audit log
    db.auditLogs = [
      {
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
        ip_address: req.ip || "10.14.22.102",
      },
      ...db.auditLogs,
    ];

    // Notification to peminjam
    const notifTitle =
      newStatus === "DISETUJUI"
        ? "Pengajuan Disetujui Akhir"
        : newStatus === "MENUNGGU_PERSETUJUAN_KABAG"
        ? "Pengajuan Disetujui Koordinator"
        : "Pengajuan Peminjaman Ditolak";

    const notifDesc =
      newStatus === "DISETUJUI"
        ? `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah disetujui akhir oleh Kabag Umum.`
        : newStatus === "MENUNGGU_PERSETUJUAN_KABAG"
        ? `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah disetujui Koordinator dan diteruskan ke Kabag Umum.`
        : `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah ditolak pada tahap ${level}. Catatan: ${catatan || "-"}`;

    db.notifications = [
      {
        id: `notif_${Date.now()}_${oldBooking.user_id}`,
        user_id: oldBooking.user_id,
        booking_id: bookingId,
        judul: notifTitle,
        pesan: notifDesc,
        status_baca: false,
        created_at: new Date().toISOString(),
      },
      ...db.notifications,
    ];

    // If forwarded to Kabag Umum
    if (newStatus === "MENUNGGU_PERSETUJUAN_KABAG") {
      const kabags = db.users.filter((u) => u.role_id === "kabag_umum");
      kabags.forEach((kb) => {
        db.notifications = [
          {
            id: `notif_${Date.now()}_${kb.id}`,
            user_id: kb.id,
            booking_id: bookingId,
            judul: "Persetujuan Akhir Kabag Umum",
            pesan: `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) diverifikasi Koordinator & menunggu persetujuan akhir Anda.`,
            status_baca: false,
            created_at: new Date().toISOString(),
          },
          ...db.notifications,
        ];
      });
    }

    // If decided by Kabag, notify Koordinator
    if (level === "KABAG") {
      const koordinators = db.users.filter((u) => u.role_id === "koordinator");
      koordinators.forEach((k) => {
        db.notifications = [
          {
            id: `notif_${Date.now()}_${k.id}`,
            user_id: k.id,
            booking_id: bookingId,
            judul: `Status Akhir Pengajuan ${oldBooking.nomor_peminjaman}`,
            pesan: `Pengajuan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah ${newStatus === "DISETUJUI" ? "disetujui" : "ditolak"} oleh Kabag Umum.`,
            status_baca: false,
            created_at: new Date().toISOString(),
          },
          ...db.notifications,
        ];
      });
    }

    saveDatabase(db);
    res.json({ success: true, booking: updatedBooking, data: db });
  });

  // BOOKINGS: CANCEL
  app.put("/api/bookings/:id/cancel", (req, res) => {
    const bookingId = req.params.id;
    const { user, alasan } = req.body as { user: User; user_nama?: string; alasan: string };

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    const oldBooking = db.bookings[idx];
    if (oldBooking.status === "DISETUJUI") {
      if (user.role_id !== "kabag_umum" && user.role_id !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Pengajuan yang telah disetujui akhir hanya dapat dibatalkan oleh Kepala Bagian Umum atau Administrator.",
        });
      }
    }

    const isKabagCancellingApproved = oldBooking.status === "DISETUJUI";

    const updatedBooking: Booking = {
      ...oldBooking,
      status: "DIBATALKAN",
      updated_at: new Date().toISOString(),
    };
    db.bookings[idx] = updatedBooking;

    db.auditLogs = [
      {
        id: `aud_${Date.now()}`,
        user_id: user.id,
        user_nama: user.nama,
        role: user.role_id,
        aktivitas: isKabagCancellingApproved
          ? "Membatalkan Pengajuan Disetujui (Diskresi Kabag Umum)"
          : "Membatalkan Pengajuan Peminjaman",
        booking_id: bookingId,
        nomor_peminjaman: oldBooking.nomor_peminjaman,
        data_lama: `Status: ${oldBooking.status}`,
        data_baru: `Status: DIBATALKAN, Alasan: ${alasan}`,
        timestamp: new Date().toISOString(),
        ip_address: req.ip || "10.14.22.100",
      },
      ...db.auditLogs,
    ];

    // Notify requester if cancelled by someone else (e.g. Kabag Umum)
    if (oldBooking.user_id !== user.id) {
      db.notifications = [
        {
          id: `notif_${Date.now()}_req`,
          user_id: oldBooking.user_id,
          booking_id: bookingId,
          judul: "Peminjaman Ruang Dibatalkan oleh Kabag Umum",
          pesan: `Pengajuan peminjaman ruangan ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) pada tanggal ${oldBooking.tanggal} telah dibatalkan oleh ${user.nama} (${user.jabatan}). Alasan: ${alasan}`,
          status_baca: false,
          created_at: new Date().toISOString(),
        },
        ...db.notifications,
      ];
    }

    const koordinators = db.users.filter((u) => u.role_id === "koordinator");
    koordinators.forEach((k) => {
      if (k.id !== user.id) {
        db.notifications = [
          {
            id: `notif_${Date.now()}_${k.id}`,
            user_id: k.id,
            booking_id: bookingId,
            judul: isKabagCancellingApproved
              ? "Pembatalan Pengajuan Disetujui oleh Kabag Umum"
              : "Peminjaman Dibatalkan",
            pesan: `${user.nama} membatalkan peminjaman ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}). Alasan: ${alasan}`,
            status_baca: false,
            created_at: new Date().toISOString(),
          },
          ...db.notifications,
        ];
      }
    });

    saveDatabase(db);
    res.json({ success: true, booking: updatedBooking, data: db });
  });

  // BOOKINGS: DELETE
  app.delete("/api/bookings/:id", (req, res) => {
    const bookingId = req.params.id;
    const { user, alasan } = req.body as { user: User; alasan?: string };

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (user && user.role_id !== "kabag_umum" && user.role_id !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Penghapusan pengajuan hanya dapat dilakukan oleh Kepala Bagian Umum atau Administrator.",
      });
    }

    const oldBooking = db.bookings[idx];
    db.bookings.splice(idx, 1);

    if (user) {
      db.auditLogs = [
        {
          id: `aud_${Date.now()}`,
          user_id: user.id,
          user_nama: user.nama,
          role: user.role_id,
          aktivitas: "Menghapus Pengajuan Peminjaman",
          booking_id: bookingId,
          nomor_peminjaman: oldBooking.nomor_peminjaman,
          data_lama: `Nomor: ${oldBooking.nomor_peminjaman}, Status: ${oldBooking.status}, Ruang: ${oldBooking.room_nama}, Tanggal: ${oldBooking.tanggal}`,
          data_baru: `DIHAPUS PERMANEN, Alasan: ${alasan || "Dihapus oleh Kepala Bagian Umum"}`,
          timestamp: new Date().toISOString(),
          ip_address: req.ip || "10.14.22.100",
        },
        ...db.auditLogs,
      ];

      if (oldBooking.user_id !== user.id) {
        db.notifications = [
          {
            id: `notif_${Date.now()}_req_del`,
            user_id: oldBooking.user_id,
            booking_id: "",
            judul: "Data Pengajuan Peminjaman Dihapus",
            pesan: `Pengajuan peminjaman nomor ${oldBooking.nomor_peminjaman} (${oldBooking.room_nama}) telah dihapus dari sistem oleh ${user.nama} (${user.jabatan}). Alasan: ${alasan || "Penghapusan data peminjaman oleh pimpinan."}`,
            status_baca: false,
            created_at: new Date().toISOString(),
          },
          ...db.notifications,
        ];
      }
    }

    saveDatabase(db);
    res.json({ success: true, message: "Booking deleted successfully", data: db });
  });

  // BOOKINGS: CHECK-IN
  app.put("/api/bookings/:id/check-in", (req, res) => {
    const bookingId = req.params.id;
    const { user } = req.body as { user: User };

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    db.bookings[idx] = {
      ...db.bookings[idx],
      check_in: {
        ...db.bookings[idx].check_in,
        checked_in_at: new Date().toISOString(),
        checked_in_by: user.nama,
      },
      updated_at: new Date().toISOString(),
    };

    db.auditLogs = [
      {
        id: `aud_${Date.now()}`,
        user_id: user.id,
        user_nama: user.nama,
        role: user.role_id,
        aktivitas: "Check-In Penggunaan Ruang Rapat",
        booking_id: bookingId,
        nomor_peminjaman: db.bookings[idx].nomor_peminjaman,
        timestamp: new Date().toISOString(),
      },
      ...db.auditLogs,
    ];

    saveDatabase(db);
    res.json({ success: true, booking: db.bookings[idx], data: db });
  });

  // BOOKINGS: CHECK-OUT
  app.put("/api/bookings/:id/check-out", (req, res) => {
    const bookingId = req.params.id;
    const { user } = req.body as { user: User };

    const idx = db.bookings.findIndex((b) => b.id === bookingId);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    db.bookings[idx] = {
      ...db.bookings[idx],
      status: "SELESAI",
      check_in: {
        ...db.bookings[idx].check_in,
        checked_out_at: new Date().toISOString(),
        checked_out_by: user.nama,
      },
      updated_at: new Date().toISOString(),
    };

    db.auditLogs = [
      {
        id: `aud_${Date.now()}`,
        user_id: user.id,
        user_nama: user.nama,
        role: user.role_id,
        aktivitas: "Check-Out dan Menyelesaikan Peminjaman",
        booking_id: bookingId,
        nomor_peminjaman: db.bookings[idx].nomor_peminjaman,
        timestamp: new Date().toISOString(),
      },
      ...db.auditLogs,
    ];

    saveDatabase(db);
    res.json({ success: true, booking: db.bookings[idx], data: db });
  });

  // ROOMS: SAVE / UPDATE
  app.post("/api/rooms", (req, res) => {
    const { room, user } = req.body as { room: Room; user: User };
    if (!room) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const idx = db.rooms.findIndex((r) => r.id === room.id);
    if (idx >= 0) {
      db.rooms[idx] = room;
    } else {
      db.rooms.push(room);
    }

    if (user) {
      db.auditLogs = [
        {
          id: `aud_${Date.now()}`,
          user_id: user.id,
          user_nama: user.nama,
          role: user.role_id,
          aktivitas: idx >= 0 ? "Mengubah Master Data Ruangan" : "Menambah Master Data Ruangan Baru",
          data_baru: `Ruang: ${room.nama_ruang}, Status: ${room.status}`,
          timestamp: new Date().toISOString(),
        },
        ...db.auditLogs,
      ];
    }

    saveDatabase(db);
    res.json({ success: true, room, data: db });
  });

  // UNITS: SAVE / UPDATE
  app.post("/api/units", (req, res) => {
    const { unit, user } = req.body as { unit: Unit; user: User };
    if (!unit) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const idx = db.units.findIndex((u) => u.id === unit.id);
    if (idx >= 0) {
      db.units[idx] = unit;
    } else {
      db.units.push(unit);
    }

    if (user) {
      db.auditLogs = [
        {
          id: `aud_${Date.now()}`,
          user_id: user.id,
          user_nama: user.nama,
          role: user.role_id,
          aktivitas: idx >= 0 ? "Mengubah Data Unit Kerja" : "Menambah Unit Kerja Baru",
          data_baru: `Unit: ${unit.nama_unit}`,
          timestamp: new Date().toISOString(),
        },
        ...db.auditLogs,
      ];
    }

    saveDatabase(db);
    res.json({ success: true, unit, data: db });
  });

  // USERS: REGISTER
  app.post("/api/users/register", (req, res) => {
    const newUser = req.body.user as Omit<User, "id" | "status" | "created_at" | "updated_at"> & { id?: string };
    if (!newUser || !newUser.nip || !newUser.email) {
      return res.status(400).json({ success: false, message: "Data pendaftaran tidak lengkap." });
    }

    const cleanNip = newUser.nip.trim();
    const cleanEmail = newUser.email.trim().toLowerCase();

    const existing = db.users.find(
      (u) => u.nip === cleanNip || u.email.toLowerCase() === cleanEmail
    );

    if (existing) {
      if (existing.nip === cleanNip) {
        return res.status(400).json({ success: false, message: "NIP sudah terdaftar dalam sistem." });
      }
      return res.status(400).json({ success: false, message: "Email sudah terdaftar dalam sistem." });
    }

    const createdUser: User = {
      ...newUser,
      id: newUser.id || `usr_${Date.now()}`,
      nip: cleanNip,
      email: cleanEmail,
      status: "Aktif",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.users.push(createdUser);

    db.auditLogs = [
      {
        id: `aud_${Date.now()}`,
        user_id: createdUser.id,
        user_nama: createdUser.nama,
        role: createdUser.role_id,
        aktivitas: "Pendaftaran Akun Mandiri Pegawai",
        data_baru: `Nama: ${createdUser.nama}, NIP: ${createdUser.nip}, Role: ${createdUser.role_id}`,
        timestamp: new Date().toISOString(),
      },
      ...db.auditLogs,
    ];

    saveDatabase(db);
    res.json({ success: true, user: createdUser, data: db });
  });

  // USERS: SAVE / UPDATE
  app.post("/api/users", (req, res) => {
    const { user, adminUser } = req.body as { user: User; adminUser: User };
    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid payload" });
    }

    const idx = db.users.findIndex((u) => u.id === user.id);
    if (idx >= 0) {
      db.users[idx] = user;
    } else {
      db.users.push(user);
    }

    if (adminUser) {
      db.auditLogs = [
        {
          id: `aud_${Date.now()}`,
          user_id: adminUser.id,
          user_nama: adminUser.nama,
          role: adminUser.role_id,
          aktivitas: idx >= 0 ? "Mengubah Data Pengguna" : "Menambah Pengguna Baru",
          data_baru: `Nama: ${user.nama}, Role: ${user.role_id}`,
          timestamp: new Date().toISOString(),
        },
        ...db.auditLogs,
      ];
    }

    saveDatabase(db);
    res.json({ success: true, user, data: db });
  });

  // NOTIFICATIONS: MARK READ
  app.put("/api/notifications/:id/read", (req, res) => {
    const notifId = req.params.id;
    const idx = db.notifications.findIndex((n) => n.id === notifId);
    if (idx >= 0) {
      db.notifications[idx].status_baca = true;
      saveDatabase(db);
    }
    res.json({ success: true });
  });

  // NOTIFICATIONS: MARK ALL READ
  app.put("/api/notifications/read-all", (req, res) => {
    const { userId } = req.body;
    db.notifications = db.notifications.map((n) =>
      !userId || n.user_id === userId ? { ...n, status_baca: true } : n
    );
    saveDatabase(db);
    res.json({ success: true });
  });

  // RESET TO DEFAULT
  app.post("/api/reset", (req, res) => {
    db = getDefaultData();
    saveDatabase(db);
    res.json({ success: true, data: db });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
