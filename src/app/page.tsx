'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Plane, Calendar, Hotel, Sliders, MapPin, 
  Check, X, Sparkles, Send, ArrowRight, RefreshCw, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';
import { gsap } from 'gsap';
import SuccessModal from '@/components/SuccessModal';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function LandingPage() {
  const { t, tText, language } = useLanguage();
  const widgetRef = useRef<HTMLDivElement>(null);
  // Database States
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Search Widget State
  const [activeSearchTab, setActiveSearchTab] = useState<'billetterie' | 'sejours' | 'hotels' | 'carte'>('billetterie');

  // Detail Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [calcAdults, setCalcAdults] = useState(2);
  const [calcChildren, setCalcChildren] = useState(0);
  const [showDrawerBookingForm, setShowDrawerBookingForm] = useState(false);
  const bookingFormRef = useRef<HTMLDivElement>(null);

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Toast States
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  // Search Widget Form States
  const [billDep, setBillDep] = useState('');
  const [billArr, setBillArr] = useState('');
  const [billDateDep, setBillDateDep] = useState('');
  const [billDateRet, setBillDateRet] = useState('');
  const [billLuggage, setBillLuggage] = useState('Cabin + Hold');
  const [billTransfer, setBillTransfer] = useState(false);
  const [billFlex, setBillFlex] = useState(false);

  const [hotelCity, setHotelCity] = useState('');
  const [hotelRoom, setHotelRoom] = useState('Double');
  const [hotelCheckIn, setHotelCheckIn] = useState('');
  const [hotelCheckOut, setHotelCheckOut] = useState('');

  // Drawer Booking Form States
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookDate, setBookDate] = useState('');

  // Fetch Packages
  useEffect(() => {
    async function loadPackages() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setPackages(data || []);
      } catch (err) {
        console.error('Error fetching packages:', err);
        addToast(t('toast_error_load'), 'error');
      } finally {
        setLoading(false);
      }
    }
    loadPackages();

    const nextWeekStr = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const twoWeeksStr = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    setBillDateDep(nextWeekStr);
    setHotelCheckIn(nextWeekStr);
    setHotelCheckOut(twoWeeksStr);
    setBookDate(nextWeekStr);
  }, []);

  useEffect(() => {
    if (!widgetRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      gsap.fromTo(widgetRef.current,
        {
          y: 120,
        },
        {
          y: -60,
          ease: 'none',
          scrollTrigger: {
            trigger: widgetRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          }
        }
      );
    });

    return () => mm.revert();
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const submitLead = async (type: string, name: string, email: string, phone: string, details: any) => {
    try {
      const { error } = await supabase.from('leads').insert([{
        type,
        name,
        email,
        phone,
        status: 'Nouveau',
        details
      }]);
      if (error) throw error;
      addToast(t('toast_success_lead'), 'success');
      return true;
    } catch (err) {
      console.error(err);
      addToast(t('toast_error_lead'), 'error');
      return false;
    }
  };

  // Widget forms submit
  const handleBilletterieSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billDep || !billArr || !billDateDep) {
      addToast(t('toast_required_fields'), 'error');
      return;
    }

    const email = prompt(t('prompt_email_devis')) || '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Veuillez entrer une adresse email valide', 'error');
      return;
    }

    const name = prompt(t('prompt_name')) || "Client Billetterie";
    const phone = prompt(t('prompt_phone'));

    if (!phone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Le numéro de téléphone est requis', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const hasLetters = /[a-zA-Z]/.test(cleanPhone);
    const isValidPhone = /^[+0-9\-()]+$/.test(cleanPhone) && cleanPhone.length >= 8;

    if (hasLetters || !isValidPhone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف صالح (أرقام فقط)' : 'Veuillez entrer un numéro de téléphone valide (chiffres uniquement)', 'error');
      return;
    }

    const details = {
      departure: billDep,
      destination: billArr,
      date_departure: billDateDep,
      date_return: billDateRet || 'N/A',
      luggage: billLuggage,
      transfer: billTransfer,
      flex_dates: billFlex,
      flight_class: 'Économique'
    };

    const ok = await submitLead('billetterie', name, email, phone, details);
    if (ok) {
      setBillDep('');
      setBillArr('');
      setBillTransfer(false);
      setBillFlex(false);
    }
  };

  const handleHotelsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hotelCity || !hotelCheckIn || !hotelCheckOut) {
      addToast(t('toast_search_required'), 'error');
      return;
    }

    const email = prompt(t('prompt_email_proposition')) || '';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      addToast(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Veuillez entrer une adresse email valide', 'error');
      return;
    }

    const name = prompt(t('prompt_name')) || "Client Hôtel";
    const phone = prompt(t('prompt_phone'));

    if (!phone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم الهاتف' : 'Le numéro de téléphone est requis', 'error');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    const hasLetters = /[a-zA-Z]/.test(cleanPhone);
    const isValidPhone = /^[+0-9\-()]+$/.test(cleanPhone) && cleanPhone.length >= 8;

    if (hasLetters || !isValidPhone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف صالح (أرقام فقط)' : 'Veuillez entrer un numéro de téléphone valide (chiffres uniquement)', 'error');
      return;
    }

    const details = {
      city: hotelCity,
      room_type: hotelRoom,
      date_checkin: hotelCheckIn,
      date_checkout: hotelCheckOut
    };

    const ok = await submitLead('hotel', name, email, phone, details);
    if (ok) {
      setHotelCity('');
    }
  };

  // Reservation inside drawer
  const handleDrawerReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !bookName || !bookPhone || !bookDate) {
      addToast(t('toast_required_fields'), 'error');
      return;
    }

    const cleanPhone = bookPhone.replace(/\s+/g, '');
    const hasLetters = /[a-zA-Z]/.test(cleanPhone);
    const isValidPhone = /^[+0-9\-()]+$/.test(cleanPhone) && cleanPhone.length >= 8;

    if (hasLetters || !isValidPhone) {
      addToast(language === 'ar' ? 'يرجى إدخال رقم هاتف صالح (أرقام فقط)' : 'Veuillez entrer un numéro de téléphone valide (chiffres uniquement)', 'error');
      return;
    }

    if (bookEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookEmail)) {
      addToast(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح' : 'Veuillez entrer une adresse email valide', 'error');
      return;
    }

    const price = (calcAdults * selectedPackage.price_adult) + (calcChildren * selectedPackage.price_child);

    const details = {
      package_id: selectedPackage.id,
      package_title: selectedPackage.title,
      adults: calcAdults,
      children: calcChildren,
      total_price: price,
      preferred_date: bookDate
    };

    const ok = await submitLead('package', bookName, bookEmail, bookPhone, details);
    if (ok) {
      setBookName('');
      setBookEmail('');
      setBookPhone('');
      setShowDrawerBookingForm(false);
      setDrawerOpen(false);
      setShowSuccessModal(true);
    }
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

  // Teasers filters
  const intTeaser = packages.filter(p => p.type === 'international').slice(0, 3);
  const omraTeaser = packages.filter(p => p.type === 'omra').slice(0, 3);

  return (
    <div className="flex-1 flex flex-col relative bg-slate-50">
      <Header transparent />

      {/* Hero Section */}
      <section className="relative w-full h-[85vh] lg:h-[90vh] min-h-[600px] flex items-center overflow-hidden bg-slate-950">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/conquete_hero.png" 
            alt="Conquête Voyage Prestige" 
            fill 
            priority
            className="object-cover opacity-50 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent z-10" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-950 to-transparent z-10" />
        </div>

        {/* Hero Content */}
        <div className="max-w-7xl mx-auto px-6 w-full z-20 grid lg:grid-cols-12 gap-12 items-center pt-24 lg:pt-28 pb-16 lg:pb-0">
          <div className="lg:col-span-7 flex flex-col gap-6 text-center lg:text-left items-center lg:items-start">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/15 backdrop-blur-md text-blue-300 font-bold text-xs px-3.5 py-1.5 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" /> {t('hero_badge')}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-none tracking-tight">
              {t('hero_title_1')}<br />
              {t('hero_title_2')}<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{t('hero_title_3')}</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-slate-300/90 leading-relaxed max-w-xl">
              {t('hero_desc')}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start">
              <Link href="/international" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl shadow-lg shadow-blue-600/30 transition-all transform hover:-translate-y-0.5">
                {t('hero_btn_explore')}
              </Link>
              <Link href="/sur-mesure" className="px-8 py-4 border border-white/20 bg-white/5 backdrop-blur-md hover:bg-white/15 hover:border-white/40 text-white font-bold rounded-xl transition-all transform hover:-translate-y-0.5">
                {t('hero_btn_custom')}
              </Link>
            </div>
          </div>
          
          {/* Right Column: Signature Destinations Showcase (Desktop Only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col gap-4 w-full max-w-md ml-auto">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" /> {t('hero_signature')}
            </div>
            
            {packages.filter(p => p.is_signature).length > 0 ? (
              packages.filter(p => p.is_signature).slice(0, 3).map((pkg, idx) => (
                <Link 
                  href={pkg.type === 'omra' ? '/omra' : '/international'} 
                  key={pkg.id}
                  className="group flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-xl hover:bg-slate-900/60 hover:border-blue-500/40 transition-all duration-300 shadow-lg hover:shadow-blue-950/20 transform hover:-translate-y-0.5"
                >
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <img 
                      src={pkg.image_url} 
                      alt={tText(pkg.title)} 
                      className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-sm font-bold text-white group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                      {tText(pkg.title)} 
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                      {tText(pkg.description)}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              !loading && (
                <div className="p-4 rounded-2xl border border-white/5 bg-slate-900/20 backdrop-blur-sm text-center">
                  <p className="text-xs text-slate-500">{t('no_signature_hint')}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Booking Search Widget */}
      <section ref={widgetRef} className="max-w-7xl mx-auto px-6 w-full -mt-24 lg:-mt-28 z-30 relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 bg-slate-50 border-b border-slate-200/80">
            <button 
              onClick={() => setActiveSearchTab('billetterie')}
              className={`py-5 text-sm font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                activeSearchTab === 'billetterie' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-extrabold' 
                  : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50/20'
              }`}
            >
              <Plane className="w-5 h-5" />
              {t('tab_flights')}
            </button>
            <button 
              onClick={() => setActiveSearchTab('sejours')}
              className={`py-5 text-sm font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                activeSearchTab === 'sejours' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-extrabold' 
                  : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50/20'
              }`}
            >
              <Compass className="w-5 h-5" />
              {t('tab_packages')}
            </button>
            <button 
              onClick={() => setActiveSearchTab('hotels')}
              className={`py-5 text-sm font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                activeSearchTab === 'hotels' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-extrabold' 
                  : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50/20'
              }`}
            >
              <Hotel className="w-5 h-5" />
              {t('tab_hotels')}
            </button>
            <button 
              onClick={() => setActiveSearchTab('carte')}
              className={`py-5 text-sm font-bold flex flex-col items-center gap-2 transition-all cursor-pointer ${
                activeSearchTab === 'carte' 
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600 font-extrabold' 
                  : 'text-slate-600 hover:text-blue-500 hover:bg-blue-50/20'
              }`}
            >
              <Sliders className="w-5 h-5" />
              {t('tab_custom')}
            </button>
          </div>

          <div className="p-8">
            {activeSearchTab === 'billetterie' && (
              <form onSubmit={handleBilletterieSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_dep')}</label>
                    <input 
                      type="text" 
                      placeholder={t('placeholder_dep')} 
                      value={billDep}
                      onChange={e => setBillDep(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_arr')}</label>
                    <input 
                      type="text" 
                      placeholder={t('placeholder_arr')} 
                      value={billArr}
                      onChange={e => setBillArr(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_date_dep')}</label>
                    <input 
                      type="date" 
                      value={billDateDep}
                      onChange={e => setBillDateDep(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_date_ret')}</label>
                    <input 
                      type="date" 
                      value={billDateRet}
                      onChange={e => setBillDateRet(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700" 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_luggage')}</label>
                    <select 
                      value={billLuggage}
                      onChange={e => setBillLuggage(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 bg-white"
                    >
                      <option value="Cabin Only">{t('opt_cabin_only')}</option>
                      <option value="Cabin + Hold">{t('opt_cabin_hold')}</option>
                      <option value="2 Hold Luggage">{t('opt_cabin_2hold')}</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={billTransfer} 
                        onChange={e => setBillTransfer(e.target.checked)}
                        className="w-5 h-5 border-slate-300 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" 
                      />
                      {t('field_transfer')}
                    </label>
                    <label className="flex items-center gap-2 font-medium text-slate-700 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={billFlex} 
                        onChange={e => setBillFlex(e.target.checked)}
                        className="w-5 h-5 border-slate-300 rounded text-blue-600 focus:ring-blue-500 accent-blue-600" 
                      />
                      {t('field_flex')}
                    </label>
                  </div>
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer">
                    <Send className="w-4 h-4" /> {t('btn_search_flights')}
                  </button>
                </div>
              </form>
            )}

            {activeSearchTab === 'sejours' && (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <h3 className="font-heading text-xl font-bold text-slate-900">{t('lbl_explore_circuits_title')}</h3>
                <p className="text-slate-500 max-w-md">{t('lbl_explore_circuits_desc')}</p>
                <Link href="/international" className="mt-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
                  {t('lbl_voir_cat_int')}
                </Link>
              </div>
            )}

            {activeSearchTab === 'hotels' && (
              <form onSubmit={handleHotelsSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_city')}</label>
                    <input 
                      type="text" 
                      placeholder={t('placeholder_city')} 
                      value={hotelCity}
                      onChange={e => setHotelCity(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_room')}</label>
                    <select 
                      value={hotelRoom}
                      onChange={e => setHotelRoom(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700 bg-white"
                    >
                      <option value="Simple">{t('opt_room_single')}</option>
                      <option value="Double">{t('opt_room_double')}</option>
                      <option value="Triple">{t('opt_room_triple')}</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_checkin')}</label>
                    <input 
                      type="date" 
                      value={hotelCheckIn}
                      onChange={e => setHotelCheckIn(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('field_checkout')}</label>
                    <input 
                      type="date" 
                      value={hotelCheckOut}
                      onChange={e => setHotelCheckOut(e.target.value)}
                      className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700"
                      required 
                    />
                  </div>
                </div>
                <div className="text-right pt-2 border-t border-slate-100">
                  <button type="submit" className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 shadow-md cursor-pointer">
                    {t('btn_search_hotels')}
                  </button>
                </div>
              </form>
            )}

            {activeSearchTab === 'carte' && (
              <div className="text-center py-6 flex flex-col items-center gap-3">
                <h3 className="font-heading text-xl font-bold text-slate-900">{t('lbl_custom_route_title')}</h3>
                <p className="text-slate-500 max-w-md">{t('lbl_custom_route_desc')}</p>
                <Link href="/sur-mesure" className="mt-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 shadow-md">
                  {t('lbl_concevoir_voyage')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Section: International Teaser */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">{t('lbl_evasion')}</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950">{t('lbl_circuits_vedettes')}</h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
          </div>
          <Link href="/international" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 group text-sm">
            {t('lbl_voir_catalogue')} <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : intTeaser.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-500">
            {t('lbl_no_int_packages')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {intTeaser.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group">
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                     src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                    alt={tText(pkg.title)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-extrabold px-3 py-1.5 rounded-md shadow-sm">
                    {t('nav_international')}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600" /> {pkg.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600" /> {pkg.destinations.split(',').length} {t('dest_count')}</span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {tText(pkg.title)}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
                    {tText(pkg.description)}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-auto">
                    <Link
                      href={`/international/${pkg.id}`}
                      className="px-3.5 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all"
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

      {/* Section: Custom Trip Designer Banner Teaser */}
      <section className="bg-slate-900 py-16 lg:py-24 text-white w-full border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-4 text-left">
            <span className="inline-flex items-center gap-1.5 bg-blue-900 border border-blue-800 text-blue-400 font-bold text-xs px-3.5 py-1 rounded-full w-fit">
              <Sparkles className="w-3.5 h-3.5" /> {t('lbl_creation_unique')}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {t('sec_custom_teaser_title')}
            </h2>
            <p className="text-slate-400 max-w-xl text-base leading-relaxed">
              {t('sec_custom_teaser_desc')}
            </p>
          </div>
          <div className="md:col-span-4 flex justify-start md:justify-end">
            <Link 
              href="/sur-mesure" 
              className="px-7 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-600/10 transition-all flex items-center gap-2 transform hover:-translate-y-0.5 cursor-pointer text-sm"
            >
              {t('btn_launch_planner')} <ArrowRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section: Omra Teaser */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">{t('lbl_sacred_pilgrim')}</span>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950">{t('lbl_omra_title')}</h2>
            <div className="w-20 h-1.5 bg-blue-600 rounded-full"></div>
          </div>
          <Link href="/omra" className="text-blue-600 font-bold flex items-center gap-1 hover:text-blue-700 group text-sm">
            {t('lbl_voir_offres_omra')} <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : omraTeaser.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-100 text-slate-500">
            {t('omra_no_packages')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {omraTeaser.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group">
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=800&q=80'} 
                    alt={tText(pkg.title)} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-4 right-4 bg-emerald-50 text-emerald-600 text-xs font-extrabold px-3 py-1.5 rounded-md shadow-sm border border-emerald-100">
                    {t('nav_omra')}
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600" /> {pkg.duration}</span>
                    {pkg.hotel_proximity && (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded border border-emerald-100 flex items-center gap-0.5">
                        {pkg.hotel_proximity} {t('haram_proximity')}
                      </span>
                    )}
                  </div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {tText(pkg.title)}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed flex-1">
                    {tText(pkg.description)}
                  </p>
                  <div className="flex items-center justify-end pt-4 border-t border-slate-100 mt-auto">
                    <button 
                      onClick={() => openPackageDetails(pkg)}
                      className="px-3.5 py-1.5 border border-blue-100 bg-blue-50 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      {t('lbl_decouvrir')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
                    src={selectedPackage.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                    alt={tText(selectedPackage.title)}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed font-semibold text-sm">
                    {tText(selectedPackage.description)}
                  </p>
                  {selectedPackage.type === 'omra' && selectedPackage.hotel_proximity && (
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

                {selectedPackage.type === 'omra' && selectedPackage.departure_dates && (
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
                    <form onSubmit={handleDrawerReservation} className="space-y-4">
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

      <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} language={language} />

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
