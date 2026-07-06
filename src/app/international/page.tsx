'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Check, X, Sliders, Hotel, Info, RefreshCw, AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OccupancySelector, { Occupancy } from '@/components/OccupancySelector';

export default function InternationalPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  // Drawer States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [occupancy, setOccupancy] = useState<Occupancy>({ adults: 2, children: 0, babies: 0 });
  const [showDrawerBookingForm, setShowDrawerBookingForm] = useState(false);

  // Form Booking States
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookPhone, setBookPhone] = useState('');
  const [bookDate, setBookDate] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

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
        addToast('Erreur de chargement des circuits.', 'error');
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
    setOccupancy({ adults: 2, children: 0, babies: 0 });
    setShowDrawerBookingForm(false);
    setDrawerOpen(true);
  };

  const getCalcTotal = () => {
    if (!selectedPackage) return 0;
    return (occupancy.adults * selectedPackage.price_adult) + (occupancy.children * selectedPackage.price_child);
  };

  const handleReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !bookName || !bookEmail || !bookPhone || !bookDate) return;

    const price = getCalcTotal();
    const details = {
      package_id: selectedPackage.id,
      package_title: selectedPackage.title,
      adults: occupancy.adults,
      children: occupancy.children,
      babies: occupancy.babies,
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
      addToast('Demande envoyée avec succès !', 'success');
      setBookName('');
      setBookEmail('');
      setBookPhone('');
      setShowDrawerBookingForm(false);
      setDrawerOpen(false);
    } catch (err) {
      console.error(err);
      addToast('Erreur de soumission.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <Header />

      {/* Banner */}
      <section className="bg-slate-900 text-white py-16 w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">Voyages</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">Circuits Internationaux</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            Explorez les merveilles de notre catalogue international. Des itinéraires d'exception préparés de A à Z par nos agents.
          </p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 lg:py-16 w-full flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="font-semibold text-sm">Chargement du catalogue...</p>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200/50 shadow-sm text-slate-500">
            Aucun séjour international disponible pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map(pkg => (
              <div key={pkg.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200/50 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all flex flex-col group">
                <div className="relative h-60 w-full overflow-hidden">
                  <img 
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                    alt={pkg.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-extrabold px-3 py-1.5 rounded-md shadow-sm">
                    International
                  </span>
                </div>
                <div className="p-6 flex flex-col flex-1 gap-4">
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-blue-600" /> {pkg.duration}</span>
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-blue-600" /> {pkg.destinations.split(',').length} Dest.</span>
                  </div>
                  <h3 className="font-heading text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
                    {pkg.description}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">À partir de</span>
                      <div className="text-xl font-extrabold text-blue-600">{pkg.price_adult} € <span className="text-xs text-slate-500 font-normal">/pers</span></div>
                    </div>
                    <button 
                      onClick={() => openPackageDetails(pkg)}
                      className="px-4 py-2 border border-blue-100 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      Découvrir
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
                <h3 className="font-heading text-xl font-bold text-slate-900 line-clamp-1">{selectedPackage.title}</h3>
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
                    alt={selectedPackage.title}
                    className="object-cover w-full h-full"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-slate-700 leading-relaxed font-semibold text-sm">
                    {selectedPackage.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-xl border border-slate-200/50">
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-500">Ce qui est inclus</h4>
                    <ul className="space-y-2 text-xs font-bold text-slate-700">
                      {selectedPackage.included?.map((inc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wide text-slate-500">Non inclus</h4>
                    <ul className="space-y-2 text-xs font-bold text-slate-700">
                      {selectedPackage.excluded?.map((exc, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" /> {exc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {selectedPackage.accompaniment && (
                  <div className="space-y-3">
                    <h4 className="font-heading text-lg font-bold text-slate-900 border-b pb-2 border-slate-100">Accompagnement</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-semibold">{selectedPackage.accompaniment}</p>
                  </div>
                )}

                {selectedPackage.itinerary && selectedPackage.itinerary.length > 0 && (
                  <div className="space-y-5">
                    <h4 className="font-heading text-lg font-bold text-slate-900 border-b pb-2 border-slate-100">Programme de Voyage</h4>
                    <div className="space-y-0 relative">
                      {selectedPackage.itinerary.map((day, idx) => (
                        <div key={idx} className="itinerary-step flex gap-4 pl-1 relative">
                          <div className="relative w-10 flex flex-col items-center itinerary-line shrink-0">
                            <span className="w-9 h-9 bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-bold text-xs flex items-center justify-center relative z-10 shadow-sm">
                              J{day.day}
                            </span>
                          </div>
                          <div className="pb-6 flex-1 flex flex-col gap-1">
                            <h5 className="font-bold text-slate-900 text-sm leading-snug">{day.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed font-medium">{day.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5"><Sliders className="w-4 h-4 text-blue-600" /> Calculateur Devis Estimatif</h4>
                  <OccupancySelector value={occupancy} onChange={setOccupancy} />
                  <div className="flex items-center justify-between pt-4 border-t border-blue-100 mt-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total Indicatif</span>
                      <div className="text-2xl font-black text-blue-600">{getCalcTotal().toLocaleString('fr-FR')} €</div>
                    </div>
                    {!showDrawerBookingForm && (
                      <button 
                        onClick={() => setShowDrawerBookingForm(true)}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-bold shadow-md cursor-pointer"
                      >
                        Réserver ce séjour
                      </button>
                    )}
                  </div>
                </div>

                {showDrawerBookingForm && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 border-t border-slate-100 space-y-4"
                  >
                    <h4 className="font-heading text-lg font-bold text-slate-900">Coordonnées de Réservation</h4>
                    <form onSubmit={handleReservation} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">Nom Complet</label>
                          <input 
                            type="text" 
                            value={bookName}
                            onChange={e => setBookName(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">Adresse e-mail</label>
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
                          <label className="text-xs font-bold text-slate-500">Téléphone</label>
                          <input 
                            type="tel" 
                            value={bookPhone}
                            onChange={e => setBookPhone(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm"
                            required 
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-bold text-slate-500">Départ Souhaité</label>
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
                          Annuler
                        </button>
                        <button 
                          type="submit" 
                          className="flex-[2] py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-md cursor-pointer"
                        >
                          Confirmer la Demande
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
