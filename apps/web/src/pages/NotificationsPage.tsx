import React, { useEffect } from 'react';
import { Bell, Check, Clock, X, AlertTriangle, Sparkles, CheckCheck } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { useNotificationStore } from '../stores/notificationStore.js';
import { useNavigate } from 'react-router-dom';

export const NotificationsPage: React.FC = () => {
  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    snoozeNotification,
    dismissNotification,
  } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Notification Center</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Intelligent alerts with explainable reasoning and instant actionable options
          </p>
        </div>

        <GlassButton
          variant="secondary"
          size="sm"
          onClick={markAllAsRead}
          icon={<CheckCheck className="w-4 h-4" />}
        >
          Mark All Read
        </GlassButton>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <GlassCard className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Bell className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="font-semibold text-slate-800 dark:text-slate-300">All notifications cleared!</p>
            <p className="text-slate-500 dark:text-slate-400">NEXUS is quietly monitoring your projects and will alert you if any conflicts arise.</p>
          </GlassCard>
        ) : (
          notifications.map((notif) => (
            <GlassCard
              key={notif._id}
              className={`p-5 space-y-4 border ${
                notif.status === 'unread'
                  ? 'border-violet-300 dark:border-violet-500/40 bg-violet-50/40 dark:bg-nexus-800/80'
                  : 'border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-nexus-900/60'
              } shadow-sm`}
              glow={notif.priority === 'critical' ? 'rose' : notif.priority === 'high' ? 'amber' : 'none'}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                      {notif.type === 'conflict' ? (
                        <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      ) : (
                        <Bell className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      )}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{notif.title}</h4>
                    {notif.status === 'unread' && (
                      <span className="w-2 h-2 rounded-full bg-violet-600" />
                    )}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
                    {notif.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <GlassBadge variant={notif.priority === 'critical' ? 'rose' : 'violet'}>
                    {notif.priority}
                  </GlassBadge>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Explainability Box: "Why did I get this notification?" */}
              {notif.reasons && notif.reasons.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 space-y-2 text-xs">
                  <span className="font-semibold block text-[11px] uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
                    Why am I seeing this?
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-400">
                    {notif.reasons.map((r, i) => (
                      <div key={i} className="flex items-center justify-between p-1.5 rounded-lg bg-white dark:bg-white/[0.03] border border-slate-200/50 dark:border-transparent">
                        <span>{r.label}:</span>
                        <strong className="text-slate-800 dark:text-slate-200">{r.detail}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  {notif.actions?.map((act, i) => (
                    <GlassButton
                      key={i}
                      size="sm"
                      variant={act.actionKey === 'view_plan' ? 'primary' : 'ghost'}
                      onClick={() => {
                        if (act.actionKey === 'view_plan') navigate('/ai');
                        if (act.actionKey === 'snooze') snoozeNotification(notif._id, 4);
                        if (act.actionKey === 'dismiss') dismissNotification(notif._id);
                      }}
                    >
                      {act.label}
                    </GlassButton>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {notif.status === 'unread' && (
                    <button
                      onClick={() => markAsRead(notif._id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 text-xs flex items-center gap-1 font-medium"
                    >
                      <Check className="w-3.5 h-3.5" /> Mark Read
                    </button>
                  )}
                  <button
                    onClick={() => dismissNotification(notif._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-white/10 text-xs"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))
        )}
      </div>
    </div>
  );
};
