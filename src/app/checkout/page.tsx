'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/storefront/Navbar';
import { CreditCard, Truck, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, addOrder } = useCart();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Please login to proceed with checkout');
      router.push('/login?redirect=/checkout');
    }
  }, [router]);

  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate Payment
    setTimeout(() => {
      const newOrder = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        items: [...cart],
        total: cartTotal,
        date: new Date().toISOString(),
        shipping: formData,
        status: 'Processing'
      };

      addOrder(newOrder);
      clearCart();
      toast.success('Payment Successful! Order placed.');
      setLoading(false);
      router.push('/profile');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Form */}
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-8 flex items-center">
              <Truck className="w-8 h-8 mr-3 text-indigo-600" />
              Shipping Information
            </h1>
            
            <form onSubmit={handleCheckout} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 transition outline-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 transition outline-none"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 transition outline-none"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 transition outline-none"
                  value={formData.country}
                  onChange={(e) => setFormData({...formData, country: e.target.value})}
                />
              </div>

              <div className="pt-8">
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-3 text-indigo-600" />
                  Payment Method
                </h2>
                <div className="p-6 bg-white border-2 border-indigo-600 rounded-3xl flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-slate-900 rounded flex items-center justify-center mr-4">
                      <span className="text-white text-[10px] font-bold">CARD</span>
                    </div>
                    <span className="font-bold text-slate-900">Stripe Checkout</span>
                  </div>
                  <div className="w-6 h-6 rounded-full border-4 border-indigo-600 bg-white" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-10 bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-indigo-700 transition shadow-2xl shadow-indigo-200 disabled:opacity-70"
              >
                {loading ? 'Processing...' : (
                  <>
                    <span>Pay ${cartTotal.toFixed(2)}</span>
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 h-fit lg:sticky lg:top-32">
            <h2 className="text-2xl font-black text-slate-900 mb-8">Order Summary</h2>
            <div className="space-y-6 mb-10">
              {cart.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 bg-gray-50 rounded-xl overflow-hidden">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-bold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-8 border-t border-gray-50">
              <div className="flex justify-between text-slate-500 font-bold">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-bold">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between text-2xl font-black text-slate-900 pt-4">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-10 p-6 bg-indigo-50 rounded-3xl flex items-start space-x-4">
              <ShieldCheck className="w-6 h-6 text-indigo-600 flex-shrink-0" />
              <div>
                <p className="font-bold text-indigo-900 text-sm">Secure Checkout</p>
                <p className="text-indigo-600 text-xs mt-1">Your payment details are encrypted and never stored on our servers.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
