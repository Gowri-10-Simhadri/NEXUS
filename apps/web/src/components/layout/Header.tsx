import React from 'react';
import { Search, Sun, Moon, Bell, Sparkles, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore.js';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenCommandBar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenCommandBar }) => {
  const { user, theme, toggleTheme, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-8 border-b border-white/[0.08] light:border-black/[0.08] bg-nexus-950/60 light:bg-white/70 backdrop-blur-xl">
      {/* Mobile Brand / Search Button */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          onClick={onOpenCommandBar}
          className="flex items-center gap-3 w-full px-4 py-2 rounded-2xl bg-nexus-900/60 light:bg-slate-100/90 border border-white/10 light:border-black/10 text-slate-400 text-xs hover:border-accent-violet/50 hover:bg-nexus-900 transition-all text-left shadow-inner"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="flex-1">Search or ask NEXUS...</span>
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-white/10 rounded-md text-slate-300">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Ask AI button */}
        <button
          onClick={() => navigate('/ai')}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent-violet/15 text-accent-violet border border-accent-violet/30 text-xs font-semibold hover:bg-accent-violet/25 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask NEXUS</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-300 light:text-slate-700 hover:bg-white/10 light:hover:bg-black/10 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-accent-amber" /> : <Moon className="w-4 h-4 text-accent-violet" />}
        </button>

        {/* Notifications Icon */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 rounded-xl text-slate-300 light:text-slate-700 hover:bg-white/10 light:hover:bg-black/10 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-rose animate-pulse" />
          )}
        </button>

        {/* User profile dropdown trigger */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10 light:border-black/10">
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/10 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-accent-violet to-accent-cyan flex items-center justify-center font-bold text-white text-xs">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:inline-block text-xs font-medium text-slate-200 light:text-slate-800 max-w-[100px] truncate">
              {user?.name || 'Account'}
            </span>
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-accent-rose hover:bg-white/10 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
