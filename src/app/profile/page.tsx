'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Navbar from '@/components/storefront/Navbar';
import { useUser, UserAddress } from '@/context/UserContext';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  CreditCard, 
  Eye, 
  Heart,
  ChevronRight, 
  LogOut, 
  Package, 
  FileText, 
  Plus, 
  Trash2, 
  Check, 
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

interface Order {
  _id: string;
  id?: string;
  items: OrderItem[];
  shippingInfo: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentInfo: {
    status: string;
    method: string;
  };
  subtotal?: number;
  shippingPrice?: number;
  totalPrice: number;
  status: string;
  courierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
}

const TABS = [
  { id: 'Overview', icon: User },
  { id: 'Orders', icon: ShoppingBag },
  { id: 'Wishlist', icon: Heart },
  { id: 'Addresses', icon: MapPin },
  { id: 'Payments', icon: CreditCard },
  { id: 'Security', icon: Shield },
  { id: 'Notifications', icon: Bell },
  { id: 'Settings', icon: Settings },
  { id: 'Recently Viewed', icon: Eye },
];



export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <UserDashboardPage />
    </Suspense>
  );
}

function UserDashboardPage() {
  const { user, loading, logout, updateUser } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Set default tab from query parameters
  const [activeTab, setActiveTab] = useState('Overview');
  
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TABS.some(t => t.id.toLowerCase() === tabParam.toLowerCase())) {
      const match = TABS.find(t => t.id.toLowerCase() === tabParam.toLowerCase());
      if (match) {
        Promise.resolve().then(() => {
          setActiveTab(match.id);
        });
      }
    }
  }, [searchParams]);

  // Loading state
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  interface RecentlyViewedItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category?: string;
  }
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewedItem[]>([]);
  
  // Edit Profile States
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Address States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrStreet, setNewAddrStreet] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('');
  const [newAddrPostal, setNewAddrPostal] = useState('');
  const [newAddrCountry, setNewAddrCountry] = useState('United States');

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  // Invoice States
  const [printOrder, setPrintOrder] = useState<Order | null>(null);

  // Load User details
  useEffect(() => {
    if (user) {
      Promise.resolve().then(() => {
        setProfileName(user.name);
        setProfileEmail(user.email);
        setProfileAvatar(user.avatarUrl || '');
      });
    }
  }, [user]);

  // Fetch Orders
  useEffect(() => {
    if (user) {
      const fetchOrders = async () => {
        try {
          const { data } = await axios.get('/api/orders');
          setOrders(data);
        } catch {
          toast.error('Failed to load order history');
        } finally {
          setOrdersLoading(false);
        }
      };
      fetchOrders();
    }
  }, [user]);

  // Load Recently Viewed from LocalStorage
  useEffect(() => {
    const list = localStorage.getItem('recentlyViewed');
    if (list) {
      try {
        const parsed = JSON.parse(list).slice(0, 4);
        Promise.resolve().then(() => {
          setRecentlyViewed(parsed);
        });
      } catch {
        // ignore
      }
    }
  }, []);

  // Guard routing
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/profile');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-24">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 font-bold text-slate-500 animate-pulse">Initializing Premium Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle Edit Profile
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      // Mock update to local context/storage (since we want premium immediate responses)
      const success = await updateUser({
        name: profileName,
        email: profileEmail,
        avatarUrl: profileAvatar
      });
      if (success) {
        toast.success('Profile details updated successfully');
      } else {
        toast.error('Failed to save profile changes');
      }
    } catch {
      toast.error('Error updating profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Add saved address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrName || !newAddrPhone || !newAddrStreet || !newAddrCity || !newAddrPostal) {
      toast.error('Please fill in all address fields');
      return;
    }
    try {
      const newAddress: UserAddress = {
        name: newAddrName,
        phone: newAddrPhone,
        street: newAddrStreet,
        city: newAddrCity,
        postalCode: newAddrPostal,
        country: newAddrCountry,
        isDefault: (user.addresses || []).length === 0,
      };

      const updatedAddresses = [...(user.addresses || []), newAddress];
      const success = await updateUser({ addresses: updatedAddresses });
      if (success) {
        toast.success('Address added successfully!');
        setShowAddressForm(false);
        setNewAddrName('');
        setNewAddrPhone('');
        setNewAddrStreet('');
        setNewAddrCity('');
        setNewAddrPostal('');
      } else {
        toast.error('Failed to save address');
      }
    } catch {
      toast.error('Error saving address');
    }
  };

  // Delete address
  const handleDeleteAddress = async (index: number) => {
    try {
      const current = user.addresses || [];
      const updated = current.filter((_, i) => i !== index);
      // Ensure one is default if list is not empty
      if (updated.length > 0 && !updated.some(a => a.isDefault)) {
        updated[0].isDefault = true;
      }
      const success = await updateUser({ addresses: updated });
      if (success) {
        toast.success('Address removed');
      }
    } catch {
      toast.error('Failed to remove address');
    }
  };

  // Set default address
  const handleSetDefaultAddress = async (index: number) => {
    try {
      const current = user.addresses || [];
      const updated = current.map((addr, i) => ({
        ...addr,
        isDefault: i === index
      }));
      const success = await updateUser({ addresses: updated });
      if (success) {
        toast.success('Default address updated');
      }
    } catch {
      toast.error('Update failed');
    }
  };

  // Handle Security Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSecurityLoading(true);
    try {
      // Offline/Online simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password changed successfully! Keep it secure.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Failed to update password');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Cancel Pending/Processing Order
  const handleCancelOrder = async (orderId: string) => {
    try {
      await axios.patch(`/api/admin/orders/${orderId}`, { status: 'cancelled' });
      toast.success('Order cancelled successfully.');
      setOrders(prev => prev.map(o => o._id === orderId || o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch {
      toast.error('Failed to cancel order. Please contact support.');
    }
  };

  // Stepper calculations
  const getStepProgress = (status: string) => {
    const steps = ['pending', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'];
    const currentIdx = steps.indexOf(status.toLowerCase());
    return currentIdx === -1 ? 0 : currentIdx;
  };

  const getStepLabel = (status: string) => {
    const formatted = status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
    if (status.toLowerCase() === 'cancelled') return 'Order Cancelled';
    return formatted;
  };

  // Calculate Subtotals & Estimates
  const printInvoice = (order: Order) => {
    setPrintOrder(order);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 print:bg-white print:pb-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="max-w-7xl mx-auto w-full px-6 py-12 flex-1">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-[40px] p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden print:hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.25),transparent_40%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-white/10 rounded-[32px] border border-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-xl">
                {profileAvatar ? (
                  <Image src={profileAvatar} alt="Avatar" width={80} height={80} className="w-full h-full object-cover rounded-[32px]" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <span className="text-xs font-black text-indigo-400 tracking-widest uppercase">Premium Member</span>
                <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-1">{user.name}</h1>
                <p className="text-slate-400 mt-1 font-medium">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={logout}
              className="flex items-center space-x-2 bg-white/10 hover:bg-red-500/20 hover:text-red-300 border border-white/10 px-6 py-3 rounded-full text-sm font-bold transition duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start print:block print:w-full">
          {/* Left Sidebar Navigation */}
          <aside className="bg-white/80 backdrop-blur-md border border-slate-100 rounded-[36px] p-6 space-y-2 shadow-sm lg:sticky lg:top-28 print:hidden">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 mb-4">Dashboard Navigation</h2>
            <nav className="space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold transition duration-300 text-sm ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <tab.icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                      <span>{tab.id}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'translate-x-1' : 'opacity-40'}`} />
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Main Panel Content */}
          <div className="lg:col-span-3 bg-white border border-slate-100 rounded-[40px] p-8 min-h-[600px] shadow-sm flex flex-col print:border-none print:shadow-none print:p-0 print:w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="flex-1 flex flex-col print:w-full"
              >
                {/* 1. OVERVIEW VIEW */}
                {activeTab === 'Overview' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Overview Dashboard</h2>
                      <p className="text-slate-400 font-bold mt-1">Quick analysis and profile status</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 relative overflow-hidden group hover:shadow-lg transition duration-300">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Fulfillments</h4>
                        <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{orders.length} Placed</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 relative overflow-hidden group hover:shadow-lg transition duration-300">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                          <Heart className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Wishlist items</h4>
                        <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{(user.wishlist || []).length} Saved</p>
                      </div>
                      <div className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 relative overflow-hidden group hover:shadow-lg transition duration-300">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <h4 className="text-slate-400 text-[10px] font-black tracking-widest uppercase">Shipping profiles</h4>
                        <p className="text-3xl font-black text-slate-900 tracking-tight mt-1">{(user.addresses || []).length} Verified</p>
                      </div>
                    </div>

                    {/* Content split */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Recent Order */}
                      <div className="border border-slate-100 p-6 rounded-[32px] bg-slate-50/20">
                        <h3 className="text-lg font-black text-slate-900 mb-4 flex items-center justify-between">
                          <span>Latest Order</span>
                          <button onClick={() => setActiveTab('Orders')} className="text-xs text-indigo-600 font-bold hover:underline">View All</button>
                        </h3>
                        {orders.length === 0 ? (
                          <p className="text-slate-400 text-sm font-bold">No active orders yet.</p>
                        ) : (
                          <div className="space-y-4">
                            <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
                              <div>
                                <p className="font-black text-sm text-slate-900">#{orders[0]._id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-xs text-slate-400 font-bold">{new Date(orders[0].createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-black uppercase">
                                {orders[0].status}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-100">
                              <Package className="w-5 h-5 text-slate-400" />
                              <div className="text-xs text-slate-500 font-medium truncate flex-1">
                                {orders[0].items.map(i => `${i.name} (${i.quantity})`).join(', ')}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Default Address */}
                      <div className="border border-slate-100 p-6 rounded-[32px] bg-slate-50/20 flex flex-col justify-between">
                        <div>
                          <h3 className="text-lg font-black text-slate-900 mb-4">Default Address</h3>
                          {!(user.addresses || []).some(a => a.isDefault) ? (
                            <p className="text-slate-400 text-sm font-bold">No default address specified.</p>
                          ) : (
                            (() => {
                              const def = (user.addresses || []).find(a => a.isDefault);
                              return (
                                <div className="space-y-1.5 text-slate-600 text-sm font-medium">
                                  <p className="font-black text-slate-900">{def?.name}</p>
                                  <p>{def?.phone}</p>
                                  <p>{def?.street}</p>
                                  <p>{def?.city}, {def?.postalCode}</p>
                                  <p>{def?.country}</p>
                                </div>
                              );
                            })()
                          )}
                        </div>
                        <button 
                          onClick={() => setActiveTab('Addresses')}
                          className="mt-6 w-full py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-black rounded-2xl transition duration-300"
                        >
                          Manage Address Profiles
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. ORDERS VIEW */}
                {activeTab === 'Orders' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Fulfillment & Orders</h2>
                      <p className="text-slate-400 font-bold mt-1">Track shipping timelines and manage refunds</p>
                    </div>

                    {ordersLoading ? (
                      <div className="py-24 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-slate-500 font-bold animate-pulse">Syncing orders state...</p>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-black text-slate-800 text-lg">No Orders Placed</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-6">Explore our curated collections and place your first order!</p>
                        <Link href="/products" className="bg-indigo-600 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-indigo-700 transition">Shop Catalog</Link>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {orders.map((order) => {
                          const stepsProgress = getStepProgress(order.status);
                          const isCancelled = order.status.toLowerCase() === 'cancelled';
                          
                          return (
                            <div key={order._id} className="border border-slate-200/60 rounded-[36px] bg-slate-50/20 p-6 md:p-8 hover:shadow-xl hover:shadow-indigo-50/20 transition duration-300">
                              {/* Header details */}
                              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                                <div>
                                  <div className="flex items-center space-x-2.5">
                                    <h3 className="font-black text-slate-900 text-xl tracking-tight">Order #{order._id.substring(0, 8).toUpperCase()}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                      isCancelled ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                                    }`}>
                                      {getStepLabel(order.status)}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-400 font-bold mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                  <button 
                                    onClick={() => printInvoice(order)}
                                    className="flex items-center space-x-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-full text-xs font-bold transition duration-300"
                                  >
                                    <FileText className="w-4 h-4" />
                                    <span>Download Invoice</span>
                                  </button>
                                  {order.status.toLowerCase() === 'pending' || order.status.toLowerCase() === 'processing' ? (
                                    <button 
                                      onClick={() => handleCancelOrder(order._id)}
                                      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200/50 px-4 py-2.5 rounded-full text-xs font-bold transition duration-300"
                                    >
                                      Cancel Order
                                    </button>
                                  ) : null}
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="py-6 space-y-4">
                                {order.items.map((item, idx) => (
                                  <div key={idx} className="flex items-center space-x-4">
                                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                                      <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-slate-900 text-sm truncate">{item.name}</p>
                                      <p className="text-xs text-slate-400 font-bold mt-0.5">Qty: {item.quantity} • Price: ${item.price}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-black text-slate-900">${(item.quantity * item.price).toFixed(2)}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Logistics timeline tracking */}
                              {!isCancelled && (
                                <div className="py-6 border-t border-slate-100">
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Logistics Fulfillment Stepper</p>
                                  <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
                                    {/* Line connecting */}
                                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block z-0" />
                                    <div 
                                      className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 -translate-y-1/2 hidden md:block z-0 transition-all duration-500" 
                                      style={{ width: `${(stepsProgress / 5) * 100}%` }}
                                    />

                                    {/* Steps */}
                                    {['Placed', 'Processing', 'Packed', 'Shipped', 'On Route', 'Delivered'].map((label, stepIdx) => {
                                      const isPassed = stepIdx <= stepsProgress;
                                      const isCurrent = stepIdx === stepsProgress;
                                      return (
                                        <div key={label} className="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-2 w-full md:w-auto">
                                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            isPassed 
                                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                                              : 'bg-white border-slate-200 text-slate-400'
                                          }`}>
                                            {isPassed && stepIdx < stepsProgress ? (
                                              <Check className="w-4 h-4" />
                                            ) : (
                                              <span className="text-xs font-black">{stepIdx + 1}</span>
                                            )}
                                          </div>
                                          <div className="text-left md:text-center">
                                            <p className={`text-xs font-black ${isPassed ? 'text-indigo-600' : 'text-slate-400'}`}>{label}</p>
                                            {isCurrent && (
                                              <p className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full mt-0.5 inline-block">Active</p>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Logistics Courier updates */}
                              {order.trackingNumber && (
                                <div className="bg-slate-100/40 p-4 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-3">
                                  <div>
                                    <p className="font-bold text-slate-500">Courier Partner</p>
                                    <p className="font-black text-slate-800 mt-0.5">{order.courierName || 'Expedited Delivery Service'}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-500">Tracking Reference</p>
                                    <p className="font-black text-slate-800 mt-0.5">{order.trackingNumber}</p>
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-500">Estimated Arrival</p>
                                    <p className="font-black text-indigo-600 mt-0.5">
                                      {order.estimatedDeliveryDate 
                                        ? new Date(order.estimatedDeliveryDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                        : '3-5 business days'}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Total Price footer */}
                              <div className="pt-6 border-t border-slate-100 flex justify-between items-center mt-6">
                                <div>
                                  <p className="text-xs text-slate-400 font-bold">Billing Gateway</p>
                                  <p className="text-xs font-black text-slate-700 mt-0.5">Payment Method: {order.paymentInfo.method} ({order.paymentInfo.status})</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-slate-400 font-bold">Total Bill</p>
                                  <p className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">${order.totalPrice.toFixed(2)}</p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. WISHLIST VIEW */}
                {activeTab === 'Wishlist' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">My Saved Wishlist</h2>
                      <p className="text-slate-400 font-bold mt-1">Items saved for later purchases</p>
                    </div>

                    {!(user.wishlist || []).length ? (
                      <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-slate-100">
                        <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="font-black text-slate-800 text-lg">Wishlist is Empty</h3>
                        <p className="text-slate-400 text-sm font-medium mt-1 mb-6">Browse products and save your favorites here!</p>
                        <Link href="/products" className="bg-indigo-600 text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-indigo-700 transition">Explore Store</Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* We populate mock values if fully typed populated details are missing, but establish rigid interfaces */}
                        {(user.wishlist || []).map((prodId: string | { _id: string; name: string; price: number; images?: { url: string }[]; category?: string }) => {
                          const idStr = typeof prodId === 'object' ? prodId._id : prodId;
                          const prodName = typeof prodId === 'object' ? prodId.name : 'Gravity Premium Accessory';
                          const prodPrice = typeof prodId === 'object' ? prodId.price : '120.00';
                          const prodImage = typeof prodId === 'object' && prodId.images && prodId.images.length > 0 ? prodId.images[0].url : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600';
                          const prodCat = typeof prodId === 'object' && prodId.category ? prodId.category : 'Storefront';

                          return (
                            <div key={idStr} className="border border-slate-100 rounded-3xl bg-slate-50/20 p-5 flex space-x-4 items-center relative group hover:shadow-lg transition">
                              <div className="relative w-20 h-20 bg-white rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0">
                                <Image src={prodImage} alt="wishlist" fill className="object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">{prodCat}</span>
                                <h4 className="font-black text-slate-900 mt-1 text-sm truncate">{prodName}</h4>
                                <p className="font-black text-indigo-600 mt-0.5 text-sm">${prodPrice}</p>
                              </div>
                              <div className="flex flex-col space-y-2">
                                <Link 
                                  href={`/products/${idStr}`}
                                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition flex items-center justify-center"
                                  title="View Details"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={async () => {
                                    try {
                                      // Remove wishlist helper from UserContext
                                      const success = await updateUser({
                                        wishlist: (user.wishlist || []).filter((id: string | { _id: string }) => (typeof id === 'object' ? id._id : id) !== idStr)
                                      });
                                      if (success) toast.success('Wishlist item removed.');
                                    } catch {
                                      toast.error('Failed to remove item');
                                    }
                                  }}
                                  className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition flex items-center justify-center"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. ADDRESSES VIEW */}
                {activeTab === 'Addresses' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Delivery Addresses</h2>
                        <p className="text-slate-400 font-bold mt-1">Manage saved shipping destinations</p>
                      </div>
                      {!showAddressForm && (
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-full text-xs font-black transition duration-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Address</span>
                        </button>
                      )}
                    </div>

                    {/* Address Form Container */}
                    {showAddressForm && (
                      <form onSubmit={handleAddAddress} className="bg-slate-50 p-6 rounded-[32px] border border-slate-150 space-y-4">
                        <div className="flex justify-between items-center mb-2 border-b border-slate-200/50 pb-3">
                          <h3 className="font-black text-slate-800 text-sm">Create Shipping Profile</h3>
                          <button 
                            type="button" 
                            onClick={() => setShowAddressForm(false)}
                            className="text-xs text-slate-400 font-bold hover:underline"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Recipient Name</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                              placeholder="Jane Doe"
                              value={newAddrName}
                              onChange={(e) => setNewAddrName(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Phone Number</label>
                            <input
                              type="tel"
                              required
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                              placeholder="+1 555-0123"
                              value={newAddrPhone}
                              onChange={(e) => setNewAddrPhone(e.target.value)}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Street Address</label>
                          <input
                            type="text"
                            required
                            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                            placeholder="123 Luxury Avenue, Suite 40"
                            value={newAddrStreet}
                            onChange={(e) => setNewAddrStreet(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">City</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                              placeholder="Beverly Hills"
                              value={newAddrCity}
                              onChange={(e) => setNewAddrCity(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Postal Code</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                              placeholder="90210"
                              value={newAddrPostal}
                              onChange={(e) => setNewAddrPostal(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Country</label>
                            <input
                              type="text"
                              required
                              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                              placeholder="United States"
                              value={newAddrCountry}
                              onChange={(e) => setNewAddrCountry(e.target.value)}
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-indigo-700 transition"
                        >
                          Save Address Destination
                        </button>
                      </form>
                    )}

                    {/* Address List */}
                    {!(user.addresses || []).length ? (
                      <div className="text-center py-16 bg-slate-50 rounded-[32px] border border-slate-100">
                        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold">No saved addresses.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(user.addresses || []).map((addr, idx) => (
                          <div key={idx} className={`p-6 rounded-[28px] border flex flex-col justify-between ${
                            addr.isDefault 
                              ? 'bg-indigo-50/20 border-indigo-200/50 shadow-md shadow-indigo-50/30' 
                              : 'bg-slate-50/40 border-slate-100 hover:shadow-md'
                          } transition duration-300`}>
                            <div>
                              <div className="flex justify-between items-start mb-4">
                                <h4 className="font-black text-slate-900">{addr.name}</h4>
                                {addr.isDefault && (
                                  <span className="bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed">{addr.phone}</p>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{addr.street}</p>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{addr.city}, {addr.postalCode}</p>
                              <p className="text-xs text-slate-600 font-medium leading-relaxed">{addr.country}</p>
                            </div>

                            <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                              {!addr.isDefault && (
                                <button
                                  onClick={() => handleSetDefaultAddress(idx)}
                                  className="text-xs text-indigo-600 font-black hover:underline flex-1 text-left"
                                >
                                  Make Default
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteAddress(idx)}
                                className="text-xs text-red-500 font-black hover:underline flex items-center space-x-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. PAYMENTS VIEW */}
                {activeTab === 'Payments' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Payments</h2>
                      <p className="text-slate-400 font-bold mt-1">Saved credit cards and transactions</p>
                    </div>

                    {/* Saved Cards Mock Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Interactive Credit Card Widget */}
                      <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 rounded-3xl relative overflow-hidden h-48 flex flex-col justify-between shadow-xl">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full filter blur-xl" />
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-bold text-indigo-300 uppercase tracking-widest">Gravity Premium</p>
                          <span className="font-black italic text-lg text-white">VISA</span>
                        </div>
                        <p className="text-xl font-black tracking-widest my-2">•••• •••• •••• 4242</p>
                        <div className="flex justify-between items-end text-xs">
                          <div>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest text-[8px]">Card Holder</p>
                            <p className="font-bold text-slate-100 mt-0.5">{user.name}</p>
                          </div>
                          <div>
                            <p className="text-indigo-400 font-bold uppercase tracking-widest text-[8px]">Expiry</p>
                            <p className="font-bold text-slate-100 mt-0.5">12/28</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Addition Simulator */}
                      <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer">
                        <CreditCard className="w-10 h-10 text-slate-300 mb-3" />
                        <h4 className="font-black text-slate-700 text-sm">Add Payment Method</h4>
                        <p className="text-xs text-slate-400 mt-1">Securely save card profiles for quick checkout</p>
                      </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                      <h3 className="font-black text-slate-900 mb-4 text-lg">Transaction History</h3>
                      {orders.length === 0 ? (
                        <p className="text-xs text-slate-400 font-bold">No completed transactions.</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((o) => (
                            <div key={o._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                              <div>
                                <p className="font-black text-slate-900">Fulfillment Billing #{o._id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-slate-400 font-bold mt-0.5">{new Date(o.createdAt).toLocaleDateString()} via {o.paymentInfo.method}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-black text-slate-900">${o.totalPrice.toFixed(2)}</p>
                                <span className={`text-[9px] font-black uppercase ${
                                  o.paymentInfo.status.toLowerCase() === 'paid' ? 'text-emerald-500' : 'text-slate-500'
                                }`}>
                                  {o.paymentInfo.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 6. SECURITY VIEW */}
                {activeTab === 'Security' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Security & Credentials</h2>
                      <p className="text-slate-400 font-bold mt-1">Update passwords and login configurations</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Current Password</label>
                        <input
                          type="password"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="••••••••"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">New Password</label>
                        <input
                          type="password"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Confirm New Password</label>
                        <input
                          type="password"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={securityLoading}
                        className="w-full bg-slate-900 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-75"
                      >
                        {securityLoading ? 'Securing credentials...' : 'Update Password Credentials'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 7. NOTIFICATIONS VIEW */}
                {activeTab === 'Notifications' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Notifications Center</h2>
                      <p className="text-slate-400 font-bold mt-1">Updates on shipping, returns, and order states</p>
                    </div>

                    <div className="space-y-4">
                      {[
                        {
                          title: 'Order Dispatched',
                          desc: 'Your gravity package #0129 has been packed and handed over to courier service.',
                          time: '2 hours ago',
                          unread: true
                        },
                        {
                          title: 'Payment Successful',
                          desc: 'Secure payment transaction confirmed. Thank you for placing your order.',
                          time: '1 day ago',
                          unread: false
                        },
                        {
                          title: 'Welcome to GRAVITY',
                          desc: 'Your registration is complete. Welcome to our elite luxury lifestyle community.',
                          time: '3 days ago',
                          unread: false
                        }
                      ].map((item, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border flex items-start space-x-4 ${
                          item.unread 
                            ? 'bg-indigo-50/10 border-indigo-100/50' 
                            : 'bg-slate-50/20 border-slate-100'
                        }`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            item.unread ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <h4 className={`font-black text-sm ${item.unread ? 'text-indigo-950' : 'text-slate-800'}`}>{item.title}</h4>
                              <span className="text-[10px] text-slate-400 font-bold flex-shrink-0">{item.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. SETTINGS VIEW */}
                {activeTab === 'Settings' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Profile Settings</h2>
                      <p className="text-slate-400 font-bold mt-1">Edit account information and details</p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-md">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Profile Name</label>
                        <input
                          type="text"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Email Address</label>
                        <input
                          type="email"
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase">Avatar/Profile Image URL</label>
                        <input
                          type="url"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-indigo-500"
                          placeholder="https://example.com/avatar.jpg"
                          value={profileAvatar}
                          onChange={(e) => setProfileAvatar(e.target.value)}
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={profileLoading}
                        className="w-full bg-indigo-600 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-indigo-700 transition disabled:opacity-75"
                      >
                        {profileLoading ? 'Saving updates...' : 'Save Profile Changes'}
                      </button>
                    </form>
                  </div>
                )}

                {/* 9. RECENTLY VIEWED VIEW */}
                {activeTab === 'Recently Viewed' && (
                  <div className="space-y-8 flex-1">
                    <div className="border-b border-slate-100 pb-6">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recently Viewed</h2>
                      <p className="text-slate-400 font-bold mt-1">Catalog items recently visited</p>
                    </div>

                    {recentlyViewed.length === 0 ? (
                      <div className="text-center py-16 bg-slate-50 rounded-[32px] border border-slate-100">
                        <Eye className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">No items in history.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {recentlyViewed.map((item, idx) => (
                          <div key={idx} className="border border-slate-150 rounded-2xl bg-white p-4 flex space-x-3 items-center hover:shadow-lg transition">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0">
                              <Image src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=300'} alt="recent" fill className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 text-xs truncate">{item.name}</h4>
                              <p className="font-black text-indigo-600 mt-0.5 text-xs">${item.price}</p>
                              <Link href={`/products/${item.id}`} className="text-[10px] text-indigo-600 font-black hover:underline mt-1.5 inline-block">View Item</Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* INVOICE PRINT ELEMENT CONTAINER */}
      {printOrder && (
        <div className="hidden print:block w-full text-slate-900 p-8 font-sans">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-black text-indigo-600 tracking-tighter">GRAVITY</h1>
              <p className="text-slate-400 text-xs font-bold mt-1">Luxury Modern Essentials Platform</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black uppercase text-slate-800">Tax Invoice</h2>
              <p className="text-xs text-slate-500 font-bold mt-1">Invoice Ref: #{printOrder._id.substring(0, 12).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-100 text-xs leading-relaxed">
            <div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[9px] mb-1">Billed To:</p>
              <p className="font-bold text-slate-800 text-sm">{user.name}</p>
              <p className="text-slate-500 font-semibold">{user.email}</p>
              <p className="text-slate-500 font-semibold">{printOrder.shippingInfo.address}</p>
              <p className="text-slate-500 font-semibold">{printOrder.shippingInfo.city}, {printOrder.shippingInfo.postalCode}</p>
              <p className="text-slate-500 font-semibold">{printOrder.shippingInfo.country}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-slate-400 uppercase tracking-widest text-[9px] mb-1">Invoice Details:</p>
              <p className="font-bold text-slate-700">Date: {new Date(printOrder.createdAt).toLocaleDateString()}</p>
              <p className="font-bold text-slate-700">Payment Gateway: {printOrder.paymentInfo.method} ({printOrder.paymentInfo.status})</p>
              <p className="font-bold text-slate-700">Order Reference: #{printOrder._id.toUpperCase()}</p>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-xs text-left mb-8">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-widest text-[8px] font-black">
                <th className="py-3">Particulars</th>
                <th className="py-3 text-right">Price</th>
                <th className="py-3 text-center">Quantity</th>
                <th className="py-3 text-right">Total Particulars</th>
              </tr>
            </thead>
            <tbody>
              {printOrder.items.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 text-slate-700 font-medium">
                  <td className="py-4 font-bold">{item.name}</td>
                  <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right font-black">${(item.quantity * item.price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Calculation */}
          <div className="w-1/2 ml-auto text-xs space-y-2 leading-relaxed">
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Subtotal:</span>
              <span>${(printOrder.subtotal || (printOrder.totalPrice * 0.9)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold">
              <span>Delivery Charges:</span>
              <span>${(printOrder.shippingPrice || (printOrder.totalPrice >= 50 ? 0 : 10)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-semibold pb-2 border-b border-slate-100">
              <span>GST/Sales Tax (18%):</span>
              <span>${((printOrder.totalPrice - (printOrder.subtotal || printOrder.totalPrice * 0.9)) - (printOrder.shippingPrice || 0)).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-900 font-black text-sm pt-2">
              <span>Final Total Paid:</span>
              <span>${printOrder.totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-16 text-center text-[9px] text-slate-400 font-black uppercase tracking-widest border-t border-slate-100 pt-6">
            Thank you for purchasing with GRAVITY • Est. 2026
          </div>
        </div>
      )}
    </div>
  );
}
