'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { User, LogOut, ShoppingBag, LayoutDashboard, ChevronDown } from 'lucide-react';

export default function ProfileDropdown() {
  const { user, logout } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-50 border border-slate-100 py-1.5 px-3 rounded-full hover:bg-slate-100 transition"
      >
        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-bold text-slate-700 hidden sm:block">{user.name.split(' ')[0]}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-2xl shadow-indigo-100 border border-gray-100 py-3 z-[100] overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50 mb-2">
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Account</p>
            <p className="font-bold text-slate-900 truncate">{user.email}</p>
          </div>
          
          <Link 
            href="/profile" 
            className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
            onClick={() => setIsOpen(false)}
          >
            <User className="w-5 h-5" />
            <span className="font-bold">My Profile</span>
          </Link>
          
          <Link 
            href="/profile" 
            className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition"
            onClick={() => setIsOpen(false)}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-bold">My Orders</span>
          </Link>

          {user.role === 'admin' && (
            <Link 
              href="/admin" 
              className="flex items-center space-x-3 px-5 py-3 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 transition"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-bold">Admin Dashboard</span>
            </Link>
          )}

          <button 
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full flex items-center space-x-3 px-5 py-3 text-red-500 hover:bg-red-50 transition"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}
