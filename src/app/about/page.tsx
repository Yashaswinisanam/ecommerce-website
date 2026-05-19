'use client';

import React from 'react';
import Navbar from '@/components/storefront/Navbar';
import { ShieldCheck, Heart, Sparkles, Award } from 'lucide-react';

interface CoreValue {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export default function AboutPage() {
  const values: CoreValue[] = [
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-600" />,
      title: 'Premium Quality',
      description: 'We source the finest materials and partner with state-of-the-art manufacturers to guarantee unparalleled longevity and product performance.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: 'Ethical Production',
      description: 'Our carbon-neutral global supply chain ensures that workers are compensated fairly and carbon offsets are utilized at every touchpoint.',
    },
    {
      icon: <Heart className="w-6 h-6 text-indigo-600" />,
      title: 'Customer First',
      description: 'Every product includes lifetime support, a 30-day no-questions-asked refund policy, and a commitment to exceed expectations.',
    },
    {
      icon: <Award className="w-6 h-6 text-indigo-600" />,
      title: 'Award Winning Design',
      description: 'Engineered with minimalistic Scandinavian aesthetics that fit seamlessly into modern spaces and active lifestyles.',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section className="relative bg-slate-900 text-white py-32 px-6 overflow-hidden">
          <div className="absolute inset-0 opacity-40 z-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600"
              alt="Brand Banner"
              className="w-full h-full object-cover filter blur-[2px]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-indigo-950/80 z-10" />

          <div className="max-w-4xl mx-auto text-center relative z-20">
            <span className="text-xs font-black uppercase tracking-widest bg-indigo-500/25 text-indigo-300 px-5 py-2 rounded-full mb-6 inline-block">
              Est. 2026 • Gravitational Craftsmanship
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
              Redefining Modern Essentials
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed font-medium">
              We started with a single, simple mission: to bridge the gap between uncompromising utility and sleek, high-performance aesthetics.
            </p>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="max-w-7xl mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 block">Our Origin</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-6">
                Born out of a desire for premium perfection.
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-6">
                Gravity was founded by a team of designers and engineers tired of cheap, mass-produced items that wore out quickly or didn&apos;t fit the aesthetic of a modern home. We wanted items that were beautifully crafted, built to last, and engineered for high-performance functionality.
              </p>
              <p className="text-slate-600 font-medium leading-relaxed">
                By removing bloated retail middlemen and shipping directly from top-tier suppliers, we make professional-grade electronics, timeless leather accessories, and ergonomic furniture accessible to design-conscious individuals worldwide.
              </p>
            </div>
            <div className="relative h-[480px] rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://wearejolie.com/cdn/shop/files/6515a786c1d7cbb66e5f3588_LowRes_Billy_Bolton_Jolie_Studio_FEC_Studio_172-HDR_7001023e-31cb-4ddc-94c8-06dc4b7eb831.jpg?v=1747065206&width=3840"
                alt="Our studio"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-slate-50 py-24 border-t border-b border-slate-100/50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3 block">Our Core Pillars</span>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">
                Values that drive us forward.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-3 tracking-tight">{value.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
