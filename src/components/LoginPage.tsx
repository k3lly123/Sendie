import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Truck, Terminal, Anchor } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';
import { api, storeToken } from '../lib/sendieApi';
import { getRoleMeta } from './workspaceTheme';

interface LoginPageProps {
  onNavigate: (screen: AppScreen) => void;
  onLoginSuccess: (businessName: string, email: string, accountType: 'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin') => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess, onShowToast }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};

    if (!email) {
      nextErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Please provide a valid email';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const result = await api.auth.login(email, password);
      storeToken(result.token);
      onLoginSuccess(result.user.businessName, result.user.email, result.user.accountType);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in';
      setErrors({ password: message });
      onShowToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    onShowToast?.('Password recovery is not wired yet. Use your existing account credentials for now.', 'info');
  };

  const loginHighlights = [
    { icon: <Truck className="h-4 w-4" />, label: 'Merchant flow', text: 'Create deliveries and share clean tracking links.' },
    { icon: <Terminal className="h-4 w-4" />, label: 'Developer flow', text: 'Generate API keys and validate webhook wiring.' },
    { icon: <Anchor className="h-4 w-4" />, label: 'Logistics flow', text: 'Manage dispatch, delivery visibility, and proof capture.' },
  ];

  return (
    <div id="login-page-root" className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_35%),#f8fafc] flex items-stretch">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.25),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))]" />
        <div className="relative z-10 flex w-full flex-col justify-between p-10">
          <div className="space-y-10">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="inline-flex">
              <BrandLogo size="lg" className="brightness-200" />
            </a>

            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Premium workspace sign in</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-display font-extrabold tracking-tight leading-tight">
                A single login for every Sendie role.
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-slate-300">
                Merchants can ship fast, developers can integrate quickly, and logistics teams can keep the workspace clean and controlled.
              </p>
            </div>
          </div>

          <div className="grid gap-3">
            {loginHighlights.map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-slate-950">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-400">Built for calm, premium operations and fast flow testing.</p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-5 md:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-xl"
        >
          <div className="mx-auto w-full rounded-[28px] border border-slate-200 bg-white/95 p-6 md:p-8 shadow-[0_25px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-8">
              <div className="lg:hidden mb-6 flex justify-center">
                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
                  <BrandLogo size="md" />
                </a>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Welcome back</p>
              <h2 className="mt-2 text-3xl font-display font-extrabold tracking-tight text-slate-950">Sign in to your workspace</h2>
              <p className="mt-2 text-sm text-slate-500">Pick up where you left off and continue the role-specific flow.</p>
            </div>

            <form id="login-form" onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-email-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-2xl border bg-slate-50 px-10 py-3 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${
                      errors.email ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] font-semibold text-rose-600">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Password</label>
                  <button type="button" onClick={handleForgotPassword} className="text-xs font-bold text-blue-600 hover:underline">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Password"
                    className={`w-full rounded-2xl border bg-slate-50 px-10 py-3 pr-10 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${
                      errors.password ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-[11px] font-semibold text-rose-600">{errors.password}</p>}
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 ${
                  loading ? 'cursor-not-allowed opacity-80' : ''
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Role support</p>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                {(['Merchant', 'Developer/Startup', 'Logistics Company'] as const).map((accountType) => {
                  const role = getRoleMeta(accountType);
                  return (
                    <div key={accountType} className="rounded-2xl border border-white bg-white p-3">
                      <p className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${role.softAccent}`}>{role.shortTitle}</p>
                      <p className="mt-2 text-xs font-semibold text-slate-900">{role.title}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-500">
              Need an account?{' '}
              <button onClick={() => onNavigate('signup')} className="font-bold text-blue-600 hover:underline">
                Create one
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
