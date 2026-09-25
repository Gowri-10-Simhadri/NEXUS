import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Calendar, Sparkles, FolderKanban } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore.js';

export const BottomNav: React.FC = () => {
  const { unreadCount } = useNotificationStore();

  const navItems = [
    { label: 'Home', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'AI Chat', path: '/ai', icon: <Sparkles className="w-6 h-6 text-accent-violet" />, special: true },
    { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-nexus-900/90 light:bg-white/90 backdrop-blur-2xl border-t border-white/[0.08] light:border-black/[0.08] px-2 py-1 shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                item.special
                  ? '-translate-y-2 bg-gradient-to-tr from-accent-violet to-accent-cyan text-white p-3 rounded-full shadow-lg shadow-accent-violet/40'
                  : isActive
                  ? 'text-accent-violet font-bold'
                  : 'text-slate-400 light:text-slate-500'
              }`
            }
          >
            {item.icon}
            {!item.special && (
              <span className="text-[10px] font-medium tracking-tight mt-0.5">{item.label}</span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
