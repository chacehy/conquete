'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Hotel, Check, X, Sliders, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';
import SuccessModal from '@/components/SuccessModal';

export default function OmraPage() {
  const { t, tText, language } = useLanguage();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonFilter, setSeasonFilter] = useState('all');

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [calcAdults, setCalcAdults] = useState(2);
  const [calcChildren, setCalcChildren] = useState(0);
  const [showDrawerBookingForm, setShowDrawerBookingForm] = useState(false);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Form Booking States
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookDate, setBookDate] = useState('');

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    async function loadPackages() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('type', 'omra')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error(err);
        addToast(t('toast_error_load_omra'), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadPackages();

    const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setBookDate(nextWeekStr);
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const openPackageDetails = (pkg: Package) => {
    setSelectedPackage(pkg);
    setCalcAdults(2);
    setCalcChildren(0);
    setShowDrawerBookingForm(false);
    setDrawerOpen(true);
  };

  const getCalcTotal = () => {
    if (!selectedPackage) return 0;
    return (calcAdults * selectedPackage.price_adult) + (calcChildren * selectedPackage.price_child);
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !bookName || !bookEmail || !bookPhone || !bookDate) return;

    const price = getCalcTotal();
    const details = {
      package_id: selectedPackage.id,
      package_title: selectedPackage.title,
      adults: calcAdults,
      children: calcChildren,
      total_price: price,
      preferred_date: bookDate
    };

    try {
      const { error } = await supabase.from('leads').insert([{
        type: 'package',
        name: bookName,
        email: bookEmail,
        phone: bookPhone,
        status: 'Nouveau',
        details
      }]);
      if (error) throw error;
      setBookName('');
      setBookEmail('');
      setBookPhone('');
      setShowDrawerBookingForm(false);
      setDrawerOpen(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      addToast(t('toast_error_lead'), 'error');
    }
  };

  const getUpcomingDepartures = () => {
    const events: { date: Date; dateStr: string; title: string; pkg: Package }[] = [];
    packages.forEach(p => {
      if (p.departure_dates && Array.isArray(p.departure_dates)) {
        p.departure_dates.forEach(d => {
          events.push({
            date: new Date(d),
            dateStr: d,
            title: p.title,
            pkg: p
          });
        });
      }
    });

    return events
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .filter(ev => ev.date >= new Date())
      .slice(0, 6);
  };

  const filteredPackages = packages.filter(p => {
    if (seasonFilter === 'all') return true;
    return p.season === seasonFilter;
  });

  return (
    <div className="flex-1 flex flex-col relative">
      <Header />

      {/* Banner */}
      <section className="bg-slate-900 text-white py-16 w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest block mb-2">{t('omra_banner_badge')}</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">{t('omra_banner_title')}</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            {t('omra_banner_desc')}
          </p>
        </div>
      </section>

      {/* Catalog & Filters */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full flex-1">
        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 mb-10 justify-center sm:justify-start">
          {[
            { id: 'all', title: t('omra_filter_all') },
            { id: 'Ramadan', title: t('omra_filter_ramadan') },
            { id: 'Mawlid', title: t('omra_filter_mawlid') },
            { id: 'Automne', title: t('omra_filter_autumn') }
          ].map(btn => (
            <button 
              key={btn.id}
              onClick={() => setSeasonFilter(btn.id)}
              className={`px-4.5 py-2.5 rounded-full font-bold text-xs border transition-all cursor-pointer ${
                seasonFilter === btn.id 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'
              }`}
            >
              {btn.title}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="font-semibold text-sm">{t('loading_data')}</p>
          </div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/50 shadow-sm text-slate-500">
            {t('omra_no_packages')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPackages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group">
                <div className="relative h-60 w-full overflow-hidden">
                  <img 
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'} 
                    alt={tText(pkg.title)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-xs font-extrabold px-3 py-1.5 rounded-md shadow-sm border border-emerald-100">
                    {t('nav_omra')}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                    <span className="flex items-center gap-1 text-slate-500"><Calendar className="w-4 h-4 text-blue-600" /> {pkg.duration}</span>
                    {pkg.hotel_proximity && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 flex items-center gap-0.5">
                        <Hotel className="w-3.5 h-3.5" /> {pkg.hotel_proximity} {t('haram_proximity')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {tText(pkg.title)}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                    {tText(pkg.description)}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-auto">
                    <button 
                      onClick={() => openPackageDetails(pkg)}
                      className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      {t('lbl_decouvrir')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Departure dates timeline */}
        {!loading && getUpcomingDepartures().length > 0 && (
          <div className="mt-20 bg-white border border-slate-200/50 rounded-2xl p-8 shadow-sm">
            <div className="text-center mb-8 flex flex-col items-center gap-2">
              <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">{t('omra_upcoming_title')}</h3>
              <p className="text-sm text-slate-500 max-w-md">{t('omra_upcoming_desc')}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getUpcomingDepartures().map((event, idx) => {
                const dateFmt = new Date(event.dateStr).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                return (
                  <div 
                    key={idx} 
                    onClick={() => openPackageDetails(event.pkg)}
                    className="p-5 bg-slate-50 rounded-xl border-l-4 border-blue-600 hover:-translate-y-1 hover:shadow-md cursor-pointer transition-all flex flex-col gap-1.5"
                  >
                    <div className="text-blue-600 font-extrabold text-xs flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" /> {dateFmt}
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">{tText(event.title)}</h4>
                    <p className="text-[10px] text-slate-500 mt-auto">{t('btn_details')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <Footer />

      {/* ==================== DETAIL DRAWER ==================== */}
      <AnimatePresence>
        {drawerOpen && selectedPackage && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950 z-50 cursor-pointer"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-heading text-xl font-bold text-slate-900 line-clamp-1">{tText(selectedPackage.title)}</h3>
                <button 
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-150 hover:bg-slate-100 text-slate-500 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="relative h-60 w-full rounded-xl overflow-hidden border border-slate-100 shadow-inner bg-slate-100">
                  <img 
                    src={selectedPackage.image_url || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'} 
                    alt={tText(selectedPackage.title)}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed font-semibold text-sm">
                    {tText(selectedPackage.description)}
                  </p>
                  {selectedPackage.hotel_proximity && (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100">
                      <Hotel className="w-3.5 h-3.5" /> {t('drawer_hotel_proximity_prefix')} {selectedPackage.hotel_proximity} {t('haram_proximity')}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200/50">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-500">{t('drawer_inclusion')}</h4>
                    <ul className="space-y-2 text-xs font-bold text-slate-700">
                      {selectedPackage.included?.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {tText(inc)}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-500">{t('drawer_exclusion')}</h4>
                    <ul className="space-y-2 text-xs font-bold text-slate-700">
                      {selectedPackage.excluded?.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> {tText(exc)}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedPackage.accompaniment && (
                  <div className="space-y-3">
                    <h4 className="font-heading text-lg font-bold text-slate-900 border-b pb-2 border-slate-100">{t('omra_accompaniment_title')}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">{tText(selectedPackage.accompaniment)}</p>
                  </div>
                )}

                {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                  <div className="space-y-5">
                    <h4 className="font-heading text-lg font-bold text-slate-900 border-b pb-2 border-slate-100">{t('drawer_itinerary')}</h4>
                    <div className="space-y-0 relative">
                      {selectedPackage.itinerary.map((day, idx) => (
                        <div key={idx} className="itinerary-step flex gap-4 pl-1 relative">
                          <div className="relative w-10 flex flex-col items-center itinerary-line shrink-0">
                            <span className="w-9 h-9 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-bold text-xs flex items-center justify-center relative z-10 shadow-sm">
                              {t('lbl_day_prefix')}{day.day}
                            </span>
                          </div>
                          <div className="pb-6 flex-1 flex flex-col gap-1">
                            <h5 className="font-bold text-slate-900 text-sm leading-snug">{tText(day.title)}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{tText(day.desc)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedPackage.departure_dates && (
                  <div className="space-y-3">
                    <h4 className="font-heading text-base font-bold text-slate-900">{t('preferred_dates_list')}</h4>
                    <div className="flex gap-2.5 flex-wrap">
                      {selectedPackage.departure_dates.map((d, i) => {
                        const dateStr = new Date(d).toLocaleDateString(language === 'ar' ? 'ar-DZ' : 'fr-FR', { day: 'numeric', month: 'short' });
                        return (
                          <span key={i} className="px-3.5 py-1.5 bg-blue-50 text-blue-700 font-extrabold text-xs rounded border border-blue-100 shadow-sm">
                            {dateStr}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Sliders className="w-4 h-4 text-blue-600" /> {t('drawer_calc_title')}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase self-end">{t('drawer_adults')}</label>
                    <label className="text-xs font-bold text-slate-500 uppercase self-end">{t('drawer_children')}</label>
                    <input 
                      type="number" 
                      value={calcAdults}
                      onChange={e => setCalcAdults(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white font-bold w-full" 
                    />
                    <input 
                      type="number" 
                      value={calcChildren}
                      onChange={e => setCalcChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      min={0}
                      className="px-3 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 bg-white font-bold w-full" 
                    />
                  </div>
                  <div className="flex items-center justify-end pt-4 border-t border-blue-100 mt-2">
                    {!showDrawerBookingForm && (
                      <button 
                        onClick={() => {
                          setShowDrawerBookingForm(true);
                          setTimeout(() => {
                            bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 50);
                        }}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md cursor-pointer"
                      >
                        {t('btn_book')}
                      </button>
                    )}
                  </div>
                </div>

                {showDrawerBookingForm && (
                  <motion.div 
                    ref={bookingFormRef}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 border-t border-slate-100 space-y-4"
                  >
                    <h4 className="font-heading text-lg font-bold text-slate-900">{t('drawer_book_title')}</h4>
                    <form onSubmit={handleReservation} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">{t('drawer_full_name')}</label>
                          <input 
                            type="text" 
                            value={bookName}
                            onChange={e => setBookName(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">{t('drawer_email')}</label>
                          <input 
                            type="email" 
                            value={bookEmail}
                            onChange={e => setBookEmail(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">{t('drawer_phone')}</label>
                          <input 
                            type="tel" 
                            value={bookPhone}
                            onChange={e => setBookPhone(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">{t('drawer_preferred_date')}</label>
                          <input 
                            type="date" 
                            value={bookDate}
                            onChange={e => setBookDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600"
                            required 
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button 
                          type="button" 
                          onClick={() => setShowDrawerBookingForm(false)}
                          className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          {t('btn_cancel')}
                        </button>
                        <button 
                          type="submit" 
                          className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md cursor-pointer"
                        >
                          {t('btn_confirm_booking')}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <SuccessModal isOpen={showSuccessModal} onClose={() => { setShowSuccessModal(false); window.location.href = '/'; }} language={language} />

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div 
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 bg-white text-slate-900 ${
                toast.type === 'success' ? 'border-emerald-100 border-l-4 border-l-emerald-500' : 'border-rose-100 border-l-4 border-l-rose-500'
              }`}
            >
              {toast.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              )}
              <span className="text-sm font-semibold leading-relaxed">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
