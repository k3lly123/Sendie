import React from 'react';
import { ArrowUpRight, CreditCard, CircleDollarSign } from 'lucide-react';
import { BillingState, Invoice, UserSession } from '../types';

interface BillingPageProps {
  user: UserSession;
  billing: BillingState;
  invoices: Invoice[];
  onCheckoutPlan: (plan: string) => void;
  onMarkInvoicePaid: (invoiceId: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

const planCardsByRole: Partial<Record<UserSession['accountType'], Array<{ name: string; price: string; description: string; shipmentsLimit: number }>>> = {
  Merchant: [
    { name: 'Free', price: '₦0', description: 'For testing the workspace.', shipmentsLimit: 15 },
    { name: 'Starter', price: '₦5,000', description: 'For small merchants and shops.', shipmentsLimit: 150 },
    { name: 'Business', price: '₦15,000', description: 'For teams that ship often.', shipmentsLimit: 800 },
  ],
  'Logistics Company': [
    { name: 'Free', price: '₦0', description: 'Try dispatch, proof, and the ops console.', shipmentsLimit: 20 },
    { name: 'Dispatch', price: '₦15,000', description: 'For teams coordinating live deliveries.', shipmentsLimit: 300 },
    { name: 'Fleet', price: '₦45,000', description: 'For larger logistics operations with higher throughput.', shipmentsLimit: 1200 },
  ],
  'Developer/Startup': [
    { name: 'Sandbox', price: '₦0', description: 'Try API keys, docs, and test webhooks.', shipmentsLimit: 50 },
    { name: 'Build', price: '₦10,000', description: 'Ship integrations with dependable limits.', shipmentsLimit: 250 },
    { name: 'Scale', price: '₦30,000', description: 'Higher limits for production traffic.', shipmentsLimit: 1000 },
  ],
} as const;

export default function BillingPage({
  user,
  billing,
  invoices,
  onCheckoutPlan,
  onMarkInvoicePaid,
  onShowToast,
}: BillingPageProps) {
  const usagePercent = billing.shipmentsLimit > 0 ? Math.min((billing.shipmentsUsed / billing.shipmentsLimit) * 100, 100) : 0;
  const planCards = planCardsByRole[user.accountType] ?? planCardsByRole.Merchant;
  const isDeveloper = user.accountType === 'Developer/Startup';
  const isLogistics = user.accountType === 'Logistics Company';

  return (
    <div id="billing-view-root" className="space-y-6">
      <div className="grid grid-cols-1 items-center gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:gap-6 sm:p-5 md:grid-cols-12 md:p-6">
        <div className="md:col-span-8 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Subscription Tier</span>
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-extrabold text-slate-900 font-display">{billing.plan} Plan</h3>
            <span className="bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {billing.paymentStatus}
            </span>
            <span className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              {billing.paymentProvider}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
            Billing now uses hosted Paystack checkout. {isDeveloper ? 'Developer plans unlock API access, webhooks, and higher request limits.' : isLogistics ? 'Logistics plans unlock dispatch tools, proof capture, and delivery visibility.' : 'Pick a plan, pay through Paystack, and the workspace activates automatically.'}
          </p>
        </div>

        <div className="flex flex-col justify-center space-y-3 rounded-[24px] border border-slate-200/60 bg-slate-50 p-4 text-center md:col-span-4">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase">MONTHLY SHIPMENTS</p>
            <p className="text-2xl font-black text-slate-900 mt-1 font-display">
              {billing.shipmentsUsed} / {billing.shipmentsLimit || '—'}
            </p>
            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-blue-600 h-full" style={{ width: `${usagePercent}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6">
        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 md:col-span-7 md:p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isDeveloper ? 'Developer API tiers' : isLogistics ? 'Logistics operating tiers' : 'Checkout plans'}
            </h4>
            <CreditCard className="h-4.5 w-4.5 text-slate-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {planCards.map((plan) => (
              <div key={plan.name} className={`rounded-[24px] border p-4 ${billing.plan === plan.name ? 'border-blue-600 bg-blue-50/20' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{plan.name}</p>
                    <p className="text-2xl font-extrabold text-slate-900 font-display">{plan.price}</p>
                  </div>
                  <CircleDollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{plan.description}</p>
                <button
                  onClick={() => onCheckoutPlan(plan.name)}
                  className="mt-4 w-full rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5"
                >
                  {isDeveloper ? 'Unlock tier' : 'Choose plan'}
                </button>
                <p className="mt-2 text-[10px] text-slate-400">
                  {isDeveloper ? `Higher request limits with ${plan.name} access` : `Up to ${plan.shipmentsLimit} shipments`}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            {isDeveloper
              ? 'Developer pricing is about API throughput, webhook volume, and support tiers.'
              : 'Paystack handles the payment handoff and returns the user to the workspace when checkout finishes.'}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:p-5 md:col-span-5 md:p-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Invoice history</h4>
            <span className="text-[10px] text-slate-400">{invoices.length} invoices</span>
          </div>

          <div className="space-y-3">
            {invoices.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                No invoices yet.
              </div>
            ) : (
              invoices.map((invoice) => (
                <div key={invoice.id} className="rounded-xl border border-slate-200 p-4 bg-white flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-slate-800">{invoice.id}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{invoice.plan} • {invoice.createdAt.slice(0, 10)}</p>
                    <p className="text-sm font-bold text-slate-900 mt-2">₦{invoice.amount.toLocaleString()} {invoice.currency}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">{invoice.status}</p>
                  </div>
                  {invoice.status !== 'paid' && invoice.checkoutUrl ? (
                    <a
                      href={invoice.checkoutUrl}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100"
                    >
                      Resume checkout
                    </a>
                  ) : invoice.status !== 'paid' ? (
                    <button
                      onClick={() => onMarkInvoicePaid(invoice.id)}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      Mark paid
                    </button>
                  ) : (
                    <span className="rounded-full bg-green-50 text-green-700 px-2 py-1 text-[10px] font-bold h-fit">Paid</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
