'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '@/components/storefront/Navbar';
import ProductCard from '@/components/storefront/ProductCard';
import { Filter, ChevronDown } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  category: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/admin/products'); // Reusing the same API for now
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Our Collection</h1>
            <p className="text-slate-500">Discover premium products for your lifestyle</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition">
              <span>Sort by: Newest</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 aspect-square rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-24">
            <h2 className="text-2xl font-bold text-slate-400">No products found</h2>
            <p className="text-slate-300 mt-2">Check back later for new arrivals</p>
          </div>
        )}
      </main>
    </div>
  );
}
