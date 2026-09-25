import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Laptop, Shield, Download, Trash2, Check, Key } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { GlassInput } from '../components/ui/GlassInput.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'desktop' | 'privacy'>('profile');

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [profileType, setProfileType] = useState(user?.profileType || 'developer');
  const [timezone, setTimezone] = useState(user?.timezone || 'UTC');
  const [startHour, setStartHour] = useState(user?.workingHours?.start || '09:00');
  const [endHour, setEndHour] = useState(user?.workingHours?.end || '18:00');
  const [desktopNotifs, setDesktopNotifs] = useState(user?.preferences?.desktopNotifications ?? true);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(user?.preferences?.quietHours?.enabled ?? false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setProfileType(user.profileType);
      setTimezone(user.timezone);
      setStartHour(user.workingHours?.start || '09:00');
      setEndHour(user.workingHours?.end || '18:00');
      setDesktopNotifs(user.preferences?.desktopNotifications ?? true);
      setQuietHoursEnabled(user.preferences?.quietHours?.enabled ?? false);
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSaveMessage('');
    try {
      const res = await api.put('/users/profile', {
        name,
        profileType,
        timezone,
        workingHours: { start: startHour, end: endHour, days: [1, 2, 3, 4, 5] },
        preferences: {
          ...user?.preferences,
          desktopNotifications: desktopNotifs,
          quietHours: { enabled: quietHoursEnabled, start: '22:00', end: '08:00' },
        },
      });
      updateUser(res.data.data.user);
      setSaveMessage('Profile and settings updated successfully.');
    } catch (err: any) {
      setSaveMessage(err.response?.data?.error?.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const res = await api.get('/users/export');
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.data.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `nexus_personal_data_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account and all associated personal data? This action is irreversible.')) {
      try {
        await api.delete('/users/account');
        await logout();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-100 flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-accent-violet" />
          <span>System & Account Settings</span>
        </h2>
        <p className="text-xs text-slate-400">
          Manage your personal profile, notification preferences, Desktop Agent, and privacy controls
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile & Work Hours', icon: <User className="w-4 h-4" /> },
          { id: 'notifications', label: 'Notification Rules', icon: <Bell className="w-4 h-4" /> },
          { id: 'desktop', label: 'Desktop Agent Status', icon: <Laptop className="w-4 h-4" /> },
          { id: 'privacy', label: 'Privacy & Data Export', icon: <Shield className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-accent-violet text-white shadow-md shadow-accent-violet/30'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {saveMessage && (
        <div className="p-3.5 rounded-xl bg-accent-emerald/15 border border-accent-emerald/30 text-accent-emerald text-xs font-medium flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Tab: Profile */}
      {activeTab === 'profile' && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <GlassInput
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-300">Profile Type</label>
              <select
                value={profileType}
                onChange={(e) => setProfileType(e.target.value)}
                className="w-full rounded-xl bg-nexus-900/60 border border-white/10 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-accent-violet/50"
              >
                <option value="developer">Developer / Engineer</option>
                <option value="student">Student / Researcher</option>
                <option value="employee">Corporate Professional</option>
                <option value="entrepreneur">Entrepreneur / Founder</option>
                <option value="freelancer">Freelancer / Consultant</option>
                <option value="general">General</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <GlassInput
                label="Daily Start Time"
                type="time"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
              />
              <GlassInput
                label="Daily Wrap-up Time"
                type="time"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
              />
            </div>

            <GlassInput
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />

            <div className="flex justify-end pt-4">
              <GlassButton type="submit" isLoading={isLoading}>
                Save Profile Changes
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      )}

      {/* Tab: Notifications */}
      {activeTab === 'notifications' && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-2xl bg-nexus-900/60 border border-white/10 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-100 block">Desktop Agent Native Notifications</span>
                <span className="text-[11px] text-slate-400 block">Deliver deadline and conflict alerts directly to Windows tray and OS popup</span>
              </div>
              <input
                type="checkbox"
                checked={desktopNotifs}
                onChange={(e) => setDesktopNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-accent-violet"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-2xl bg-nexus-900/60 border border-white/10 cursor-pointer">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-100 block">Quiet Hours (22:00 - 08:00)</span>
                <span className="text-[11px] text-slate-400 block">Suppress non-critical notifications during rest hours</span>
              </div>
              <input
                type="checkbox"
                checked={quietHoursEnabled}
                onChange={(e) => setQuietHoursEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-accent-violet"
              />
            </label>

            <div className="flex justify-end pt-4">
              <GlassButton onClick={handleSaveProfile} isLoading={isLoading}>
                Update Notification Rules
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab: Desktop Agent */}
      {activeTab === 'desktop' && (
        <GlassCard className="p-6 sm:p-8 space-y-6" glow="cyan">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-100">NEXUS Desktop Companion Agent</h3>
                <span className="text-xs text-accent-emerald font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                  Electron Agent Gateway Active
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              The Desktop Agent runs quietly in your Windows system tray. It receives real-time WebSocket signals and raises native Windows toast notifications when workload conflicts or upcoming project deadlines are detected—even if this website is closed.
            </p>

            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs text-slate-300 font-mono">
              <span className="text-accent-cyan block font-bold">To launch desktop agent locally:</span>
              <p className="text-slate-400">npm run dev:desktop</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Tab: Privacy & Data Export */}
      {activeTab === 'privacy' && (
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-100">Export Your Personal Data</h3>
              <p className="text-xs text-slate-400">
                Download a complete, structured JSON archive of all your tasks, goals, projects, calendar events, notes, and decisions.
              </p>
              <GlassButton
                variant="secondary"
                size="sm"
                onClick={handleExportData}
                icon={<Download className="w-4 h-4" />}
              >
                Download JSON Export Archive
              </GlassButton>
            </div>

            <div className="pt-6 border-t border-accent-rose/20 space-y-3">
              <h3 className="text-sm font-bold text-accent-rose">Danger Zone: Delete Account</h3>
              <p className="text-xs text-slate-400">
                Permanently purge your account, database records, and indexed personal memory documents. This cannot be undone.
              </p>
              <GlassButton
                variant="danger"
                size="sm"
                onClick={handleDeleteAccount}
                icon={<Trash2 className="w-4 h-4" />}
              >
                Permanently Delete Account
              </GlassButton>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
