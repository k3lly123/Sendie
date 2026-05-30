import React from 'react';
import { CreditCard, ArrowUpRight, CheckCircle, ShieldCheck, Download, Sparkles, Building, BarChart } from 'lucide-react';
import { UserSession } from '../types';

interface BillingPageProps {
  user: UserSession;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function BillingPage({ user, onShowToast }: BillingPageProps) {
  const invoices = [
    { id: 'INV-0229', date: '2026-05-01', amount: '$49.00', status: 'Paid', method: 'Visa ending 4242' },
    { id: 'INV-0181', date: '2026-04-01', amount: '$49.00', status: 'Paid', method: 'Visa ending 4242' },
    { id: 'INV-0044', date: '2026-03-01', amount: '$12.50', status: 'Paid', method: 'Visa ending 4242' },
  ];

  return (
    <div id="billing-view-root" className="space-y-6">
      
      {/* SECTION 1: Plan status */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-premium grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-8 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subscription Tier</span>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 font-display">Starter Account Plan</h3>
            <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Stripe Active</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
            Your startup is currently operating on the <strong>Starter subscription ($49/mo)</strong>, which includes up to 150 automated delivery dispatch runs, sandbox keys, and customs SMS notification alerts.
          </p>
        </div>

        <div className="md:col-span-4 flex flex-col justify-center text-center bg-slate-50 border border-slate-200/60 rounded-xl p-4 space-y-3">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">MONTHLY SHIPMENTS STATUS</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-display">48 / 150</p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full w-[32%]" />
            </div>
          </div>
          <button 
            onClick={() => {
              if (onShowToast) {
                onShowToast('Plan upgrade activated! All limits lifted for sandbox test runs.', 'success');
              } else {
                alert('Demo status: For platform evaluation, all plan tier upgrades are toggled free. Click ok to simulate custom corporate routing requests!');
              }
            }}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow"
          >
            <span>Upgrade Subscription</span>
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* SECTION 2: Payment credentials card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Visa payment credentials card visual */}
        <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-premium space-y-5">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Default Payment Method</h4>
            <CreditCard className="h-4.5 w-4.5 text-slate-400" />
          </div>

          {/* Stylized credit card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-lg space-y-6 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">PLATFORM WALLET</p>
                <p className="text-sm font-bold font-display mt-0.5">Sendie Corporate</p>
              </div>
              <span className="font-mono text-xs font-bold text-blue-400 tracking-wider">VISA</span>
            </div>

            <p className="font-mono text-base tracking-widest text-slate-100 font-bold">••••  ••••  ••••  4242</p>

            <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
              <div>
                <p className="text-[8px] uppercase font-sans">CARDHOLDER</p>
                <p className="font-sans font-bold text-white mt-0.5">{user.businessName}</p>
              </div>
              <div>
                <p className="text-[8px] uppercase font-sans">EXPIRES</p>
                <p className="font-bold text-white mt-0.5">08/29</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (onShowToast) {
                onShowToast('Payment instrument modified successfully in sandbox.', 'success');
              } else {
                alert('Demo status: Payment method modifier simulated successfully.');
              }
            }}
            className="cursor-pointer w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg transition-colors"
          >
            Modify Payment Details
          </button>
        </div>

        {/* Invoice reference list */}
        <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-premium space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Historical System Invoices</h4>
            <span className="text-[10px] text-slate-400">Downloadable PDFs</span>
          </div>

          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs font-semibold">
                <div className="space-y-1">
                  <p className="text-slate-800 font-mono font-bold leading-none">{inv.id}</p>
                  <span className="text-[10.5px] text-slate-400 font-mono block">{inv.date} • {inv.method}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-800 font-extrabold">{inv.amount}</span>
                  <span className="bg-green-100 border border-green-200 text-green-800 font-bold text-[9px] px-2 py-0.2 rounded-full uppercase">
                    {inv.status}
                  </span>
                  <button 
                    onClick={() => {
                      if (onShowToast) {
                        onShowToast(`Downloading statement details for invoice ${inv.id}...`, 'info');
                      } else {
                        alert(`Demo status: Downloading receipt PDF for invoice ${inv.id}`);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-50 border rounded-lg"
                    title="Download Receipt"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
