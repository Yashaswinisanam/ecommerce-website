import React from 'react';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-slate-900 text-white p-8 hidden md:block">
        <h2 className="text-3xl font-black mb-12 text-indigo-400 tracking-tighter">GRAVITY</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center space-x-3 py-3 px-6 hover:bg-slate-800 rounded-[18px] transition font-bold text-slate-300 hover:text-white">
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/products" className="flex items-center space-x-3 py-3 px-6 hover:bg-slate-800 rounded-[18px] transition font-bold text-slate-300 hover:text-white">
            <span>Products</span>
          </Link>
          <Link href="/admin/orders" className="flex items-center space-x-3 py-3 px-6 hover:bg-slate-800 rounded-[18px] transition font-bold text-slate-300 hover:text-white">
            <span>Orders</span>
          </Link>
          <Link href="/admin/users" className="flex items-center space-x-3 py-3 px-6 hover:bg-slate-800 rounded-[18px] transition font-bold text-slate-300 hover:text-white">
            <span>Users</span>
          </Link>
          <div className="pt-8 mt-8 border-t border-slate-800">
             <Link href="/" className="flex items-center space-x-3 py-3 px-6 hover:bg-slate-800 rounded-[18px] transition font-bold text-slate-400 hover:text-white">
               <span>View Store</span>
             </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
