'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/storefront/Navbar';
import Link from 'next/link';
import axios from 'axios';
import { Laptop, Watch, Armchair, ArrowRight, ShoppingBag } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  category: string;
}

interface CategoryCard {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  itemCount: string;
  image: string;
  color: string;
  bgGradient: string;
}

export default function CategoriesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Derive categories dynamically from inventory
  const uniqueCategories = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  const categories: CategoryCard[] = uniqueCategories.map((cat) => {
    const catProducts = products.filter((p) => p.category === cat);
    const count = catProducts.length;
    const firstProduct = catProducts[0];
    const image = firstProduct?.images?.[0]?.url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=600';

    // Choose icons & gradients dynamically based on name
    let icon = <Laptop className="w-8 h-8" />;
    let color = 'text-indigo-600';
    let bgGradient = 'from-indigo-500/10 to-purple-500/10';

    const lowerCat = cat.toLowerCase();
    if (lowerCat.includes('accessories') || lowerCat.includes('watch') || lowerCat.includes('bag') || lowerCat.includes('jewelry')) {
      icon = <Watch className="w-8 h-8" />;
      color = 'text-amber-600';
      bgGradient = 'from-amber-500/10 to-orange-500/10';
    } else if (lowerCat.includes('furniture') || lowerCat.includes('chair') || lowerCat.includes('table') || lowerCat.includes('desk') || lowerCat.includes('decor')) {
      icon = <Armchair className="w-8 h-8" />;
      color = 'text-emerald-600';
      bgGradient = 'from-emerald-500/10 to-teal-500/10';
    } else if (lowerCat.includes('clothing') || lowerCat.includes('apparel') || lowerCat.includes('fashion') || lowerCat.includes('shirt')) {
      icon = <ShoppingBag className="w-8 h-8" />;
      color = 'text-rose-600';
      bgGradient = 'from-rose-500/10 to-pink-500/10';
    }

    return {
      id: cat,
      name: cat,
      description: `Explore our collection of premium ${cat.toLowerCase()} designed for modern living.`,
      icon,
      itemCount: `${count} ${count === 1 ? 'Item' : 'Items'}`,
      image,
      color,
      bgGradient,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 w-full">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            Shop by Category
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Explore our curated sub-collections engineered for your daily lifestyle.
          </p>
        </div>

        {/* Dynamic Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-100 h-96 rounded-[40px]" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[40px] border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-400">No categories found</h2>
            <p className="text-slate-300 mt-2">Create products in the admin panel to populate categories</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category) => (
              <div 
                key={category.id} 
                className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group flex flex-col justify-between"
              >
                <div>
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden bg-slate-100">
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent z-10" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={category.image} 
                      alt={category.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    />
                    <div className="absolute top-6 right-6 bg-white/90 backdrop-blur px-4 py-1.5 rounded-full z-20 shadow-sm">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{category.itemCount}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-8">
                    <div className={`w-14 h-14 bg-gradient-to-tr ${category.bgGradient} rounded-2xl flex items-center justify-center mb-6 ${category.color}`}>
                      {category.icon}
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {category.description}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-8 pb-8">
                  <Link 
                    href={`/products?category=${category.id}`}
                    className="w-full py-4 bg-slate-50 hover:bg-indigo-600 hover:text-white text-slate-800 rounded-2xl font-black transition-all duration-300 flex items-center justify-center group/btn shadow-inner cursor-pointer"
                  >
                    <span className="mr-2">Explore Collection</span>
                    <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
