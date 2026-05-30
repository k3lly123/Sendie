import React, { useState } from 'react';
import { Terminal, Shield, ArrowRight, Code, Key, Server, Check } from 'lucide-react';

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'create' | 'get' | 'update' | 'track'>('create');

  const docData = {
    create: {
      method: 'POST',
      url: 'https://api.sendie.sh/v1/deliveries',
      desc: 'Create an automatic delivery dispatch run in the Sendie logistics engine.',
      request: `{
  "customer_name": "Adewale Bashir",
  "customer_phone": "+234 803 111 2222",
  "item_description": "Air Jordan 1 Retro Sneakers",
  "pickup_location": "Ikeja Logistics Hub, Lagos",
  "delivery_location": "Adetokunbo Ademola St, Lagos",
  "pickup_notes": "Handle with absolute care"
}`,
      response: `{
  "status": "success",
  "id": "TRK-9024A",
  "created_at": "2026-05-30T07:15:00Z",
  "status": "Pending",
  "tracking_url": "https://sendie.sh/track/TRK-9024A",
  "estimated_delivery": "Today, 04:30 PM"
}`,
    },
    get: {
      method: 'GET',
      url: 'https://api.sendie.sh/v1/deliveries/TRK-9024A',
      desc: 'Fetch full metadata records and courier status traces for a specific delivery.',
      request: `// Query parameters optional: ?include_timeline=true`,
      response: `{
  "id": "TRK-9024A",
  "status": "In Transit",
  "customer": {
    "name": "Adewale Bashir",
    "phone": "+234 803 111 2222"
  },
  "route": {
    "origin": "Ikeja Logistics Hub, Lagos",
    "destination": "Adetokunbo Ademola St, Lagos"
  },
  "timeline_logs": [
    { "status": "Pending", "time": "2026-05-30T07:15:00Z" },
    { "status": "Picked Up", "time": "2026-05-30T10:05:00Z" },
    { "status": "In Transit", "time": "2026-05-30T13:40:00Z" }
  ]
}`,
    },
    update: {
      method: 'PATCH',
      url: 'https://api.sendie.sh/v1/deliveries/TRK-9024A',
      desc: 'Update shipment status manually (Sandbox) or cancel active dispatch runs.',
      request: `{
  "status": "Delivered",
  "courier_signature": "Bashir Adewale"
}`,
      response: `{
  "id": "TRK-9024A",
  "status": "Delivered",
  "updated_at": "2026-05-30T16:30:00Z"
}`,
    },
    track: {
      method: 'GET',
      url: 'https://api.sendie.sh/v1/tracking/TRK-9024A/timeline',
      desc: 'Retrieve lightweight progress steps optimized for responsive customer interfaces.',
      request: `// No authorization required; Public endpoint query`,
      response: `{
  "id": "TRK-9024A",
  "milestones": [
    { "title": "Order Created", "is_complete": true },
    { "title": "Picked Up", "is_complete": true },
    { "title": "In Transit", "is_complete": true },
    { "title": "Delivered", "is_complete": false }
  ]
}`,
    }
  };

  return (
    <div id="docs-view-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      {/* Left Column: Endpoints Index list */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Authentication Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium space-y-3">
          <div className="flex items-center gap-2 text-slate-800">
            <Shield className="h-4.5 w-4.5 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider">Authentication</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All requests to the Sendie API must include your secret token in the HTTP Authorizations header:
          </p>
          <div className="bg-slate-900 text-white rounded-lg p-3 font-mono text-[10.5px] leading-none text-blue-300">
            Authorization: Bearer <span className="text-white">sk_live_sendie_...</span>
          </div>
        </div>

        {/* Endpoint Selector Menu */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Endpoints API Reference</h3>
          
          <div className="space-y-2">
            {[
              { id: 'create', label: 'Create Order', method: 'POST' },
              { id: 'get', label: 'Get Order', method: 'GET' },
              { id: 'update', label: 'Update Status', method: 'PATCH' },
              { id: 'track', label: 'Track Order (Public)', method: 'GET' },
            ].map((endpoint) => {
              const active = activeTab === endpoint.id;
              const methodColor = 
                endpoint.method === 'GET' ? 'text-green-600 bg-green-50' :
                endpoint.method === 'POST' ? 'text-blue-600 bg-blue-50' : 'text-purple-600 bg-purple-50';

              return (
                <button
                  key={endpoint.id}
                  onClick={() => setActiveTab(endpoint.id as any)}
                  className={`w-full text-left rounded-lg p-2.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${active ? 'bg-slate-100 text-slate-950 font-bold border-l-4 border-blue-600 pl-2' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span>{endpoint.label}</span>
                  <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${methodColor}`}>{endpoint.method}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Right Column: Code block detail representation */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden">
        
        {/* Summary block */}
        <div className="p-5 border-b border-slate-100 bg-[#FAFBFD]">
          <div className="flex items-center gap-3">
            <span className={`text-[9.5px] font-mono font-extrabold px-2 py-0.5 rounded bg-slate-900 text-white`}>
              {docData[activeTab].method}
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 break-all">{docData[activeTab].url}</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 leading-relaxed font-semibold">
            {docData[activeTab].desc}
          </p>
        </div>

        {/* Codes Display Container */}
        <div className="p-5 space-y-6 bg-white">
          
          {/* Request Payload JSON */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">HTTP Request Payload Example</span>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-blue-300 overflow-x-auto select-all max-h-56">
              <pre className="text-slate-300 whitespace-pre">
                <code>{docData[activeTab].request}</code>
              </pre>
            </div>
          </div>

          {/* Response Payload JSON */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Response JSON Example (200 OK / 201 Created)</span>
            <div className="bg-slate-950 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-green-300 overflow-x-auto select-all max-h-56">
              <pre className="text-slate-300 whitespace-pre">
                <code>{docData[activeTab].response}</code>
              </pre>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
