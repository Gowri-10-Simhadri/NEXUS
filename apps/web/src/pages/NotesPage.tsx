import React, { useState, useEffect } from 'react';
import { FileText, Plus, Pin, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { NoteItem } from '../types/index.js';

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const loadNotes = async () => {
    try {
      const res = await api.get('/knowledge/notes');
      setNotes(res.data.data.notes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/knowledge/notes', { title, content, isPinned });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setIsPinned(false);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await api.delete(`/knowledge/notes/${id}`);
      loadNotes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
            <span>Scratchpad & Notes</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Quick thought capture, sprint notes, and snippet storage
          </p>
        </div>

        <GlassButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          New Note
        </GlassButton>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map((n) => (
          <GlassCard key={n._id} className="p-5 space-y-3 flex flex-col justify-between bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-sm" interactive>
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{n.title}</h3>
                <div className="flex items-center gap-1">
                  {n.isPinned && <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                  <button
                    onClick={() => handleDeleteNote(n._id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {n.content}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-200/80 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400">
              Updated {new Date(n.updatedAt).toLocaleDateString()}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Quick Note">
        <form onSubmit={handleCreateNote} className="space-y-4">
          <GlassInput
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sprint 2 retrospective notes"
            required
          />
          <GlassTextArea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            placeholder="Type your notes..."
            required
          />
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="rounded bg-white dark:bg-nexus-900 border-slate-300 dark:border-white/20 text-violet-600"
            />
            <span>Pin this note to the top</span>
          </label>
          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Save Note</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
