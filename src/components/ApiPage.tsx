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
  RefreshCw
} from 'lucide-react';
import { ApiKey, ApiUsageStats, AppScreen } from '../types';

interface ApiPageProps {
  apiKeys: ApiKey[];
  stats: ApiUsageStats;
  onGenerateApiKey: (name: string) => void;
  onRevokeApiKey: (id: string) => void;
  onNavigate: (screen: AppScreen) => void;
}

export default function ApiPage({ apiKeys, stats, onGenerateApiKey, onRevokeApiKey, onNavigate }: ApiPageProps) {
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [showGenerateForm, setShowGenerateForm] = useState(false);

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
  const successRate = ((stats.successfulRequests / stats.requestsCount) * 100).toFixed(2);

  return (
    <div id="developer-api-portal-container" className="space-y-6">
      
      {/* SECTION 1: API Overview banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 relative overflow-hidden shadow-premium">
        {/* Glow circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
            <Terminal className="h-3 w-3" /> Developer Infrastructure Mode
          </div>
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Programmatic delivery dispatching mesh.
          </h2>
          <p className="text-[11.5px] text-slate-300 leading-relaxed">
            Generate and securely register Bearer credentials to deploy logistics runs instantly from your WooCommerce, Shopify, Custom Node/Python store, or warehouse POS registers.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('api-docs')}
              className="cursor-pointer bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 px-4 text-xs font-bold transition-all shadow inline-flex items-center gap-1.5 active:scale-95"
            >
              <span>Explore Developer Endpoint Docs</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: API Usage statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1 - Total API Calls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total REST API Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">
              {stats.requestsCount.toLocaleString()}
            </span>
            <span className="text-[10px] text-green-600 font-bold block">✓ 100% throughput</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 - Success rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">API Success Rate</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">{successRate}%</span>
            <span className="text-[10px] text-slate-400 block">{stats.successfulRequests.toLocaleString()} successful dispatch hooks</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center border border-green-100">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 - Failed calls */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Failed API Requests</span>
            <span className="text-2xl font-extrabold text-slate-900 font-display block">{stats.failedRequests}</span>
            <span className="text-[10px] text-red-500 font-semibold block">⚠ Response 400 Bad Parameters</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center border border-red-100">
            <AlertTriangle className="h-5 w-5" />
          </div>
        </div>

      </div>

      {/* SECTION 3: KEY MANAGEMENT INTERACTIVE SYSTEM */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium p-5 md:p-6">
        
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Active Secure API Keys</h3>
            <p className="text-xs text-slate-400 mt-1">Credentials used for authenticating your server calls</p>
          </div>

          <button
            id="api-show-form"
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-all shadow shadow-blue-500/10 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Generate New Token</span>
          </button>
        </div>

        {/* DYNAMIC CASE: Form to input details */}
        {showGenerateForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-md"
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
                    onClick={() => handleCopy(k.id, `${k.prefix}${k.secret.replace(/•/g, 'x')}`)}
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
        </div>

      </div>

    </div>
  );
}
