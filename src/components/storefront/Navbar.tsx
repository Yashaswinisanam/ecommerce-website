'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, loading } = useUser();

  return (
    <nav className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-slate-100/80 px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo */}
        <Link 
          href="/" 
          className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent hover:opacity-90 transition"
        >
          GRAVITY
        </Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-slate-600 hover:text-indigo-600 font-bold transition">Shop</Link>
          <Link href="/categories" className="text-slate-600 hover:text-indigo-600 font-bold transition">Categories</Link>
          <Link href="/about" className="text-slate-600 hover:text-indigo-600 font-bold transition">Our Story</Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">
          <button className="text-slate-400 hover:text-indigo-600 transition hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          
          {/* Ant-flicker loading boundary */}
          {loading ? (
            <div className="w-24 h-9 bg-slate-100 animate-pulse rounded-full border border-slate-200/50" />
          ) : user ? (
            <ProfileDropdown />
          ) : (
            <Link 
              href="/login" 
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-6 rounded-full font-bold hover:shadow-lg hover:shadow-indigo-100 transition duration-300 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Login</span>
            </Link>
          )}

          <Link href="/cart" className="relative group p-2 rounded-full hover:bg-slate-50 transition">
            <ShoppingBag className="w-6 h-6 text-slate-700 group-hover:text-indigo-600 transition" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden p-2 text-slate-700 hover:bg-slate-50 rounded-full transition">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
console.log("GIT_TEST");