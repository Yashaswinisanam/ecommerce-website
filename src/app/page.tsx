'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Zap, Shield, Truck } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter text-indigo-600">GRAVITY</Link>
        <div className="flex items-center space-x-8">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600 font-medium transition">Products</Link>
          <Link href="/cart" className="relative group">
            <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition" />
            <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">0</span>
          </Link>
          <Link href="/login" className="bg-black text-white px-5 py-2 rounded-full font-semibold hover:bg-gray-800 transition">Login</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-slate-50">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full">
              New Collection 2026
            </span>
            <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tight text-slate-900 leading-none">
              Style Elevated. <br />
              <span className="text-indigo-600">Performance</span> Defined.
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the next generation of e-commerce with our curated collection of premium essentials designed for modern life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/products" className="group bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center hover:bg-indigo-700 transition shadow-xl shadow-indigo-200">
                Shop Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/admin" className="px-8 py-4 rounded-full font-bold text-lg text-slate-700 hover:bg-white transition border border-slate-200">
                Admin Demo
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute top-24 -right-24 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-30" />
      </section>

      {/* Features */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightning Fast</h3>
            <p className="text-slate-500">Optimized for speed. Browse and checkout in seconds without any friction.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
            <p className="text-slate-500">Your data is protected. We use industry-standard encryption for all transactions.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Global Shipping</h3>
            <p className="text-slate-500">Wherever you are, we&apos;ll get your products to you quickly and safely.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 px-6 border-t border-gray-100 bg-slate-50 text-center">
        <p className="text-slate-400 font-medium">© 2024 GRAVITY E-commerce. All rights reserved.</p>
      </footer>
    </div>
  );
}
