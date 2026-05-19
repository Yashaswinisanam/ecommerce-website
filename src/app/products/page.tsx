'use client';

import React, { useEffect, useState, Suspense } from 'react';
import axios from 'axios';
import Navbar from '@/components/storefront/Navbar';
import ProductCard from '@/components/storefront/ProductCard';
import { Filter, ChevronDown, ShoppingBag } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  category: string;
}

function ProductsList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  // Interactive UI state
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [priceRange, setPriceRange] = useState<string>('all');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('/api/admin/products');
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Update selected category when query parameter changes
  useEffect(() => {
    if (categoryParam) {
      setTimeout(() => {
        setSelectedCategory(categoryParam);
      }, 0);
    } else {
      setTimeout(() => {
        setSelectedCategory('All');
      }, 0);
    }
  }, [categoryParam]);

  // Derived category list from actual inventory
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
  const categories = ['All', ...uniqueCategories];

  // 1. Category Filter
  let processedProducts = selectedCategory === 'All'
    ? products
    : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  // 2. Price Filter
  if (priceRange === 'under150') {
    processedProducts = processedProducts.filter((p) => p.price < 150);
  } else if (priceRange === '150to300') {
    processedProducts = processedProducts.filter((p) => p.price >= 150 && p.price <= 300);
  } else if (priceRange === 'over300') {
    processedProducts = processedProducts.filter((p) => p.price > 300);
  }

  // 3. Sorting
  processedProducts = [...processedProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return b._id.localeCompare(a._id);
    }
  });

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* Categories Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-10 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 cursor-pointer ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100'
                : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {selectedCategory === 'All' ? 'Our Collection' : `${selectedCategory} Collection`}
          </h1>
          <p className="text-slate-500">
            Discover premium products tailored to your modern lifestyle
          </p>
        </div>
        
        <div className="flex items-center gap-4 relative">
          {/* Price Range Filter */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSortDropdown(false);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              <span>Price: {priceRange === 'all' ? 'All' : priceRange === 'under150' ? 'Under $150' : priceRange === '150to300' ? '$150 - $300' : 'Over $300'}</span>
            </button>
            
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                {[
                  { id: 'all', label: 'All Prices' },
                  { id: 'under150', label: 'Under $150' },
                  { id: '150to300', label: '$150 - $300' },
                  { id: 'over300', label: 'Over $300' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setPriceRange(option.id);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                      priceRange === option.id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Menu */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
                setShowFilterDropdown(false);
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <span>Sort by: {sortBy === 'newest' ? 'Newest' : sortBy === 'price-low' ? 'Price: Low-High' : sortBy === 'price-high' ? 'Price: High-Low' : 'Name: A-Z'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-xl z-30 p-2 space-y-1">
                {[
                  { id: 'newest', label: 'Newest Arrivals' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'name', label: 'Name: A to Z' }
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSortBy(option.id);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition cursor-pointer ${
                      sortBy === option.id 
                        ? 'bg-indigo-50 text-indigo-600' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
          {processedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {!loading && processedProducts.length === 0 && (
        <div className="text-center py-24">
          <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-400">No products found</h2>
          <p className="text-slate-300 mt-2">Adjust your filters or check back later</p>
        </div>
      )}
    </main>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Suspense fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      }>
        <ProductsList />
      </Suspense>
    </div>
  );
}
