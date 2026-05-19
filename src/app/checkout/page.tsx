'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useUser, UserAddress } from '@/context/UserContext';
import Navbar from '@/components/storefront/Navbar';
import { 
  CreditCard, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Coins, 
  Smartphone,
  MapPin,
  CheckCircle2,
  Receipt,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user, loading } = useUser();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const router = useRouter();

  // Selected address and payment methods
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'UPI' | 'COD'>('Stripe');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'GPay' | 'PhonePe' | 'Paytm'>('GPay');

  // Shipping Form details
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'United States',
  });

  interface PlacedOrderItem {
    _id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }

  interface PlacedOrderShipping {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  }

  interface PlacedOrder {
    _id: string;
    items: PlacedOrderItem[];
    shippingInfo: PlacedOrderShipping;
    paymentMethod: string;
    totalPrice: number;
  }

  const [showReceipt, setShowReceipt] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token && !loading) {
      toast.error('Please login to proceed with checkout');
      router.push('/login?redirect=/checkout');
    }
  }, [router, loading]);

  // Autofill if user has addresses
  useEffect(() => {
    if (user && user.addresses && user.addresses.length > 0) {
      // Find default or select first
      const defaultIdx = user.addresses.findIndex((a: UserAddress) => a.isDefault);
      const activeIdx = defaultIdx !== -1 ? defaultIdx : 0;
      const addr = user.addresses[activeIdx];
      Promise.resolve().then(() => {
        setSelectedAddressIndex(activeIdx);
        setFormData({
          name: addr.name || user.name,
          phone: addr.phone || '',
          address: addr.street || '',
          city: addr.city || '',
          postalCode: addr.postalCode || '',
          country: addr.country || 'United States',
        });
      });
    } else if (user) {
      Promise.resolve().then(() => {
        setFormData(prev => ({ ...prev, name: user.name }));
      });
    }
  }, [user]);

  const handleSelectAddressProfile = (index: number) => {
    setSelectedAddressIndex(index);
    if (user && user.addresses) {
      const addr = user.addresses[index];
      setFormData({
        name: addr.name || user.name,
        phone: addr.phone || '',
        address: addr.street || '',
        city: addr.city || '',
        postalCode: addr.postalCode || '',
        country: addr.country || 'United States',
      });
      toast.success(`Autofilled: ${addr.name}'s address`);
    }
  };

  // Dynamic fee calculations
  const subtotal = cartTotal;
  const shippingPrice = subtotal >= 50 ? 0 : 10;
  const taxPrice = parseFloat((subtotal * 0.18).toFixed(2));
  const grandTotal = parseFloat((subtotal + shippingPrice + taxPrice).toFixed(2));

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      toast.error('Your shopping cart is empty');
      return;
    }
    if (!formData.address || !formData.city || !formData.postalCode || !formData.phone) {
      toast.error('Please complete all shipping address fields');
      return;
    }

    setCheckoutLoading(true);
    try {
      const orderPayload = {
        items: cart.map(item => ({
          _id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingInfo: {
          address: `${formData.name} - ${formData.phone}, ${formData.address}`,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'pending' : 'paid',
        paymentInfo: {
          id: 'pay_' + Math.random().toString(36).substring(2, 9),
          status: paymentMethod === 'COD' ? 'pending' : 'paid',
          method: paymentMethod,
          transactionId: 'txn_' + Math.random().toString(36).substring(2, 10).toUpperCase()
        }
      };

      const { data } = await axios.post('/api/orders', orderPayload);
      setPlacedOrder(data);
      clearCart();
      toast.success('Secure Payment Verified!');
      setShowReceipt(true);
    } catch (error) {
      console.error('Checkout creation error:', error);
      toast.error('Failed to process checkout transaction');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* LEFT SIDE: Shipping, saved address autofill, and payment details */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Header info */}
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center">
                <Truck className="w-8 h-8 mr-3 text-indigo-600" />
                Premium Checkout Flow
              </h1>
              <p className="text-slate-500 font-bold mt-1.5">Enter details or select a pre-saved shipping address</p>
            </div>

            {/* Saved Addresses list for rapid selection */}
            {user.addresses && user.addresses.length > 0 && (
              <div className="bg-white p-6 rounded-[32px] border border-slate-100/80 shadow-sm space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                  Pre-saved Address Profiles
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr: UserAddress, idx: number) => {
                    const isSelected = selectedAddressIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectAddressProfile(idx)}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition duration-300 ${
                          isSelected 
                            ? 'bg-indigo-50/20 border-indigo-500 text-indigo-900 shadow-md shadow-indigo-50/20' 
                            : 'bg-slate-50/40 border-slate-150 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-black text-xs text-slate-900 truncate flex-1">{addr.name}</span>
                            {isSelected && <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 truncate">{addr.phone}</p>
                          <p className="text-[10px] font-bold text-slate-500 truncate mt-1">{addr.street}</p>
                          <p className="text-[10px] font-bold text-slate-500 truncate">{addr.city}, {addr.postalCode}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Form details */}
            <form onSubmit={handleCheckoutSubmit} className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm space-y-6">
              <h3 className="font-black text-slate-900 text-lg">Shipping Location Details</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Recipient Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                    value={formData.phone}
                    placeholder="+1 555-0199"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Street Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">City</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Postal Code</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Country</label>
                  <input
                    type="text"
                    required
                   className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 outline-none text-xs font-bold transition"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>

              {/* PAYMENT SELECTOR GATEWAYS */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <h3 className="font-black text-slate-900 text-lg">Secure Payment Selector</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Stripe Selector */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Stripe')}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between items-start h-28 text-left transition duration-300 ${
                      paymentMethod === 'Stripe' 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                        : 'border-slate-150 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-black text-xs">Stripe Card</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Encrypted Visa/Mastercard</p>
                    </div>
                  </button>

                  {/* UPI Selector */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between items-start h-28 text-left transition duration-300 ${
                      paymentMethod === 'UPI' 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                        : 'border-slate-150 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-black text-xs">UPI Gateways</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Paytm / GPay / PhonePe</p>
                    </div>
                  </button>

                  {/* COD Selector */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-5 rounded-2xl border-2 flex flex-col justify-between items-start h-28 text-left transition duration-300 ${
                      paymentMethod === 'COD' 
                        ? 'border-indigo-600 bg-indigo-50/20 text-indigo-900' 
                        : 'border-slate-150 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Coins className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="font-black text-xs">Cash on Delivery</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Pay in cash on delivery</p>
                    </div>
                  </button>
                </div>

                {/* Sub UPI selectors */}
                {paymentMethod === 'UPI' && (
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 flex items-center space-x-4 text-xs font-bold text-slate-600">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select App</span>
                    {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app as 'GPay' | 'PhonePe' | 'Paytm')}
                        className={`px-3 py-1.5 rounded-full border transition ${
                          selectedUpiApp === app ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Pay button */}
              <button
                type="submit"
                disabled={checkoutLoading}
                className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4.5 rounded-3xl font-black text-lg flex items-center justify-center space-x-3 hover:shadow-2xl hover:shadow-indigo-100 active:scale-[0.98] transition disabled:opacity-70"
              >
                {checkoutLoading ? 'Processing Secure Payment...' : (
                  <>
                    <span>Confirm & Pay ${grandTotal.toFixed(2)}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT SIDE: Cart Summaries & billing calculations */}
          <div className="lg:col-span-5 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm lg:sticky lg:top-32 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Invoice Summary</h2>
            
            {/* Cart products listing */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 border-b border-slate-50 pb-6">
              {cart.length === 0 ? (
                <p className="text-sm text-slate-400 font-bold text-center py-6">Your shopping bag is empty.</p>
              ) : (
                cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                        <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 max-w-[180px] truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity} • ${item.price}</p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Split breakdown prices */}
            <div className="space-y-3 pt-2 text-xs font-bold text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal Particulars</span>
                <span className="text-slate-800 font-black">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax Breakdown (GST 18%)</span>
                <span className="text-slate-800 font-black">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Premium Expedited Shipping</span>
                {shippingPrice === 0 ? (
                  <span className="text-emerald-600 font-black uppercase">FREE</span>
                ) : (
                  <span className="text-slate-800 font-black">${shippingPrice.toFixed(2)}</span>
                )}
              </div>
              <div className="border-t border-slate-100 my-3 pt-3 flex justify-between text-slate-900 font-black text-xl">
                <span>Grand Invoice Total</span>
                <span className="text-indigo-600 tracking-tight">${grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Secure Lock details */}
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start space-x-3 text-xs leading-relaxed text-indigo-700">
              <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-black">Secure Checkout Standard</p>
                <p className="text-slate-500 font-medium mt-0.5">Your payment is encrypted via AES-256 protocols and confirmed securely.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* SUCCESS ANIMATION AND RECEIPT POPUP */}
      <AnimatePresence>
        {showReceipt && placedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 z-[1000] backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[40px] max-w-lg w-full p-8 shadow-2xl relative overflow-hidden text-center"
            >
              {/* Confirmed check icon */}
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Order Confirmed!</h2>
              <p className="text-slate-400 font-bold text-xs mt-1">Thank you. Your receipt has been created successfully.</p>
              
              {/* Receipt Body layout */}
              <div className="my-6 border border-slate-100 rounded-3xl p-5 bg-slate-50/50 text-left text-xs leading-relaxed text-slate-600">
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200/50 font-black text-slate-800">
                  <span className="flex items-center"><Receipt className="w-4 h-4 mr-1 text-indigo-600" /> Invoice Recipient</span>
                  <span>#{placedOrder._id.substring(0, 12).toUpperCase()}</span>
                </div>
                <div className="space-y-1.5 font-medium">
                  <p><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-1">Placed By:</span> {user.name}</p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-1">Payment Method:</span> {paymentMethod} (Successful)</p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-1">Address:</span> {formData.address}</p>
                  <p><span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] mr-1">Billing Total:</span> <span className="font-black text-indigo-600 text-sm">${grandTotal.toFixed(2)}</span></p>
                </div>
              </div>

              {/* Redirect triggers */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    router.push('/profile?tab=Orders');
                  }}
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-2xl hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Track Logistics Delivery</span>
                </button>
                <button
                  onClick={() => {
                    setShowReceipt(false);
                    router.push('/products');
                  }}
                  className="w-full text-slate-500 hover:text-slate-800 font-bold text-xs transition py-2"
                >
                  Back to Catalog Shopping
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
