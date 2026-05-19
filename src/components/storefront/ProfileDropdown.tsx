'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { User, LogOut, ShoppingBag, LayoutDashboard, ChevronDown, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const initials = user.name ? user.name.charAt(0).toUpperCase() : 'U';
  const firstName = user.name ? user.name.split(' ')[0] : 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-50/50 hover:bg-slate-100/85 border border-slate-200/40 py-1.5 px-3.5 rounded-full transition duration-300 outline-none"
      >
        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-100">
          {initials}
        </div>
        <span className="text-sm font-bold text-slate-700 hidden sm:block">{firstName}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-[28px] shadow-2xl shadow-indigo-100/60 border border-slate-100 py-3 z-[100] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-50 mb-2 bg-slate-50/30">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</span>
                {user.role === 'admin' && (
                  <span className="flex items-center text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black uppercase">
                    <ShieldCheck className="w-2.5 h-2.5 mr-0.5" /> Admin
                  </span>
                )}
              </div>
              <p className="font-bold text-slate-900 truncate mt-1">{user.email}</p>
            </div>
            
            <Link 
              href="/profile?tab=Overview" 
              className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-600 transition duration-200 font-bold"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5 opacity-70" />
              <span>My Profile</span>
            </Link>
            
            <Link 
              href="/profile?tab=Orders" 
              className="flex items-center space-x-3 px-5 py-3 text-slate-600 hover:bg-indigo-50/60 hover:text-indigo-600 transition duration-200 font-bold"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-5 h-5 opacity-70" />
              <span>My Orders</span>
            </Link>

            {user.role === 'admin' && (
              <Link 
                href="/admin" 
                className="flex items-center space-x-3 px-5 py-3 text-indigo-600 bg-indigo-50/30 hover:bg-indigo-50/70 transition duration-200 font-bold"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <div className="border-t border-slate-50 my-2" />

            <button 
              onClick={() => { logout(); setIsOpen(false); }}
              className="w-full flex items-center space-x-3 px-5 py-3 text-red-500 hover:bg-red-50/60 transition duration-200 font-bold text-left"
            >
              <LogOut className="w-5 h-5 opacity-70" />
              <span>Logout</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
