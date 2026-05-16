'use client';

import React, { useState, useEffect } from 'react';
import { X, Upload, Package, DollarSign, Tag, Database } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product?: any;
}

export default function ProductModal({ isOpen, onClose, onSuccess, product }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: [] as any[],
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        stock: product.stock.toString(),
        images: product.images || [],
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        images: [],
      });
    }
  }, [product, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const data = new FormData();
    data.append('file', file);

    try {
      // In a real app, you'd upload to your /api/upload route which goes to Cloudinary
      // For demo, we'll simulate it
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { url: reader.result as string, public_id: Date.now().toString() }]
        }));
        setLoading(false);
      };
    } catch (error) {
      toast.error('Upload failed');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      if (product) {
        await axios.put(`/api/admin/products/${product._id}`, payload);
        toast.success('Product updated');
      } else {
        await axios.post('/api/admin/products', payload);
        toast.success('Product created');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Action failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full transition text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Package className="w-4 h-4 mr-2" /> Product Name
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 transition"
                placeholder="e.g. Premium Wireless Headphones"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Tag className="w-4 h-4 mr-2" /> Category
              </label>
              <input
                type="text"
                required
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 transition"
                placeholder="e.g. Electronics"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              required
              rows={4}
              className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 transition resize-none"
              placeholder="Tell us about the product..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                <DollarSign className="w-4 h-4 mr-2" /> Price
              </label>
              <input
                type="number"
                required
                step="0.01"
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 transition"
                placeholder="0.00"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Database className="w-4 h-4 mr-2" /> Stock
              </label>
              <input
                type="number"
                required
                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-600 transition"
                placeholder="0"
                value={formData.stock}
                onChange={e => setFormData({...formData, stock: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-black text-slate-400 uppercase tracking-widest">Product Images</label>
            <div className="grid grid-cols-4 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 group">
                  <img src={img.url} className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-xs font-bold text-slate-400">Upload</span>
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="pt-4 sticky bottom-0 bg-white pb-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-xl hover:bg-indigo-700 transition shadow-2xl shadow-indigo-100 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
