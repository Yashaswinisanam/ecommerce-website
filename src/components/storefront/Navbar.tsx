'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, Search, Menu } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { cartCount } = useCart();
  const { user } = useUser();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left: Logo */}
        <Link href="/" className="text-2xl font-black tracking-tighter text-indigo-600">GRAVITY</Link>

        {/* Center: Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/products" className="text-gray-600 hover:text-indigo-600 font-bold transition">Shop</Link>
          <Link href="/categories" className="text-gray-600 hover:text-indigo-600 font-bold transition">Categories</Link>
          <Link href="/about" className="text-gray-600 hover:text-indigo-600 font-bold transition">Our Story</Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-6">
          <button className="text-gray-400 hover:text-indigo-600 transition hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <ProfileDropdown />
          ) : (
            <Link href="/login" className="flex items-center space-x-2 bg-indigo-600 text-white py-2 px-5 rounded-full font-bold hover:bg-indigo-700 transition">
              <span>Login</span>
            </Link>
          )}

          <Link href="/cart" className="relative group">
            <ShoppingBag className="w-6 h-6 text-gray-700 group-hover:text-indigo-600 transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </Link>
          <button className="md:hidden text-gray-700">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
