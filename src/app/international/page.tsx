'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';

export default function InternationalPage() {
  const { t, tText } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPackages() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('type', 'international')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, []);

  return (
    <div className="flex-1 flex flex-col relative">
      <Header />

      {/* Banner */}
      <section className="bg-slate-900 text-white py-16 w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">{t('int_banner_badge')}</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">{t('int_banner_title')}</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            {t('int_banner_desc')}
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="font-semibold text-sm">{t('loading_data')}</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/50 shadow-sm text-slate-500">
            {t('int_no_packages')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group">
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'}
                    alt={tText(pkg.title)}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-extrabold px-3 py-1.5 rounded-md shadow-sm">
                    {t('nav_international')}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600" /> {pkg.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600" /> {pkg.destinations.split(',').length} {t('dest_count')}</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {tText(pkg.title)}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                    {tText(pkg.description)}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-auto">
                    <Link
                      href={`/international/${pkg.id}`}
                      className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                    >
                      {t('lbl_decouvrir')}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
