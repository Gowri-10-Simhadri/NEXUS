import React, { useState, useEffect } from 'react';
import { Activity as ActivityIcon, Clock, CheckCircle2, FileText, Plus, Bell } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import api from '../services/api.js';
import { ActivityItem } from '../types/index.js';

export const ActivityPage: React.FC = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/activity')
      .then((res) => setActivities(res.data.data.activities))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <ActivityIcon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
          <span>Activity & Audit Timeline</span>
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Chronological record of task completions, AI action executions, and milestone updates
        </p>
      </div>

      <GlassCard className="p-6 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm">
        <div className="relative border-l border-slate-200 dark:border-white/10 ml-4 space-y-6">
          {activities.length === 0 ? (
            <div className="pl-6 text-xs text-slate-500 dark:text-slate-400">No activity recorded yet.</div>
          ) : (
            activities.map((act) => (
              <div key={act._id} className="relative pl-6 space-y-1">
                <span className="absolute -left-2.5 top-0.5 w-5 h-5 rounded-full bg-white dark:bg-nexus-900 border border-violet-500 flex items-center justify-center text-[10px] text-violet-600 shadow-xs">
                  •
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-200">{act.description}</p>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  {new Date(act.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))
          )}
        </div>
      </GlassCard>
    </div>
  );
};
