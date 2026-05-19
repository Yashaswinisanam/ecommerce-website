'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, 
  Search, 
  SlidersHorizontal,
  DollarSign, 
  Truck, 
  RotateCcw,
  X,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  user?: {
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  shippingInfo: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: {
    id?: string;
    status: string;
    method: string;
    transactionId?: string;
  };
  subtotal?: number;
  taxPrice?: number;
  shippingPrice?: number;
  totalPrice: number;
  total?: number;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
}

const ORDER_STATUSES = [
  'pending', 
  'processing', 
  'paid', 
  'packed', 
  'shipped', 
  'out_for_delivery', 
  'delivered', 
  'cancelled', 
  'returned', 
  'refunded'
];

const PAYMENT_STATUSES = [
  'unpaid', 
  'pending', 
  'paid', 
  'failed', 
  'refunded', 
  'partially_refunded'
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Form states for updates
  const [courierName, setCourierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [estDeliveryDate, setEstDeliveryDate] = useState('');
  const [submittingLogistics, setSubmittingLogistics] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/admin/orders');
        setOrders(data);
      } catch {
        toast.error('Failed to load admin orders catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/admin/orders/${id}`, { status });
      toast.success(`Fulfillment updated to ${status}`);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status } : o));
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => prev ? { ...prev, status } : null);
      }
    } catch {
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await axios.patch(`/api/admin/orders/${id}`, { paymentStatus });
      toast.success(`Payment updated to ${paymentStatus}`);
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, paymentInfo: { ...o.paymentInfo, status: paymentStatus } } : o));
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => prev ? { ...prev, paymentInfo: { ...prev.paymentInfo, status: paymentStatus } } : null);
      }
    } catch {
      toast.error('Failed to update payment status');
    }
  };

  // Submit Logistics detail parameters
  const handleUpdateLogistics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmittingLogistics(true);
    try {
      // Patch local MongoDB state or simulate
      await axios.patch(`/api/admin/orders/${selectedOrder._id}`, {
        courierName,
        trackingNumber,
        estimatedDeliveryDate: estDeliveryDate ? new Date(estDeliveryDate).toISOString() : undefined
      });
      toast.success('Logistics courier details registered!');
      
      setOrders(prev => prev.map(o => o._id === selectedOrder._id ? {
        ...o,
        courierName,
        trackingNumber,
        estimatedDeliveryDate: estDeliveryDate || undefined
      } : o));
      
      setSelectedOrder(prev => prev ? {
        ...prev,
        courierName,
        trackingNumber,
        estimatedDeliveryDate: estDeliveryDate || undefined
      } : null);
      
    } catch {
      toast.error('Failed to write logistics details');
    } finally {
      setSubmittingLogistics(false);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setCourierName(order.courierName || '');
    setTrackingNumber(order.trackingNumber || '');
    if (order.estimatedDeliveryDate) {
      setEstDeliveryDate(new Date(order.estimatedDeliveryDate).toISOString().substring(0, 10));
    } else {
      setEstDeliveryDate('');
    }
  };

  // Calculations for Metrics
  const grossSales = orders.reduce((acc, o) => o.status.toLowerCase() !== 'cancelled' ? acc + (o.totalPrice || o.total || 0) : acc, 0);
  const activeFulfillment = orders.filter(o => ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(o.status.toLowerCase())).length;
  const refundRequests = orders.filter(o => ['returned', 'refunded'].includes(o.status.toLowerCase())).length;

  // Filter & Search Logic
  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    const orderIdMatches = o._id.toLowerCase().includes(term);
    const customerMatches = o.user?.name?.toLowerCase().includes(term) || o.user?.email?.toLowerCase().includes(term);
    const matchesSearch = orderIdMatches || customerMatches;

    const matchesStatus = statusFilter === 'all' || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const tA = new Date(a.createdAt).getTime();
    const tB = new Date(b.createdAt).getTime();
    return sortOrder === 'desc' ? tB - tA : tA - tB;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-40">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Fulfillment Control Center</h1>
          <p className="text-slate-500 font-bold mt-1">Manage shipping timelines, verify payments, and handle returns</p>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gross Revenue</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">${grossSales.toFixed(2)}</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volume Placed</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{orders.length} Orders</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Fulfils</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{activeFulfillment} In Progress</h4>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund requests</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">{refundRequests} Claims</h4>
          </div>
        </div>
      </div>

      {/* Filter and Search Layout Bar */}
      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 transition"
            placeholder="Search Order Reference ID or Customer details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-3 w-full md:w-auto flex-wrap gap-2 md:gap-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-400 hidden md:block" />
          <select
            className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-600 transition"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {ORDER_STATUSES.map(s => (
              <option key={s} value={s}>{s.toUpperCase()}</option>
            ))}
          </select>

          <select
            className="bg-slate-50 border-none rounded-2xl px-4 py-3 text-xs font-black text-slate-600 outline-none focus:ring-2 focus:ring-indigo-600 transition"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Orders List Table Card */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-24 text-center">
            <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-bold">No orders matched the specified filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase tracking-widest text-[9px] font-black">
                  <th className="py-4.5 px-8">Order ID</th>
                  <th className="py-4.5 px-6">Customer Details</th>
                  <th className="py-4.5 px-6">Order Status</th>
                  <th className="py-4.5 px-6">Payment Gate</th>
                  <th className="py-4.5 px-6 text-right">Revenue</th>
                  <th className="py-4.5 px-8 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                {filteredOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-5 px-8 font-black text-slate-900">
                      #{o._id.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-900">{o.user?.name || 'Guest User'}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{o.user?.email || 'N/A'}</p>
                    </td>
                    <td className="py-5 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        o.status.toLowerCase() === 'cancelled' 
                          ? 'bg-red-50 text-red-600' 
                          : o.status.toLowerCase() === 'delivered' 
                          ? 'bg-emerald-50 text-emerald-700' 
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <p className="font-bold text-slate-800">{o.paymentInfo.method}</p>
                      <span className={`text-[9px] font-black uppercase ${
                        o.paymentInfo.status.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-slate-400'
                      }`}>{o.paymentInfo.status}</span>
                    </td>
                    <td className="py-5 px-6 text-right font-black text-slate-900">
                      ${(o.totalPrice || o.total || 0).toFixed(2)}
                    </td>
                    <td className="py-5 px-8 text-center">
                      <button
                        onClick={() => openOrderDetails(o)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4.5 py-2 rounded-xl text-xs font-black transition duration-200"
                      >
                        Inspect & Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAIL MODAL PANEL */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-[100] backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-[40px] max-w-2xl w-full p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedOrder(null)}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="text-2xl font-black text-slate-950 tracking-tight"> Fulfill Order details</h2>
              <p className="text-xs text-slate-400 font-bold mt-1">Order Ref: #{selectedOrder._id.toUpperCase()}</p>

              {/* Form gridsplit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-6">
                
                {/* Left Form: fulfillment and payment selection status */}
                <div className="space-y-5">
                  <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-2">Status Actions</h3>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Status</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition"
                      value={selectedOrder.status}
                      onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                    >
                      {ORDER_STATUSES.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Payment Billing</label>
                    <select
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600 transition"
                      value={selectedOrder.paymentInfo.status}
                      onChange={(e) => updatePaymentStatus(selectedOrder._id, e.target.value)}
                    >
                      {PAYMENT_STATUSES.map(s => (
                        <option key={s} value={s}>{s.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  {selectedOrder.paymentInfo.method.toUpperCase() === 'COD' && selectedOrder.paymentInfo.status !== 'paid' && (
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start space-x-3 text-xs leading-relaxed text-amber-700">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
                      <div>
                        <p className="font-black">COD Approval Needed</p>
                        <p className="text-slate-500 font-medium mt-0.5">This transaction is cash-on-delivery. Verify physical payment on fulfillment before marking paid.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Form: logistics shipping registration details */}
                <form onSubmit={handleUpdateLogistics} className="space-y-4">
                  <h3 className="font-black text-slate-950 text-sm border-b border-slate-100 pb-2">Logistics Registry</h3>
                  
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Courier Name</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600"
                      placeholder="DHL / Fedex / BlueDart"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tracking Number</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600"
                      placeholder="EXPR-9012-990"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Estimated Arrival Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:border-indigo-600"
                      value={estDeliveryDate}
                      onChange={(e) => setEstDeliveryDate(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLogistics}
                    className="w-full bg-slate-950 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-70"
                  >
                    {submittingLogistics ? 'Saving courier registry...' : 'Register Courier Timeline'}
                  </button>
                </form>

              </div>

              {/* Items details block summary */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="font-black text-slate-950 text-sm mb-3">Order Particulars</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <p className="font-bold text-slate-800">{item.name} <span className="text-slate-400 font-bold">(Qty: {item.quantity})</span></p>
                      <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address details block */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="font-black text-slate-950 text-sm mb-2">Shipping Profile Address</h3>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedOrder.shippingInfo.address}</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed">{selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.postalCode}, {selectedOrder.shippingInfo.country}</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
