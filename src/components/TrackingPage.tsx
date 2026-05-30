import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldCheck, 
  MapPin, 
  PhoneCall, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Package, 
  Check, 
  Copy, 
  Search,
  MessageCircle,
  Truck,
  Building,
  ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { Order, OrderStatus } from '../types';

interface TrackingPageProps {
  orders: Order[];
  selectedOrderId: string;
  onSelectOrderId: (id: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function TrackingPage({ orders, selectedOrderId, onSelectOrderId, onShowToast }: TrackingPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Active tracked order
  const activeOrder = orders.find(o => o.id === selectedOrderId) || orders[0];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    const found = orders.find(o => o.id.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    if (found) {
      onSelectOrderId(found.id);
      setSearchTerm('');
    } else {
      if (onShowToast) {
        onShowToast(`Tracking ID "${searchTerm}" not found in sandbox register. Please try another ID (e.g., TRK-78290)`, 'error');
      } else {
        alert(`Tracking ID "${searchTerm}" not found in sandbox register. Please try another ID (e.g., TRK-78290)`);
      }
    }
  };

  const handleCopyLink = () => {
    if (!activeOrder) return;
    navigator.clipboard.writeText(`https://sendie.sh/track/${activeOrder.id}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Status mapping
  const getStatusDisplay = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return { text: 'Awaiting Pickup', desc: 'Sellers is prepping cargo item at depot', color: 'text-amber-500 bg-amber-500/10' };
      case 'Picked Up':
        return { text: 'Assigned Co', desc: 'Driver successfully scanned and packed cargo', color: 'text-purple-600 bg-purple-500/10' };
      case 'In Transit':
        return { text: 'En Route', desc: 'Driver is traversing sorting channels now', color: 'text-blue-500 bg-blue-500/10' };
      case 'Delivered':
        return { text: 'Delivered', desc: 'Cargo safely delivered to recipient hub address', color: 'text-green-600 bg-green-500/10' };
      case 'Failed':
      default:
        return { text: 'Delivery Halt', desc: 'Unsuccessful delivery attempts recorded', color: 'text-red-600 bg-red-500/10' };
    }
  };

  const statusInfo = activeOrder ? getStatusDisplay(activeOrder.status) : null;
  
  // Status Index
  const statusValues: OrderStatus[] = ['Pending', 'Picked Up', 'In Transit', 'Delivered'];
  const currentIndex = activeOrder ? statusValues.indexOf(activeOrder.status === 'Failed' ? 'Pending' : activeOrder.status) : 0;

  const timelineMilestones = [
    { title: 'Order Dispatched', desc: 'Merchant registered shipment' },
    { title: 'Cargo Picked Up', desc: 'Driver loaded and packed package' },
    { title: 'In Transit', desc: 'Traversing local highway corridors' },
    { title: 'Package Delivered', desc: 'Handed to recipient successfully' },
  ];

  return (
    <div id="tracking-customer-portal" className="max-w-4xl mx-auto space-y-6">
      
      {/* QUICK SANDBOX INSTRUCTIONS */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Customer-Facing Live Tracking Simulator</span>
          </p>
          <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
            This viewport demonstrates the premium, unbranded mobile-first tracking page provided to end customers. Search any sandbox ID to render details.
          </p>
        </div>

        {/* Global Select search container */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search sandbox ID (e.g. TRK-78290)"
            className="bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg text-xs"
          >
            Track Route
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFTSIDE: Sandbox Controller overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-premium">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mb-4">Sandbox register keys</h3>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Click any active sandbox order below to view it rendered in the mobile phone emulator:
            </p>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {orders.map((o) => (
                <div
                  key={o.id}
                  onClick={() => onSelectOrderId(o.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between hover:bg-slate-50 ${selectedOrderId === o.id ? 'border-blue-600 bg-blue-50/10 font-bold text-slate-900 shadow-sm' : 'border-slate-100 text-slate-600'}`}
                >
                  <div>
                    <span className="font-mono font-bold block">{o.id}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{o.customerName}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 ml-2 rounded uppercase border ${selectedOrderId === o.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                    {o.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHTSIDE: POLISHED PHONE TRACKING CONTAINER MOBILEVIEW */}
        <div className="lg:col-span-7 flex justify-center">
          
          {/* Mock Smartphone Outer Shell */}
          <div className="w-full max-w-[360px] bg-[#0F172A] p-2.5 rounded-[40px] shadow-2xl border-4 border-slate-800 relative z-10 overflow-hidden transform transition-all duration-300 hover:scale-[1.01]">
            {/* Top Speaker/Camera notch */}
            <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-full flex items-center justify-around px-3 z-50">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800"></span>
              <span className="w-10 h-1 bg-slate-800 rounded-full"></span>
            </div>

            {/* Mobile App Canvas Screen */}
            <div className="bg-slate-50 text-slate-800 rounded-[30px] overflow-hidden min-h-[580px] flex flex-col justify-between pt-6 text-sm">
              
              {/* Header inside phone */}
              <div className="bg-white border-b border-slate-200 p-4 pb-3 flex items-center justify-between sticky top-0 z-20">
                <BrandLogo size="sm" iconOnly />
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none tracking-widest font-sans">DELIVERY CARRIER</p>
                  <p className="text-sm font-bold text-slate-900 leading-none mt-1">Sendie Express</p>
                </div>
              </div>

              {/* Scrollable Mobile Body container */}
              <div className="p-4 flex-1 space-y-4 overflow-y-auto max-h-[460px]">
                
                {/* Simulated Real Map graphic box */}
                <div className="h-28 bg-[#DBEAFE]/40 border border-[#BFDBFE]/60 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 select-none">
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#2563eb_1.2px,transparent_1.2px)] [background-size:16px_16px]"></div>
                  
                  {/* Decorative curved SVG route ribbon */}
                  <svg className="w-full h-full absolute inset-0 text-blue-500/80" stroke="currentColor" fill="none">
                    <path d="M 20 80 C 60 70 80 20 180 40 C 240 50 250 15 300 20" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  
                  {/* Map marker elements */}
                  <div className="absolute left-6 top-[72px] h-3 w-3 bg-blue-600 rounded-full ring-4 ring-blue-500/10 border-2 border-white"></div>
                  
                  <div className="absolute right-12 top-[12px] h-4 w-4 bg-green-500 rounded-full flex items-center justify-center border-2 border-white text-[8px] text-white animate-bounce shadow">
                    ✓
                  </div>

                  {activeOrder && activeOrder.status !== 'Delivered' && activeOrder.status !== 'Failed' ? (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg px-2 py-1 shadow border border-slate-100 flex items-center gap-1.5 animate-pulse">
                      <Truck className="h-3 w-3 text-blue-600" />
                      <span className="text-[9px] font-bold text-slate-800">Courier moving</span>
                    </div>
                  ) : null}

                  {/* Tracking Id display index */}
                  <div className="absolute bottom-2 left-2 bg-slate-900/90 text-white font-mono text-[9px] px-2 py-0.5 rounded-md font-bold uppercase">
                    ID: {activeOrder ? activeOrder.id : 'TRK-...'}
                  </div>
                </div>

                {/* Tracking ID and Status summary card */}
                {activeOrder && statusInfo ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold font-mono text-slate-400 uppercase tracking-widest">{activeOrder.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">{statusInfo.desc}</h4>
                      <p className="text-[11px] text-slate-500 mt-1 uppercase font-bold tracking-wider text-blue-600">
                        ESTIMATED DELIVERY: {activeOrder.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* Progress dot timeline steps */}
                {activeOrder ? (
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-4 block">DELIVERY MILESTONES</h5>
                    
                    {activeOrder.status === 'Failed' ? (
                      <div className="bg-red-50 text-red-800 border border-red-200 rounded-xl p-3 text-[11px] mb-3 leading-relaxed">
                        ⚠️ Automated notice: Delivery attempted but recipient was unreachable.
                      </div>
                    ) : null}

                    <div className="relative pl-5 space-y-4">
                      {/* Thread line line */}
                      <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-slate-100"></div>

                      {timelineMilestones.map((step, index) => {
                        const markerActive = index <= currentIndex && activeOrder.status !== 'Failed';
                        const makerCurrent = index === currentIndex && activeOrder.status !== 'Failed';

                        let dotStyle = 'bg-slate-100 text-slate-300 border-slate-100';
                        if (markerActive) {
                          if (makerCurrent) {
                            dotStyle = 'bg-blue-600 text-white border-blue-100 ring-2 ring-blue-500/10 scale-105 font-bold';
                          } else {
                            dotStyle = 'bg-green-600 text-white border-green-100 font-bold';
                          }
                        }

                        return (
                          <div key={index} className="relative text-left">
                            <span className={`absolute -left-[17px] h-3.5 w-3.5 rounded-full border flex items-center justify-center text-[7px] z-10 transition-colors ${dotStyle}`}>
                              {markerActive ? '✓ font-bold' : ''}
                            </span>
                            <div>
                              <p className={`text-xs font-bold leading-none ${markerActive ? 'text-slate-800' : 'text-slate-400'}`}>{step.title}</p>
                              <p className="text-[10px] text-slate-400 mt-1 leading-normal">{step.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Cargo contents info */}
                {activeOrder ? (
                  <div className="bg-[#FAFBFD] border border-slate-200 rounded-2xl p-4 text-xs space-y-2.5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CARGO CONTENTS</p>
                    <div className="flex gap-2 items-center text-slate-800 font-semibold">
                      <Package className="h-4 w-4 text-slate-500 flex-shrink-0" />
                      <span>{activeOrder.itemDescription}</span>
                    </div>

                    <div className="border-t border-slate-200/50 pt-2 text-[11px] text-slate-500 leading-relaxed italic bg-white p-2 border rounded">
                      <strong>Delivery notes:</strong> {activeOrder.notes || 'Handle box with extreme professionalism.'}
                    </div>

                    {/* Copier helper */}
                    <div className="pt-1.5 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                      <span>Sender: Delta Partners</span>
                      <button 
                        onClick={handleCopyLink} 
                        className="text-blue-600 hover:underline flex items-center gap-1 leading-none cursor-pointer"
                      >
                        {copiedId ? 'Copied URL!' : 'Share tracking url'}
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Support hotline assistance */}
                <div className="bg-slate-900 text-white rounded-2xl p-4 text-left space-y-3 shadow-md">
                  <div className="flex gap-2 items-center">
                    <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-blue-400">
                      <PhoneCall className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold font-display">Need courier assistance?</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Have questions about specific delivery coordinates or schedules? Contact support directly.
                  </p>
                  <a href="tel:+234800SENDIE" className="block text-center bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-2 text-xs font-bold transition-all shadow-sm">
                    Contact Hotline
                  </a>
                </div>

              </div>

              {/* Mobile screen footer bottom bar notch */}
              <div className="bg-white border-t border-slate-200 p-3 flex justify-center items-center">
                <div className="w-24 h-1 bg-slate-300 rounded-full"></div>
              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
