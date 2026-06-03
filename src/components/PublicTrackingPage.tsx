import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2, Clock3, MapPin, Search, Truck, Package, PhoneCall } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { api } from '../lib/sendieApi';
import type { Order } from '../types';

interface PublicTrackingPageProps {
  trackingId: string;
  onBack: () => void;
}

type TrackingResponse = {
  order: Order;
  timeline: Array<{ status: string; isComplete: boolean; isCurrent: boolean }>;
};

export default function PublicTrackingPage({ trackingId, onBack }: PublicTrackingPageProps) {
  const [searchValue, setSearchValue] = useState(trackingId);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<TrackingResponse | null>(null);

  const loadTracking = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) {
      setError('Enter a tracking ID to continue.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await api.public.tracking(trimmed);
      setResult(data);
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Tracking record not found';
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trackingId) {
      setSearchValue(trackingId);
      void loadTracking(trackingId);
    }
  }, [trackingId]);

  const order = result?.order;

  const statusMeta = useMemo(() => {
    if (!order) {
      return null;
    }

    switch (order.status) {
      case 'Delivered':
        return { label: 'Delivered', tone: 'bg-green-50 text-green-700 border-green-200', note: 'The package has been completed.' };
      case 'In Transit':
        return { label: 'In Transit', tone: 'bg-blue-50 text-blue-700 border-blue-200', note: 'The courier is en route.' };
      case 'Picked Up':
        return { label: 'Picked Up', tone: 'bg-purple-50 text-purple-700 border-purple-200', note: 'The courier has collected the parcel.' };
      case 'Failed':
        return { label: 'Failed', tone: 'bg-red-50 text-red-700 border-red-200', note: 'The last delivery attempt was not completed.' };
      default:
        return { label: 'Pending', tone: 'bg-amber-50 text-amber-700 border-amber-200', note: 'The shipment is waiting for pickup.' };
    }
  }, [order]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_28%),#f8fafc] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <BrandLogo size="md" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.26em] text-blue-600">Track a delivery</p>
            <h1 className="mt-3 text-3xl font-display font-extrabold tracking-tight text-slate-950">
              Track every delivery.
              <span className="block text-blue-600">Stay informed.</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
              Enter a tracking ID to view the current status, timeline, and expected delivery time.
            </p>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Enter tracking ID"
                  className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                onClick={() => void loadTracking(searchValue)}
                disabled={loading}
                className="mt-3 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Track delivery'}
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: 'Public page', value: 'No login required' },
                { label: 'Support', value: 'Shared with merchant' },
                { label: 'Updates', value: 'Timeline + ETA' },
                { label: 'Proof', value: 'Photo / OTP / signature' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <div className="lg:col-span-7 space-y-6">
            {!order ? (
              <div className="rounded-[32px] border border-dashed border-slate-300 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                <div className="flex items-center gap-3 text-slate-500">
                  <Truck className="h-5 w-5" />
                  <p className="text-sm font-semibold">Load a valid tracking ID to see the delivery status here.</p>
                </div>
                {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Tracking ID</p>
                      <h2 className="mt-1 text-2xl font-display font-extrabold text-slate-950">{order.id}</h2>
                      <p className="mt-2 text-sm text-slate-500">{statusMeta?.note}</p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold ${statusMeta?.tone || 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                      {statusMeta?.label}
                    </span>
                  </div>

                  <div className="grid gap-4 p-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <Package className="h-4 w-4" />
                        Package
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900">{order.itemDescription}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{order.notes || 'No special delivery notes were recorded.'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <MapPin className="h-4 w-4" />
                        Route
                      </div>
                      <p className="mt-3 text-sm font-semibold text-slate-900">{order.pickupLocation}</p>
                      <p className="mt-1 text-xs text-slate-500">to</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{order.deliveryLocation}</p>
                    </div>
                  </div>

                  <div className="grid gap-4 border-t border-slate-100 p-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Rider</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{order.riderAssignment?.name || 'Not assigned yet'}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.riderAssignment?.vehicle || 'Awaiting dispatch assignment'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">GPS-lite</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{order.gpsTracking?.enabled ? 'Live on active delivery' : 'Not enabled'}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.gpsTracking?.lastKnownLocation || 'No live location yet'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Exception</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{order.deliveryException?.status === 'open' ? 'Open' : 'Clear'}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.deliveryException?.note || 'No active delivery exception'}</p>
                    </div>
                  </div>
                </motion.div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Timeline</h3>
                    <div className="mt-5 space-y-4">
                      {result?.timeline.map((step, index) => (
                        <div key={`${step.status}-${index}`} className="flex items-start gap-3">
                          <div className={`mt-0.5 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${step.isComplete ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                            {step.isComplete ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <p className={`text-sm font-semibold ${step.isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>{step.status}</p>
                            <p className="mt-1 text-xs text-slate-400">{step.isCurrent ? 'Current step' : step.isComplete ? 'Completed' : 'Pending'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-300">Customer help</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">
                      If something looks wrong, contact the merchant or delivery support with the tracking ID above.
                    </p>
                    <div className="mt-5 space-y-3 text-sm">
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <PhoneCall className="h-4 w-4 text-blue-300" />
                        <span>Merchant support contact</span>
                      </div>
                      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <Clock3 className="h-4 w-4 text-blue-300" />
                        <span>Estimated delivery: {order.estimatedDelivery}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
