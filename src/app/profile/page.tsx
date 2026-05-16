'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/storefront/Navbar';
import { useCart } from '@/context/CartContext';
import { Package, User, ShoppingBag, ChevronRight, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { orders } = useCart();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      router.push('/login');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Sidebar / Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <User className="w-10 h-10 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">{user.name}</h2>
                <p className="text-slate-500 font-medium">{user.email}</p>
                <div className="mt-4 px-4 py-1 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full">
                  {user.role} Account
                </div>
              </div>
              
              <div className="mt-10 pt-10 border-t border-gray-50 space-y-2">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-600 rounded-2xl transition group"
                >
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition" />
                </button>
              </div>
            </div>
          </div>

          {/* Orders History */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-black text-slate-900 flex items-center">
                <ShoppingBag className="w-8 h-8 mr-3 text-indigo-600" />
                Order History
              </h1>
              <span className="bg-white px-4 py-2 rounded-full border border-gray-100 text-sm font-bold text-slate-500">
                {orders.length} Orders
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="bg-white p-16 rounded-[40px] text-center border border-gray-100">
                <Package className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                <h2 className="text-xl font-bold text-slate-900 mb-2">No orders found</h2>
                <p className="text-slate-500 mb-8">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => router.push('/products')}
                  className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-md transition">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
                        <p className="font-bold text-slate-900">#{order.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                        <p className="font-bold text-slate-900">{new Date(order.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Total</p>
                        <p className="font-bold text-indigo-600">${order.total.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="px-4 py-1.5 bg-green-50 text-green-600 text-xs font-black uppercase tracking-widest rounded-full">
                          {order.status}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4 overflow-x-auto pb-2">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="w-16 h-16 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100">
                          <img src={item.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
