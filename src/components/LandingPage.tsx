import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Code, Shield, CheckCircle, Globe, Zap, Users, Filter, BarChart3, Truck, Copy, Check, Terminal } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { AppScreen } from '../types';

interface LandingPageProps {
  onNavigate: (screen: AppScreen) => void;
  onSelectTrackId: (id: string) => void;
}

export default function LandingPage({ onNavigate, onSelectTrackId }: LandingPageProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<'nodejs' | 'curl' | 'python'>('nodejs');

  const companies = [
    { name: 'Jumia', color: 'orange' },
    { name: 'ShopUp', color: 'blue' },
    { name: 'Konga', color: 'pink' },
    { name: 'Jiji', color: 'green' },
    { name: 'Palmpay', color: 'purple' },
    { name: 'Cowrywise', color: 'indigo' },
  ];

  const features = [
    {
      icon: <Truck className="h-6 w-6 text-blue-600" />,
      title: 'Create Orders',
      description: 'Generate point-to-point delivery runs in seconds. Dispatch to drivers immediately or schedule for later fulfillment.',
    },
    {
      icon: <Zap className="h-6 w-6 text-brand-500" />,
      title: 'Track Deliveries',
      description: 'End-to-end, ultra-precise transit updates. Give customers a delightful, live-updating tracking interface with SMS alerts.',
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: 'Manage Customers',
      description: 'Store rich communication preferences, historical addresses, and trace lifetime delivery orders in a clean CRM dashboard.',
    },
    {
      icon: <Code className="h-6 w-6 text-brand-500" />,
      title: 'Integrate API',
      description: 'Developer-first infrastructure. High-performance JSON endpoints, webhooks, and sandbox keys to scale delivery operations.',
    },
  ];

  const codeSnippets = {
    nodejs: `const Sendie = require('@sendie/node')('sk_live_51M...');

async function createDelivery() {
  const delivery = await Sendie.deliveries.create({
    customer_name: "Adewale Bashir",
    phone: "+234 803 111 2222",
    pickup: "Ikeja Hub, Lagos",
    destination: "Victoria Island, Lagos",
    item: "Air Jordan 1 Retro",
    metadata: { order_ref: "REF-99210" }
  });
  console.log(\`Track link created: \${delivery.tracking_url}\`);
}

createDelivery();`,
    curl: `curl -X POST https://api.sendie.sh/v1/deliveries \\
  -H "Authorization: Bearer sk_live_51M..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_name": "Adewale Bashir",
    "phone": "+234 803 111 2222",
    "pickup": "Ikeja Hub, Lagos",
    "destination": "Victoria Island, Lagos",
    "item": "Air Jordan 1 Retro"
  }'`,
    python: `import sendie

sendie.api_key = "sk_live_51M..."

delivery = sendie.Deliveries.create(
    customer_name="Adewale Bashir",
    phone="+234 803 111 2222",
    pickup="Ikeja Hub, Lagos",
    destination="Victoria Island, Lagos",
    item="Air Jordan 1 Retro"
)
print(f"Tracking ID: {delivery.id}")`,
  };

  const pricingPlans = [
    {
      name: 'Free',
      price: '$0',
      description: 'Perfect for small local merchants exploring digital deliveries.',
      features: [
        'Up to 15 deliveries / mo',
        'Standard tracking links',
        'Basic order management dashboard',
        'Community support assistance',
      ],
      cta: 'Start with Free',
      popular: false,
    },
    {
      name: 'Starter',
      price: '$49',
      period: '/mo',
      description: 'Powering growing social commerce startups and retail businesses.',
      features: [
        'Up to 150 deliveries / mo',
        'Custom SMS notification alerts',
        'API & Webhook integration',
        'Next-day payout processing',
        'Email & Chat support (24h)',
      ],
      cta: 'Choose Starter',
      popular: true,
    },
    {
      name: 'Business',
      price: '$199',
      period: '/mo',
      description: 'Engineered for mature merchants with high-volume logistics.',
      features: [
        'Up to 800 deliveries / mo',
        'Unbranded tracking domain (white label)',
        'Multi-member business accounts',
        'Advanced routing analytics dashboard',
        'Priority support response (<1h)',
      ],
      cta: 'Go Business',
      popular: false,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'Bespoke infrastructure for custom high-volume operations.',
      features: [
        'Unlimited deliveries',
        'Dedicated account manager support',
        'SLA delivery speed guarantees',
        'Custom integrations development',
        '99.99% system uptime API assurance',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div id="landing-page-root" className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar Section */}
      <nav id="navbar" className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('landing'); }}>
                <BrandLogo size="md" />
              </a>
              <div className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Product</a>
                <a href="#api" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">API</a>
                <a href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</a>
                <a href="#api" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Docs</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                id="navbar-login-btn"
                onClick={() => onNavigate('login')}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors"
              >
                Log in
              </button>
              <button 
                id="navbar-signup-btn"
                onClick={() => onNavigate('signup')}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="hero" className="py-16 md:py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Hero */}
          <div className="lg:col-span-5 flex flex-col justify-center text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full py-1 px-3.5 mb-6 text-xs font-semibold text-blue-700 w-fit"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Platform V2 Launched • Modern Logistics Platform
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[49px] leading-[1.1] font-display font-extrabold tracking-tight text-slate-900"
            >
              Track every delivery.<br />
              <span className="text-blue-600 relative inline">
                Power every business.
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Sendie helps businesses create, manage and track deliveries with a modern dashboard and powerful developer-first API infrastructure.
            </motion.p>

            {/* CTA controls */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button 
                id="hero-get-started-cta"
                onClick={() => onNavigate('signup')}
                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all flex items-center gap-2 group text-sm md:text-base"
              >
                Get Started for free 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#api"
                className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg text-sm md:text-base shadow-sm hover:shadow-md transition-all flex items-center gap-2"
              >
                <Code className="h-4 w-4 text-slate-500" />
                View API Docs
              </a>
            </motion.div>

            {/* Small pills */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 grid grid-cols-2 gap-y-3 gap-x-4 max-w-lg border-t border-slate-200/80 pt-6"
            >
              {[
                { text: 'Real-time tracking', desc: 'Precise map traces' },
                { text: 'API Integration', desc: 'Bearer token setup' },
                { text: 'Order Management', desc: 'Central logistics desk' },
                { text: 'Delivery Updates', desc: 'Automated SMS alerts' },
              ].map((pill, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-800 leading-none">{pill.text}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{pill.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right Hero - Mockup dashboard graphic */}
          <div className="lg:col-span-7 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative w-full z-10"
            >
              {/* Main Dashboard Panel mockup */}
              <div className="bg-white rounded-xl shadow-double border border-slate-200 p-6 overflow-hidden max-w-2xl mx-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <span className="text-xs text-slate-400 font-mono ml-2">sendie-dashboard-v2</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 rounded px-2.5 py-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">LOGISTICS MONITOR LIVE</span>
                  </div>
                </div>

                {/* Dashboard Metrics Widgets */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { label: 'Total Orders', count: '356', pct: '+24%', color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'In Transit', count: '142', pct: '+18%', color: 'text-brand-500', bg: 'bg-brand-50' },
                    { label: 'Delivered', count: '198', pct: '+32%', color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending', count: '16', pct: '-6%', color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((metric, i) => (
                    <div key={i} className="border border-slate-100 rounded-lg p-2.5 text-center bg-slate-50/50">
                      <p className="text-[10px] text-slate-500 font-medium truncate">{metric.label}</p>
                      <p className="text-lg font-bold text-slate-800 my-0.5">{metric.count}</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${metric.bg} ${metric.color}`}>
                        {metric.pct}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Simulated table order rows */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 tracking-wider uppercase">Recent Deliveries</h4>
                    <span className="text-[11px] text-blue-600 font-semibold cursor-pointer">View all</span>
                  </div>
                  {[
                    { id: 'ORD-78291', item: 'Nike Sneakers', customer: 'Amina Bello', status: 'In Transit', color: 'bg-blue-500 text-white' },
                    { id: 'ORD-78290', item: 'Phone Case', customer: 'Emmanuel Okafor', status: 'Delivered', color: 'bg-green-500 text-white' },
                    { id: 'ORD-78289', item: 'T-shirt', customer: 'Chioma Nwachukwu', status: 'Picked Up', color: 'bg-purple-500 text-white' },
                    { id: 'ORD-78288', item: 'smart Watch', customer: 'Tunde Folawiyo', status: 'Pending', color: 'bg-amber-500 text-slate-900' },
                  ].map((row, i) => (
                    <div 
                      key={i} 
                      onClick={() => {
                        // Quick click behavior: Navigate directly to tracking details for that simulated order!
                        const orderTranslateMap: Record<string, string> = {
                          'ORD-78291': 'TRK-78291',
                          'ORD-78290': 'TRK-78290',
                          'ORD-78289': 'TRK-78289',
                          'ORD-78288': 'TRK-78288',
                        };
                        const mappedId = orderTranslateMap[row.id] || 'TRK-9024A';
                        onSelectTrackId(mappedId);
                        onNavigate('tracking');
                      }}
                      className="group cursor-pointer hover:bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-center justify-between transition-all hover:translate-x-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{row.id}</span>
                            <span className="text-xs text-slate-500">• {row.item}</span>
                          </div>
                          <p className="text-[11px] text-slate-400">Recipient: {row.customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${row.color}`}>
                          {row.status}
                        </span>
                        <div className="text-[10px] text-blue-600 font-bold group-hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                          Track →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Float Phone tracking screen on right */}
              <div className="absolute -bottom-8 right-0 hidden md:block w-52 bg-slate-900 text-white rounded-[24px] p-2.5 shadow-2xl border-4 border-slate-800 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto mb-2"></div>
                <div className="px-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-mono text-slate-400">7:18</span>
                    <span className="text-[9px] font-mono text-green-400">LTE ●</span>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-2 mb-2">
                    <p className="text-[8px] text-slate-400 uppercase">Track your Order</p>
                    <p className="text-xs font-mono font-bold tracking-wider text-blue-400">TRK-8F3K2L</p>
                  </div>
                  {/* Miniature map trace */}
                  <div className="h-16 bg-slate-800 rounded-lg relative overflow-hidden mb-2 flex items-center justify-center">
                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <svg className="w-full h-full absolute inset-0 text-blue-500" stroke="currentColor" fill="none">
                      <path d="M 10 50 C 40 40 50 10 90 20 C 120 25 130 50 170 40" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                    <div className="absolute left-2.5 top-[45px] w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="absolute right-6 top-[37px] w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-bounce"></div>
                    <span className="text-[9px] font-bold text-white bg-slate-900/90 py-0.5 px-1 rounded absolute bottom-1 right-1">In Transit</span>
                  </div>
                  <p className="text-[9px] text-slate-300">Your package is with courier.</p>
                  <p className="text-[8px] text-slate-500">Est. Arrival today, 4:30 PM</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trusted Companies section */}
      <section id="trusted" className="py-8 bg-white border-y border-slate-200/60 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold text-slate-400 tracking-[0.2em] uppercase mb-5">
            TRUSTED BY PLATFORMS & LOGISTICS PROVIDERS OF ALL SIZES
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
            {companies.map((co, index) => (
              <div 
                key={index} 
                className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity cursor-default filter grayscale hover:grayscale-0"
              >
                <div className="h-6 w-6 rounded bg-slate-800 text-white flex items-center justify-center font-bold text-xs font-mono">
                  {co.name[0]}
                </div>
                <span className="font-display font-bold text-lg text-slate-800 tracking-tight">
                  {co.name}
                </span>
                <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-bold uppercase font-sans">Africa</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 md:py-28 bg-slate-50 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 tracking-[0.25em] uppercase">POWERFUL MODULES</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Enterprise logistics infrastructure. Simple for small merchants.
            </p>
            <p className="mt-4 text-base text-slate-500">
              Stop stitching together complex spreadsheet workflows and disjointed delivery agents. One hub, robust REST endpoints, client-triggered tracking links.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-premium hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="h-12 w-12 rounded-lg bg-blue-50/80 flex items-center justify-center mb-5 border border-blue-100/40">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-950 font-display mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section id="api" className="py-20 bg-slate-900 text-slate-100 scroll-mt-10 overflow-hidden relative">
        {/* Glow decorative overlays */}
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl rounded-full"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl rounded-full"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Texts */}
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-bold text-blue-400 tracking-[0.2em] uppercase">INFRASTRUCTURE AS CODE</span>
              <h2 className="mt-3 text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
                Integrations in hours, not months.
              </h2>
              <p className="mt-4 text-slate-400 leading-relaxed">
                Connect your online shop, POS software, or delivery fleet directly to Sendie's tracking network. Robust Webhook configurations notify your server whenever a packages arrives or status shifts.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-xs">✓</div>
                  <span className="text-sm text-slate-300 font-semibold">99.99% Core API Uptime Guarantee</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-xs">✓</div>
                  <span className="text-sm text-slate-300 font-semibold">Sandbox keys with toggle state</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-blue-400 text-xs">✓</div>
                  <span className="text-sm text-slate-300 font-semibold">Native Node, Python and Go Wrappers</span>
                </div>
              </div>

              <div className="mt-10">
                <button 
                  id="api-start-building-cta"
                  onClick={() => onNavigate('signup')}
                  className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-lg text-sm tracking-wide transition-all shadow-md active:scale-95"
                >
                  Start Building Now
                </button>
              </div>
            </div>

            {/* Right Interactive Code Block */}
            <div className="lg:col-span-7">
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
                {/* Header terminal style tab list */}
                <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs text-slate-500 font-mono ml-2">POST /v1/deliveries</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setActiveCodeTab('nodejs')}
                      className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${activeCodeTab === 'nodejs' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      NodeJS
                    </button>
                    <button 
                      onClick={() => setActiveCodeTab('curl')}
                      className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${activeCodeTab === 'curl' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      cURL
                    </button>
                    <button 
                      onClick={() => setActiveCodeTab('python')}
                      className={`font-mono text-xs px-2.5 py-1 rounded transition-colors ${activeCodeTab === 'python' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      Python
                    </button>
                  </div>
                </div>

                {/* Snippet terminal scroll container */}
                <div className="p-5 relative font-mono text-xs leading-relaxed text-blue-300 overflow-x-auto min-h-[220px]">
                  <pre className="text-slate-300 select-all whitespace-pre">
                    <code>{codeSnippets[activeCodeTab]}</code>
                  </pre>

                  {/* Copy Button */}
                  <button 
                    onClick={handleCopyCode}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all hover:scale-105 active:scale-95"
                    title="Copy to Clipboard"
                  >
                    {copiedKey ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Simulating Output Response footer */}
                <div className="bg-slate-900 border-t border-slate-800 px-5 py-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <Terminal className="h-3.5 w-3.5 text-slate-500" />
                    <span>response: {"{"} status: <span className="text-green-400">201 Created</span>, id: <span className="text-blue-400">"TRK-9024A"</span> {"}"}</span>
                  </div>
                  <span className="text-slate-500">28ms</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Matrix section */}
      <section id="pricing" className="py-20 md:py-28 bg-white scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 tracking-[0.25em] uppercase">PRICING STRUCTURE</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-display font-extrabold text-slate-900 tracking-tight">
              Honest tiers. Pay only for what you ship.
            </p>
            <p className="mt-4 text-slate-500">
              No long contract lock-ins. Upgrade or downgrade plans cleanly as your trade seasons change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`bg-white border rounded-2xl p-6 relative flex flex-col justify-between transition-all ${plan.popular ? 'border-blue-600 ring-2 ring-blue-600/10 shadow-lg' : 'border-slate-200 shadow-premium'}`}
              >
                <div>
                  {plan.popular && (
                    <span className="bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full absolute -top-3 left-6">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-display font-extrabold text-lg text-slate-900">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                  
                  {/* Pricing figure */}
                  <div className="my-6">
                    <span className="text-4xl font-extrabold font-display text-slate-900 tracking-tight">{plan.price}</span>
                    {plan.period && <span className="text-slate-400 text-sm font-semibold">{plan.period}</span>}
                  </div>

                  {/* Pricing Feature Points */}
                  <ul className="space-y-3.5 border-t border-slate-100 pt-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => {
                      onNavigate('signup');
                    }}
                    className={`cursor-pointer w-full py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all ${plan.popular ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer component */}
      <footer id="footer" className="bg-slate-900 text-slate-400 border-t border-slate-800 py-16 scroll-mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Logo brand message */}
          <div className="lg:col-span-2 select-none">
            <BrandLogo size="md" className="brightness-200" />
            <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-sm">
              Sendie is a modern, premium logistics and delivery infrastructure platform for businesses, startups, and social commerce merchants worldwide.
            </p>
            <p className="mt-6 text-[10px] text-slate-500 font-mono">
              © {new Date().getFullYear()} Sendie Inc. All rights reserved.
            </p>
          </div>

          {/* Directory lists */}
          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Product</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Direct Shipping Dispatch</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Integration Keys</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Client Tracking Web</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Analytics Insights</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Status Webhooks</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Documentation</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-blue-400 transition-colors">API Reference Guides</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">SDK Client Libraries</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">System Uptime Audit</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Webhook Playgrounds</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Compliance Certifications</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs tracking-wider uppercase mb-4">Company</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#" className="hover:text-blue-400 transition-colors">About Sendie Group</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Careers (We're hiring!)</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Press Room kit</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Contact Support</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Status Terminal</a></li>
            </ul>
          </div>

        </div>
      </footer>
    </div>
  );
}
