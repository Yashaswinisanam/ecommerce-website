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
  RefreshCw,
  ChevronDown,
  ThumbsUp,
  Heart,
  CheckCircle,
  Lock
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductImage {
  url: string;
  public_id?: string;
}

interface SpecItem {
  key: string;
  value: string;
}

interface Review {
  _id: string;
  user: string;
  name: string;
  rating: number;
  comment: string;
  helpfulCount: number;
  isVerified: boolean;
  createdAt: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: ProductImage[];
  specifications?: SpecItem[];
  warrantyPeriod?: string;
  deliveryEstimate?: string;
  returnEligibility?: boolean;
  returnDuration?: number;
  returnPolicy?: string;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  ratingBreakdown?: number[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, addToWishlist, removeFromWishlist } = useUser();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  
  // Accordions state
  const [activeAccordion, setActiveAccordion] = useState<string | null>('specs');

  // Zoom Effect State
  const [zoomStyle, setZoomStyle] = useState({ display: 'none', backgroundPosition: '0% 0%' });
  
  // Review form states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Full Screen Preview Modal
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Wishlist checking state
  const isWishlisted = user?.wishlist?.includes(id) || false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`/api/products/${id}`);
        setProduct(data);
        if (data.images?.length > 0) {
          setSelectedImage(data.images[0].url);
        }

        // Add to Recently Viewed local cache
        const recentRaw = localStorage.getItem('recentlyViewed');
        let recent = [];
        if (recentRaw) {
          try {
            recent = JSON.parse(recentRaw);
          } catch {
            recent = [];
          }
        }
        // Filter out duplicates and limit to 10
        recent = recent.filter((p: { id: string }) => p.id !== data._id);
        recent.unshift({
          id: data._id,
          name: data.name,
          price: data.price,
          image: data.images?.[0]?.url || '',
          category: data.category
        });
        localStorage.setItem('recentlyViewed', JSON.stringify(recent.slice(0, 10)));

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
    toast.success('Added to shopping cart!');
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.error('Please log in to manage your wishlist');
      router.push(`/login?redirect=/products/${id}`);
      return;
    }

    try {
      if (isWishlisted) {
        const success = await removeFromWishlist(id);
        if (success) toast.success('Removed from wishlist');
      } else {
        const success = await addToWishlist(id);
        if (success) toast.success('Added to wishlist!');
      }
    } catch {
      toast.error('Failed to update wishlist state');
    }
  };

  // Image Magnification Hover Zoom
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none', backgroundPosition: '0% 0%' });
  };

  // Submit Review Handlers
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a review');
      router.push(`/login?redirect=/products/${id}`);
      return;
    }
    if (!reviewComment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      const { data } = await axios.post(`/api/products/${id}/review`, {
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Thank you for your premium review!');
      setProduct((prev) => {
        if (!prev) return null;
        const newReviews = [data.review, ...(prev.reviews || [])];
        return {
          ...prev,
          reviews: newReviews,
          averageRating: data.averageRating,
          totalReviews: data.totalReviews,
          ratingBreakdown: data.ratingBreakdown
        };
      });
      setReviewComment('');
    } catch (err) {
      const apiErr = err as { response?: { data?: { error?: string } } };
      toast.error(apiErr.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Upvote helpful reviews
  const handleHelpfulClick = async (reviewId: string) => {
    try {
      await axios.patch(`/api/products/${id}/review`, { reviewId });
      toast.success('Marked as helpful');
      setProduct((prev) => {
        if (!prev) return null;
        const updated = (prev.reviews || []).map((r) => 
          r._id === reviewId ? { ...r, helpfulCount: r.helpfulCount + 1 } : r
        );
        return { ...prev, reviews: updated };
      });
    } catch {
      toast.error('Failed to update rating upvote');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-32">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Product Not Found</h2>
          <button onClick={() => router.back()} className="text-indigo-600 font-bold flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
          </button>
        </div>
      </div>
    );
  }

  // Specifications list fallbacks
  const specs = product.specifications && product.specifications.length > 0 
    ? product.specifications 
    : [
        { key: 'Composition', value: 'Premium Craft Grade' },
        { key: 'Country of Origin', value: 'Imported' },
        { key: 'Care Guidelines', value: 'Premium Wipe Care' },
        { key: 'Delivery ETA', value: product.deliveryEstimate || '3-5 Business Days' }
      ];

  const ratingBreakdown = product.ratingBreakdown || [0, 0, 0, 0, 0];
  const reviewsCount = product.totalReviews || 0;
  const avgRating = product.averageRating || 4.8;

  // Estimated Arrival Date String
  const arrivalDate = new Date();
  arrivalDate.setDate(arrivalDate.getDate() + 4);
  const formattedArrival = arrivalDate.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="min-h-screen bg-white pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Link */}
        <button
          onClick={() => router.push('/products')}
          className="mb-8 flex items-center text-slate-400 hover:text-indigo-600 transition font-bold"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Collections
        </button>

        {/* Product Details Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          
          {/* LEFT SIDE: Interactive Image Gallery */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* MAIN IMAGE CONTAINER WITH MAGNIFICATION ZOOM */}
            <div 
              className="relative aspect-square rounded-[36px] overflow-hidden bg-slate-50 border border-slate-100 shadow-2xl shadow-indigo-100/50 cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setIsFullScreen(true)}
            >
              <Image
                src={selectedImage || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover transition-opacity duration-300"
              />
              
              {/* Zoom Overlay Div */}
              <div 
                className="absolute inset-0 pointer-events-none hidden md:block bg-no-repeat transition-all duration-75"
                style={{
                  ...zoomStyle,
                  backgroundImage: `url(${selectedImage})`,
                  backgroundSize: '200%'
                }}
              />
            </div>

            {/* THUMBNAILS GALLERY CONTAINER */}
            {product.images?.length > 1 && (
              <div className="flex gap-4 overflow-x-auto py-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`relative min-w-[80px] h-[80px] rounded-2xl overflow-hidden border-2 transition duration-200 flex-shrink-0 ${
                      selectedImage === img.url ? 'border-indigo-600 scale-105 shadow-md shadow-indigo-100' : 'border-slate-150 hover:border-indigo-400'
                    }`}
                  >
                    <Image src={img.url} alt={`Thumbnail ${idx}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT SIDE: Product Info details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <div>
              <span className="inline-block px-4 py-1.5 mb-4 text-xs font-black tracking-widest text-indigo-600 uppercase bg-indigo-50 rounded-full">
                {product.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tighter">
                {product.name}
              </h1>
            </div>

            {/* Rating Stars Summary banner */}
            <div className="flex items-center space-x-4 border-b border-slate-100 pb-6">
              <div className="flex items-center text-yellow-400">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-current' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-slate-500 font-bold">
                {avgRating.toFixed(1)} ({reviewsCount} Verified Reviews)
              </span>
            </div>

            {/* Price badge */}
            <div className="flex items-baseline space-x-3">
              <p className="text-4xl font-black text-slate-950 tracking-tight">${product.price.toFixed(2)}</p>
              {product.price > 100 && (
                <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-md">Free Delivery Qualified</span>
              )}
            </div>

            {/* Product description */}
            <p className="text-slate-500 text-base leading-relaxed">{product.description}</p>

            {/* Stock status indicator */}
            <div>
              {product.stock > 0 ? (
                <span className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-black uppercase">
                  <CheckCircle className="w-3.5 h-3.5 mr-1" /> {product.stock} Units In Stock
                </span>
              ) : (
                <span className="inline-flex items-center text-xs bg-red-50 text-red-600 px-3 py-1 rounded-full font-black uppercase">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Add to Cart & Wishlist row */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4.5 rounded-3xl font-black text-lg flex items-center justify-center space-x-3 hover:shadow-2xl hover:shadow-indigo-100 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{product.stock > 0 ? 'Add to Cart Bag' : 'Temporarily Out of Stock'}</span>
              </button>
              <button
                onClick={handleToggleWishlist}
                className={`p-4.5 rounded-3xl border flex items-center justify-center transition duration-300 ${
                  isWishlisted ? 'bg-red-50 border-red-200 text-red-500' : 'bg-slate-50 border-slate-200/60 text-slate-400 hover:text-slate-600'
                }`}
                title="Toggle Wishlist"
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Interactive Specs and Returns Accordion details */}
            <div className="border-t border-b border-slate-100 py-2 space-y-2">
              {/* Accordion header 1: Specifications */}
              <div className="border-b border-slate-50 py-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                  className="w-full flex items-center justify-between font-black text-slate-800 text-sm py-1"
                >
                  <span>Detailed Specifications</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'specs' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'specs' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        {specs.map((s, index) => (
                          <div key={index} className="space-y-1">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">{s.key}</span>
                            <p className="font-bold text-slate-800">{s.value}</p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion header 2: Shipping & Logistics */}
              <div className="border-b border-slate-50 py-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                  className="w-full flex items-center justify-between font-black text-slate-800 text-sm py-1"
                >
                  <span>Premium Shipping & Delivery estimates</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center space-x-3">
                          <Truck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="font-black text-slate-800">Guaranteed Delivery</p>
                            <p className="text-slate-500 mt-0.5">Delivered by {formattedArrival} via Express Carrier.</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="font-black text-slate-800">Relational warranty coverage</p>
                            <p className="text-slate-500 mt-0.5">{product.warrantyPeriod || '2 Year Full Warranty'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Accordion header 3: Returns Policies */}
              <div className="py-3">
                <button 
                  onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                  className="w-full flex items-center justify-between font-black text-slate-800 text-sm py-1"
                >
                  <span>Easy Return Policy</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${activeAccordion === 'returns' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeAccordion === 'returns' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden mt-3"
                    >
                      <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600 font-medium">
                        <div className="flex items-center space-x-3">
                          <RefreshCw className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <div>
                            <p className="font-black text-slate-800">{product.returnDuration || 30}-Day Returns Eligible</p>
                            <p className="text-slate-500 mt-0.5">{product.returnPolicy || '30-Day no-questions-asked refund policy'}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Checkout Trust badge section */}
            <div className="flex justify-center sm:justify-start items-center space-x-6 text-slate-400 text-xs font-black uppercase tracking-wider">
              <div className="flex items-center space-x-1.5">
                <Lock className="w-4 h-4 text-slate-300" />
                <span>100% Encrypted Payment</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-300" />
                <span>Quality Verified</span>
              </div>
            </div>

          </motion.div>

        </div>

        {/* BOTTOM SECTION: Ratings, Breakdown Bars & Customer Reviews */}
        <section className="mt-24 border-t border-slate-100 pt-16">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">Verified Customer Reviews</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Reviews aggregate stats sidebar */}
            <div className="space-y-6 lg:sticky lg:top-28">
              <div className="bg-slate-50 p-8 rounded-[36px] border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregate Score</p>
                <h3 className="text-6xl font-black text-slate-900 mt-2 tracking-tighter">{avgRating.toFixed(1)}</h3>
                <div className="flex justify-center text-yellow-400 my-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-current' : 'text-slate-200'}`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 font-bold">Based on {reviewsCount} customer submissions</p>
              </div>

              {/* Progress bars breakdown */}
              <div className="space-y-3 bg-slate-50/50 p-6 border border-slate-100 rounded-3xl text-xs">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingBreakdown[stars - 1] || 0;
                  const percent = reviewsCount > 0 ? (count / reviewsCount) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center space-x-3 text-slate-600 font-medium">
                      <span className="w-3 text-slate-400 font-bold">{stars}★</span>
                      <div className="flex-1 h-2 bg-slate-150 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-right font-black text-slate-500">{percent.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center review timeline list & writing panels */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Write review portal */}
              <div className="bg-white p-6 md:p-8 border border-slate-150 rounded-[32px] shadow-sm">
                <h3 className="font-black text-slate-900 text-xl tracking-tight mb-4">Share Your Product Experience</h3>
                <p className="text-xs text-slate-400 font-bold mb-6">Only verified purchasers can submit genuine comments</p>
                
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {/* Rating Stars Input Selector */}
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">My rating</label>
                    <div className="flex space-x-1.5 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setReviewRating(s)}
                          className="hover:scale-110 active:scale-95 transition outline-none"
                        >
                          <Star className={`w-8 h-8 ${s <= reviewRating ? 'fill-current' : 'text-slate-200'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Review Comment</label>
                    <textarea
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      placeholder="Write your genuine thoughts, quality observations, etc."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-slate-950 text-white font-bold text-xs py-3.5 rounded-xl hover:bg-slate-800 transition disabled:opacity-70"
                  >
                    {submittingReview ? 'Submitting Review...' : 'Publish Customer Review'}
                  </button>
                </form>
              </div>

              {/* Reviews timeline lists */}
              <div className="space-y-6">
                {(!product.reviews || product.reviews.length === 0) ? (
                  <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-slate-400 text-xs font-bold">No reviews for this product yet. Be the first to share your opinion!</p>
                  </div>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev._id} className="p-6 rounded-[28px] border border-slate-100 bg-slate-50/10 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-black text-slate-900 text-sm">{rev.name}</span>
                            {rev.isVerified && (
                              <span className="flex items-center text-[8px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-black uppercase">
                                <CheckCircle className="w-2.5 h-2.5 mr-0.5" /> Verified Purchase
                              </span>
                            )}
                          </div>
                          <div className="flex text-yellow-400 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-slate-200'}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(rev.createdAt).toLocaleDateString()}</span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{rev.comment}</p>

                      <div className="flex items-center justify-between pt-2">
                        <button
                          onClick={() => handleHelpfulClick(rev._id)}
                          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-600 font-black transition"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>Helpful ({rev.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>

          </div>

        </section>

      </main>

      {/* FULL SCREEN GALLERY PREVIEW MODAL */}
      <AnimatePresence>
        {isFullScreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/95 z-[999] flex items-center justify-center p-8 cursor-zoom-out"
            onClick={() => setIsFullScreen(false)}
          >
            <div className="relative w-full max-w-4xl aspect-square rounded-3xl overflow-hidden bg-slate-900">
              <Image src={selectedImage} alt={product.name} fill className="object-contain" />
            </div>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition"
            >
              Close
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}