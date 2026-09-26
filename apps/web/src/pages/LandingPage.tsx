import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Shield,
  Bell,
  Brain,
  ArrowRight,
  Clock,
  AlertTriangle,
  ChevronRight,
  Database,
  Lock,
  Layers,
  Sparkle,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { NexusTitle3D } from '../components/hero/NexusTitle3D.js';
import { FoldText } from '../components/ui/FoldText.js';
import { Button3D } from '../components/ui/Button3D.js';
import { TiltCard3D } from '../components/ui/TiltCard3D.js';
import { NexusLogo } from '../components/ui/NexusLogo.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/80 text-slate-800 flex flex-col justify-between overflow-x-hidden relative selection:bg-violet-500 selection:text-white">
      {/* Soft Decorative Ambient Background Blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 opacity-60">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[400px] bg-gradient-to-tr from-cyan-200/40 via-violet-200/40 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[40%] -left-32 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl" />
        <div className="absolute top-[60%] -right-32 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl" />
      </div>

      {/* Modern Light Header */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-slate-200/80 bg-white/70 backdrop-blur-md sticky top-0 shadow-sm">
        <NexusLogo size="md" />
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Sign In</span>
          </button>
          <Button3D
            onClick={() => navigate('/register')}
            size="sm"
            variant="primary"
            iconRight={<ArrowRight className="w-4 h-4" />}
          >
            Get Started
          </Button3D>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-20 space-y-20">
        <div className="text-center space-y-7 max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-xs font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>AI Personal Intelligence & Planning System</span>
          </div>

          {/* 1. Main Project Title: 3D Animated NEXUS with Logo directly to the right - NO CARD */}
          <div className="w-full flex items-center justify-center pt-2">
            <NexusTitle3D />
          </div>

          {/* 2. Animated Tagline Below NEXUS: Restored previous correct tagline using FoldText */}
          <div className="w-full flex justify-center py-1">
            <FoldText
              text="Know when you need to act."
              splitBy="char"
              hinge="top"
              trigger="mount"
              duration={0.65}
              stagger={0.04}
              ease="power3.out"
              perspective={800}
              creaseShading={0.5}
              fontSize="clamp(1.6rem, 4.2vw, 3.2rem)"
              fontWeight={700}
              color="#0f172a"
              className="fold-text-nexus"
            />
          </div>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-normal">
            NEXUS proactively connects your goals, deadlines, calendar events, documents, and decisions. It anticipates workload crunches and alerts you natively before conflicts happen.
          </p>

          {/* 3D Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3 w-full max-w-md mx-auto">
            <Button3D
              onClick={() => navigate('/register')}
              size="lg"
              variant="primary"
              iconRight={<ArrowRight className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Start Free with Demo
            </Button3D>
            <Button3D
              onClick={() => navigate('/login')}
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              Sign In (demo@nexus.app)
            </Button3D>
          </div>
        </div>

        {/* Flagship Scenario Interactive Showcase */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
              Flagship Intelligence Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">
              Workload Crunch & Conflict Detection
            </h2>
          </div>

          <div className="p-6 sm:p-9 rounded-3xl bg-white/90 border border-slate-200/90 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.06)] backdrop-blur-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Box 1: Project Deadline */}
              <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-700 uppercase tracking-wider">Project Deadline</span>
                    <Clock className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">AI Music Composer</h3>
                  <p className="text-xs text-slate-500">Due: <strong className="text-slate-700">Friday 5:00 PM</strong></p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full w-[50%]" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                  <span>50% complete (2 tasks pending, ~4 hrs)</span>
                </p>
              </div>

              {/* Box 2: Examination Event */}
              <div className="p-5 rounded-2xl bg-rose-50/50 border border-rose-200/70 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Calendar Exam</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-800">Architecture Final Exam</h3>
                  <p className="text-xs text-slate-500">Scheduled: <strong className="text-slate-700">Saturday 10:00 AM</strong></p>
                </div>
                <div className="p-3 rounded-xl bg-rose-100/60 border border-rose-200 text-xs text-rose-800 font-medium">
                  High-stakes evaluation requires dedicated preparation window.
                </div>
              </div>

              {/* Box 3: Proactive Intelligence Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50/70 border border-violet-200 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">Proactive Resolution</span>
                    <Brain className="w-5 h-5 text-violet-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">NEXUS AI Recovery Plan</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Detected conflict. Suggested: Complete remaining 2 project tasks today to reserve Friday evening for exam review.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-center gap-2 hover:from-violet-700 hover:to-indigo-700 transition-all shadow-md shadow-violet-500/20 active:scale-[0.98]"
                >
                  <span>Explore Live Demo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Six Interactive 3D Cards with Coordinated Multicolor Accents */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-200">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-800">
              Built for Clarity, Focus, and Execution
            </h2>
            <p className="text-sm text-slate-500 max-w-xl mx-auto">
              Interact with the cards below to explore how NEXUS orchestrates your work.
            </p>
          </div>

          {/* 3x2 Desktop, 2x3 Tablet, 1x6 Mobile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* Card 1: Cyan / Blue */}
            <TiltCard3D
              accent="cyan"
              badge="Intelligence"
              icon={<Clock className="w-6 h-6" />}
              title="Workload Conflict Detection"
              description="Continuous analysis across projects, tasks, and calendar events to highlight crunch zones before deadlines collide."
              action={
                <span className="text-xs font-semibold text-cyan-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>View conflict analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 2: Violet / Purple */}
            <TiltCard3D
              accent="violet"
              badge="Autonomy"
              icon={<Brain className="w-6 h-6" />}
              title="Proactive AI Recovery Plans"
              description="Automated rescheduling suggestions and mitigation paths when tasks fall behind or schedules become congested."
              action={
                <span className="text-xs font-semibold text-violet-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Generate recovery plans</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 3: Pink / Magenta */}
            <TiltCard3D
              accent="pink"
              badge="Knowledge"
              icon={<Database className="w-6 h-6" />}
              title="Personal Memory & Document RAG"
              description="Upload PDF specifications, notes, and research. Query them with semantic vector retrieval powered by Gemini."
              action={
                <span className="text-xs font-semibold text-pink-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Explore memory store</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 4: Teal / Emerald */}
            <TiltCard3D
              accent="teal"
              badge="Native"
              icon={<Bell className="w-6 h-6" />}
              title="Native Windows Desktop Agent"
              description="Runs in your Windows tray and delivers proactive desktop notifications even when your browser is closed."
              action={
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Connect desktop daemon</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 5: Orange / Coral */}
            <TiltCard3D
              accent="orange"
              badge="Architecture"
              icon={<Layers className="w-6 h-6" />}
              title="Architectural Decision Records"
              description="Capture the 'why' behind architectural choices with structured ADRs linked directly to project roadmaps and goals."
              action={
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Log architecture records</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 6: Indigo / Blue */}
            <TiltCard3D
              accent="indigo"
              badge="Security"
              icon={<Shield className="w-6 h-6" />}
              title="Self-Sovereign Privacy & Security"
              description="No keystroke logging, no screen capturing, and no intrusive monitoring. Your data remains strictly in your control."
              action={
                <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Review security guarantees</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />
          </div>
        </div>
      </main>

      {/* Modern Light Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-slate-200/80 bg-white/50 text-center text-xs text-slate-500">
        NEXUS © 2026. Built with React, TypeScript, Node.js, and MongoDB.
      </footer>
    </div>
  );
};
