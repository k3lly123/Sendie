import React, { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, MapPin, Package, PhoneCall, Search, Sparkles, Truck } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { Order, OrderStatus } from '../types';

interface TrackingPageProps {
  orders: Order[];
  selectedOrderId: string;
  onSelectOrderId: (id: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

type TimelineStep = {
  title: string;
  desc: string;
};

const statusSteps: OrderStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];

function getStatusMeta(status: OrderStatus) {
  switch (status) {
    case 'Pending':
      return {
        text: 'Awaiting pickup',
        desc: 'Merchant is preparing the delivery for dispatch.',
        badge: 'text-amber-600 bg-amber-500/10',
      };
    case 'Picked Up':
      return {
        text: 'Picked up',
        desc: 'Courier has collected the package and the handoff is recorded.',
        badge: 'text-purple-600 bg-purple-500/10',
      };
    case 'In Transit':
      return {
        text: 'In transit',
        desc: 'The delivery is moving toward the destination.',
        badge: 'text-blue-600 bg-blue-500/10',
      };
    case 'Delivered':
      return {
        text: 'Delivered',
        desc: 'Package reached the recipient successfully.',
        badge: 'text-emerald-600 bg-emerald-500/10',
      };
    case 'Failed':
    default:
      return {
        text: 'Delivery issue',
        desc: 'The delivery needs attention or a reattempt.',
        badge: 'text-rose-600 bg-rose-500/10',
      };
  }
}

export default function TrackingPage({
  orders,
  selectedOrderId,
  onSelectOrderId,
  onShowToast,
}: TrackingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeOrder = useMemo(() => {
    if (!orders.length) return undefined;
    return orders.find((order) => order.id === selectedOrderId) || orders[0];
  }, [orders, selectedOrderId]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((order) => {
      return (
        order.id.toLowerCase().includes(query) ||
        order.customerName.toLowerCase().includes(query) ||
        order.itemDescription.toLowerCase().includes(query)
      );
    });
  }, [orders, searchTerm]);

  const currentIndex = activeOrder
    ? statusSteps.indexOf(activeOrder.status === 'Failed' ? 'Pending' : activeOrder.status)
    : 0;

  const timeline: TimelineStep[] = [
    { title: 'Order created', desc: 'The merchant recorded the shipment.' },
    { title: 'Package picked up', desc: 'Courier received the parcel.' },
    { title: 'In transit', desc: 'Delivery is on the move.' },
    { title: 'Delivered', desc: 'Package reached the recipient.' },
  ];

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = filteredOrders.find((order) => order.id.toLowerCase().includes(searchTerm.trim().toLowerCase()));

    if (found) {
      onSelectOrderId(found.id);
      setSearchTerm('');
      return;
    }

    const message = `Tracking ID "${searchTerm}" was not found. Try a full ID like TRK-78290.`;
    if (onShowToast) {
      onShowToast(message, 'error');
    } else {
      alert(message);
    }
  };

  const handleCopyLink = async () => {
    if (!activeOrder) return;
    await navigator.clipboard.writeText(`https://sendie.sh/track/${activeOrder.id}`);
    setCopiedId(activeOrder.id);
    window.setTimeout(() => setCopiedId(null), 1800);
  };

  const statusMeta = activeOrder ? getStatusMeta(activeOrder.status) : null;

  return (
    <div id="tracking-customer-portal" className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 rounded-[28px] border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.26em] text-blue-700">
            <Sparkles className="h-4 w-4" />
            Customer tracking preview
          </p>
          <p className="mt-1 text-xs leading-relaxed text-blue-700/80">
            Preview the customer-facing delivery page for any order in this workspace.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex w-full gap-2 md:w-auto">
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search tracking ID"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/15 md:w-64"
          />
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700"
          >
            Track
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-5">
          <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-800">Tracked orders</h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-500">
              Choose any order to preview the customer tracking experience.
            </p>

            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                  No orders match your search.
                </div>
              ) : (
                filteredOrders.map((order) => {
                  const isActive = order.id === activeOrder?.id;
                  return (
                    <button
                      key={order.id}
                      onClick={() => onSelectOrderId(order.id)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                        isActive
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                          : 'border-slate-100 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <p className="font-mono text-sm font-bold text-slate-900">{order.id}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{order.customerName}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {order.status}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center lg:col-span-7">
          <div className="w-full max-w-[390px] overflow-hidden rounded-[40px] border-4 border-slate-800 bg-[#0f172a] p-2.5 shadow-2xl">
            <div className="relative overflow-hidden rounded-[32px] bg-slate-50 text-slate-800">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white p-4 pb-3">
                <BrandLogo size="sm" iconOnly />
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase leading-none tracking-widest text-slate-400">
                    Public tracking
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-900">Sendie delivery</p>
                </div>
              </div>

              <div className="space-y-4 p-4">
                <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-100/60 to-sky-50">
                  <div className="absolute inset-0 bg-[radial-gradient(#93c5fd_1px,transparent_1px)] [background-size:18px_18px] opacity-30" />
                  <svg className="absolute inset-0 h-full w-full text-blue-500/70" fill="none" stroke="currentColor">
                    <path d="M 22 92 C 66 68 84 24 176 42 C 238 54 260 20 330 22" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute left-5 top-[78px] h-3 w-3 rounded-full border-2 border-white bg-blue-600 ring-4 ring-blue-500/10" />
                  <div className="absolute right-10 top-[14px] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-500 text-[10px] text-white shadow">
                    <Check className="h-3 w-3" />
                  </div>
                  {activeOrder && activeOrder.status !== 'Delivered' && activeOrder.status !== 'Failed' ? (
                    <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1 shadow-sm">
                      <Truck className="h-3 w-3 text-blue-600" />
                      <span className="text-[9px] font-bold text-slate-800">Courier on route</span>
                    </div>
                  ) : null}
                  <div className="absolute bottom-2 left-2 rounded-md bg-slate-900/90 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-white">
                    ID: {activeOrder?.id ?? 'TRK-...'}
                  </div>
                </div>

                {activeOrder && statusMeta ? (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                        {activeOrder.id}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusMeta.badge}`}>
                        {statusMeta.text}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{statusMeta.desc}</h4>
                      <p className="mt-1 text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Estimated delivery: {activeOrder.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                ) : null}

                {activeOrder ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h5 className="mb-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      Delivery milestones
                    </h5>

                    <div className="relative space-y-4 pl-5">
                      <div className="absolute bottom-2 left-2 top-2 w-px bg-slate-100" />
                      {timeline.map((step, index) => {
                        const active = index <= currentIndex && activeOrder.status !== 'Failed';
                        const current = index === currentIndex && activeOrder.status !== 'Failed';
                        const dotClass = current
                          ? 'border-blue-100 bg-blue-600 text-white ring-2 ring-blue-500/10'
                          : active
                            ? 'border-green-100 bg-green-600 text-white'
                            : 'border-slate-100 bg-slate-100 text-slate-300';

                        return (
                          <div key={step.title} className="relative">
                            <span
                              className={`absolute -left-[17px] flex h-3.5 w-3.5 items-center justify-center rounded-full border text-[7px] ${dotClass}`}
                            >
                              {active ? <Check className="h-2.5 w-2.5" /> : ''}
                            </span>
                            <p className={`text-xs font-bold ${active ? 'text-slate-800' : 'text-slate-400'}`}>
                              {step.title}
                            </p>
                            <p className="mt-1 text-[10px] leading-normal text-slate-400">{step.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {activeOrder ? (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-[#fafbfd] p-4 text-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Delivery details</p>
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <Package className="h-4 w-4 flex-shrink-0 text-slate-500" />
                      <span>{activeOrder.itemDescription}</span>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white p-2 text-[11px] leading-relaxed text-slate-500">
                      <strong>Delivery notes:</strong>{' '}
                      {activeOrder.notes || 'Handle with care and deliver to the recipient on arrival.'}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      <span>Sender: {activeOrder.customerName}</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        {copiedId === activeOrder.id ? 'Copied link!' : 'Share tracking link'}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3 rounded-2xl bg-slate-900 p-4 text-white shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-blue-400">
                      <PhoneCall className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold">Need delivery support?</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-slate-400">
                    Questions about the delivery status or ETA? Contact the support line below.
                  </p>
                  <a
                    href="tel:+234800SENDIE"
                    className="block rounded-lg bg-blue-600 py-2 text-center text-xs font-bold text-white transition-colors hover:bg-blue-500"
                  >
                    Contact support
                  </a>
                </div>
              </div>

              <div className="flex justify-center border-t border-slate-200 bg-white p-3">
                <div className="h-1 w-24 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
