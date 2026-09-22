import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { ToastContainer } from '../common/ToastContainer';
import { CheckInModal } from '../booking/CheckInModal';
import { AlertTriangle, ExternalLink, X } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const { isFirestoreQuotaExhausted } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isCheckInModalOpen, setIsCheckInModalOpen] = useState(false);
  const [isQuotaBannerDismissed, setIsQuotaBannerDismissed] = useState(false);

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Top Header Bar */}
      <Header
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Cloud Firestore Quota Notice Banner */}
      {isFirestoreQuotaExhausted && !isQuotaBannerDismissed && (
        <aside
          aria-label="Notifikasi Kuota Firestore"
          className="bg-amber-500/10 border-b border-amber-300 text-amber-950 px-4 py-2.5 sm:px-6 flex items-center justify-between text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2.5 flex-1 pr-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <div className="flex-1">
              <span className="font-semibold text-amber-900">
                Pemberitahuan Kuota Cloud Firestore (Spark Tier):
              </span>{' '}
              <span className="text-amber-800">
                Batas kuota harian tercapai (akan direset otomatis besok). Aplikasi tetap beroperasi normal dengan penyimpanan server & lokal tanpa kehilangan data.
              </span>{' '}
              <a
                href="https://console.firebase.google.com/project/sipr-5b16e/firestore/databases/(default)/data?openUpgradeDialog=true"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-amber-900 underline hover:text-amber-700 ml-1"
              >
                Buka Konsol Firebase <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={() => setIsQuotaBannerDismissed(true)}
            className="text-amber-700 hover:text-amber-900 p-1 rounded-md transition-colors"
            title="Tutup pemberitahuan"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenCheckInModal={() => setIsCheckInModalOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Check-in Modal */}
      <CheckInModal
        isOpen={isCheckInModalOpen}
        onClose={() => setIsCheckInModalOpen(false)}
      />

      {/* Global Toast Notification System */}
      <ToastContainer />
    </div>
  );
};

