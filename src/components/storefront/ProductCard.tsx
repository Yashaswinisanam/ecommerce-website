'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    category: string;
    images: { url: string; public_id: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0]?.url || '',
    });
    toast.success('Added to cart!');
  };

  return (
    <div className="group relative bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500">
      {/* Image Container */}
      <Link href={`/products/${product._id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.images[0]?.url || '/placeholder.png'}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-lg transition">
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">{product.category}</p>
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition truncate w-40">
              {product.name}
            </h3>
          </div>
          <p className="text-xl font-black text-slate-900">${product.price}</p>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full mt-4 bg-slate-900 text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-indigo-600 transition-colors duration-300"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Add to Cart</span>
        </button>
      </div>
    </div>
  );
}
