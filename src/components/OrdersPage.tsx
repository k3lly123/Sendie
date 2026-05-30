import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Copy, 
  Check, 
  Eye, 
  Trash2, 
  ArrowUpRight,
  ExternalLink,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { Order, OrderStatus, AppScreen } from '../types';

interface OrdersPageProps {
  orders: Order[];
  onNavigate: (screen: AppScreen) => void;
  onSelectOrder: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
}

export default function OrdersPage({ orders, onNavigate, onSelectOrder, onDeleteOrder }: OrdersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | OrderStatus>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`https://sendie.sh/track/${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.itemDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'All' || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const getStatusColorClass = (status: OrderStatus) => {
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
    <div id="orders-page-container" className="space-y-6">
      
      {/* FILTER HEADER ROW */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search bar inputs */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="orders-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders, IDs, names, addresses..."
            className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filter Selection list */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mr-1">Status:</span>
          {(['All', 'Pending', 'Picked Up', 'In Transit', 'Delivered', 'Failed'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === filter ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'}`}
            >
              {filter}
            </button>
          ))}

          <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

          {/* Create Button redirect */}
          <button
            id="orders-create-shortcut"
            onClick={() => onNavigate('create-order')}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ml-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Create Order</span>
          </button>
        </div>

      </div>

      {/* TABLE DATA LIST CARD */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden">
        
        <div className="overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <SlidersHorizontal className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-700">No dispatch orders match your criteria.</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting state filters or searching for another customer descriptor.</p>
              <button 
                onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}
                className="mt-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs px-4 py-2 rounded-lg transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[800px]">
              <thead className="bg-[#FAFBFD] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">Order ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Delivery Cargo</th>
                  <th className="p-4">Pickup Hub</th>
                  <th className="p-4">Delivery address</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4">Created Date</th>
                  <th className="p-4 text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    onClick={() => { onSelectOrder(order.id); onNavigate('order-details'); }}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    {/* Order ID */}
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900 group-hover:text-blue-600 transition-all">
                      {order.id}
                    </td>

                    {/* Customer */}
                    <td className="p-4">
                      <div>
                        <p className="font-semibold text-slate-800 leading-none">{order.customerName}</p>
                        <span className="text-[10px] text-slate-400 font-mono block mt-1">{order.customerPhone}</span>
                      </div>
                    </td>

                    {/* Item */}
                    <td className="p-4 text-slate-500 font-medium truncate max-w-[120px]">
                      {order.itemDescription}
                    </td>

                    {/* Pickup */}
                    <td className="p-4 text-slate-400 truncate max-w-[130px]" title={order.pickupLocation}>
                      {order.pickupLocation}
                    </td>

                    {/* Delivery Destination */}
                    <td className="p-4 text-slate-500 truncate max-w-[150px]" title={order.deliveryLocation}>
                      {order.deliveryLocation}
                    </td>

                    {/* Status badge */}
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColorClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>

                    {/* Created date */}
                    <td className="p-4 text-slate-400 font-mono whitespace-nowrap">
                      {order.createdDate.split(' ')[0]}
                    </td>

                    {/* Actions row */}
                    <td className="p-4 text-right pr-6" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2 text-slate-400">
                        <button
                          onClick={() => { onSelectOrder(order.id); onNavigate('order-details'); }}
                          className="p-1 px-2.5 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5"
                          title="View complete traces"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold">View</span>
                        </button>
                        <button
                          onClick={(e) => handleCopyLink(e, order.id)}
                          className="p-1 px-2.5 rounded hover:bg-slate-100 hover:text-slate-800 transition-colors inline-flex items-center gap-1.5"
                          title="Copy customer tracking page link"
                        >
                          {copiedId === order.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="text-[10px] font-bold">Copy</span>
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Sure you want to completely revoke shipment order ${order.id}?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1 px-2 rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                          title="Revoke shipment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Dynamic total details footer bar */}
        <div className="px-6 py-4 bg-[#FAFBFD] border-t border-slate-100 text-xs text-slate-400 font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <span>Displaying <strong>{filteredOrders.length}</strong> of <strong>{orders.length}</strong> total active dispatches</span>
          <span className="font-mono text-[10px]">Sendie Logistics Router Active Engine v2.4</span>
        </div>

      </div>

    </div>
  );
}
