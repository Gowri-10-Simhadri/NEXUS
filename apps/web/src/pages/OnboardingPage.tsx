import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Clock, Bell, Target, ArrowRight, Check } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassInput } from '../components/ui/GlassInput.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [profileType, setProfileType] = useState('developer');
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('18:00');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
  const [desktopNotifs, setDesktopNotifs] = useState(true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [goalTitle, setGoalTitle] = useState('Master Full-Stack AI & Cloud Systems');
  const [isLoading, setIsLoading] = useState(false);

  const { updateUser } = useAuthStore();
  const navigate = useNavigate();

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/users/onboarding', {
        profileType,
        timezone,
        workingHours: { start: startHour, end: endHour, days: [1, 2, 3, 4, 5] },
        preferences: {
          desktopNotifications: desktopNotifs,
          quietHours: { enabled: quietHoursEnabled, start: '22:00', end: '08:00' },
        },
        initialGoals: goalTitle ? [{ title: goalTitle, category: 'Main' }] : [],
      });
      updateUser(res.data.data.user);
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-nexus-950 text-slate-900 dark:text-slate-100 ambient-glow-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-xl space-y-6">
        {/* Progress Bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Step {step} of 3</span>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-1.5 w-8 rounded-full transition-all ${
                  step >= i ? 'bg-violet-600' : 'bg-slate-200 dark:bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        <GlassCard className="p-6 sm:p-10 space-y-6 bg-white/90 dark:bg-nexus-900/60 border border-slate-200/80 dark:border-white/10 shadow-lg">
          {/* STEP 1: Profile & Timezone */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Personalization</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">What best describes your role?</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  NEXUS customizes prioritization heuristics according to your workflow pattern.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: 'developer', label: 'Developer / Engineer' },
                  { id: 'student', label: 'Student / Researcher' },
                  { id: 'employee', label: 'Corporate Professional' },
                  { id: 'entrepreneur', label: 'Founder / Startup' },
                  { id: 'freelancer', label: 'Freelancer / Consultant' },
                  { id: 'general', label: 'General Productive' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProfileType(item.id)}
                    className={`p-3.5 rounded-2xl border text-xs font-medium text-left transition-all ${
                      profileType === item.id
                        ? 'border-violet-600 bg-violet-50 dark:bg-violet-500/20 text-violet-950 dark:text-white shadow-md shadow-violet-500/20 font-bold'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-nexus-900/50 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <GlassInput
                label="Your Timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. America/New_York or Asia/Kolkata"
              />

              <div className="flex justify-end pt-4">
                <GlassButton onClick={() => setStep(2)} icon={<ArrowRight className="w-4 h-4" />}>
                  Continue
                </GlassButton>
              </div>
            </div>
          )}

          {/* STEP 2: Working Hours & Notifications */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400">
                  <Clock className="w-4 h-4" />
                  <span>Working Hours & Proactivity</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">When do you do your best work?</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  NEXUS schedules focus time blocks and delivers smart reminders during your active hours.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <GlassInput
                  label="Day Start (Focus Begins)"
                  type="time"
                  value={startHour}
                  onChange={(e) => setStartHour(e.target.value)}
                />
                <GlassInput
                  label="Day End (Wrap Up)"
                  type="time"
                  value={endHour}
                  onChange={(e) => setEndHour(e.target.value)}
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-nexus-900/60 border border-slate-200 dark:border-white/10 space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-200 block">
                      Enable Desktop Agent Notifications
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400 block">
                      Receive proactive deadline warnings directly in Windows.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={desktopNotifs}
                    onChange={(e) => setDesktopNotifs(e.target.checked)}
                    className="w-4 h-4 text-violet-600 rounded bg-white dark:bg-nexus-950 border-slate-300 dark:border-white/20"
                  />
                </label>
              </div>

              <div className="flex justify-between pt-4">
                <GlassButton variant="ghost" onClick={() => setStep(1)}>
                  Back
                </GlassButton>
                <GlassButton onClick={() => setStep(3)} icon={<ArrowRight className="w-4 h-4" />}>
                  Continue
                </GlassButton>
              </div>
            </div>
          )}

          {/* STEP 3: Initial Goal */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <Target className="w-4 h-4" />
                  <span>Your North Star</span>
                </div>
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-slate-100">What is your primary milestone right now?</h2>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  You can break this down into actionable projects and tasks inside NEXUS.
                </p>
              </div>

              <GlassInput
                label="Primary Goal Title"
                value={goalTitle}
                onChange={(e) => setGoalTitle(e.target.value)}
                placeholder="e.g. Master Full-Stack AI & Cloud Systems"
              />

              <div className="p-4 rounded-2xl bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                <span className="font-bold text-violet-800 dark:text-violet-300 block">You're ready to launch!</span>
                <p>NEXUS will initialize your dashboard and start monitoring upcoming deadlines.</p>
              </div>

              <div className="flex justify-between pt-4">
                <GlassButton variant="ghost" onClick={() => setStep(2)}>
                  Back
                </GlassButton>
                <GlassButton
                  onClick={handleFinish}
                  size="lg"
                  isLoading={isLoading}
                  icon={<Check className="w-4 h-4" />}
                >
                  Enter NEXUS Dashboard
                </GlassButton>
              </div>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
