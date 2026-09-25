import React, { useState, useEffect } from 'react';
import { Database, Plus, FileText, Trash2, Search, Sparkles, BookOpen, Tag, Info } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassBadge } from '../components/ui/GlassBadge.js';
import { GlassModal } from '../components/ui/GlassModal.js';
import { GlassInput, GlassTextArea } from '../components/ui/GlassInput.js';
import api from '../services/api.js';
import { DocumentItem } from '../types/index.js';

export const KnowledgePage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/knowledge/documents');
      setDocuments(res.data.data.documents);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/knowledge/documents', {
        title,
        content,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        fileType: 'text/markdown',
      });
      setIsModalOpen(false);
      setTitle('');
      setContent('');
      setTags('');
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await api.delete(`/knowledge/documents/${id}`);
      loadDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.content && doc.content.toLowerCase().includes(q)) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
            <Database className="w-6 h-6 text-accent-cyan" />
            <span>Personal Memory & Knowledge Vault</span>
          </h2>
          <p className="text-xs text-slate-400">
            Store long-term preferences, project specifications, and reference notes that NEXUS AI automatically recalls during planning
          </p>
        </div>

        <GlassButton onClick={() => setIsModalOpen(true)} icon={<Plus className="w-4 h-4" />}>
          Add Personal Memory
        </GlassButton>
      </div>

      {/* Educational Banner explaining how Memory works */}
      <div className="p-4 rounded-2xl bg-accent-cyan/10 border border-accent-cyan/20 flex items-start gap-3 text-xs text-slate-300">
        <Info className="w-5 h-5 text-accent-cyan shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-100">
            How does Personal Memory help you?
          </p>
          <p className="text-slate-300 leading-relaxed">
            Unlike generic chatbots with no long-term recall, NEXUS indexes your stored memories (such as preferred working hours, tech stacks, or architectural requirements). When you chat with the AI or ask for a recovery plan, it automatically grounds its advice in these memories.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-nexus-900/60 border border-white/10 text-xs text-slate-300">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search stored memories, keywords, or tags..."
          className="bg-transparent flex-1 text-slate-100 placeholder-slate-500 focus:outline-none text-xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-[11px] text-slate-400 hover:text-white"
          >
            Clear ({filteredDocs.length} results)
          </button>
        )}
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full">
            <GlassCard className="p-12 text-center text-xs text-slate-400 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <div>
                <p className="font-semibold text-slate-200 text-sm">No personal memories found</p>
                <p className="text-slate-400 mt-1 max-w-md mx-auto">
                  {searchQuery
                    ? 'No memories matched your search.'
                    : 'Add notes about your work style, project architectures, or study habits so the AI assistant can reference them.'}
                </p>
              </div>
              <GlassButton
                size="sm"
                onClick={() => setIsModalOpen(true)}
                icon={<Plus className="w-3.5 h-3.5" />}
              >
                Add First Memory
              </GlassButton>
            </GlassCard>
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <GlassCard key={doc._id} className="p-5 space-y-4 flex flex-col justify-between" interactive glow="cyan">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-accent-cyan/15 text-accent-cyan">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 font-display">{doc.title}</h3>
                      <span className="text-[10px] text-slate-400">Indexed for AI recall</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteDoc(doc._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
                  {doc.content}
                </p>

                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {doc.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-slate-300 font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>Stored {new Date(doc.createdAt).toLocaleDateString()}</span>
                <GlassBadge variant="cyan">AI Grounded</GlassBadge>
              </div>
            </GlassCard>
          ))
        )}
      </div>

      {/* Add Memory Modal */}
      <GlassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Personal Memory to Vault"
      >
        <form onSubmit={handleCreateDocument} className="space-y-4">
          <GlassInput
            label="Memory / Document Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Preferred Coding Hours & Sprint Focus Style"
            required
            autoFocus
          />

          <GlassTextArea
            label="Memory Content / Knowledge Details"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="e.g. I prefer doing deep programming tasks in the evening between 6pm-10pm. When breaking down tasks, emphasize automated testing."
            rows={6}
            required
          />

          <GlassInput
            label="Categories / Tags (Comma separated)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="WorkStyle, Architecture, Preferences"
          />

          <div className="flex justify-end gap-2 pt-4">
            <GlassButton variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton type="submit">Save to Personal Memory</GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
