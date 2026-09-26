import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Bell, Brain, ArrowRight, CheckCircle2, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { TextAnimationCollection } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';
import { FoldText } from '../components/ui/FoldText.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassCard } from '../components/ui/GlassCard.js';
import { NexusLogo } from '../components/ui/NexusLogo.js';

export function Scene() {
  return (
    <div className="shader-frame">
      <TextAnimationCollection
        variant="threeui-intro"
        mode="dark"
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-nexus-950 text-slate-100 ambient-glow-mesh flex flex-col justify-between overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-12 py-6 border-b border-white/[0.08] backdrop-blur-md sticky top-0 z-30 bg-nexus-950/60">
        <NexusLogo size="lg" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            Sign In
          </button>
          <GlassButton onClick={() => navigate('/register')} size="sm">
            Get Started
          </GlassButton>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-10 sm:py-16 space-y-16">
        <div className="text-center space-y-6 max-w-4xl mx-auto flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-violet/15 border border-accent-violet/30 text-accent-violet text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4" />
            <span>AI Personal Intelligence & Planning System</span>
          </div>

          {/* 1. Main Project Title: ThreeUI TextAnimationCollection */}
          <div className="w-full flex flex-col items-center justify-center">
            <Scene />
          </div>

          {/* 2. Animated Text Below NEXUS: FoldText */}
          <div className="w-full flex justify-center py-2">
            <FoldText
              text="Connect. Discover. Innovate."
              splitBy="char"
              hinge="top"
              trigger="mount"
              duration={0.65}
              stagger={0.045}
              ease="power3.out"
              perspective={700}
              creaseShading={0.55}
              fontSize="clamp(1.8rem, 5vw, 3.6rem)"
              fontWeight={700}
              color="#f7f2e8"
              className="fold-text-nexus"
            />
          </div>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-slate-300/90 leading-relaxed max-w-2xl mx-auto font-normal">
            NEXUS proactively connects your goals, deadlines, calendar events, documents, and decisions. It anticipates workload crunches and alerts you natively on Windows—even when the website is closed.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full">
            <GlassButton
              onClick={() => navigate('/register')}
              size="lg"
              icon={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Start Free with Demo Scenario
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/login')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Sign In (Demo: demo@nexus.app)
            </GlassButton>
          </div>
        </div>

        {/* Flagship Scenario Interactive Showcase */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-accent-cyan">Flagship Intelligence Scenario</span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display">Workload Crunch & Conflict Detection</h2>
          </div>

          <GlassCard className="p-6 sm:p-10 border-accent-violet/30 shadow-2xl space-y-8" glow="violet">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Box 1: Project Deadline */}
              <div className="p-5 rounded-2xl bg-nexus-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent-cyan">PROJECT DEADLINE</span>
                  <Clock className="w-4 h-4 text-accent-cyan" />
                </div>
                <h3 className="font-bold text-base text-slate-100">AI Music Composer</h3>
                <p className="text-xs text-slate-400">Due: <strong>Friday 5:00 PM</strong></p>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-accent-cyan h-2 rounded-full w-[50%]" />
                </div>
                <p className="text-[11px] text-slate-400">50% complete (2 tasks pending, ~4 hrs)</p>
              </div>

              {/* Box 2: Examination Event */}
              <div className="p-5 rounded-2xl bg-nexus-900/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-accent-rose">CALENDAR EXAM</span>
                  <AlertTriangle className="w-4 h-4 text-accent-rose" />
                </div>
                <h3 className="font-bold text-base text-slate-100">Architecture Final Exam</h3>
                <p className="text-xs text-slate-400">Scheduled: <strong>Saturday 10:00 AM</strong></p>
                <div className="p-2 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-[11px] text-accent-rose">
                  High-stakes evaluation requires dedicated preparation window.
                </div>
              </div>

              {/* Box 3: Proactive Intelligence Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-accent-violet/20 to-accent-cyan/10 border border-accent-violet/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-accent-violet">PROACTIVE RESOLUTION</span>
                  <Brain className="w-5 h-5 text-accent-violet" />
                </div>
                <h4 className="font-bold text-sm text-slate-100">NEXUS AI Recovery Plan</h4>
                <p className="text-xs text-slate-300">
                  Detected conflict. Suggested: Complete remaining 2 project tasks today to reserve Friday evening for exam review.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2 px-3 rounded-xl bg-accent-violet text-white text-xs font-semibold flex items-center justify-center gap-2 hover:bg-accent-violet/90 transition-all shadow-md shadow-accent-violet/30"
                >
                  <span>Explore Live Demo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Core Capabilities Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 space-y-3" interactive>
            <div className="w-10 h-10 rounded-xl bg-accent-violet/20 flex items-center justify-center text-accent-violet">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Personal Memory & RAG</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload PDF specifications, notes, and architecture diagrams. Query them anytime with vector-embedded semantic search.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3" interactive>
            <div className="w-10 h-10 rounded-xl bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">Native Desktop Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Quietly runs in the Windows system tray. Alerts you of impending deadline risks even when your browser is closed.
            </p>
          </GlassCard>

          <GlassCard className="p-6 space-y-3" interactive>
            <div className="w-10 h-10 rounded-xl bg-accent-emerald/20 flex items-center justify-center text-accent-emerald">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base">100% Privacy Respect</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              No keystroke logging, no screen monitoring, no stealth surveillance. Complete user-controlled data ownership.
            </p>
          </GlassCard>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 border-t border-white/[0.08] text-center text-xs text-slate-500">
        NEXUS © 2026. Built with React, TypeScript, Node.js, and MongoDB.
      </footer>
    </div>
  );
};
