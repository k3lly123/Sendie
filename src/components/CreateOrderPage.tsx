import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Truck, Sparkles, CheckCircle2, Copy, Check, FilePlus2, RefreshCw, ArrowLeft, ExternalLink } from 'lucide-react';
import { Order, AppScreen } from '../types';

interface CreateOrderPageProps {
  onAddOrder: (order: Omit<Order, 'id' | 'createdDate' | 'trackingLink' | 'estimatedDelivery'>) => Promise<Order> | Order;
  onNavigate: (screen: AppScreen) => void;
  onSelectOrder: (orderId: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function CreateOrderPage({ onAddOrder, onNavigate, onSelectOrder, onShowToast }: CreateOrderPageProps) {
  // Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Ikeja Logistics Hub, Lagos');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [dropOffContactName, setDropOffContactName] = useState('');
  const [dropOffContactPhone, setDropOffContactPhone] = useState('');
  const [dropOffLandmark, setDropOffLandmark] = useState('');
  const [notes, setNotes] = useState('');
  const [estTime, setEstTime] = useState('Today, 05:30 PM');

  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const hubOptions = [
    'Ikeja Logistics Hub, Lagos',
    'Yaba Sorting Office, Lagos',
    'Lekki Phase 1 Depot, Lagos',
    'Gbagada fulfillment Center, Lagos',
    'Port Harcourt Regional Station',
    'Abuja Maitama Dispatch Depot'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !itemDescription.trim() || !deliveryLocation.trim()) {
      if (onShowToast) {
        onShowToast('Please fill out all mandatory customer and delivery fields.', 'warning');
      } else {
        alert('Please fill out all mandatory customer and delivery fields');
      }
      return;
    }

    setLoading(true);

    try {
      const added = await onAddOrder({
        customerName,
        customerPhone,
        itemDescription,
        pickupLocation,
        deliveryLocation,
        dropOffContactName: dropOffContactName || undefined,
        dropOffContactPhone: dropOffContactPhone || undefined,
        dropOffLandmark: dropOffLandmark || undefined,
        status: 'Pending',
        notes: notes || undefined,
      });

      setCreatedOrder(added);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create order';
      if (onShowToast) {
        onShowToast(message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!createdOrder) return;
    navigator.clipboard.writeText(`https://sendie.sh/track/${createdOrder.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const resetForm = () => {
    setCustomerName('');
    setCustomerPhone('');
    setItemDescription('');
    setPickupLocation('Ikeja Logistics Hub, Lagos');
    setDeliveryLocation('');
    setDropOffContactName('');
    setDropOffContactPhone('');
    setDropOffLandmark('');
    setNotes('');
    setEstTime('Today, 05:30 PM');
    setCreatedOrder(null);
  };

  return (
    <div id="create-order-view-wrapper" className="max-w-2xl mx-auto">
      
      {/* HEADER CONTROLS */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => onNavigate('dashboard-home')}
          className="p-1 px-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </button>
        <span className="text-xs text-slate-400">/</span>
        <span className="text-xs font-bold text-slate-600">New order</span>
      </div>

      {/* DYNAMIC CASE 1: SUCCESS DIALOG STATE */}
      {createdOrder ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200 rounded-2xl shadow-double p-8 text-center"
        >
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 id="success-header-message" className="text-2xl font-extrabold font-display text-slate-900 tracking-tight">
            Order created successfully!
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            Your tracking link and notification record have been created.
          </p>

          {/* Generated Information Summary */}
          <div className="my-8 bg-[#FAFBFD] border border-slate-200 rounded-xl p-5 max-w-md mx-auto text-left space-y-3.5">
            <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TRACKING ID</span>
              <span className="font-mono text-base font-extrabold text-slate-900 tracking-wide">{createdOrder.id}</span>
            </div>
            
            <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CUSTOMER</span>
              <span className="text-xs font-bold text-slate-800">{createdOrder.customerName}</span>
            </div>

            <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-2.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ITEM DISPATCH</span>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[200px]">{createdOrder.itemDescription}</span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EST. ARRIVAL</span>
              <span className="text-xs font-bold text-blue-600">{createdOrder.estimatedDelivery}</span>
            </div>
          </div>

          {/* Copyable code panel */}
          <div className="max-w-md mx-auto bg-slate-900 text-white rounded-xl p-3 flex items-center justify-between mb-8 shadow-sm">
            <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md font-bold uppercase">Tracking link</span>
              <span className="font-mono text-xs text-blue-400 truncate max-w-[200px]">sendie.sh/track/{createdOrder.id}</span>
            </div>
            <button
              onClick={handleCopyLink}
              className="p-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {/* Nav shortcut triggers */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => { onSelectOrder(createdOrder.id); onNavigate('order-details'); }}
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>View order details</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={resetForm}
              className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-5 rounded-lg transition-all flex items-center gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Create another order</span>
            </button>
          </div>
        </motion.div>
      ) : (
        /* FORM DETAILS WRAPPER */
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.06)] md:p-8">
          <div className="border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-xl font-extrabold font-display text-slate-900 tracking-tight">Create delivery order</h2>
            <p className="text-xs text-slate-400 mt-1">Specify pick-up channels and target customer credentials below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION: Customer context */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">1. Customer credentials</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer Name *</label>
                  <input
                    id="order-cust-name"
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Adewale Bashir"
                    className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Customer Phone *</label>
                  <input
                    id="order-cust-phone"
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+234 803 111 2222"
                    className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: Item description */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">2. Delivery details</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Item description *</label>
                <input
                  id="order-item-desc"
                  type="text"
                  required
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  placeholder="e.g. Nike Air Max Sneakers (Size 44)"
                  className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* SECTION: Pickup and Drop-off routes */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">3. Logistics routing addresses</h3>
              
              <div className="space-y-4">
                {/* Hub dropdown */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Pickup Hub (Origin Location)</label>
                  <select
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                  >
                    {hubOptions.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                {/* Delivery address */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivery drop-off location *</label>
                  <input
                    id="order-delivery-address"
                    type="text"
                    required
                    value={deliveryLocation}
                    onChange={(e) => setDeliveryLocation(e.target.value)}
                    placeholder="e.g. Adetokunbo Ademola St, Victoria Island, Lagos"
                    className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Drop-off contact name</label>
                    <input
                      type="text"
                      value={dropOffContactName}
                      onChange={(e) => setDropOffContactName(e.target.value)}
                      placeholder="Recipient, receptionist, or store manager"
                      className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Drop-off contact phone</label>
                    <input
                      type="tel"
                      value={dropOffContactPhone}
                      onChange={(e) => setDropOffContactPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Drop-off landmark / nearby point</label>
                  <input
                    type="text"
                    value={dropOffLandmark}
                    onChange={(e) => setDropOffLandmark(e.target.value)}
                    placeholder="Opposite Allen Avenue, beside the pharmacy, 2nd floor"
                    className="w-full bg-[#FAFBFD] focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION: Optional notes and estimated targets */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-blue-600 uppercase tracking-widest">4. Optional metadata</h3>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Recommended</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Estimated delivery window</label>
                  <input
                    type="text"
                    value={estTime}
                    onChange={(e) => setEstTime(e.target.value)}
                    placeholder="Today, 05:30 PM"
                    className="w-full bg-[#FAFBFD] border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Delivery courier instructions</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Call 5 mins before arrival"
                    className="w-full bg-[#FAFBFD] border border-slate-300 rounded-lg py-2 px-3 text-xs font-semibold text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="border-t border-slate-100 pt-6">
              <button
                id="submit-create-order-btn"
                type="submit"
                disabled={loading}
                className={`cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs tracking-wider uppercase transition-all shadow-md active:translate-y-0.5 ${loading ? 'opacity-85 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Generating Tracking ID Routing Paths...</span>
                  </div>
                ) : (
                  <span>Create Delivery Order</span>
                )}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
