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
  Layers,
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/90 text-slate-900 flex flex-col justify-between overflow-x-hidden relative selection:bg-violet-500 selection:text-white">
      {/* Abstract Animated Layered Background (NO GRIDS) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        {/* Layer 1: Blurred Logo-Color Ambient Orbs */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-violet-200/50 via-cyan-200/50 to-pink-200/40 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute top-[35%] -left-32 w-[420px] h-[420px] bg-cyan-200/40 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-[55%] -right-32 w-[450px] h-[450px] bg-violet-200/40 rounded-full blur-3xl animate-float-reverse" />
        <div className="absolute top-[80%] left-[10%] w-[380px] h-[380px] bg-emerald-200/35 rounded-full blur-3xl animate-float-slow" />

        {/* Layer 2: Subtle Floating 3D Geometric Accents */}
        <div className="absolute top-28 left-[12%] w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-300/30 backdrop-blur-md rotate-12 animate-float-slow shadow-sm" />
        <div className="absolute top-48 right-[14%] w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-300/30 backdrop-blur-md animate-float-reverse shadow-sm" />
        <div className="absolute top-[68%] left-[8%] w-24 h-24 rounded-3xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-300/30 backdrop-blur-md -rotate-6 animate-float-slow shadow-sm" />
      </div>

      {/* Top Header Navigation */}
      <header className="relative z-30 flex items-center justify-between px-6 sm:px-12 py-5 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 shadow-sm">
        {/* Brand with Logo on the LEFT and Dark Text on the RIGHT */}
        <NexusLogo size="md" />

        <div className="flex items-center gap-3.5">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4 text-violet-600" />
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

      {/* Main Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 sm:py-20 space-y-24">
        <div className="text-center space-y-8 max-w-4xl mx-auto flex flex-col items-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-800 text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-violet-600" />
            <span>AI Personal Intelligence & Planning System</span>
          </div>

          {/* 1. Main Visual Centerpiece: Advanced 3D NEXUS Title with Logo on the LEFT (NO CARD) */}
          <div className="w-full flex items-center justify-center pt-2">
            <NexusTitle3D />
          </div>

          {/* 2. Tagline Below NEXUS: Restored Tagline Animated with FoldText */}
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
              creaseShading={0.45}
              fontSize="clamp(1.8rem, 4.4vw, 3.4rem)"
              fontWeight={800}
              color="#0f172a"
              className="fold-text-nexus"
            />
          </div>

          {/* Supporting Description with Dark High-Contrast Text */}
          <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto font-normal">
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 shadow-sm">
              Flagship Intelligence Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Workload Crunch & Conflict Detection
            </h2>
          </div>

          <div className="p-6 sm:p-9 rounded-3xl bg-white border border-slate-200 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Box 1: Project Deadline */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-800 uppercase tracking-wider">Project Deadline</span>
                    <Clock className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">AI Music Composer</h3>
                  <p className="text-xs text-slate-600">Due: <strong className="text-slate-900">Friday 5:00 PM</strong></p>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full w-[50%]" />
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                  <span>50% complete (2 tasks pending, ~4 hrs)</span>
                </p>
              </div>

              {/* Box 2: Examination Event */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Calendar Exam</span>
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900">Architecture Final Exam</h3>
                  <p className="text-xs text-slate-600">Scheduled: <strong className="text-slate-900">Saturday 10:00 AM</strong></p>
                </div>
                <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-200 text-xs text-rose-900 font-semibold">
                  High-stakes evaluation requires dedicated preparation window.
                </div>
              </div>

              {/* Box 3: Proactive Intelligence Action */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200 space-y-3 flex flex-col justify-between shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-violet-800 uppercase tracking-wider">Proactive Resolution</span>
                    <Brain className="w-5 h-5 text-violet-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">NEXUS AI Recovery Plan</h4>
                  <p className="text-xs text-slate-700 leading-relaxed font-normal">
                    Detected conflict. Suggested: Complete remaining 2 project tasks today to reserve Friday evening for exam review.
                  </p>
                </div>
                <Button3D
                  onClick={() => navigate('/login')}
                  variant="primary"
                  size="sm"
                  iconRight={<ChevronRight className="w-4 h-4" />}
                  className="w-full"
                >
                  Explore Live Demo
                </Button3D>
              </div>
            </div>
          </div>
        </div>

        {/* Six Interactive 3D Cards with Layered Depth and Logo-Derived Colors */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet-800 bg-violet-50 px-3.5 py-1 rounded-full border border-violet-200 shadow-sm">
              Platform Features
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Built for Clarity, Focus, and Execution
            </h2>
            <p className="text-sm text-slate-600 max-w-xl mx-auto">
              Hover over the cards below to experience interactive 3D perspective and physical depth.
            </p>
          </div>

          {/* 3x2 Desktop, 2x3 Tablet, 1x6 Mobile Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {/* Card 1: Cyan / Blue */}
            <TiltCard3D
              accent="cyan"
              badge="Intelligence"
              icon={<Clock className="w-7 h-7" />}
              title="Workload Conflict Detection"
              description="Continuous analysis across projects, tasks, and calendar events to highlight crunch zones before deadlines collide."
              action={
                <span className="text-xs font-bold text-cyan-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>View conflict analysis</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 2: Violet / Purple */}
            <TiltCard3D
              accent="violet"
              badge="Autonomy"
              icon={<Brain className="w-7 h-7" />}
              title="Proactive AI Recovery Plans"
              description="Automated rescheduling suggestions and mitigation paths when tasks fall behind or schedules become congested."
              action={
                <span className="text-xs font-bold text-violet-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Generate recovery plans</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 3: Pink / Magenta */}
            <TiltCard3D
              accent="pink"
              badge="Knowledge"
              icon={<Database className="w-7 h-7" />}
              title="Personal Memory & Document RAG"
              description="Upload PDF specifications, notes, and research. Query them with semantic vector retrieval powered by Gemini."
              action={
                <span className="text-xs font-bold text-pink-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Explore memory store</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 4: Teal / Emerald */}
            <TiltCard3D
              accent="teal"
              badge="Native"
              icon={<Bell className="w-7 h-7" />}
              title="Native Windows Desktop Agent"
              description="Runs in your Windows tray and delivers proactive desktop notifications even when your browser is closed."
              action={
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Connect desktop daemon</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 5: Orange / Coral */}
            <TiltCard3D
              accent="orange"
              badge="Architecture"
              icon={<Layers className="w-7 h-7" />}
              title="Architectural Decision Records"
              description="Capture the 'why' behind architectural choices with structured ADRs linked directly to project roadmaps and goals."
              action={
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Log architecture records</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />

            {/* Card 6: Indigo / Blue */}
            <TiltCard3D
              accent="indigo"
              badge="Security"
              icon={<Shield className="w-7 h-7" />}
              title="Self-Sovereign Privacy & Security"
              description="No keystroke logging, no screen capturing, and no intrusive monitoring. Your data remains strictly in your control."
              action={
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 group-hover:gap-2 transition-all">
                  <span>Review security guarantees</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              }
            />
          </div>
        </div>
      </main>

      {/* Modern Light Footer */}
      <footer className="relative z-10 px-6 py-8 border-t border-slate-200 bg-white/70 text-center text-xs text-slate-500 font-medium">
        NEXUS © 2026. Built with React, TypeScript, Node.js, and MongoDB.
      </footer>
    </div>
  );
};
