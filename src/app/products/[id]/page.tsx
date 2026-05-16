'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Navbar from '@/components/storefront/Navbar';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const MOCK_PRODUCTS: any[] = [
  {
    _id: '1',
    name: 'Premium Wireless Headphones',
    description: 'Experience unparalleled sound quality with our flagship wireless headphones. Featuring advanced active noise cancellation, 40-hour battery life, and ultra-soft protein leather ear pads for all-day comfort. The custom-tuned 40mm drivers deliver deep, rhythmic bass and sparkling highs.',
    price: 299,
    category: 'Electronics',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000', public_id: 'mock1' }]
  },
  {
    _id: '2',
    name: 'Minimalist Leather Watch',
    description: 'A masterpiece of minimalist design. This timepiece features a surgical-grade stainless steel case, sapphire crystal glass, and a genuine Italian leather strap that develops a beautiful patina over time. Perfect for both formal occasions and everyday wear.',
    price: 189,
    category: 'Accessories',
    stock: 24,
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000', public_id: 'mock2' }]
  },
  {
    _id: '3',
    name: 'Smart Home Speaker',
    description: 'Transform your home audio experience. Our smart speaker combines room-filling sound with intelligent voice control. With multi-room capability and lossless audio streaming support, it is the only speaker you will ever need.',
    price: 129,
    category: 'Electronics',
    stock: 8,
    images: [{ url: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?q=80&w=1000', public_id: 'mock3' }]
  },
  {
    _id: '4',
    name: 'Ergonomic Office Chair',
    description: 'Invest in your health and productivity. Designed by orthopedic experts, this chair provides dynamic lumbar support, breathable mesh fabric, and 4D adjustable armrests. The synchronous tilt mechanism ensures your body stays perfectly aligned.',
    price: 450,
    category: 'Furniture',
    stock: 5,
    images: [{ url: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=1000', public_id: 'mock4' }]
  }
];

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Try to find in mock data first
        const mockProduct = MOCK_PRODUCTS.find(p => p._id === id);
        if (mockProduct) {
          setProduct(mockProduct);
          setLoading(false);
          return;
        }

        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        _id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0]?.url || '',
      });
      toast.success('Added to cart!');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Product not found</h2>
      <button onClick={() => router.back()} className="text-indigo-600 font-bold flex items-center">
        <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex items-center text-slate-400 hover:text-indigo-600 transition font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Collection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative aspect-square rounded-[40px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-indigo-50"
          >
            <Image 
              src={product.images[0]?.url || '/placeholder.png'} 
              alt={product.name} 
              fill 
              className="object-cover"
            />
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="inline-block px-4 py-1.5 mb-6 text-xs font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
              {product.category}
            </span>
            <h1 className="text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tighter">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-5 h-5 fill-current" />)}
              </div>
              <span className="text-slate-400 font-bold">4.9 (120+ Reviews)</span>
            </div>

            <p className="text-4xl font-black text-slate-900 mb-8">${product.price}</p>
            
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              {product.description}
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="font-bold text-sm text-slate-900">Free Shipping</p>
                  <p className="text-xs text-slate-500">Orders over $50</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />
                <div>
                  <p className="font-bold text-sm text-slate-900">2 Year Warranty</p>
                  <p className="text-xs text-slate-500">Full coverage</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100"
              >
                <ShoppingCart className="w-6 h-6" />
                <span>Add to Cart</span>
              </button>
            </div>
            
            <div className="mt-8 flex items-center justify-center space-x-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
              <div className="flex items-center"><RefreshCw className="w-4 h-4 mr-2" /> 30-Day Returns</div>
              <div className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> Secure Checkout</div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
