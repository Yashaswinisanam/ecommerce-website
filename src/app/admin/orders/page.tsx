'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ShoppingBag, ChevronRight, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get('/api/admin/orders');
        setOrders(data);
      } catch (error) {
        toast.error('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Processing': return <Clock className="w-4 h-4 text-orange-500" />;
      case 'Shipped': return <Truck className="w-4 h-4 text-blue-500" />;
      case 'Cancelled': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await axios.patch(`/api/admin/orders/${id}`, { status });
      toast.success('Status updated');
      setOrders((prev: any) => prev.map((o: any) => o._id === id ? { ...o, status } : o));
    } catch (e) {
      toast.error('Update failed');
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await axios.patch(`/api/admin/orders/${id}`, { paymentStatus });
      toast.success('Payment updated');
      setOrders((prev: any) => prev.map((o: any) => o._id === id ? { ...o, paymentStatus } : o));
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <div>
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Order Management</h1>
        <p className="text-slate-500">Track and update customer fulfillment status</p>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white p-24 rounded-[40px] text-center border-2 border-dashed border-slate-100">
             <ShoppingBag className="w-20 h-20 text-slate-100 mx-auto mb-6" />
             <p className="text-slate-400 font-bold text-lg">No orders to display</p>
          </div>
        ) : (
          orders.map((order: any) => (
            <div key={order._id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-indigo-50 rounded-[24px] flex items-center justify-center text-indigo-600">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                    <p className="text-slate-500 font-bold">{order.user?.name || 'Guest User'} • {new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 lg:justify-end items-center">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Delivery Status</p>
                    <select 
                      value={order.status || 'Pending'}
                      onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 transition"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Payment</p>
                    <select 
                      value={order.paymentStatus || 'Unpaid'}
                      onChange={(e) => updatePaymentStatus(order._id, e.target.value)}
                      className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 transition"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>

                  <div className="col-span-2 sm:col-span-1 text-right sm:text-left lg:text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue</p>
                    <p className="text-2xl font-black text-indigo-600 tracking-tighter">${order.totalPrice || order.total}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
