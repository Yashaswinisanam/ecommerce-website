'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import Navbar from '@/components/storefront/Navbar';
import {
  ShoppingCart,
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  RefreshCw
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

interface ProductImage {
  url: string;
  public_id?: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: ProductImage[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);

        setProduct(data);

        if (data.images?.length > 0) {
          setSelectedImage(data.images[0].url);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images?.[0]?.url || '',
    });

    toast.success('Added to cart!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Product not found
        </h2>

        <button
          onClick={() => router.back()}
          className="text-indigo-600 font-bold flex items-center"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

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
          {/* LEFT SIDE - IMAGES */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {/* MAIN IMAGE */}
            <div className="relative aspect-square rounded-[40px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-indigo-50">
              <Image
                src={selectedImage || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>

            {/* THUMBNAILS */}
            <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
              {product.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative min-w-[90px] h-[90px] rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === img.url
                      ? 'border-indigo-600'
                      : 'border-slate-200'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`Thumbnail ${index}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* RIGHT SIDE - PRODUCT INFO */}
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

            {/* RATINGS */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 fill-current" />
                ))}
              </div>

              <span className="text-slate-400 font-bold">
                4.9 (120+ Reviews)
              </span>
            </div>

            {/* PRICE */}
            <p className="text-4xl font-black text-slate-900 mb-8">
              ${product.price}
            </p>

            {/* DESCRIPTION */}
            <p className="text-slate-500 text-lg leading-relaxed mb-10">
              {product.description}
            </p>

            {/* FEATURES */}
            <div className="grid grid-cols-2 gap-6 mb-12">
              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <Truck className="w-6 h-6 text-indigo-600" />

                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Free Shipping
                  </p>

                  <p className="text-xs text-slate-500">
                    Orders over $50
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <ShieldCheck className="w-6 h-6 text-indigo-600" />

                <div>
                  <p className="font-bold text-sm text-slate-900">
                    2 Year Warranty
                  </p>

                  <p className="text-xs text-slate-500">
                    Full coverage
                  </p>
                </div>
              </div>
            </div>

            {/* STOCK */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <span className="text-green-600 font-bold">
                  In Stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-red-500 font-bold">
                  Out of Stock
                </span>
              )}
            </div>

            {/* BUTTONS */}
            <div className="flex space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl flex items-center justify-center space-x-3 hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-6 h-6" />

                <span>
                  {product.stock > 0
                    ? 'Add to Cart'
                    : 'Out of Stock'}
                </span>
              </button>
            </div>

            {/* FOOTER INFO */}
            <div className="mt-8 flex items-center justify-center space-x-8 text-slate-400 text-sm font-bold uppercase tracking-widest">
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                30-Day Returns
              </div>

              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Secure Checkout
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}