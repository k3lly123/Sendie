import React, { useMemo, useState } from 'react';
import {
  PlusCircle,
  Share2,
  FileCode,
  TrendingUp,
  Clock,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  ArrowRight,
  LayoutDashboard,
  Terminal,
  CreditCard,
  Shield,
  Sparkles,
  Activity,
  KeyRound,
  BellRing,
  Users,
  Layers3,
  RefreshCcw,
  MapPin,
} from 'lucide-react';
import { ApiKey, ApiUsageStats, AppScreen, BillingState, Customer, Notification, Order, UserSession } from '../types';
import { getRoleMeta } from './workspaceTheme';

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

interface DashboardHomeProps {
  user: UserSession;
  orders: Order[];
  customers: Customer[];
  apiKeys: ApiKey[];
  apiStats: ApiUsageStats;
  billing: BillingState;
  webhooks: WebhookEvent[];
  notifications: Notification[];
  onNavigate: (screen: AppScreen) => void;
  onSelectOrder: (orderId: string) => void;
}

const quickActionsByRole: Record<UserSession['accountType'], Array<{ label: string; description: string; target: AppScreen; icon: React.ReactNode }>> = {
  Merchant: [
    { label: 'Create delivery', description: 'Launch the simple order form.', target: 'create-order', icon: <PlusCircle className="h-4 w-4" /> },
    { label: 'Open tracking', description: 'Preview the customer tracking flow.', target: 'tracking', icon: <Share2 className="h-4 w-4" /> },
    { label: 'Customers', description: 'See repeat buyers and delivery history.', target: 'customers', icon: <Users className="h-4 w-4" /> },
  ],
  'Developer/Startup': [
    { label: 'Generate key', description: 'Create an integration token.', target: 'api', icon: <Terminal className="h-4 w-4" /> },
    { label: 'Read docs', description: 'See locked vs unlocked endpoints by plan.', target: 'api-docs', icon: <FileCode className="h-4 w-4" /> },
    { label: 'Open pricing', description: 'See how access scales as you grow.', target: 'billing', icon: <CreditCard className="h-4 w-4" /> },
  ],
  'Logistics Company': [
    { label: 'Open dispatch', description: 'View the live delivery queue.', target: 'orders', icon: <Truck className="h-4 w-4" /> },
    { label: 'Create shipment', description: 'Book a new delivery job quickly.', target: 'create-order', icon: <PlusCircle className="h-4 w-4" /> },
    { label: 'Live tracking', description: 'Watch active deliveries and status.', target: 'tracking', icon: <MapPin className="h-4 w-4" /> },
  ],
  Admin: [
    { label: 'Open controls', description: 'Manage workspace settings and resets.', target: 'settings', icon: <Shield className="h-4 w-4" /> },
    { label: 'Billing', description: 'Review subscription state and invoices.', target: 'billing', icon: <CreditCard className="h-4 w-4" /> },
    { label: 'Monitor orders', description: 'Check the live platform feed.', target: 'orders', icon: <LayoutDashboard className="h-4 w-4" /> },
  ],
};

export default function DashboardHome({
  user,
  orders,
  customers,
  apiKeys,
  apiStats,
  billing,
  webhooks,
  notifications,
  onNavigate,
  onSelectOrder,
}: DashboardHomeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const role = getRoleMeta(user.accountType);
  const actions = quickActionsByRole[user.accountType] ?? quickActionsByRole.Merchant;

  const summary = useMemo(() => {
    const totalOrdersCount = orders.length;
    const pendingCount = orders.filter((order) => order.status === 'Pending').length;
    const inTransitCount = orders.filter((order) => order.status === 'In Transit' || order.status === 'Picked Up').length;
    const deliveredCount = orders.filter((order) => order.status === 'Delivered').length;
    const successRate = apiStats.requestsCount > 0
      ? Math.round((apiStats.successfulRequests / apiStats.requestsCount) * 100)
      : 0;
    const webhookHealth = webhooks.length === 0
      ? 100
      : Math.round((webhooks.filter((webhook) => webhook.status === 'delivered').length / webhooks.length) * 100);
    const gpsEnabledCount = orders.filter((order) => order.gpsTracking?.enabled).length;
    const proofPendingCount = orders.filter((order) => order.status !== 'Delivered' && order.proofOfDelivery?.status !== 'captured').length;
    const riderAssignedCount = orders.filter((order) => order.riderAssignment?.status && order.riderAssignment.status !== 'unassigned').length;
    const openExceptionCount = orders.filter((order) => order.deliveryException?.status === 'open').length;

    return {
      totalOrdersCount,
      pendingCount,
      inTransitCount,
      deliveredCount,
      successRate,
      webhookHealth,
      gpsEnabledCount,
      proofPendingCount,
      riderAssignedCount,
      openExceptionCount,
      proofCaptured: orders.some((order) => order.proofOfDelivery?.status === 'captured'),
    };
  }, [apiStats.failedRequests, apiStats.requestsCount, apiStats.successfulRequests, orders, webhooks]);

  const handleCopyLink = (event: React.MouseEvent, id: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(`https://sendie.sh/track/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const statusPill = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Picked Up':
        return 'bg-violet-50 text-violet-700 border-violet-100';
      case 'In Transit':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  return (
    <div id="dashboard-home-view" className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="relative p-6 md:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.08),transparent_30%)]" />
            <div className="relative space-y-5">
              <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] ${role.softAccent} ${role.borderAccent}`}>
                <Sparkles className="h-3.5 w-3.5" />
                <span>{role.title}</span>
              </div>
              <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                <div className="max-w-2xl space-y-3">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Welcome back, {user.businessName}</p>
                  <h2 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight text-slate-950">
                    {user.accountType === 'Merchant' && 'Simple order operations for merchants and vendors.'}
                    {user.accountType === 'Developer/Startup' && 'Clean API and integration tools for your team.'}
                    {user.accountType === 'Logistics Company' && 'Run dispatch, tracking, and proof of delivery in one calm console.'}
                    {user.accountType === 'Admin' && 'Monitor the platform with calm, clear controls.'}
                  </h2>
                  <p className="text-sm md:text-base leading-relaxed text-slate-600">
                    {user.accountType === 'Merchant' && 'Create deliveries, share tracking links, and keep customer workflows clean.'}
                    {user.accountType === 'Developer/Startup' && 'Generate keys, inspect request health, and manage pricing for your API access.'}
                    {user.accountType === 'Logistics Company' && 'Coordinate shipments, keep visibility high, and capture proof without the chaos.'}
                    {user.accountType === 'Admin' && 'Review billing, usage, notifications, and reset the workspace when needed.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 xl:w-[40rem]">
                  {actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => onNavigate(action.target)}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white">
                          {action.icon}
                        </span>
                        <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                      </div>
                      <p className="mt-4 text-sm font-bold text-slate-950">{action.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Notifications</p>
                <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{notifications.filter((notification) => notification.unread).length}</p>
                <p className="mt-1 text-xs text-slate-500">Unread items in this workspace</p>
              </div>
              <BellRing className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Role</p>
                <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{role.shortTitle}</p>
                <p className="mt-1 text-xs text-slate-500">{role.description}</p>
              </div>
              <Shield className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Total orders</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-display font-extrabold text-slate-950">{summary.totalOrdersCount}</p>
            <Truck className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Pending</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-display font-extrabold text-slate-950">{summary.pendingCount}</p>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">In transit</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-display font-extrabold text-slate-950">{summary.inTransitCount}</p>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Delivered</p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-3xl font-display font-extrabold text-slate-950">{summary.deliveredCount}</p>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {user.accountType === 'Merchant' && (
          <>
            <div className="lg:col-span-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Recent dispatches</h3>
                  <p className="mt-1 text-xs text-slate-500">Merchant-friendly view of the latest orders</p>
                </div>
                <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-blue-600 hover:underline">
                  View all
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="p-4 pl-6">Order ID</th>
                      <th className="p-4">Customer</th>
                      <th className="p-4">Item</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4">Created</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => {
                          onSelectOrder(order.id);
                          onNavigate('order-details');
                        }}
                        className="cursor-pointer transition-colors hover:bg-slate-50/80"
                      >
                        <td className="p-4 pl-6 font-mono font-bold text-slate-950">{order.id}</td>
                        <td className="p-4">
                          <p className="font-semibold text-slate-800">{order.customerName}</p>
                          <p className="mt-1 text-[10px] font-mono text-slate-400">{order.customerPhone}</p>
                        </td>
                        <td className="p-4 text-slate-600">{order.itemDescription}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusPill(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-slate-400">{order.createdDate.split(' ')[0]}</td>
                        <td className="p-4 pr-6 text-right" onClick={(event) => event.stopPropagation()}>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                onSelectOrder(order.id);
                                onNavigate('order-details');
                              }}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View
                            </button>
                            <button
                              onClick={(event) => handleCopyLink(event, order.id)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                            >
                              {copiedId === order.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                              Copy link
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Customer snapshot</h3>
              <p className="mt-2 text-xs text-slate-500">A simple, clean list for sellers and vendors.</p>
              <div className="mt-4 space-y-3">
                {customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="rounded-2xl border border-slate-200 p-3">
                      <p className="text-sm font-bold text-slate-900">{customer.name}</p>
                      <p className="mt-1 text-[11px] text-slate-500">{customer.totalOrders} orders · last delivery {customer.recentDelivery}</p>
                    </div>
                ))}
                {customers.length === 0 && <p className="text-xs text-slate-400">No customers yet.</p>}
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Merchant readiness</h3>
              <p className="mt-2 text-xs text-slate-500">The core merchant flow should feel obvious and low-friction.</p>
              <div className="mt-4 space-y-3">
                {[
                  { label: 'Create first order', done: summary.totalOrdersCount > 0 },
                  { label: 'Update delivery status', done: summary.totalOrdersCount > 0 && summary.pendingCount < summary.totalOrdersCount },
                  { label: 'Capture proof of delivery', done: summary.proofCaptured },
                  { label: 'Enable free browser alerts', done: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 px-3 py-2">
                    {item.done ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <Clock className="h-4.5 w-4.5 text-amber-500" />
                    )}
                    <p className={`text-xs font-semibold ${item.done ? 'text-slate-900' : 'text-slate-500'}`}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Merchant flow is ready</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-900/70">
                      Keep it simple: create an order, share tracking, and monitor delivery progress.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {user.accountType === 'Logistics Company' && (
          <>
            <div className="lg:col-span-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.22em] text-slate-900">Dispatch board</h3>
                  <p className="mt-1 text-xs text-slate-500">One clean queue for delivery status, proof, and visibility.</p>
                </div>
                <button onClick={() => onNavigate('orders')} className="text-xs font-bold text-emerald-600 hover:underline">
                  Open board
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="p-4 pl-6">Shipment</th>
                      <th className="p-4">Destination</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Proof</th>
                      <th className="p-4 text-center">GPS-lite</th>
                      <th className="p-4 text-right pr-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 6).map((order) => {
                      const proofCaptured = order.proofOfDelivery?.status === 'captured';
                      const gpsEnabled = Boolean(order.gpsTracking?.enabled);
                      const destination = order.dropOffLandmark || order.deliveryLocation;
                      return (
                        <tr
                          key={order.id}
                          onClick={() => {
                            onSelectOrder(order.id);
                            onNavigate('order-details');
                          }}
                          className="cursor-pointer transition-colors hover:bg-slate-50/80"
                        >
                          <td className="p-4 pl-6">
                            <p className="font-mono font-bold text-slate-950">{order.id}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{order.customerName}</p>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-slate-800">{destination}</p>
                            <p className="mt-1 text-[10px] text-slate-400">{order.dropOffContactName || 'No drop-off contact yet'}</p>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusPill(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${proofCaptured ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-amber-100 bg-amber-50 text-amber-700'}`}>
                              {proofCaptured ? 'Captured' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${gpsEnabled ? 'border-blue-100 bg-blue-50 text-blue-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
                              {gpsEnabled ? 'On' : 'Off'}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right" onClick={(event) => event.stopPropagation()}>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  onSelectOrder(order.id);
                                  onNavigate('order-details');
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                              <button
                                onClick={(event) => handleCopyLink(event, order.id)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-50"
                              >
                                {copiedId === order.id ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                Share
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Visibility</h3>
                <p className="mt-2 text-xs text-slate-500">Keep the operation calm with just the right amount of data.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Active deliveries</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.inTransitCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">GPS-lite on</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.gpsEnabledCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Proof captured</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.proofCaptured ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Proof pending</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.proofPendingCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Riders assigned</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.riderAssignedCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Open exceptions</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.openExceptionCount}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Proof queue</h3>
                <div className="mt-4 space-y-3">
                  {orders.filter((order) => order.status !== 'Delivered' && order.proofOfDelivery?.status !== 'captured').slice(0, 3).map((order) => (
                    <button
                      key={order.id}
                      onClick={() => {
                        onSelectOrder(order.id);
                        onNavigate('order-details');
                      }}
                      className="w-full rounded-2xl border border-slate-200 p-3 text-left hover:bg-slate-50"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-bold text-slate-900">{order.id}</p>
                        <span className="rounded-full border border-amber-100 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Needs proof</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-500">{order.customerName} · {order.deliveryLocation}</p>
                    </button>
                  ))}
                  {orders.filter((order) => order.status !== 'Delivered' && order.proofOfDelivery?.status !== 'captured').length === 0 && (
                    <p className="text-xs text-slate-400">All active deliveries have proof captured.</p>
                  )}
                </div>
              </div>

              <div className="rounded-[28px] border border-emerald-100 bg-emerald-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-900">Logistics flow is ready</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-900/70">
                      Dispatch, GPS-lite, proof of delivery, and calm visibility stay in one operations path.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {user.accountType === 'Developer/Startup' && (
          <>
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">API health</h3>
                    <p className="mt-1 text-xs text-slate-500">Use this for integration checks, release verification, and plan-based API access.</p>
                  </div>
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Requests</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{apiStats.requestsCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Success rate</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.successRate}%</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">API keys</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{apiKeys.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Webhook health</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.webhookHealth}%</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">API keys</h3>
                      <p className="mt-1 text-xs text-slate-500">Keep production and test access clear.</p>
                    </div>
                    <KeyRound className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {apiKeys.slice(0, 3).map((key) => (
                      <div key={key.id} className="rounded-2xl border border-slate-200 p-3">
                        <p className="text-sm font-bold text-slate-900">{key.name}</p>
                        <p className="mt-1 font-mono text-[11px] text-slate-500">{key.prefix}{key.secret}</p>
                      </div>
                    ))}
                    {apiKeys.length === 0 && <p className="text-xs text-slate-400">No API keys yet. Generate one to start testing.</p>}
                    <button onClick={() => onNavigate('api')} className="mt-2 inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                      Open API portal
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Developer pricing</h3>
                      <p className="mt-1 text-xs text-slate-500">API access grows with your usage. Logistics operations stay in the separate console.</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {[
                      { name: 'Sandbox', price: 'Free', note: 'Try API keys, docs, and test webhooks.', target: 'billing' as AppScreen },
                      { name: 'Build', price: '₦10,000', note: 'For teams shipping integrations into real stores.', target: 'billing' as AppScreen },
                      { name: 'Scale', price: '₦30,000', note: 'Higher limits for production API traffic and webhooks.', target: 'billing' as AppScreen },
                    ].map((plan) => (
                      <button
                        key={plan.name}
                        onClick={() => onNavigate(plan.target)}
                        className="w-full rounded-2xl border border-slate-200 p-3 text-left hover:bg-slate-50"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-slate-900">{plan.name}</p>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">{plan.price}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">{plan.note}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Developer shortcuts</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={() => onNavigate('api')} className="flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-left text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Terminal className="h-4.5 w-4.5" />
                      Generate API key
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => onNavigate('api-docs')} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <FileCode className="h-4.5 w-4.5 text-slate-500" />
                      Read docs
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => onNavigate('create-order')} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <PlusCircle className="h-4.5 w-4.5 text-slate-500" />
                      Test merchant flow
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-blue-100 bg-blue-50/70 p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Layers3 className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-900">Developer flow is API-first</p>
                    <p className="mt-1 text-xs leading-relaxed text-blue-900/70">
                      Keys, docs, usage, and pricing are visible here; logistics operations stay in the logistics console.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {user.accountType === 'Admin' && (
          <>
            <div className="lg:col-span-8 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Platform health</h3>
                    <p className="mt-1 text-xs text-slate-500">A lightweight control room for monitoring activity.</p>
                  </div>
                  <Activity className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Orders</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{summary.totalOrdersCount}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Customers</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{customers.length}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Failed requests</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{apiStats.failedRequests}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Billing tier</p>
                    <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{billing.plan}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Billing overview</h3>
                      <p className="mt-1 text-xs text-slate-500">Plan, usage, invoice state, and the next action to take.</p>
                    </div>
                    <CreditCard className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Shipments used</p>
                      <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">{billing.shipmentsUsed} / {billing.shipmentsLimit || '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Monthly revenue</p>
                      <p className="mt-2 text-2xl font-display font-extrabold text-slate-950">₦{billing.monthlyRevenue.toLocaleString()}</p>
                    </div>
                    <button onClick={() => onNavigate('billing')} className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:underline">
                      Open billing
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Activity stream</h3>
                      <p className="mt-1 text-xs text-slate-500">Notifications and recent webhook events.</p>
                    </div>
                    <BellRing className="h-5 w-5 text-slate-400" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="rounded-2xl border border-slate-200 p-3">
                        <p className="text-sm font-semibold text-slate-900">{notification.text}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">{notification.time}</p>
                      </div>
                    ))}
                    {notifications.length === 0 && <p className="text-xs text-slate-400">No notifications yet.</p>}
                    {webhooks.slice(0, 2).map((webhook) => (
                      <div key={webhook.id} className="rounded-2xl border border-slate-200 p-3">
                        <p className="text-sm font-semibold text-slate-900">{webhook.eventType}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{webhook.target}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-900">Admin controls</h3>
                <div className="mt-4 space-y-3">
                  <button onClick={() => onNavigate('settings')} className="flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-left text-xs font-bold text-white">
                    <span className="flex items-center gap-2">
                      <Shield className="h-4.5 w-4.5" />
                      Workspace controls
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button onClick={() => onNavigate('billing')} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4.5 w-4.5 text-slate-500" />
                      Billing view
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                  <button onClick={() => onNavigate('orders')} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <span className="flex items-center gap-2">
                      <LayoutDashboard className="h-4.5 w-4.5 text-slate-500" />
                      Monitor orders
                    </span>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <RefreshCcw className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Reset available in settings</p>
                    <p className="mt-1 text-xs leading-relaxed text-slate-500">
                      Use it when you want a clean seeded workspace to run another role test cycle.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
