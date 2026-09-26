import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Clock, AlertTriangle, ChevronLeft, ChevronRight, CheckSquare } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { CalendarEvent } from '../types/index.js';

export const CalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [projectDeadlines, setProjectDeadlines] = useState<any[]>([]);
  const [taskDeadlines, setTaskDeadlines] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'event' | 'meeting' | 'exam' | 'reminder'>('exam');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');

  const loadEvents = async () => {
    try {
      const res = await api.get('/calendar');
      setEvents(res.data.data.events);
      setProjectDeadlines(res.data.data.projectDeadlines || []);
      setTaskDeadlines(res.data.data.taskDeadlines || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/calendar', {
        title,
        description,
        type,
        startTime,
        endTime: endTime || startTime,
        location,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      setLocation('');
      loadEvents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">Schedule & Calendar</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Unified timeline of examinations, meetings, and project deadlines
          </p>
        </div>

        <GlassButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Schedule Event / Exam
        </GlassButton>
      </div>

      {/* Events Stream / Agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Scheduled Items */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span>Timeline Events ({events.length})</span>
          </h3>

          <div className="space-y-3">
            {events.length === 0 ? (
              <GlassCard className="p-8 text-center text-xs text-slate-500">
                No events scheduled.
              </GlassCard>
            ) : (
              events.map((ev) => (
                <GlassCard
                  key={ev._id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm"
                  interactive
                  glow={ev.type === 'exam' ? 'rose' : 'violet'}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <GlassBadge variant={ev.type === 'exam' ? 'rose' : 'violet'}>
                        {ev.type}
                      </GlassBadge>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{ev.title}</h4>
                    </div>
                    {ev.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">{ev.description}</p>
                    )}
                    {ev.location && (
                      <span className="text-[11px] text-slate-500 block">📍 {ev.location}</span>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-200 block">
                      {new Date(ev.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Embedded Project & Task Deadlines */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Active Deadlines</span>
          </h3>

          <div className="space-y-3">
            {projectDeadlines.map((p) => (
              <GlassCard key={p.id} className="p-4 space-y-1 border border-cyan-300 dark:border-cyan-500/30 bg-cyan-50/30 dark:bg-nexus-900/60 shadow-xs">
                <span className="text-[10px] font-bold text-cyan-700 dark:text-cyan-400 uppercase">Project Due</span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{p.title}</h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {new Date(p.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </GlassCard>
            ))}

            {taskDeadlines.map((t) => (
              <GlassCard key={t.id} className="p-4 space-y-1 border border-amber-300 dark:border-amber-500/30 bg-amber-50/30 dark:bg-nexus-900/60 shadow-xs">
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Task Due</span>
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{t.title}</h5>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  {new Date(t.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Event or Examination"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <GlassInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Software Architecture Final Examination"
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Event Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-xl bg-white dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 shadow-sm"
            >
              <option value="exam">Examination (High-Priority Alert)</option>
              <option value="meeting">Meeting</option>
              <option value="event">General Event</option>
              <option value="focus">Deep Work / Focus Block</option>
              <option value="reminder">Reminder</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Start Time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <GlassInput
              label="End Time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <GlassInput
            label="Location or Meeting Link"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Hall 4 / Google Meet"
          />

          <GlassTextArea
            label="Notes / Syllabus"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Save to Calendar</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
