import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Truck, ArrowRight, Chrome, Github, Sparkles } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';

interface LoginPageProps {
  onNavigate: (screen: AppScreen) => void;
  onLoginSuccess: (businessName: string, email: string, accountType: 'Merchant' | 'Startup' | 'Developer') => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function LoginPage({ onNavigate, onLoginSuccess, onShowToast }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please provide a valid email';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    // Simulate login timeout for high premium feel
    setTimeout(() => {
      setLoading(false);
      // Determine simulated details based on client input
      const parts = email.split('@');
      const merchantName = parts[0] ? parts[0].charAt(0).toUpperCase() + parts[0].slice(1) + ' Inc' : 'Delta Commerce';
      onLoginSuccess(merchantName, email, 'Merchant');
    }, 900);
  };

  const handleOAuthLogin = (provider: 'Google' | 'GitHub') => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess('Global Tech Ventures', `developer@${provider.toLowerCase()}.com`, 'Startup / Developer' as any);
    }, 750);
  };

  return (
    <div id="login-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center md:grid md:grid-cols-12 overflow-hidden selection:bg-blue-500 selection:text-white">
      {/* LEFT SIDE: Clean branding illustration */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Glow dots overlays */}
        <div className="absolute -top-16 -left-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }} className="inline-block">
            <BrandLogo size="lg" className="brightness-200" />
          </a>
        </div>

        {/* Dynamic Vector Illustration Container */}
        <div className="relative my-auto py-12 z-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h2 className="text-3xl font-extrabold font-display leading-snug tracking-tight text-white mb-4">
              Deliver tracking experiences your customers love.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sendie provides modern delivery tracking and management infrastructure for businesses of any size.
            </p>
          </motion.div>

          {/* S-logo delivery truck mockup vector */}
          <div className="mt-8 relative h-48 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-center overflow-hidden">
            <div className="absolute top-3 right-3 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Live Dispatch
            </div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-16 w-16 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl flex items-center justify-center">
                <Truck className="h-9 w-9" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">ORDER DEPLOYED</p>
                <p className="text-base font-bold text-white mt-1">TRK-9831A En Route</p>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div className="bg-blue-500 h-full w-2/3 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Simulated city skyline wireframe graphic */}
            <div className="absolute bottom-0 inset-x-0 h-10 opacity-15 border-t border-slate-700">
              <div className="flex items-end justify-around h-full px-4">
                <span className="w-5 h-8 bg-white rounded-t"></span>
                <span className="w-7 h-5 bg-white rounded-t"></span>
                <span className="w-4 h-9 bg-white rounded-t"></span>
                <span className="w-8 h-4 bg-white rounded-t"></span>
                <span className="w-6 h-7 bg-white rounded-t"></span>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {[
              { text: 'Create & manage orders', desc: 'Create orders in seconds and share tracking links.' },
              { text: 'Real-time tracking', desc: 'Keep your customers updated in real time.' },
              { text: 'Powerful APIs', desc: 'Integrate our APIs and build seamlessly.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-5 w-5 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">✓</div>
                <div>
                  <p className="text-xs font-bold text-white">{f.text}</p>
                  <p className="text-[11px] text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5 text-center lg:text-left text-xs text-slate-500">
          © 2026 Sendie. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login form */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 min-h-screen bg-slate-50 relative">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-double rounded-2xl p-8">
          <div className="text-center lg:text-left mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
                <BrandLogo size="md" />
              </a>
            </div>
            <h1 className="text-2xl font-extrabold font-display text-slate-900">Welcome back</h1>
            <p className="text-xs text-slate-500 mt-1.5">Sign in to your Sendie account</p>
          </div>

          <form id="login-form" onSubmit={handleLogin} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full bg-white border rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
                <a href="#" onClick={(e) => { e.preventDefault(); if (onShowToast) { onShowToast('Demo status: Please use password "password123" to sign in.', 'info'); } else { alert('Demo status: Please use password "password123" to sign in.'); } }} className="text-xs text-blue-600 hover:underline font-semibold">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={`w-full bg-white border rounded-lg py-2.5 pl-10 pr-10 text-sm text-slate-900 focus:outline-none focus:ring-2 ${errors.password ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.password}</p>}
            </div>

            {/* Remember me checkbox */}
            <div className="flex items-center">
              <input
                id="remember_me"
                name="remember_me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="remember_me" className="ml-2 block text-xs text-slate-600 font-semibold select-none cursor-pointer">
                Remember my secure environment keys
              </label>
            </div>

            {/* Login CTA */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className={`cursor-pointer w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-sm tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-85 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Social and OAuth Divider */}
          <div className="relative my-7">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs text-slate-400 font-bold uppercase tracking-wider">
              <span className="bg-white px-3">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleOAuthLogin('Google')}
              disabled={loading}
              className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-4 font-semibold text-xs text-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Chrome className="h-4 w-4 text-red-500" />
              Google
            </button>
            <button 
              onClick={() => handleOAuthLogin('GitHub')}
              disabled={loading}
              className="cursor-pointer bg-white hover:bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-4 font-semibold text-xs text-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <Github className="h-4 w-4 text-slate-800" />
              GitHub
            </button>
          </div>

          {/* Prompt to register */}
          <div className="mt-8 text-center text-xs">
            <span className="text-slate-500">Don't have an account? </span>
            <button 
              onClick={() => onNavigate('signup')} 
              className="text-blue-600 hover:underline font-bold"
            >
              Sign up
            </button>
          </div>
        </div>

        {/* Mock guide footer for validation */}
        <div className="mt-6 max-w-sm text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
            🚀 <strong>Instant testing:</strong> Just write standard credentials (e.g. <code>merchant@gmail.com</code> &amp; password <code>password123</code>) or click Google/Github to auto-sign in.
          </p>
        </div>
      </div>
    </div>
  );
}
