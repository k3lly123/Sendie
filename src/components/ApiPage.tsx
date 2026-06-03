import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Activity, 
  Percent, 
  AlertTriangle, 
  Globe, 
  ShieldCheck, 
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { ApiKey, ApiUsageStats, AppScreen, BillingState, UserSession } from '../types';

type WebhookEvent = {
  id: string;
  eventType: string;
  target: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
  responseCode?: number;
};

interface ApiPageProps {
  apiKeys: ApiKey[];
  stats: ApiUsageStats;
  webhooks: WebhookEvent[];
  billing: BillingState;
  user: UserSession;
  onGenerateApiKey: (name: string) => void;
  onRevokeApiKey: (id: string) => void;
  onNavigate: (screen: AppScreen) => void;
}

const apiPlanCaps: Record<string, { keyLimit: number; label: string; note: string }> = {
  Free: { keyLimit: 0, label: 'No developer access', note: 'Upgrade to Sandbox, Build, or Scale to unlock API keys.' },
  Sandbox: { keyLimit: 1, label: 'Sandbox', note: 'Best for testing one integration and a webhook flow.' },
  Build: { keyLimit: 5, label: 'Build', note: 'For live integrations with a few keys.' },
  Scale: { keyLimit: 20, label: 'Scale', note: 'For teams with higher traffic and multiple environments.' },
  Dispatch: { keyLimit: 3, label: 'Dispatch', note: 'Limited access for logistics teams that also need API hooks.' },
  Fleet: { keyLimit: 10, label: 'Fleet', note: 'Higher throughput for larger operations.' },
};

export default function ApiPage({ apiKeys, stats, webhooks, billing, user, onGenerateApiKey, onRevokeApiKey, onNavigate }: ApiPageProps) {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const currentCaps = apiPlanCaps[billing.plan] ?? apiPlanCaps.Free;
  const apiKeyCount = apiKeys.length;
  const keyLimitReached = currentCaps.keyLimit > 0 && apiKeyCount >= currentCaps.keyLimit;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    onGenerateApiKey(newKeyName.trim());
    setNewKeyName('');
    setShowGenerateForm(false);
  };

  // Compute stats details
  const successRate = stats.requestsCount > 0
    ? ((stats.successfulRequests / stats.requestsCount) * 100).toFixed(2)
    : '0.00';

  return (
    <div id="developer-api-portal-container" className="space-y-6">
      
      {/* SECTION 1: API Overview banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_35%)]" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Terminal className="h-3 w-3" /> Developer portal
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            API keys and delivery endpoints.
          </h2>
          <p className="max-w-xl text-sm leading-7 text-slate-300">
            Create API keys for authenticated requests and connect Sendie to your storefronts or internal tools.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('api-docs')}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              <span>Explore developer docs</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Current tier</p>
          <p className="mt-2 text-lg font-extrabold text-slate-900 font-display">{currentCaps.label}</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{currentCaps.note}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">API keys used</p>
          <p className="mt-2 text-lg font-extrabold text-slate-900 font-display">
            {apiKeyCount}{currentCaps.keyLimit > 0 ? ` / ${currentCaps.keyLimit}` : ''}
          </p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            {currentCaps.keyLimit > 0 ? 'Key creation is capped by your plan.' : 'Upgrade to unlock developer access.'}
          </p>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Workspace role</p>
          <p className="mt-2 text-lg font-extrabold text-slate-900 font-display">{user.accountType}</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">Developer access is separate from the logistics operations console.</p>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Developer onboarding</h3>
            <p className="text-xs text-slate-400 mt-1">The clean path from plan selection to shipping your integration.</p>
          </div>
          <Sparkles className="h-5 w-5 text-slate-400" />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {[
            { label: 'Choose a plan', done: billing.plan !== 'Free', note: 'Sandbox, Build, or Scale.' },
            { label: 'Create API key', done: apiKeyCount > 0, note: 'Your integration token.' },
            { label: 'Read docs', done: true, note: 'See locked and unlocked endpoints.' },
            { label: 'Test webhook', done: webhooks.length > 0, note: 'Generate one event first.' },
            { label: 'Ship to prod', done: billing.plan === 'Build' || billing.plan === 'Scale' || billing.plan === 'Dispatch' || billing.plan === 'Fleet', note: 'Switch over when ready.' },
          ].map((step) => (
            <div key={step.label} className={`rounded-2xl border p-4 ${step.done ? 'border-emerald-100 bg-emerald-50/60' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center gap-2">
                {step.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <div className="h-4 w-4 rounded-full border border-slate-300" />}
                <p className="text-xs font-bold text-slate-900">{step.label}</p>
              </div>
              <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">{step.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button onClick={() => onNavigate('billing')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white">
            Open billing
            <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={() => onNavigate('api-docs')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            Read docs
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* SECTION 2: API Usage statistics panel */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        
        {/* Metric 1 - Total API Calls */}
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total REST API Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">
              {stats.requestsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-green-600 font-bold block">Connected workspace data</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 - Success rate */}
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">API Success Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">{successRate}%</span>
            <span className="text-[10px] text-slate-400 block">{stats.successfulRequests.toLocaleString()} successful requests</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 - Failed calls */}
        <div className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Failed API Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">{stats.failedRequests}</span>
            <span className="text-[10px] text-red-500 font-semibold block">Requests that need attention</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* SECTION 3: KEY MANAGEMENT INTERACTIVE SYSTEM */}
      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 md:p-6">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Active secure API keys</h3>
            <p className="mt-1 text-xs text-slate-500">Credentials used for authenticating your server calls.</p>
          </div>

          <button
            id="api-show-form"
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            disabled={keyLimitReached}
            className="inline-flex items-center gap-1.5 self-start rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{keyLimitReached ? 'Key limit reached' : 'Generate New Token'}</span>
          </button>
        </div>

        {/* DYNAMIC CASE: Form to input details */}
        {showGenerateForm && !keyLimitReached && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 max-w-md rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Create a secure API environment token</h4>
            <form onSubmit={handleFormSubmit} className="space-y-3">
              <input
                id="api-key-name"
                type="text"
                required
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production WooCommerce Server Hook"
                className="w-full bg-white border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-750 text-white font-bold text-xs py-1.5 px-3.5 rounded-md transition-colors"
                >
                  Generate Token
                </button>
                <button
                  type="button"
                  onClick={() => setShowGenerateForm(false)}
                  className="bg-slate-200 text-slate-700 font-bold text-xs py-1.5 px-3.5 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* KEYS LIST */}
        <div className="space-y-4">
          {apiKeys.map((k) => (
            <div 
              key={k.id}
              className="border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-800">{k.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-400">Created: {k.createdDate}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 rounded font-mono font-bold tracking-wider">Active</span>
                </div>
              </div>

              {/* Code value element */}
              <div className="flex items-center gap-2">
                <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-mono text-[10.5px] text-slate-600 max-w-xs truncate flex items-center gap-1 leading-none">
                  <span className="text-blue-600 font-bold">{k.prefix}</span>
                  <span>{k.secret}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleCopy(k.id, `${k.prefix}${k.secret}`)}
                    className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                    title="Copy secret key"
                  >
                    {copiedKeyId === k.id ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Sure you want to completely revoke credentials for "${k.name}"?`)) {
                        onRevokeApiKey(k.id);
                      }
                    }}
                    className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                    title="Revoke key credentials"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {keyLimitReached && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
              You've reached the API key limit for the {billing.plan} plan. Upgrade to unlock more keys.
            </div>
          )}
        </div>

      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 md:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Recent webhook events</h3>
            <p className="text-xs text-slate-400 mt-1">Delivery attempts recorded by the local workspace</p>
          </div>
          <RefreshCw className="h-4 w-4 text-slate-400" />
        </div>

        {webhooks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            No webhook events yet. Create or update an order to generate one.
          </div>
        ) : (
          <div className="space-y-3">
            {webhooks.slice(0, 4).map((event) => (
              <div key={event.id} className="rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-slate-800">{event.eventType}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{event.target} • {event.createdAt.slice(0, 19).replace('T', ' ')}</p>
                  <p className="text-[10px] text-slate-500 mt-2 break-all">
                    {JSON.stringify(event.payload)}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${event.status === 'delivered' ? 'bg-green-50 text-green-700' : event.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
                  {event.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
