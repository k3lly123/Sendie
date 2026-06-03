import React, { useState } from 'react';
import { ArrowRight, Code, Key, Shield, Terminal, Lock, CheckCircle2 } from 'lucide-react';
import { BillingState, UserSession } from '../types';

interface ApiDocsPageProps {
  billing: BillingState;
  user: UserSession;
}

const planGuidance: Record<string, { title: string; note: string; access: string }> = {
  Free: {
    title: 'No developer access',
    note: 'This plan is mainly for merchant testing. Upgrade to unlock API keys and partner endpoints.',
    access: 'API keys locked',
  },
  Sandbox: {
    title: 'Sandbox',
    note: 'Good for testing one integration, one webhook stream, and the public tracking flow.',
    access: '1 API key',
  },
  Build: {
    title: 'Build',
    note: 'For live storefronts and internal tools that need stable API access.',
    access: '5 API keys',
  },
  Scale: {
    title: 'Scale',
    note: 'For production teams with higher request volume and more environments.',
    access: '20 API keys',
  },
  Dispatch: {
    title: 'Dispatch',
    note: 'Logistics teams can use limited API hooks while keeping the ops console separate.',
    access: '3 API keys',
  },
  Fleet: {
    title: 'Fleet',
    note: 'Larger logistics operations with more throughput and wider integration needs.',
    access: '10 API keys',
  },
};

export default function ApiDocsPage({ billing, user }: ApiDocsPageProps) {
  const [activeTab, setActiveTab] = useState<'create' | 'update' | 'track' | 'public'>('create');
  const planInfo = planGuidance[billing.plan] ?? planGuidance.Free;
  const endpointAccess = {
    create: billing.plan === 'Sandbox' || billing.plan === 'Build' || billing.plan === 'Scale' || billing.plan === 'Dispatch' || billing.plan === 'Fleet',
    update: billing.plan === 'Sandbox' || billing.plan === 'Build' || billing.plan === 'Scale' || billing.plan === 'Dispatch' || billing.plan === 'Fleet',
    track: true,
    public: billing.plan === 'Sandbox' || billing.plan === 'Build' || billing.plan === 'Scale' || billing.plan === 'Dispatch' || billing.plan === 'Fleet',
  };

  const docData = {
    create: {
      method: 'POST',
      url: '/api/orders',
      desc: 'Create a merchant delivery order from the dashboard API.',
      request: `{
  "customerName": "Adewale Bashir",
  "customerPhone": "+234 803 111 2222",
  "itemDescription": "Air Jordan 1 Retro Sneakers",
  "pickupLocation": "Ikeja Logistics Hub, Lagos",
  "deliveryLocation": "Adetokunbo Ademola St, Lagos",
  "notes": "Call before arrival"
}`,
      response: `{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "order": {
      "id": "TRK-9A12BC",
      "trackingLink": "https://sendie.sh/track/TRK-9A12BC"
    }
  }
}`,
    },
    update: {
      method: 'PATCH',
      url: '/api/orders/TRK-9A12BC/status',
      desc: 'Update the status of an existing order and append a tracking event.',
      request: `{
  "status": "In Transit"
}`,
      response: `{
  "status": "success",
  "message": "Order updated",
  "data": {
    "order": {
      "id": "TRK-9A12BC",
      "status": "In Transit"
    }
  }
}`,
    },
    track: {
      method: 'GET',
      url: '/api/tracking/TRK-9A12BC',
      desc: 'Public tracking endpoint for customer-facing order status pages.',
      request: `// No authorization required`,
      response: `{
  "status": "success",
  "message": "Tracking retrieved",
  "data": {
    "order": {
      "id": "TRK-9A12BC",
      "status": "In Transit"
    },
    "timeline": [
      { "status": "Pending", "isComplete": true },
      { "status": "Picked Up", "isComplete": true },
      { "status": "In Transit", "isComplete": true },
      { "status": "Delivered", "isComplete": false }
    ]
  }
}`,
    },
    public: {
      method: 'POST',
      url: '/api/public/v1/deliveries',
      desc: 'Public partner API for external companies that want to create shipments with Sendie.',
      request: `{
  "customer_name": "Adewale Bashir",
  "customer_phone": "+234 803 111 2222",
  "item_description": "Air Jordan 1 Retro Sneakers",
  "pickup_location": "Ikeja Logistics Hub, Lagos",
  "delivery_location": "Adetokunbo Ademola St, Lagos",
  "pickup_notes": "Call before arrival"
}`,
      response: `{
  "status": "success",
  "message": "Public delivery created",
  "data": {
    "trackingUrl": "https://sendie.sh/track/TRK-9A12BC"
  }
}`,
    },
  };

  return (
    <div id="docs-view-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-slate-800">
            <Code className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Current plan</h3>
          </div>
          <p className="text-sm font-bold text-slate-900">{planInfo.title}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{planInfo.note}</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
            {planInfo.access} · {user.accountType}
          </div>
        </div>

        <div className="space-y-3 rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Authentication</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Private requests use a bearer session token. Public partner requests use `X-API-Key`.
          </p>
          <div className="bg-slate-900 text-white rounded-lg p-3 font-mono text-[10.5px] leading-none text-blue-300 space-y-2">
            <div>Authorization: Bearer sk_session_...</div>
            <div>X-API-Key: sk_sendie_...</div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Endpoints API Reference</h3>
          <div className="space-y-2">
            {[
              { id: 'create', label: 'Create Order', method: 'POST' },
              { id: 'update', label: 'Update Status', method: 'PATCH' },
              { id: 'track', label: 'Track Order', method: 'GET' },
              { id: 'public', label: 'Partner API', method: 'POST' },
            ].map((endpoint) => {
              const active = activeTab === endpoint.id;
              const methodColor =
                endpoint.method === 'GET' ? 'text-green-600 bg-green-50'
                  : endpoint.method === 'POST' ? 'text-blue-600 bg-blue-50'
                    : 'text-purple-600 bg-purple-50';

              return (
                <button
                  key={endpoint.id}
                  onClick={() => setActiveTab(endpoint.id as keyof typeof docData)}
                  className={`w-full text-left rounded-lg p-2.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${active ? 'bg-slate-100 text-slate-950 font-bold border-l-4 border-blue-600 pl-2' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{endpoint.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${methodColor}`}>{endpoint.method}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Endpoint access by plan</h3>
          <div className="space-y-3">
            {[
              { label: 'Create order', key: 'create' as const },
              { label: 'Update status', key: 'update' as const },
              { label: 'Track order', key: 'track' as const },
              { label: 'Public delivery API', key: 'public' as const },
            ].map((item) => {
              const allowed = endpointAccess[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{item.label}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {item.key === 'public' ? 'Requires a developer plan.' : 'Included for active API tiers.'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${allowed ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                    {allowed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                    {allowed ? 'Unlocked' : 'Locked'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">What to do next</h3>
          <div className="space-y-3">
            {[
              'Pick Sandbox, Build, or Scale in Billing',
              'Create one API key and copy it safely',
              'Send one test webhook event',
              'Confirm the public tracking URL',
              'Upgrade when you need higher limits',
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">{index + 1}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
        <div className="p-5 border-b border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center gap-3">
            <span className="text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white">
              {docData[activeTab].method}
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 break-all">{docData[activeTab].url}</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
            {docData[activeTab].desc}
          </p>
        </div>

        <div className="p-5 space-y-6 bg-white">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">HTTP Request Payload Example</span>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-blue-300 overflow-x-auto select-all max-h-56">
              <pre className="text-slate-300 whitespace-pre"><code>{docData[activeTab].request}</code></pre>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Response JSON Example</span>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-green-300 overflow-x-auto select-all max-h-56">
              <pre className="text-slate-300 whitespace-pre"><code>{docData[activeTab].response}</code></pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-800">
                <Key className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Merchant use case</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use the private API to create orders, update status, and power your merchant dashboard.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2 text-slate-800">
                <Terminal className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider">Partner use case</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Use the public delivery API to plug Sendie into external storefronts and warehouse software. Available on developer-friendly tiers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
