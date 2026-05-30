import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  PlusCircle, 
  Share2, 
  FileCode, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Truck, 
  CheckCircle2, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Eye,
  Edit2,
  ArrowRight
} from 'lucide-react';
import { Order, AppScreen } from '../types';

interface DashboardHomeProps {
  orders: Order[];
  onNavigate: (screen: AppScreen) => void;
  onSelectOrder: (orderId: string) => void;
}

export default function DashboardHome({ orders, onNavigate, onSelectOrder }: DashboardHomeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Derive stats
  const totalOrdersCount = orders.length;
  const pendingCount = orders.filter(o => o.status === 'Pending').length;
  const inTransitCount = orders.filter(o => o.status === 'In Transit' || o.status === 'Picked Up').length;
  const deliveredCount = orders.filter(o => o.status === 'Delivered').length;

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://sendie.sh/track/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Picked Up':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Failed':
      default:
        return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  return (
    <div id="dashboard-home-view" className="space-y-8">
      
      {/* Analytics Cards Row */}
      <section id="analytics-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Orders Card */}
        <div id="metric-total-orders" className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Total Orders</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display block">{totalOrdersCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>+24.1% <span className="text-slate-400 font-normal">vs last month</span></span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/40">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        {/* Pending Card */}
        <div id="metric-pending" className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Pending Runs</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display block">{pendingCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-bold">
              <Clock className="h-3.5 w-3.5" />
              <span>{pendingCount > 0 ? 'Awaiting dispatch' : 'Full pipeline clean'}</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/40">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* In Transit Card */}
        <div id="metric-in-transit" className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">In Transit</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display block">{inTransitCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
              <TrendingUp className="h-3.5 w-3.5 animate-bounce" />
              <span>Active couriers live</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/40 transit-pulse">
            <Truck className="h-6 w-6" />
          </div>
        </div>

        {/* Delivered Card */}
        <div id="metric-delivered" className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-premium flex items-center justify-between">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block">Delivered Orders</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display block">{deliveredCount}</span>
            <div className="flex items-center gap-1.5 text-xs text-green-600 font-bold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>99.2% success rate</span>
            </div>
          </div>
          <div className="h-12 w-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100/40">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

      </section>

      {/* Main Content Layout: Table & Quick tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Side: Recent Orders Table */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-xl shadow-premium overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Dispatches</h3>
              <p className="text-xs text-slate-400 mt-1">Real-time trace indicators on pending order runs</p>
            </div>
            <button 
              onClick={() => onNavigate('orders')}
              className="text-xs text-blue-600 font-bold hover:underline"
            >
              View all orders
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-[#FAFBFD] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Delivery Cargo</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.slice(0, 5).map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => { onSelectOrder(order.id); onNavigate('order-details'); }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {order.id}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-800 leading-none">{order.customerName}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 font-medium truncate max-w-[150px]">
                      {order.itemDescription}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono">
                      {order.createdDate.split(' ')[0]}
                    </td>
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2.5">
                        <button
                          onClick={() => { onSelectOrder(order.id); onNavigate('order-details'); }}
                          className="p-1 px-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors inline-flex items-center gap-1"
                          title="View order logs"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={(e) => handleCopyLink(e, order.id)}
                          className="p-1 px-2 rounded-md hover:bg-slate-100 text-slate-600 transition-colors inline-flex items-center gap-1"
                          title="Copy customer live link"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                          <span>Copy link</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Quick Action tools */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-premium">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Quick dispatch actions</h3>
            
            <div className="space-y-3">
              {/* Primary action */}
              <button
                id="quick-create-dispatch"
                onClick={() => onNavigate('create-order')}
                className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-3 text-xs font-semibold flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle className="h-4.5 w-4.5" />
                  <span>Create Delivery Order</span>
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Generate links helper */}
              <button
                id="quick-tracking-portal"
                onClick={() => {
                  if (orders.length > 0) {
                    onSelectOrder(orders[0].id);
                  }
                  onNavigate('tracking');
                }}
                className="cursor-pointer w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg p-3 text-xs font-semibold flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2">
                  <Share2 className="h-4.5 w-4.5 text-slate-500" />
                  <span>Simulate Tracking Terminal</span>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600" />
              </button>

              {/* API documentation hook */}
              <button
                id="quick-view-docs"
                onClick={() => onNavigate('api-docs')}
                className="cursor-pointer w-full bg-slate-900 hover:bg-slate-950 text-white rounded-lg p-3 text-xs font-semibold flex items-center justify-between transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <FileCode className="h-4.5 w-4.5 text-blue-400" />
                  <span>Explore Developer API docs</span>
                </div>
                <ArrowRight className="h-4 w-4 text-blue-400 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

          {/* Infrastructure uptime card */}
          <div className="bg-slate-150 border border-slate-200 rounded-xl p-5 flex items-start gap-4">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Operational Uptime: 100%</p>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                All courier webhooks active. Database read/write throughput operational. Connected to 6 local routing partners.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
