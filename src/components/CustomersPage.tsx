import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Mail, Phone, Calendar, ShoppingBag, Eye, History, Sparkles } from 'lucide-react';
import { Customer, AppScreen } from '../types';

interface CustomersPageProps {
  customers: Customer[];
  onNavigate: (screen: AppScreen) => void;
  onSelectOrder: (orderId: string) => void;
  onShowToast?: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export default function CustomersPage({ customers, onNavigate, onSelectOrder, onShowToast }: CustomersPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(cust => 
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  return (
    <div id="customers-view-container" className="space-y-6">
      
      {/* FILTER SEARCH HEADER */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="cust-search"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search key customers by name, phone email..."
            className="w-full bg-slate-50 focus:bg-white border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded-lg py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 transition-all focus:outline-none"
          />
        </div>

        <button
          onClick={() => {
            if (onShowToast) {
              onShowToast('New recipients auto-register after you dispatch them an order from "Create Order"!', 'info');
            } else {
              alert('Demo status: Automatic CRM database synchronization. New recipients are auto-registered once you dispatch them an order from the "Create Order" page!');
            }
          }}
          className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Recipient</span>
        </button>
      </div>

      {/* METRIC ANALYSIS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total CRM Records', val: customers.length, desc: 'Active shipping accounts' },
          { label: 'Avg Customer Order Density', val: '6.4 runs', desc: 'Average orders dispatch' },
          { label: 'Retention Coefficient', val: '84.2%', desc: 'Repeat orders ratio' },
        ].map((met, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 shadow-premium">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{met.label}</span>
            <p className="text-xl font-extrabold text-slate-800 mt-1.5 leading-none">{met.val}</p>
            <span className="text-[10px] text-slate-500 mt-1 block">{met.desc}</span>
          </div>
        ))}
      </div>

      {/* RECIPIENT LIST TABLE CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-premium overflow-hidden">
        <div className="overflow-x-auto">
          {filteredCustomers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="h-8 w-8 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-semibold">No customer profile matching search guidelines.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-[#FAFBFD] border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4 pl-6">ID</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Contact Channel</th>
                  <th className="p-4 text-center">Lifetime Orders</th>
                  <th className="p-4">Recent Delivery ID</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right pr-6">Recent trace</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* ID */}
                    <td className="p-4 pl-6 font-mono font-bold text-slate-900">
                      {cust.id}
                    </td>

                    {/* Name */}
                    <td className="p-4 font-bold text-slate-800 font-display text-sm">
                      {cust.name}
                    </td>

                    {/* Email / Phone */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-[11px]">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{cust.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[10px]">
                          <Phone className="h-3 w-3" />
                          <span>{cust.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Total orders */}
                    <td className="p-4 text-center">
                      <span className="font-bold text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100/40">
                        {cust.totalOrders} runs
                      </span>
                    </td>

                    {/* Recent delivery reference */}
                    <td className="p-4 font-mono font-bold text-slate-500">
                      {cust.recentDelivery}
                    </td>

                    {/* Joined date */}
                    <td className="p-4 text-slate-400 font-mono">
                      {cust.joinedDate}
                    </td>

                    {/* Select view recent order */}
                    <td className="p-4 text-right pr-6">
                      <button
                        onClick={() => {
                          onSelectOrder(cust.recentDelivery);
                          onNavigate('order-details');
                        }}
                        className="cursor-pointer p-1 px-2.5 bg-slate-100 hover:bg-blue-600 rounded-lg text-slate-600 hover:text-white font-bold text-[10px] transition-all inline-flex items-center gap-1"
                        title="Jump to active tracking logs"
                      >
                        <History className="h-3 w-3" />
                        <span>Trace Cargo</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
