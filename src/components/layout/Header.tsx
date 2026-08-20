import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { ROLE_META } from '../../constants/roles';
import { StatusBadge } from '../common/Badge';
import { KemenperinLogo } from '../common/KemenperinLogo';
import {
  Search,
  Bell,
  Building2,
  Menu,
  X,
  ChevronRight,
  CheckCheck,
  Calendar,
  Clock,
  User as UserIcon,
  LogOut,
  Shield,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileSidebar }) => {
  const { currentUser, logout } = useAuth();
  const {
    bookings,
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useApp();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  if (!currentUser) return null;

  const roleMeta = ROLE_META[currentUser.role_id];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search filtering
  const filteredBookings = searchQuery.trim()
    ? bookings.filter((b) => {
        if (currentUser?.role_id === 'peminjam' && b.user_id !== currentUser.id) {
          return false;
        }
        return (
          b.nomor_peminjaman.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.peminjam_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.room_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.keperluan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          b.unit_nama.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    : [];

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
        {/* Left section: Hamburger + Logo + Titles */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <KemenperinLogo size="sm" />

          <div className="flex flex-col min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate">
              Sistem Informasi Peminjaman Ruang Rapat
            </h1>
            <p className="text-[11px] text-slate-500 font-normal leading-tight truncate">
              BSKJI – Kementerian Perindustrian
            </p>
          </div>
        </div>

        {/* Center section: Global Search with Sleek Pill Styling */}
        <div className="hidden md:block relative max-w-sm w-full" ref={searchRef}>
          <div className="relative h-9 bg-gray-100 rounded-full flex items-center border border-gray-200 px-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <input
              type="text"
              placeholder="Cari No. Peminjaman, Ruang, Peminjam..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder:text-gray-400 font-normal"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 hover:text-gray-600 p-0.5 ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Search className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            )}
          </div>

            {/* Search Dropdown Results */}
            {isSearchOpen && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto animate-in fade-in-50 duration-150">
                <div className="p-3 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Hasil Pencarian ({filteredBookings.length})
                </div>
                {filteredBookings.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    Tidak ada peminjaman yang cocok dengan pencarian.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredBookings.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/bookings/${item.id}`);
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-blue-700">
                              {item.nomor_peminjaman}
                            </span>
                            <StatusBadge status={item.status} size="sm" />
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-1 truncate">
                            {item.keperluan}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" /> {item.room_nama}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" /> {item.peminjam_nama}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right section: Role Badge + Notifications + Profile */}
          <div className="flex items-center gap-2.5">
            {/* Static Role Badge */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50/80 border border-blue-200/80 rounded-xl"
              title={`Peran: ${roleMeta.nama}`}
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline text-slate-500 font-medium text-[11px]">Peran:</span>
              <span className="font-bold text-blue-700">
                {roleMeta.nama}
              </span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative w-9 h-9 flex items-center justify-center text-slate-600 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>

              {isNotifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in-50 duration-150">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Notifikasi System</h4>
                      <p className="text-[11px] text-slate-500">
                        {unreadNotificationCount} belum dibaca
                      </p>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <CheckCheck className="w-3.5 h-3.5" /> Tandai Semua Dibaca
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        Belum ada notifikasi baru.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.booking_id) {
                              navigate(`/bookings/${notif.booking_id}`);
                              setIsNotifOpen(false);
                            }
                          }}
                          className={`p-3.5 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                            !notif.status_baca ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-bold text-slate-900 leading-tight">
                              {notif.judul}
                            </h5>
                            {!notif.status_baca && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                            {notif.pesan}
                          </p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                    <button
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotifOpen(false);
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                    >
                      Lihat Semua Notifikasi →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Current User Avatar & Logout */}
            <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {currentUser.nama
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.nama}
                </p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight">
                  {currentUser.unit_nama}
                </p>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ml-1"
                title="Keluar dari Sistem"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

        </header>
    </>
  );
};
