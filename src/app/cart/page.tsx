'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/storefront/Navbar';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-12">Your Cart</h1>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Cart is empty</h2>
            <p className="text-slate-500 mb-8">Looks like you haven't added anything yet.</p>
            <Link href="/products" className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold hover:bg-indigo-700 transition">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Items List */}
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item) => (
                <div key={item._id} className="flex items-center space-x-6 p-6 bg-white border border-gray-100 rounded-3xl group">
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-indigo-600 font-bold mb-4">${item.price}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 bg-slate-50 rounded-xl px-3 py-1.5 border border-slate-100">
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity - 1)}
                          className="text-slate-500 hover:text-indigo-600 transition"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-slate-900 w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                          className="text-slate-500 hover:text-indigo-600 transition"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item._id)}
                        className="text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Card */}
            <div className="lg:col-span-1">
              <div className="bg-slate-900 text-white p-8 rounded-[40px] sticky top-32 shadow-2xl shadow-indigo-200">
                <h2 className="text-2xl font-bold mb-8">Order Summary</h2>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="pt-4 border-t border-slate-800 flex justify-between text-xl font-black">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                <Link href="/checkout" className="w-full bg-white text-slate-900 py-5 rounded-2xl font-black flex items-center justify-center space-x-2 hover:bg-indigo-50 transition group">
                  <span>Checkout</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <p className="mt-6 text-center text-xs text-slate-500 uppercase tracking-widest font-bold">
                  Secure Checkout Powered by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
