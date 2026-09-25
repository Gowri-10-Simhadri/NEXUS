import React from 'react';
import { Bell, AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';
import { useNotificationStore } from '../../stores/notificationStore.js';
import { useNavigate } from 'react-router-dom';

export const GlassToast: React.FC = () => {
  const { activeToast, dismissToast, snoozeNotification, dismissNotification } = useNotificationStore();
  const navigate = useNavigate();

  if (!activeToast) return null;

  const handleAction = (actionKey: string, url?: string) => {
    if (actionKey === 'view_plan') {
      navigate('/ai');
    } else if (actionKey === 'open_project' && url) {
      navigate(url);
    } else if (actionKey === 'snooze') {
      snoozeNotification(activeToast._id, 2);
    } else if (actionKey === 'dismiss') {
      dismissNotification(activeToast._id);
    }
    dismissToast();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-slideUp">
      <div className="rounded-2xl p-5 bg-nexus-900/95 light:bg-white/95 backdrop-blur-2xl border border-accent-violet/40 shadow-2xl shadow-accent-violet/20 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-accent-violet/20 text-accent-violet">
              {activeToast.type === 'conflict' ? (
                <AlertTriangle className="w-5 h-5 text-accent-rose" />
              ) : activeToast.type === 'deadline' ? (
                <Clock className="w-5 h-5 text-accent-amber" />
              ) : (
                <Bell className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-accent-cyan">
                {activeToast.type.replace('_', ' ')}
              </span>
              <h4 className="text-sm font-bold text-slate-100 light:text-slate-900 leading-tight">
                {activeToast.title}
              </h4>
            </div>
          </div>
          <button
            onClick={dismissToast}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 light:text-slate-600 leading-relaxed">
          {activeToast.message}
        </p>

        {activeToast.reasons && activeToast.reasons.length > 0 && (
          <div className="p-2.5 rounded-xl bg-black/30 light:bg-slate-100 text-[11px] text-slate-400 space-y-1">
            <span className="font-semibold text-slate-300 light:text-slate-700 block">Why am I seeing this?</span>
            {activeToast.reasons.slice(0, 2).map((r, i) => (
              <div key={i} className="flex justify-between">
                <span>{r.label}:</span>
                <span className="font-medium text-slate-200 light:text-slate-800">{r.detail}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          {activeToast.actions?.map((act, idx) => (
            <button
              key={idx}
              onClick={() => handleAction(act.actionKey, act.url)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                act.actionKey === 'view_plan'
                  ? 'bg-accent-violet text-white hover:bg-accent-violet/90 shadow-md shadow-accent-violet/30'
                  : 'bg-white/10 light:bg-black/10 text-slate-300 light:text-slate-700 hover:bg-white/15'
              }`}
            >
              {act.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
