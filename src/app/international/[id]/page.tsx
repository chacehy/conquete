'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Check, X, ChevronLeft, Clock, Hotel,
  RefreshCw, AlertCircle, Sliders, Info, Star, ExternalLink,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package, HotelOption } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SuccessModal from '@/components/SuccessModal';
import { useLanguage } from '@/lib/LanguageContext';

export default function PackageDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { t, tText, language } = useLanguage();

  const [pkg, setPkg] = useState<Package | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childTierSelections, setChildTierSelections] = useState<number[]>([]);
  const [selectedHotelIdx, setSelectedHotelIdx] = useState(0);
  const [selectedDepartureDate, setSelectedDepartureDate] = useState('');

  const [showBooking, setShowBooking] = useState(false);
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookDate, setBookDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .eq('id', id)
          .single();
        if (error || !data) { setNotFound(true); setLoading(false); return; }
        setPkg(data);
        if (data.departure_dates?.length) setSelectedDepartureDate(data.departure_dates[0]);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
    setBookDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  }, [id]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const tid = Date.now();
    setToasts(prev => [...prev, { id: tid, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(toast => toast.id !== tid)), 4000);
  };

  const getImages = (): string[] => {
    if (!pkg) return [];
    const fallback = pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80';
    if (Array.isArray(pkg.images) && pkg.images.length > 0) return pkg.images;
    return [fallback];
  };

  const selectedHotel: HotelOption | null = pkg?.hotels?.[selectedHotelIdx] ?? null;

  // Room occupancy rule: max 2 adults + 2 enfants, or 3 adults + 1 enfant. Bébés don't count.
  const countOccupantChildren = (sels: number[]) => {
    const tiers = selectedHotel?.child_prices ?? [];
    return sels.filter(idx => !tiers[Math.min(idx, tiers.length - 1)]?.is_baby).length;
  };
  const fitsOccupancy = (adultsCount: number, occupantChildren: number) =>
    adultsCount <= 3 && (adultsCount <= 2 ? occupantChildren <= 2 : occupantChildren <= 1);

  const getChildPriceBreakdown = (): { label: string; price: number }[] => {
    if (!selectedHotel || children === 0) return [];
    const tiers = selectedHotel.child_prices;
    if (tiers.length === 0) return [];
    return Array.from({ length: children }, (_, i) => {
      const tierIdx = childTierSelections[i] ?? 0;
      const tier = tiers[Math.min(tierIdx, tiers.length - 1)];
      return { label: tier.label, price: tier.price };
    });
  };

  const getTotal = () => {
    if (!pkg) return 0;
    const adultPrice = selectedHotel ? selectedHotel.price_adult : pkg.price_adult;
    const childBreakdown = getChildPriceBreakdown();
    const childTotal = selectedHotel
      ? childBreakdown.reduce((s, t) => s + t.price, 0)
      : children * pkg.price_child;
    return adults * adultPrice + childTotal;
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkg || submitting) return;

    if (!bookName || !bookPhone || !bookDate) {
      addToast(t('toast_required_fields'), 'error');
      return;
    }

    const cleanPhone = bookPhone.replace(/\s+/g, '');
    const isValidPhone = /^[+0-9\-()]+$/.test(cleanPhone) && cleanPhone.length >= 8 && !/[a-zA-Z]/.test(cleanPhone);
    if (!isValidPhone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف صالح (أرقام فقط)' : 'Veuillez entrer un numéro de téléphone valide (chiffres uniquement)', 'error');
      return;
    }

    if (bookEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookEmail)) {
      addToast(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Veuillez entrer une adresse email valide', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const childBreakdown = getChildPriceBreakdown();
      const { error } = await supabase.from('leads').insert([{
        type: 'package',
        name: bookName,
        email: bookEmail,
        phone: bookPhone,
        status: 'Nouveau',
        details: {
          package_id: pkg.id,
          package_title: pkg.title,
          adults,
          children,
          total_price: getTotal(),
          preferred_date: selectedDepartureDate || bookDate,
          ...(selectedHotel ? {
            selected_hotel: selectedHotel.name,
            selected_hotel_stars: selectedHotel.stars,
            selected_departure_date: selectedDepartureDate,
            child_price_breakdown: childBreakdown,
          } : {}),
        },
      }]);
      if (error) throw error;
      setShowBooking(false);
      setBookName(''); setBookEmail(''); setBookPhone('');
      setShowSuccessModal(true);
    } catch {
      addToast(t('toast_error_lead'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="font-semibold text-sm">{t('loading_data')}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !pkg) {
    return (
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-32 text-slate-600">
          <AlertCircle className="w-14 h-14 text-slate-300" />
          <p className="font-heading text-2xl font-bold text-slate-900">Circuit introuvable</p>
          <p className="text-sm text-slate-500">Ce circuit n'existe pas ou a été retiré du catalogue.</p>
          <Link href="/international" className="mt-2 inline-flex items-center gap-2 text-blue-600 text-sm font-semibold hover:underline">
            <ChevronLeft className="w-4 h-4" /> {t('btn_back')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = getImages();
  const destinations = pkg.destinations.split(',').map(d => d.trim());
  const hasGallery = images.length > 1;

  return (
    <div className="flex-1 flex flex-col">
      <Header />

      {/* ── HERO ── */}
      <section className="relative h-[68vh] min-h-[520px] w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeImageIdx}
            src={images[activeImageIdx]}
            alt={tText(pkg.title)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-slate-950/25" />

        {/* Back button */}
        <div className="absolute top-0 left-0 right-0 px-6 sm:px-10 pt-6 max-w-7xl mx-auto w-full">
          <Link
            href="/international"
            className="inline-flex items-center gap-1.5 text-white/75 hover:text-white text-sm font-semibold transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('int_banner_title')}
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-10 pb-10 max-w-7xl mx-auto w-full">
          <div className="flex flex-col gap-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                {t('nav_international')}
              </span>
              {pkg.season && (
                <span className="bg-white/15 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wide px-3 py-1 rounded-full border border-white/25">
                  {pkg.season}
                </span>
              )}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white leading-tight">
              {tText(pkg.title)}
            </h1>
            <div className="flex flex-wrap items-center gap-4 mt-1">
              <div className="flex items-center gap-1.5 text-white/80 text-sm font-semibold">
                <Clock className="w-4 h-4 text-blue-400" />
                {pkg.duration}
              </div>
              <div className="w-px h-4 bg-white/25 hidden sm:block" />
              <div className="flex items-center gap-1.5 text-white/80 text-sm font-semibold">
                <MapPin className="w-4 h-4 text-blue-400" />
                {destinations.join(' · ')}
              </div>
              {pkg.hotel_proximity && (
                <>
                  <div className="w-px h-4 bg-white/25 hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-white/80 text-sm font-semibold">
                    <Hotel className="w-4 h-4 text-blue-400" />
                    {t('drawer_hotel_proximity_prefix')} {pkg.hotel_proximity} {t('haram_proximity')}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Image nav dots */}
        {hasGallery && (
          <div className="absolute bottom-10 right-10 flex items-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveImageIdx(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${i === activeImageIdx ? 'bg-white w-6' : 'bg-white/40 w-1.5 hover:bg-white/70'}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── MAIN LAYOUT ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-14 w-full">
        <div className="flex flex-col lg:flex-row gap-14">

          {/* ── LEFT COLUMN ── */}
          <div className="flex-1 min-w-0 space-y-16">

            {/* Photo Gallery */}
            {hasGallery && (
              <section>
                <div className={`grid gap-2 rounded-2xl overflow-hidden ${images.length >= 3 ? 'grid-cols-4 h-80' : 'grid-cols-2 h-64'}`}>
                  <div
                    className={`relative overflow-hidden cursor-pointer ${images.length >= 3 ? 'col-span-3' : 'col-span-1'}`}
                    onClick={() => setActiveImageIdx(0)}
                  >
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={`gallery-main-${activeImageIdx}`}
                        src={images[activeImageIdx]}
                        alt=""
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                      />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    {images.slice(0, Math.min(images.length, 4)).map((img, i) => {
                      const isLast = i === 3 && images.length > 4;
                      return (
                        <button
                          key={i}
                          onClick={() => setActiveImageIdx(i)}
                          className={`flex-1 relative overflow-hidden transition-all cursor-pointer ${activeImageIdx === i ? 'ring-2 ring-blue-500 ring-inset' : 'opacity-75 hover:opacity-100'}`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isLast && (
                            <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">+{images.length - 4} photos</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* Description */}
            <section className="space-y-5">
              <SectionHeading>À Propos de ce Voyage</SectionHeading>
              <p className="pl-4 text-slate-700 leading-relaxed text-[15px] font-medium whitespace-pre-wrap">
                {tText(pkg.description)}
              </p>
            </section>

            {/* Hotel Options Showcase */}
            {(pkg.hotels?.length ?? 0) > 0 && (
              <section className="space-y-5" id="hotel-options">
                <SectionHeading>Options d'Hébergement</SectionHeading>
                <div className="pl-4 space-y-4">
                  {pkg.hotels!.map((hotel, hIdx) => (
                    <div
                      key={hIdx}
                      className={`rounded-2xl border p-5 space-y-4 transition-all ${
                        selectedHotelIdx === hIdx
                          ? 'border-blue-400 bg-blue-50/40 shadow-sm shadow-blue-100'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900 text-[15px] leading-snug">{hotel.name}</span>
                            <span className="text-amber-500 text-xs font-bold">{'★'.repeat(hotel.stars)}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">{hotel.location} · {hotel.formula}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-black text-blue-600">{hotel.price_adult.toLocaleString('fr-DZ')} DA</p>
                          <p className="text-[10px] text-slate-400 font-semibold">/ adulte</p>
                        </div>
                      </div>
                      {hotel.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {hotel.amenities.map((a, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-full">
                              {a}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center justify-between gap-3 pt-1">
                        {hotel.reference_url ? (
                          <a
                            href={hotel.reference_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[11px] text-blue-500 font-semibold hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Voir les avis
                          </a>
                        ) : <span />}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHotelIdx(hIdx);
                            setChildTierSelections(Array(children).fill(0));
                            document.getElementById('sidebar-calculator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedHotelIdx === hIdx
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                              : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          {selectedHotelIdx === hIdx ? '✓ Sélectionné' : 'Choisir cet hôtel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Included / Excluded */}
            {((pkg.included?.length ?? 0) > 0 || (pkg.excluded?.length ?? 0) > 0) && (
              <section className="space-y-5">
                <SectionHeading>{t('drawer_inclusion').split(' ')[0] === 'Ce' ? 'Ce Voyage Comprend' : t('drawer_inclusion')}</SectionHeading>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(pkg.included?.length ?? 0) > 0 && (
                    <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-6 space-y-4">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" /> {t('drawer_inclusion')}
                      </h3>
                      <ul className="space-y-3">
                        {pkg.included!.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] font-semibold text-slate-700">
                            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            {tText(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {(pkg.excluded?.length ?? 0) > 0 && (
                    <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-6 space-y-4">
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-rose-700 flex items-center gap-2">
                        <X className="w-3.5 h-3.5" /> {t('drawer_exclusion')}
                      </h3>
                      <ul className="space-y-3">
                        {pkg.excluded!.map((item, i) => (
                          <li key={i} className="flex items-start gap-2.5 text-[13px] font-semibold text-slate-700">
                            <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                            {tText(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Accompaniment */}
            {pkg.accompaniment && (
              <section className="space-y-5">
                <SectionHeading>{t('omra_accompaniment_title')}</SectionHeading>
                <div className="pl-4">
                  <div className="flex items-start gap-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-slate-700 text-[14px] leading-relaxed font-medium">{tText(pkg.accompaniment)}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Itinerary Timeline */}
            {(pkg.itinerary?.length ?? 0) > 0 && (
              <section className="space-y-6">
                <SectionHeading>{t('drawer_itinerary')}</SectionHeading>
                <div className="space-y-0 relative pl-4">
                  {pkg.itinerary!.map((day, idx) => (
                    <div key={idx} className="itinerary-step flex gap-5 relative">
                      <div className="relative w-10 flex flex-col items-center itinerary-line shrink-0">
                        <span className="w-9 h-9 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-bold text-xs flex items-center justify-center relative z-10 shadow-sm">
                          {t('lbl_day_prefix')}{day.day}
                        </span>
                      </div>
                      <div className="pb-8 flex-1 flex flex-col gap-1.5">
                        <h4 className="font-bold text-slate-900 text-[15px] leading-snug">{tText(day.title)}</h4>
                        <p className="text-[13px] text-slate-500 leading-relaxed font-medium">{tText(day.desc)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Departure Dates */}
            {(pkg.departure_dates?.length ?? 0) > 0 && (
              <section className="space-y-5">
                <SectionHeading>{t('preferred_dates_list')}</SectionHeading>
                <div className="pl-4 flex flex-wrap gap-3">
                  {pkg.departure_dates!.map((date, i) => (
                    <div key={i} className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                      <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-[13px] text-slate-700">
                        {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="lg:w-[380px] xl:w-[420px] shrink-0">
            <div className="sticky top-24 space-y-4" id="sidebar-calculator">

              {/* Price card */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-lg overflow-hidden">
                <div className="bg-[#0A1128] px-7 py-6">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">{t('lbl_a_partir_de')}</p>
                  <div className="flex items-end gap-2">
                    <span className="text-4xl font-black text-white">
                      {(selectedHotel?.price_adult ?? pkg.price_adult).toLocaleString('fr-DZ')} DA
                    </span>
                    <span className="text-slate-400 text-sm pb-1">/ adulte</span>
                  </div>
                  {(selectedHotel?.child_prices[0]?.price ?? pkg.price_child) > 0 && (
                    <p className="text-slate-400 text-[13px] mt-1.5">
                      {(selectedHotel?.child_prices[0]?.price ?? pkg.price_child).toLocaleString('fr-DZ')} DA / enfant
                    </p>
                  )}
                </div>

                {/* Quick facts */}
                <div className="px-7 py-5 border-b border-slate-100 space-y-4">
                  <QuickFact icon={<Clock className="w-4 h-4 text-blue-600" />} label={t('lbl_days')} value={pkg.duration} />
                  <QuickFact icon={<MapPin className="w-4 h-4 text-blue-600" />} label={t('dest_count')} value={destinations.join(', ')} />
                  {selectedHotel && (
                    <QuickFact
                      icon={<Hotel className="w-4 h-4 text-blue-600" />}
                      label="Hébergement"
                      value={`${selectedHotel.name} ${'★'.repeat(selectedHotel.stars)}`}
                    />
                  )}
                  {pkg.season && (
                    <QuickFact icon={<Calendar className="w-4 h-4 text-blue-600" />} label="Saison" value={pkg.season} />
                  )}
                </div>

                {/* Hotel selector (when hotels exist) */}
                {(pkg.hotels?.length ?? 0) > 1 && (
                  <div className="px-7 py-5 border-b border-slate-100 space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-amber-400" /> Choisir votre hôtel
                    </h3>
                    <div className="space-y-2">
                      {pkg.hotels!.map((hotel, hIdx) => (
                        <button
                          key={hIdx}
                          type="button"
                          onClick={() => { setSelectedHotelIdx(hIdx); setChildTierSelections(Array(children).fill(0)); }}
                          className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                            selectedHotelIdx === hIdx
                              ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm truncate">{hotel.name}</p>
                              <p className="text-[11px] text-slate-500">{hotel.location} · {hotel.formula} · {'★'.repeat(hotel.stars)}</p>
                            </div>
                            <p className="font-black text-blue-600 text-sm shrink-0">{hotel.price_adult.toLocaleString('fr-DZ')} DA</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Departure date selector */}
                {(pkg.departure_dates?.length ?? 0) > 0 && (
                  <div className="px-7 py-5 border-b border-slate-100 space-y-3">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-500" /> Date de départ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {pkg.departure_dates!.map((date, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => { setSelectedDepartureDate(date); setBookDate(date); }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            selectedDepartureDate === date
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price calculator */}
                <div className="px-7 py-6 space-y-5">
                  <h3 className="font-heading font-bold text-slate-900 text-base flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-blue-600" /> {t('drawer_calc_title')}
                  </h3>

                  <CounterRow
                    label={t('drawer_adults')}
                    subLabel={`${(selectedHotel?.price_adult ?? pkg.price_adult).toLocaleString('fr-DZ')} DA / pers`}
                    value={adults}
                    onDecrement={() => setAdults(a => Math.max(1, a - 1))}
                    onIncrement={() => {
                      const next = adults + 1;
                      if (!fitsOccupancy(next, countOccupantChildren(childTierSelections))) {
                        addToast('Occupation maximale par chambre : 2 adultes + 2 enfants, ou 3 adultes + 1 enfant (bébés non comptés).', 'error');
                        return;
                      }
                      setAdults(next);
                    }}
                  />
                  <CounterRow
                    label={selectedHotel?.child_max_age
                      ? `Enfants (moins de ${selectedHotel.child_max_age} ans)`
                      : t('drawer_children')}
                    subLabel={selectedHotel && selectedHotel.child_prices.length > 0
                      ? selectedHotel.child_prices.length > 1
                        ? 'Choisissez la tranche d\'âge'
                        : `${selectedHotel.child_prices[0].price.toLocaleString('fr-DZ')} DA / enfant`
                      : `${pkg.price_child.toLocaleString('fr-DZ')} DA / pers`}
                    value={children}
                    onDecrement={() => {
                      if (children <= 0) return;
                      setChildren(c => Math.max(0, c - 1));
                      setChildTierSelections(prev => prev.slice(0, -1));
                    }}
                    onIncrement={() => {
                      const nextSels = [...childTierSelections, 0];
                      if (!fitsOccupancy(adults, countOccupantChildren(nextSels))) {
                        addToast('Occupation maximale par chambre : 2 adultes + 2 enfants, ou 3 adultes + 1 enfant (bébés non comptés).', 'error');
                        return;
                      }
                      setChildren(c => c + 1);
                      setChildTierSelections(nextSels);
                    }}
                  />

                  {/* Child price breakdown with per-child tier selector */}
                  {children > 0 && selectedHotel && (
                    <div className="bg-slate-50 rounded-xl px-4 py-3 space-y-2">
                      {Array.from({ length: children }, (_, i) => {
                        const tiers = selectedHotel.child_prices;
                        if (tiers.length <= 1) {
                          const tier = tiers[0];
                          return (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-slate-500 font-medium">Enfant {i + 1}{tier ? ` — ${tier.label}` : ''}</span>
                              <span className="font-bold text-slate-700">{tier ? tier.price.toLocaleString('fr-DZ') : 0} DA</span>
                            </div>
                          );
                        }
                        const selectedTierIdx = childTierSelections[i] ?? 0;
                        const selectedTier = tiers[Math.min(selectedTierIdx, tiers.length - 1)];
                        return (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-medium shrink-0">Enfant {i + 1}</span>
                            <select
                              value={selectedTierIdx}
                              onChange={e => {
                                const newSels = [...childTierSelections];
                                newSels[i] = parseInt(e.target.value);
                                if (!fitsOccupancy(adults, countOccupantChildren(newSels))) {
                                  addToast('Occupation maximale par chambre : 2 adultes + 2 enfants, ou 3 adultes + 1 enfant (bébés non comptés).', 'error');
                                  return;
                                }
                                setChildTierSelections(newSels);
                              }}
                              className="flex-1 px-2 py-1 border border-slate-200 rounded-lg bg-white text-slate-700 text-[11px] cursor-pointer outline-none focus:border-blue-400"
                            >
                              {tiers.map((tier, tIdx) => (
                                <option key={tIdx} value={tIdx}>{tier.label}</option>
                              ))}
                            </select>
                            <span className="font-bold text-slate-700 shrink-0">{selectedTier.price.toLocaleString('fr-DZ')} DA</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide">{t('drawer_total')}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {adults} adulte{adults > 1 ? 's' : ''}
                        {children > 0 ? ` + ${children} enfant${children > 1 ? 's' : ''}` : ''}
                      </p>
                    </div>
                    <span className="text-3xl font-black text-blue-600">{getTotal().toLocaleString('fr-DZ')} DA</span>
                  </div>

                  <AnimatePresence mode="wait">
                    {!showBooking ? (
                      <motion.button
                        key="cta"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowBooking(true)}
                        className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25 cursor-pointer"
                      >
                        {t('btn_book')}
                      </motion.button>
                    ) : (
                      <motion.div
                        key="form"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-3 pt-4 border-t border-slate-100"
                      >
                        <h4 className="font-heading font-bold text-slate-900 text-sm">{t('drawer_book_title')}</h4>
                        {selectedHotel && (
                          <div className="text-xs bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 text-blue-700 font-semibold">
                            {selectedHotel.name} {'★'.repeat(selectedHotel.stars)}
                            {selectedDepartureDate && ` · Départ ${new Date(selectedDepartureDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                          </div>
                        )}
                        <form onSubmit={handleReservation} className="space-y-3">
                          <input
                            type="text"
                            placeholder={`${t('drawer_full_name')} *`}
                            value={bookName}
                            onChange={e => setBookName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                          <input
                            type="email"
                            placeholder={t('drawer_email')}
                            value={bookEmail}
                            onChange={e => setBookEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                          />
                          <input
                            type="tel"
                            placeholder={`${t('drawer_phone')} *`}
                            value={bookPhone}
                            onChange={e => setBookPhone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                            required
                          />
                          {!selectedDepartureDate && (
                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-1">{t('drawer_preferred_date')}</label>
                              <input
                                type="date"
                                value={bookDate}
                                onChange={e => setBookDate(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors text-slate-600"
                                required
                              />
                            </div>
                          )}
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowBooking(false)}
                              className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
                            >
                              {t('btn_cancel')}
                            </button>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-60 shadow-md cursor-pointer transition-colors"
                            >
                              {submitting ? '...' : t('btn_confirm_booking')}
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Contact nudge */}
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl px-6 py-5 text-center space-y-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Besoin d'aide ?</p>
                <p className="text-sm font-semibold text-slate-700">Contactez nos conseillers voyages</p>
                <p className="text-xs text-slate-500">Disponibles 7j/7 pour vos questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => { setShowSuccessModal(false); window.location.href = '/'; }}
        language={language}
      />

      {/* Toast notifications */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 40, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-center gap-3 bg-white text-slate-900 ${
                toast.type === 'success'
                  ? 'border-emerald-100 border-l-4 border-l-emerald-500'
                  : 'border-rose-100 border-l-4 border-l-rose-500'
              }`}
            >
              {toast.type === 'success'
                ? <Check className="w-5 h-5 text-emerald-500 shrink-0" />
                : <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
              <span className="text-sm font-semibold leading-relaxed">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-1 h-8 bg-blue-600 rounded-full shrink-0" />
      <h2 className="font-heading text-2xl font-bold text-slate-900">{children}</h2>
    </div>
  );
}

function QuickFact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{label}</p>
        <p className="font-semibold text-slate-900 text-sm truncate">{value}</p>
      </div>
    </div>
  );
}

function CounterRow({
  label, subLabel, value, onDecrement, onIncrement,
}: {
  label: string; subLabel: string; value: number;
  onDecrement: () => void; onIncrement: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-slate-900 text-sm">{label}</p>
        <p className="text-[11px] text-slate-400">{subLabel}</p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onDecrement}
          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-base leading-none cursor-pointer transition-colors"
        >
          −
        </button>
        <span className="w-5 text-center font-bold text-slate-900 tabular-nums">{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          className="w-8 h-8 rounded-full border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 font-bold text-base leading-none cursor-pointer transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
