import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.js';
import { BottomNav } from './BottomNav.js';
import { Header } from './Header.js';
import { CommandBar } from './CommandBar.js';
import { GlassToast } from '../ui/GlassToast.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useAuthStore } from '../../stores/authStore.js';

export const DashboardLayout: React.FC = () => {
  const [isCommandBarOpen, setIsCommandBarOpen] = useState(false);
  const { initSocket, fetchNotifications } = useNotificationStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem('nexus_access_token');
    if (token && isAuthenticated) {
      initSocket(token);
      fetchNotifications();
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-nexus-950 text-slate-100 ambient-glow-mesh">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-6">
        <Header onOpenCommandBar={() => setIsCommandBarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fadeIn">
          <Outlet />
        </main>
      </div>

      {/* Mobile-First Bottom Navigation */}
      <BottomNav />

      {/* Global Command Bar Palette */}
      <CommandBar
        isOpen={isCommandBarOpen}
        onClose={() => setIsCommandBarOpen(false)}
      />

      {/* Real-Time Glass Notification Toast */}
      <GlassToast />
    </div>
  );
};
