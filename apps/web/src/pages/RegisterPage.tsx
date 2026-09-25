import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Lock, UserPlus } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassInput } from '../components/ui/GlassInput.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { NexusLogo } from '../components/ui/NexusLogo.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState('developer');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password, profileType });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-nexus-950 text-slate-100 ambient-glow-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <NexusLogo size="xl" />
          <p className="text-xs text-slate-400">
            Create your account
          </p>
        </div>

        <GlassCard className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-medium">
                {error}
              </div>
            )}

            <GlassInput
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex Mercer"
              icon={<UserIcon className="w-4 h-4" />}
              required
            />

            <GlassInput
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <GlassInput
              label="Password (min. 6 characters)"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
              minLength={6}
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
                <option value="general">General / Other</option>
              </select>
            </div>

            <GlassButton
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Create Account
            </GlassButton>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
            Already have an account?{' '}
            <Link to="/login" className="text-accent-violet font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
