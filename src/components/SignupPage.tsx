import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Building, Eye, EyeOff, Sparkles, Server, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';
import { api, storeToken } from '../lib/sendieApi';
import { getRoleMeta } from './workspaceTheme';

interface SignupPageProps {
  onNavigate: (screen: AppScreen) => void;
  onSignupSuccess: (businessName: string, email: string, accountType: 'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin') => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function SignupPage({ onNavigate, onSignupSuccess, onShowToast }: SignupPageProps) {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'Merchant' | 'Developer/Startup' | 'Logistics Company' | 'Admin'>('Merchant');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ businessName?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: { businessName?: string; email?: string; password?: string } = {};

    if (!businessName.trim()) {
      nextErrors.businessName = 'Business or developer name is required';
    }
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
      const result = await api.auth.signup({
        businessName,
        email,
        password,
        accountType,
      });
      storeToken(result.token);
      onSignupSuccess(result.user.businessName, result.user.email, result.user.accountType);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account';
      setErrors({ email: message });
      onShowToast?.(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const roleCards = [
    {
      type: 'Merchant' as const,
      icon: <ShoppingBag className="h-4.5 w-4.5" />,
      title: 'Merchant',
      desc: 'Sell, ship, and manage customer orders.',
    },
    {
      type: 'Developer/Startup' as const,
      icon: <Server className="h-4.5 w-4.5" />,
      title: 'Developer',
      desc: 'Connect storefronts and integrate APIs.',
    },
    {
      type: 'Logistics Company' as const,
      icon: <Truck className="h-4.5 w-4.5" />,
      title: 'Logistics',
      desc: 'Dispatch teams, proof, and delivery visibility.',
    },
  ];

  return (
    <div id="signup-page-root" className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_35%),#f8fafc] flex items-stretch">
      <div className="hidden lg:flex lg:w-[46%] relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_40%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))]" />
        <div className="relative z-10 flex w-full flex-col justify-between p-10">
          <div className="space-y-10">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="inline-flex">
              <BrandLogo size="lg" className="brightness-200" />
            </a>

            <div className="max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                <span>One workspace, every role</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-display font-extrabold tracking-tight leading-tight">
                Start with a polished role-specific experience.
              </h1>
              <p className="max-w-lg text-sm leading-relaxed text-slate-300">
                Merchants move faster, developers integrate cleaner, and logistics teams keep the environment controlled for testing.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {(['Merchant', 'Developer/Startup', 'Logistics Company'] as const).map((type) => {
              const role = getRoleMeta(type);
              return (
                <div key={type} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl ${role.softAccent}`}>
                      {type === 'Merchant' ? <ShoppingBag className="h-4 w-4" /> : type === 'Developer/Startup' ? <Server className="h-4 w-4" /> : <Truck className="h-4 w-4" />}
                    </div>
                  <div>
                    <p className="text-sm font-bold">{role.shortTitle}</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{role.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400">Fast setup, clean UI, and full API connectivity from day one.</p>
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
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Get started</p>
              <h2 className="mt-2 text-3xl font-display font-extrabold tracking-tight text-slate-950">Create your Sendie account</h2>
              <p className="mt-2 text-sm text-slate-500">Choose your role and we’ll shape the workspace around it.</p>
            </div>

            <form id="signup-form" onSubmit={handleSignup} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Select your role</label>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roleCards.map((card) => {
                    const role = getRoleMeta(card.type);
                    const selected = accountType === card.type;
                    return (
                      <button
                        key={card.type}
                        type="button"
                        onClick={() => setAccountType(card.type)}
                        className={`rounded-2xl border p-4 text-left transition-all ${
                          selected ? `border-blue-300 bg-blue-50 shadow-sm ${role.borderAccent}` : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${selected ? role.softAccent : 'bg-slate-100 text-slate-500'}`}>
                            {card.icon}
                          </span>
                          <span className={`h-3 w-3 rounded-full border ${selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`} />
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-950">{card.title}</p>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{card.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Business name / company name</label>
                <div className="relative">
                  <Building className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-business-input"
                    type="text"
                    value={businessName}
                    onChange={(event) => setBusinessName(event.target.value)}
                    placeholder="e.g. Acme Express Logistics"
                    className={`w-full rounded-2xl border bg-slate-50 px-10 py-3 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${
                      errors.businessName ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.businessName && <p className="text-[11px] font-semibold text-rose-600">{errors.businessName}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Email address</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-email-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@company.com"
                    className={`w-full rounded-2xl border bg-slate-50 px-10 py-3 text-sm text-slate-950 outline-none transition focus:bg-white focus:ring-4 ${
                      errors.email ? 'border-rose-300 focus:ring-rose-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-[11px] font-semibold text-rose-600">{errors.email}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Password</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="signup-password-input"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 6 characters"
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
                id="signup-submit-btn"
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 ${
                  loading ? 'cursor-not-allowed opacity-80' : ''
                }`}
              >
                {loading ? 'Setting up your account...' : 'Create account'}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <button onClick={() => onNavigate('login')} className="font-bold text-blue-600 hover:underline">
                Sign in
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
