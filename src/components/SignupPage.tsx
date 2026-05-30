import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Building, Eye, EyeOff, ShieldCheck, HeartHandshake, Sparkles, Server, ShoppingBag } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';

interface SignupPageProps {
  onNavigate: (screen: AppScreen) => void;
  onSignupSuccess: (businessName: string, email: string, accountType: 'Merchant' | 'Startup' | 'Developer') => void;
}

export default function SignupPage({ onNavigate, onSignupSuccess }: SignupPageProps) {
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'Merchant' | 'Startup' | 'Developer'>('Merchant');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ businessName?: string; email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { businessName?: string; email?: string; password?: string } = {};

    if (!businessName.trim()) {
      newErrors.businessName = 'Business or developer name is required';
    }
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

    // Simulate server response timeout
    setTimeout(() => {
      setLoading(false);
      onSignupSuccess(businessName, email, accountType);
    }, 1000);
  };

  return (
    <div id="signup-page-root" className="min-h-screen bg-slate-50 flex flex-col justify-center md:grid md:grid-cols-12 overflow-hidden selection:bg-blue-500 selection:text-white">
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
              Get sandbox keys &amp; start dispatching orders instantly.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Join thousands of fast-growing startups and retail merchants powering deliveries with the Sendie logistics mesh.
            </p>
          </motion.div>

          {/* Quick service features badge */}
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden">
            <div className="flex items-center gap-3.5 mb-4 border-b border-slate-700/50 pb-3">
              <div className="h-10 w-10 bg-brand-500/20 text-brand-500, border border-brand-500/30 rounded-lg flex items-center justify-center">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Merchant &amp; Developer Ready</p>
                <span className="text-[10px] text-slate-400">Universal API endpoints matching every platform</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-ping"></span>
                <span>Instant dispatch triggers</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                <span>Automatic route optimization protocols</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-300"></span>
                <span>99.9% notification webhook deliveries</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-5 text-xs text-slate-500 text-center lg:text-left">
          By signing up, you agree to our Service agreements, SLA policies, and secure API compliance checks.
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Signup form */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center p-6 md:p-12 min-h-screen bg-slate-50 relative">
        <div className="w-full max-w-md bg-white border border-slate-200 shadow-double rounded-2xl p-8">
          <div className="text-center lg:text-left mb-6">
            <div className="lg:hidden flex justify-center mb-6">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
                <BrandLogo size="md" />
              </a>
            </div>
            <h1 className="text-2xl font-extrabold font-display text-slate-900">Create your account</h1>
            <p className="text-xs text-slate-500 mt-1.5">No immediate credit card required</p>
          </div>

          <form id="signup-form" onSubmit={handleSignup} className="space-y-4">
            {/* Account Type Selector cards */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Account Type</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setAccountType('Merchant')}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${accountType === 'Merchant' ? 'border-blue-600 bg-blue-50/20 text-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <ShoppingBag className={`h-4.5 w-4.5 ${accountType === 'Merchant' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="radio"
                      name="actype"
                      checked={accountType === 'Merchant'}
                      onChange={() => setAccountType('Merchant')}
                      className="h-3 w-3 text-blue-600"
                    />
                  </div>
                  <p className="text-xs font-bold mt-2 font-display leading-none text-slate-900">Merchant</p>
                  <p className="text-[10px] text-slate-400 mt-1">Manage deliveries</p>
                </div>

                <div
                  onClick={() => setAccountType('Startup / Developer' as any)}
                  className={`border rounded-xl p-3 cursor-pointer transition-all ${accountType === 'Startup / Developer' as any ? 'border-blue-600 bg-blue-50/20 text-slate-900 shadow-sm' : 'border-slate-200 hover:border-slate-300 text-slate-500 bg-white'}`}
                >
                  <div className="flex items-center justify-between">
                    <Server className={`h-4.5 w-4.5 ${accountType === 'Startup / Developer' as any ? 'text-blue-600' : 'text-slate-400'}`} />
                    <input
                      type="radio"
                      name="actype"
                      checked={accountType === 'Startup / Developer' as any}
                      onChange={() => setAccountType('Startup / Developer' as any)}
                      className="h-3 w-3 text-blue-600"
                    />
                  </div>
                  <p className="text-xs font-bold mt-2 font-display leading-none text-slate-900">Startup / Dev</p>
                  <p className="text-[10px] text-slate-400 mt-1">Integrate APIs</p>
                </div>
              </div>
            </div>

            {/* Business Name field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Business Name / Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Building className="h-4 w-4" />
                </span>
                <input
                  id="signup-business-input"
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Acme Express Logistics"
                  className={`w-full bg-white border rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 ${errors.businessName ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
              </div>
              {errors.businessName && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.businessName}</p>}
            </div>

            {/* Email field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="signup-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={`w-full bg-white border rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'}`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-500 font-semibold mt-0.5">{errors.email}</p>}
            </div>

            {/* Password field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="signup-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="minimum 6 characters"
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

            {/* Submit CTA */}
            <button
              id="signup-submit-btn"
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
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>

          {/* Quick toggle link */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <button 
              onClick={() => onNavigate('login')} 
              className="text-blue-600 hover:underline font-bold"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
