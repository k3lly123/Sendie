import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  User, 
  Smartphone,
  BookOpen,
  Copy,
  Check,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  AlertOctagon,
  RefreshCw,
  Trash2,
  Printer
} from 'lucide-react';
import { Order, OrderStatus, AppScreen } from '../types';

interface OrderDetailsPageProps {
  order: Order | null;
  onNavigate: (screen: AppScreen) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onCancelOrder: (orderId: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function OrderDetailsPage({ order, onNavigate, onUpdateStatus, onCancelOrder, onShowToast }: OrderDetailsPageProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  if (!order) {
    return (
      <div className="text-center py-16 bg-white border border-slate-200 rounded-xl max-w-lg mx-auto">
        <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">No active order selected.</p>
        <p className="text-xs text-slate-400 mt-1">Please select an order from the list or create a new run.</p>
        <button
          onClick={() => onNavigate('orders')}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all"
        >
          View Dispatches
        </button>
      </div>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://sendie.sh/track/${order.id}`);
    setCopiedLink(true);
    if (onShowToast) {
      onShowToast(`Tracking link for ${order.id} copied successfully.`, 'success');
    }
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStatusChange = (status: OrderStatus) => {
    setUpdating(true);
    setTimeout(() => {
      onUpdateStatus(order.id, status);
      setUpdating(false);
    }, 400);
  };

  // Timeline steps computation
  const statusValues: OrderStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];
  const currentIndex = statusValues.indexOf(order.status === 'Failed' ? 'Pending' : order.status);

  const stepsDetails = [
    { title: 'Order Created', desc: 'Registered in Sendie mesh system', time: '07:15 AM' },
    { title: 'Picked Up', desc: 'Assigned and loaded by local courier', time: '10:05 AM' },
    { title: 'In Transit', desc: 'Cargo en-route to delivery drop-off', time: '01:40 PM' },
    { title: 'Delivered', desc: 'Cargo safely received by terminal contact', time: '04:30 PM' },
  ];

  return (
    <div id="order-details-root" className="max-w-4xl mx-auto">
      
      {/* INTERACTIVE EXPERIENCE (HIDDEN ON PRINT) */}
      <div className="print:hidden space-y-6">
        
        {/* HEADER BAR */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onNavigate('orders')}
              className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-extrabold text-slate-900 tracking-wide">{order.id}</span>
                <span className={`text-[10px] font-bold border rounded-full px-2 py-0.5 whitespace-nowrap bg-blue-50 text-blue-700 border-blue-100 uppercase`}>
                  {order.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Created Date: {order.createdDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print Receipt Button */}
            <button
              id="order-details-print-btn"
              onClick={() => window.print()}
              className="cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Printer className="h-3.5 w-3.5 text-slate-400" />
              <span>Print Receipt</span>
            </button>

            {/* Copy customer link */}
            <button
              id="order-details-copy-link"
              onClick={handleCopyLink}
              className="cursor-pointer bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              {copiedLink ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-slate-400" />}
              <span>{copiedLink ? 'Copied' : 'Copy Track Link'}</span>
            </button>

            {/* Cancel Actions */}
            {!showConfirmCancel ? (
              <button
                id="order-details-cancel-btn"
                onClick={() => setShowConfirmCancel(true)}
                className="cursor-pointer bg-red-50 text-red-600 hover:bg-red-100 border border-red-200/50 font-bold text-xs py-2 px-3.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Cancel Order</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 animation-scale-in">
                <button
                  onClick={() => {
                    onCancelOrder(order.id);
                    if (onShowToast) {
                      onShowToast(`Order ${order.id} was cancelled successfully.`, 'info');
                    }
                    onNavigate('orders');
                  }}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-2 px-3 rounded-lg shadow transition-all"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 px-3 rounded-lg transition-all"
                >
                  Keep
                </button>
              </div>
            )}
          </div>
        </div>

        {/* BODY INTERACTION BLOCKS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Side: Information Card */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl shadow-premium p-6 space-y-6">
            
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Logistics Details</h3>
              
              <div className="space-y-4">
                {/* Item Description */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                    <Package className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Cargo Cargo Item</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">{order.itemDescription}</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                    <User className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Customer Contact</p>
                    <p className="text-sm font-bold text-slate-800 mt-1 leading-none">{order.customerName}</p>
                    <span className="text-xs text-slate-500 block mt-1.5 font-mono">{order.customerPhone}</span>
                  </div>
                </div>

                {/* Pickup location */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                    <MapPin className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Origin Hub</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{order.pickupLocation}</p>
                  </div>
                </div>

                {/* Delivery destination */}
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 flex-shrink-0">
                    <MapPin className="h-4.5 w-4.5 text-green-600 animate-bounce" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">Delivery drop-off destination</p>
                    <p className="text-xs font-semibold text-slate-700 mt-1">{order.deliveryLocation}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes display */}
            <div className="border-t border-slate-100 pt-5">
              <p className="text-[10px] font-bold text-slate-400 uppercase leading-none mb-2">Courier notes</p>
              <p className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 italic">
                {order.notes || 'No special instructions recorded.'}
              </p>
            </div>

            {/* STAGE-BASED STATUS MODIFIERS */}
            <div className="border-t border-slate-100 pt-5">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Simulate Courier Progress</h4>
                {updating && <span className="text-[10px] font-semibold text-blue-600 animate-pulse">Updating...</span>}
              </div>
              
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Step through the cargo life events to test the dynamic client tracking page.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {(['Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'] as OrderStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={updating}
                    onClick={() => handleStatusChange(st)}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all border ${order.status === st ? 'bg-slate-900 border-slate-900 text-white font-extrabold shadow' : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'}`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Timeline Steps progress trace */}
          <div className="lg:col-span-5 bg-[#FAFBFD] border border-slate-200 rounded-xl p-6">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-6">Delivery status log</h3>

            {order.status === 'Failed' ? (
              <div className="border border-red-200 bg-red-50 rounded-xl p-4 flex gap-3 text-red-800 mb-6">
                <AlertOctagon className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold">Courier Shipment Failed</p>
                  <p className="text-[11px] text-red-600 mt-1 leading-relaxed">
                    The recipient was unreachable after several automated call attempts. Shipments are being re-routed to the primary sorting office.
                  </p>
                </div>
              </div>
            ) : null}

            {/* Connected timeline steps flow */}
            <div className="relative pl-6 space-y-6">
              {/* Thread line line graphic */}
              <div className="absolute left-3 top-2.5 bottom-2 w-[1.5px] bg-slate-200"></div>

              {stepsDetails.map((step, idx) => {
                const active = idx <= currentIndex && order.status !== 'Failed';
                const current = idx === currentIndex && order.status !== 'Failed';

                let dotColor = 'bg-slate-200 text-slate-400 border-white';
                if (active) {
                  if (current) {
                    dotColor = 'bg-blue-600 text-white border-blue-200 ring-4 ring-blue-500/10 scale-105';
                  } else {
                    dotColor = 'bg-green-600 text-white border-green-100';
                  }
                }

                return (
                  <div key={idx} className="relative flex items-start gap-4">
                    {/* Circle dot overlay */}
                    <span className={`absolute -left-5 h-5 w-5 rounded-full border-2 flex items-center justify-center font-mono text-[9px] font-bold z-10 transition-all ${dotColor}`}>
                      {idx + 1}
                    </span>

                    <div>
                      <h5 className={`text-xs font-bold leading-none ${active ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.title}
                      </h5>
                      <p className={`text-[11px] mt-1.5 leading-relaxed ${active ? 'text-slate-600' : 'text-slate-400'}`}>
                        {step.desc}
                      </p>
                      <span className="text-[9px] font-mono text-slate-400 mt-1 block">
                        {active ? step.time : 'Awaiting event'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* PRINT-ONLY PHYSICAL RECEIPT SLIP TEMPLATE */}
      <div className="hidden print:block bg-white text-slate-900 p-8 max-w-2xl mx-auto font-sans text-sm border-2 border-slate-900 rounded-lg">
        {/* Invoice/Receipt Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-wider text-slate-900 uppercase font-mono">Sendie Logistics</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Cargo Transit Network • Hub Sandbox Terminal</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Automated Dispatcher Portal</p>
          </div>
          <div className="text-right">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800">Shipping Receipt</h2>
            <div className="mt-1 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 inline-block font-bold">
              ID: {order.id}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Date: {order.createdDate}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-8 border-b border-slate-200 pb-6 mb-6">
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Merchant / Shipper</h3>
            <p className="font-bold text-xs text-slate-850">Delta Commerce</p>
            <p className="text-[11px] text-slate-500 mt-0.5">omoregiekellyking85@gmail.com</p>
            <p className="text-[11px] text-slate-400 mt-1">Channel status: Evaluated sandbox sandbox</p>
          </div>
          <div>
            <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Recipient Contact</h3>
            <p className="font-bold text-xs text-slate-850">{order.customerName}</p>
            <p className="font-mono text-[11px] text-slate-600 mt-0.5">{order.customerPhone}</p>
          </div>
        </div>

        {/* Manifest Cargo Segment */}
        <div className="mb-6">
          <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Package Item & Log description</h3>
          <table className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 lowercase font-mono">
                <th className="py-2 font-bold uppercase text-[10px]">Description</th>
                <th className="py-2 text-right font-bold uppercase text-[10px]">Delivery State</th>
                <th className="py-2 text-right font-bold uppercase text-[10px]">Est. Date</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-3 pr-2">
                  <p className="font-bold text-slate-800">{order.itemDescription}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">Notes: {order.notes || 'No special courier notes recorded.'}</p>
                </td>
                <td className="py-3 text-right font-semibold text-slate-700">{order.status}</td>
                <td className="py-3 text-right font-mono text-slate-600 font-medium">{order.estimatedDelivery}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Logistics Routing */}
        <div className="grid grid-cols-2 gap-8 bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8">
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Origin Point</span>
            <p className="text-xs font-semibold text-slate-700">{order.pickupLocation}</p>
          </div>
          <div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Destination point</span>
            <p className="text-xs font-semibold text-slate-700">{order.deliveryLocation}</p>
          </div>
        </div>

        {/* Tracking verification barcode fallback */}
        <div className="border-t border-slate-200 pt-6 flex flex-col items-center justify-center text-center">
          <div className="bg-slate-100 border border-slate-200 py-3 px-6 rounded-lg font-mono text-xs tracking-widest text-slate-800 select-none mb-1 font-bold">
            ||||| | |||| ||| || ||| | {order.id}
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-1">
            Generated via Sendie Sandbox • Recipient tracking: {order.trackingLink}
          </p>
          <div className="mt-8 flex justify-between w-full text-[10px] text-slate-400 border-t border-slate-100 pt-4">
            <span>Authorized Dispatch Agent Signature: __________________</span>
            <span>Date printed: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
