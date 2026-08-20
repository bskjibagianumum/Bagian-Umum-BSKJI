import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { ROLE_META } from '../../constants/roles';
import { KemenperinLogo } from '../common/KemenperinLogo';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarDays,
  FileText,
  CheckSquare,
  DoorOpen,
  FileBarChart,
  Bell,
  History,
  Settings,
  Users,
  Building,
  CheckCircle2,
  X,
  ShieldCheck,
  ChevronRight,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCheckInModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen,
  onCloseMobile,
  onOpenCheckInModal,
}) => {
  const { currentUser, logout } = useAuth();
  const { bookings, unreadNotificationCount } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Calculate pending approvals count for current user role
  const pendingApprovalsCount = bookings.filter((b) => {
    if (currentUser.role_id === 'koordinator') {
      return b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR';
    }
    if (currentUser.role_id === 'kabag_umum') {
      return b.status === 'MENUNGGU_PERSETUJUAN_KABAG';
    }
    if (currentUser.role_id === 'admin') {
      return (
        b.status === 'MENUNGGU_PERSETUJUAN_KOORDINATOR' ||
        b.status === 'MENUNGGU_PERSETUJUAN_KABAG'
      );
    }
    return false;
  }).length;

  // Define sidebar navigation items
  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Ajukan Peminjaman',
      path: '/bookings/new',
      icon: CalendarPlus,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Jadwal Ruang',
      path: '/calendar',
      icon: CalendarDays,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Pengajuan Saya',
      path: '/bookings',
      icon: FileText,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Persetujuan',
      path: '/approvals',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      roles: ['koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Data Ruang',
      path: '/rooms',
      icon: DoorOpen,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Laporan',
      path: '/reports',
      icon: FileBarChart,
      roles: ['koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Notifikasi',
      path: '/notifications',
      icon: Bell,
      badge: unreadNotificationCount > 0 ? unreadNotificationCount : undefined,
      roles: ['peminjam', 'koordinator', 'kabag_umum', 'admin'],
    },
    {
      label: 'Pengguna',
      path: '/users',
      icon: Users,
      roles: ['admin'],
    },
    {
      label: 'Unit Kerja',
      path: '/units',
      icon: Building,
      roles: ['admin'],
    },
    {
      label: 'Audit Trail',
      path: '/audit-trail',
      icon: History,
      roles: ['admin'],
    },
    {
      label: 'Pengaturan',
      path: '/settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  // Filter items based on active role
  const visibleNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role_id)
  );

  const roleMeta = ROLE_META[currentUser.role_id];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <KemenperinLogo size="md" />
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white leading-tight tracking-tight">
              SIP Ruang Rapat
            </span>
            <span className="text-[10px] text-slate-400 font-medium">BSKJI Kemenperin</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Quick Check-In / Check-Out Action Button */}
      <div className="p-3">
        <button
          onClick={onOpenCheckInModal}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm shadow-blue-900/50 transition-all group"
        >
          <CheckCircle2 className="w-4 h-4 text-blue-100 group-hover:scale-110 transition-transform" />
          <span>Check-In Penggunaan Ruang</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">
          Menu Utama
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sleek User Profile Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] border border-slate-700 font-bold shrink-0">
              {currentUser.nama
                .split(' ')
                .map((n) => n[0])
                .join('')
                .substring(0, 2)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{currentUser.nama}</span>
              <span className="text-[10px] text-slate-400 italic truncate">{roleMeta.nama}</span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
            title="Keluar dari Sistem"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-slate-200 bg-slate-900 min-h-[calc(100vh-65px)]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-full bg-slate-900 shadow-2xl flex-1 flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
