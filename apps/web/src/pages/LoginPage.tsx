import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, ArrowRight } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard.js';
import { GlassInput } from '../components/ui/GlassInput.js';
import { GlassButton } from '../components/ui/GlassButton.js';
import { NexusLogo } from '../components/ui/NexusLogo.js';
import { useAuthStore } from '../stores/authStore.js';
import api from '../services/api.js';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('demo@nexus.app');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, accessToken, refreshToken } = res.data.data;
      login(user, accessToken, refreshToken);

      if (!user.onboardingComplete) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@nexus.app');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-nexus-950 text-slate-100 ambient-glow-mesh flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <NexusLogo size="xl" />
          <p className="text-xs text-slate-400">
            Sign in to your account
          </p>
        </div>

        {/* Demo Fast Login Callout */}
        <div
          onClick={handleDemoFill}
          className="p-3.5 rounded-2xl bg-accent-violet/10 border border-accent-violet/30 flex items-center justify-between cursor-pointer hover:bg-accent-violet/15 transition-all text-xs"
        >
          <div className="flex items-center gap-2 text-accent-violet font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>Use Pre-loaded Demo Account (Flagship Scenario)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-accent-violet" />
        </div>

        {/* Form Card */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-accent-rose/10 border border-accent-rose/20 text-accent-rose text-xs font-medium">
                {error}
              </div>
            )}

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
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              required
            />

            <GlassButton
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              icon={<LogIn className="w-4 h-4" />}
            >
              Sign In
            </GlassButton>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-white/10">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-violet font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
