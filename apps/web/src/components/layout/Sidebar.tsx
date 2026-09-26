import React from 'react';
import { NavLink } from 'react-router-dom';
import { NexusLogo } from '../ui/NexusLogo.js';
import {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Target,
  Calendar,
  Sparkles,
  Bell,
  Database,
  FileText,
  GitBranch,
  Lightbulb,
  Activity,
  Settings,
  Search,
} from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore.js';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { unreadCount } = useNotificationStore();

  const mainNav: NavItem[] = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'AI Chat', path: '/ai', icon: <Sparkles className="w-5 h-5 text-accent-violet" /> },
    { label: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5 text-accent-cyan" /> },
    { label: 'Goals', path: '/goals', icon: <Target className="w-5 h-5 text-accent-emerald" /> },
    { label: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Notifications', path: '/notifications', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
  ];

  const secondaryNav: NavItem[] = [
    { label: 'Insights & Risks', path: '/insights', icon: <Lightbulb className="w-5 h-5 text-accent-amber" /> },
    { label: 'Personal Memory', path: '/knowledge', icon: <Database className="w-5 h-5" /> },
    { label: 'Notes', path: '/notes', icon: <FileText className="w-5 h-5" /> },
    { label: 'Decision Memory', path: '/decisions', icon: <GitBranch className="w-5 h-5" /> },
    { label: 'Activity Timeline', path: '/activity', icon: <Activity className="w-5 h-5" /> },
    { label: 'Global Search', path: '/search', icon: <Search className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 h-screen sticky top-0 border-r border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-nexus-900/70 backdrop-blur-2xl p-4 overflow-y-auto">
      {/* Brand Logo */}
      <div className="px-3 py-4 mb-4">
        <NexusLogo size="lg" />
      </div>

      {/* Main Navigation */}
      <div className="space-y-1 mb-6">
        <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Core Workload
        </span>
        {mainNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-violet-50 dark:bg-accent-violet/20 text-violet-700 dark:text-accent-violet border border-violet-200/80 dark:border-accent-violet/30 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.06]'
              }`
            }
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && item.badge > 0 ? (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white shadow-sm">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>

      {/* Secondary Navigation */}
      <div className="space-y-1 mt-auto pt-4 border-t border-slate-200/60 dark:border-white/[0.06]">
        <span className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Intelligence & Memory
        </span>
        {secondaryNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-violet-50 dark:bg-accent-violet/15 text-violet-700 dark:text-accent-violet font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-white/[0.04]'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  );
};
