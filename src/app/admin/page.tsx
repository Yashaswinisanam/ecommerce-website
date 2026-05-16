'use client';

import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  DollarSign, 
  Package, 
  ArrowUpRight, 
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const stats = [
    { label: 'Total Revenue', value: '$12,450', icon: DollarSign, change: '+12.5%', color: 'bg-emerald-500' },
    { label: 'Total Orders', value: '156', icon: ShoppingBag, change: '+18.2%', color: 'bg-indigo-500' },
    { label: 'Total Products', value: '42', icon: Package, change: '+4.3%', color: 'bg-amber-500' },
    { label: 'Total Users', value: '890', icon: Users, change: '+25.1%', color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-10 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-bold mt-1">Welcome back, Admin. Here is what is happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center space-x-2 text-sm font-bold text-slate-600">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>System Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-6">
              <div className={`p-4 rounded-2xl ${stat.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-black">
                <TrendingUp className="w-3 h-3" />
                <span>{stat.change}</span>
              </div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/admin/products" className="group p-6 bg-indigo-600 rounded-[24px] text-white hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 flex items-center justify-between">
              <div>
                <p className="font-black text-xl mb-1">Add Product</p>
                <p className="text-indigo-100 text-sm font-bold">List a new item in store</p>
              </div>
              <ArrowUpRight className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/admin/orders" className="group p-6 bg-slate-900 rounded-[24px] text-white hover:bg-slate-800 transition-all duration-300 shadow-lg shadow-slate-100 flex items-center justify-between">
              <div>
                <p className="font-black text-xl mb-1">Manage Orders</p>
                <p className="text-slate-400 text-sm font-bold">View fulfillment status</p>
              </div>
              <ArrowUpRight className="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Recent Activity Mock */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 mb-6">Recent Activity</h2>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">New user registered</p>
                  <p className="text-xs text-slate-400 font-bold">2 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-3 text-sm font-black text-indigo-600 bg-indigo-50 rounded-2xl hover:bg-indigo-100 transition">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
