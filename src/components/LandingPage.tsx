import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  Copy,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Sparkles,
  Terminal,
  Truck,
  Users,
  Zap,
  CreditCard,
  PhoneCall,
  Globe2,
  BadgeCheck,
  BrainCircuit,
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';

interface LandingPageProps {
  onNavigate: (screen: AppScreen) => void;
  onSelectTrackId: (id: string) => void;
}

const featureCards = [
  {
    title: 'Create Orders',
    short: 'Fast setup',
    description: 'Create and manage delivery orders effortlessly.',
    icon: <Truck className="h-5 w-5" />,
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Track Deliveries',
    short: 'Real-time updates',
    description: 'Give customers a clear live tracking experience.',
    icon: <MapPin className="h-5 w-5" />,
    accent: 'from-indigo-500 to-violet-500',
  },
  {
    title: 'Manage Customers',
    short: 'Order history',
    description: 'Store customer information and order history.',
    icon: <Users className="h-5 w-5" />,
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Integrate API',
    short: 'Developer ready',
    description: 'Power your app with our robust delivery API.',
    icon: <Terminal className="h-5 w-5" />,
    accent: 'from-amber-500 to-orange-500',
  },
] as const;

const pricingCards = [
  {
    name: 'Sandbox',
    price: 'Free',
    description: 'For developers testing one integration and one webhook stream.',
    bullets: ['1 API key', 'Docs access', 'Free browser alerts'],
  },
  {
    name: 'Build',
    price: '₦12k',
    description: 'For teams shipping a live integration into their workflow.',
    bullets: ['5 API keys', 'Webhook access', 'Plan-based limits'],
  },
  {
    name: 'Dispatch',
    price: '₦45k',
    description: 'For logistics companies that need operations and proof visibility.',
    bullets: ['Dispatch console', 'Proof capture', 'Higher request caps'],
  },
] as const;

export default function LandingPage({ onNavigate, onSelectTrackId }: LandingPageProps) {
  const [activeCodeTab, setActiveCodeTab] = useState<'nodejs' | 'curl' | 'python'>('nodejs');
  const [copied, setCopied] = useState(false);

  const codeSnippets = useMemo(() => ({
    nodejs: `const response = await fetch('/api/public/v1/deliveries', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'YOUR_API_KEY',
  },
  body: JSON.stringify({
    customer_name: 'Adewale Bashir',
    customer_phone: '+234 803 111 2222',
    pickup_location: 'Ikeja Hub, Lagos',
    delivery_location: 'Victoria Island, Lagos',
    item_description: 'Air Jordan 1 Retro',
  }),
});

const data = await response.json();
console.log(data);`,
    curl: `curl -X POST /api/public/v1/deliveries \\
  -H "X-API-Key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Adewale Bashir",
    "customer_phone": "+234 803 111 2222",
    "pickup_location": "Ikeja Hub, Lagos",
    "delivery_location": "Victoria Island, Lagos",
    "item_description": "Air Jordan 1 Retro"
  }'`,
    python: `import requests

response = requests.post(
    "https://your-domain.example/api/public/v1/deliveries",
    headers={"X-API-Key": "YOUR_API_KEY"},
    json={
        "customer_name": "Adewale Bashir",
        "customer_phone": "+234 803 111 2222",
        "pickup_location": "Ikeja Hub, Lagos",
        "delivery_location": "Victoria Island, Lagos",
        "item_description": "Air Jordan 1 Retro",
    },
)
print(response.json())`,
  }), []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_35%),#f8fafc] text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate('landing')} className="transition-transform hover:scale-[1.01]">
              <BrandLogo size="md" />
            </button>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#product" className="hover:text-blue-600 transition-colors">Product</a>
              <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
              <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#api" className="hover:text-blue-600 transition-colors">API</a>
              <a href="#api" className="hover:text-blue-600 transition-colors">Docs</a>
              <a href="#resources" className="hover:text-blue-600 transition-colors">Resources</a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('login')}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              Log in
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition-transform hover:-translate-y-0.5"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        <section className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 py-14 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
          <div className="lg:col-span-5 xl:col-span-5">
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Powering deliveries for modern businesses and startups
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="mt-5 max-w-xl text-4xl font-display font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-[4.2rem] lg:leading-[0.95]"
            >
              Track every delivery.
              <span className="block text-blue-600">Power every business.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.12 }}
              className="mt-6 max-w-xl text-lg leading-8 text-slate-600"
            >
              Sendie helps businesses manage deliveries, keep customers informed, and scale operations with powerful APIs and real-time tracking.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <button
                onClick={() => onNavigate('signup')}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-transform hover:-translate-y-0.5"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Sign in
              </button>
              <a href="#roles" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50">
                Explore roles
              </a>
            </motion.div>

            <div className="mt-10 grid grid-cols-2 gap-3 max-w-xl">
              {[
                { label: 'Real-time Tracking', value: 'Live delivery updates' },
                { label: 'API Integration', value: 'Built for developers' },
                { label: 'Order Management', value: 'Simple merchant ops' },
                { label: 'Delivery Updates', value: 'Customer-facing status' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.1 }} className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.08),transparent_30%)]" />
              <div className="relative border-b border-slate-100 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-mono text-slate-400">sendie-live-console</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    platform live
                  </div>
                </div>
              </div>

              <div className="grid gap-4 px-6 py-6 lg:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-950 p-5 text-white lg:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Today</p>
                      <p className="mt-2 text-3xl font-display font-extrabold">356 deliveries</p>
                    </div>
                    <LayoutDashboard className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      { label: 'Pending', value: '16', tone: 'bg-amber-400/15 text-amber-300' },
                      { label: 'In transit', value: '142', tone: 'bg-blue-400/15 text-blue-300' },
                      { label: 'Delivered', value: '198', tone: 'bg-emerald-400/15 text-emerald-300' },
                    ].map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{metric.label}</p>
                        <p className="mt-2 text-2xl font-display font-extrabold">{metric.value}</p>
                        <span className={`mt-3 inline-flex rounded-full px-2 py-1 text-[10px] font-bold uppercase ${metric.tone}`}>live</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Customer tracking</p>
                  <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] text-slate-400">Tracking ID</p>
                      <p className="mt-1 font-mono text-sm font-bold text-slate-950">TRK-DEMO-001</p>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: 'Pending', done: true },
                        { label: 'Picked Up', done: true },
                        { label: 'In Transit', done: true },
                        { label: 'Delivered', done: false },
                      ].map((step) => (
                        <div key={step.label} className="flex items-center gap-3">
                          {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                          <p className={`text-xs font-semibold ${step.done ? 'text-slate-900' : 'text-slate-500'}`}>{step.label}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => onSelectTrackId('TRK-DEMO-001')}
                      className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline"
                    >
                      Open live tracking demo
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="product" className="border-y border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Everything you need to deliver better</p>
              <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950 sm:text-4xl">One platform. Four clear workflows.</h2>
              <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Sendie keeps the experience calm and premium whether you are creating orders, tracking deliveries, managing customers, or shipping with APIs.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {featureCards.map((feature) => (
                <div key={feature.title} className="group rounded-[28px] border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
                  <div className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.accent} p-3 text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <p className="mt-4 text-lg font-display font-extrabold text-slate-950">{feature.title}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{feature.short}</p>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{feature.description}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-slate-950">
                    Learn more
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Trusted by businesses and startups across Africa</p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-8 text-lg font-extrabold text-slate-300">
                <span>kuda</span>
                <span>zoho</span>
                <span>jumia</span>
                <span>flutterwave</span>
                <span>paystack</span>
                <span>gokada</span>
              </div>
            </div>
          </div>
        </section>

        <section id="solutions" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">How it works</p>
              <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950">A calm flow from signup to delivery.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The product stays simple enough for merchants, powerful enough for developers, and structured enough for logistics teams.
              </p>
            </div>
            <div className="lg:col-span-8 grid gap-4 sm:grid-cols-2">
              {[
                { step: '01', title: 'Choose your role', description: 'Merchant, Developer, or Logistics Company.' },
                { step: '02', title: 'Get the right workspace', description: 'The UI and access rules adapt to the role you picked.' },
                { step: '03', title: 'Start your flow', description: 'Create orders, keys, or dispatch tasks with clear next steps.' },
                { step: '04', title: 'Track and improve', description: 'Use status updates, proof capture, and plan-aware limits.' },
              ].map((item) => (
                <div key={item.step} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{item.step}</p>
                  <p className="mt-3 text-lg font-display font-extrabold text-slate-950">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-300">Africa-ready operations</p>
              <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight sm:text-4xl">Built for the way African teams actually work.</h2>
              <p className="mt-4 text-base leading-7 text-slate-300">
                Landmarks, mobile-first screens, free browser alerts, and low-friction delivery proof make the product easier to run in the real world.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  'Landmark-based drop-offs',
                  'Free browser notifications',
                  'Low-bandwidth UI',
                  'Proof of delivery',
                  'Naira-ready pricing',
                  'Fast support handoff',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 grid gap-4 md:grid-cols-2">
              {[
                { title: 'Merchant clarity', text: 'Create, track, prove, and close deliveries without API noise.', icon: <Truck className="h-5 w-5" /> },
                { title: 'Developer control', text: 'API keys, docs, webhook logs, and pricing tiers stay obvious.', icon: <Code2 className="h-5 w-5" /> },
                { title: 'Logistics visibility', text: 'Dispatch board, proof queue, and GPS-lite status in one place.', icon: <Globe2 className="h-5 w-5" /> },
                { title: 'Delivery health', text: 'Billing, usage, and exception signals stay calm and visible.', icon: <ShieldCheck className="h-5 w-5" /> },
              ].map((item) => (
                <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
                  <div className="inline-flex rounded-2xl bg-white/10 p-3 text-white">{item.icon}</div>
                  <p className="mt-4 text-lg font-display font-extrabold">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Pricing</p>
              <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950">Clear plans for each customer type.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
              Merchants buy simplicity, developers buy access, and logistics companies buy operations — with pricing that feels natural in Africa.
              </p>
            </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {pricingCards.map((plan, index) => (
              <div key={plan.name} className={`rounded-[28px] border p-6 shadow-sm ${index === 1 ? 'border-blue-200 bg-blue-50/40' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">{plan.name}</p>
                    <p className="mt-2 text-3xl font-display font-extrabold text-slate-950">{plan.price}</p>
                  </div>
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">{plan.description}</p>
                <div className="mt-5 space-y-3">
                  {plan.bullets.map((bullet) => (
                    <div key={bullet} className="flex items-center gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      {bullet}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => onNavigate('signup')}
                  className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${index === 1 ? 'bg-blue-600 text-white' : 'bg-slate-950 text-white'}`}
                >
                  Choose plan
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section id="api" className="bg-white border-y border-slate-200">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">API preview</p>
              <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950">A clean developer story from docs to production.</h2>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Create an API key, read the docs, test one webhook, and move to a paid tier when you need more capacity.
              </p>
              <div className="mt-8 space-y-3">
                {[
                  'API keys and webhooks',
                  'Plan-based endpoint access',
                  'Public tracking API',
                  'Clear upgrade path',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => onNavigate('signup')} className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
                  Start building
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button onClick={() => onNavigate('login')} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700">
                  Sign in
                </button>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-5 text-white shadow-[0_24px_80px_rgba(15,23,42,0.18)]">
                <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-4">
                  {(['nodejs', 'curl', 'python'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCodeTab(tab)}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] transition-colors ${activeCodeTab === tab ? 'bg-white text-slate-950' : 'bg-white/5 text-slate-300 hover:bg-white/10'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="mt-5 rounded-3xl border border-white/10 bg-black/30 p-4 font-mono text-[12px] leading-6 text-blue-300">
                  <pre className="whitespace-pre-wrap">{codeSnippets[activeCodeTab]}</pre>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={copyCode}
                    className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? 'Copied' : 'Copy snippet'}
                  </button>
                  <button onClick={() => onNavigate('signup')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-bold text-white">
                    Open API portal
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="resources" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Try the flow</p>
                <h2 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950">Open a live tracking page in one click.</h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  We already have the customer tracking page live. Click a sample order and verify the customer-facing experience end to end.
                </p>
              </div>
              <div className="lg:col-span-4 flex lg:justify-end">
                <button
                  onClick={() => {
                    onSelectTrackId('TRK-DEMO-001');
                    onNavigate('public-tracking');
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-slate-950/10"
                >
                  Open tracking demo
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-5 lg:px-8">
            <div className="lg:col-span-2">
              <BrandLogo size="md" className="brightness-200" />
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
                Sendie is the calm delivery infrastructure layer for merchants, logistics companies, and developers across Africa.
              </p>
            </div>
            {[
              { title: 'Product', links: ['Orders', 'Tracking', 'Billing', 'Settings'] },
              { title: 'Developers', links: ['API Docs', 'API Keys', 'Webhooks', 'Public API'] },
              { title: 'Company', links: ['About', 'Customers', 'Pricing', 'Contact'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies', 'Support'] },
            ].map((column) => (
              <div key={column.title}>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">{column.title}</p>
                <div className="mt-4 space-y-3 text-sm text-slate-300">
                  {column.links.map((link) => (
                    <p key={link}>{link}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/10">
            <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
              <p>© {new Date().getFullYear()} Sendie. All rights reserved.</p>
              <p>Built for merchants, logistics teams, and developers.</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
