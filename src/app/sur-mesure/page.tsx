'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Sliders, User, Heart, Users, Send, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SurMesurePage() {
  const [step, setStep] = useState(1);

  // Form Fields
  const [smDest, setSmDest] = useState('');
  const [smDuration, setSmDuration] = useState('10-12 days');
  const [smProfile, setSmProfile] = useState('couple');
  const [smPassengers, setSmPassengers] = useState(2);
  const [smBudget, setSmBudget] = useState('Confort');
  const [smNotes, setSmNotes] = useState('');
  const [smName, setSmName] = useState('');
  const [smEmail, setSmEmail] = useState('');
  const [smPhone, setSmPhone] = useState('');

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleStepNext = () => {
    if (step === 1 && !smDest.trim()) {
      addToast('Veuillez renseigner votre destination.', 'error');
      return;
    }
    if (step === 2 && (!smPassengers || smPassengers < 1)) {
      addToast('Le nombre de voyageurs doit être supérieur à 0.', 'error');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smName || !smEmail || !smPhone) {
      addToast('Veuillez remplir vos coordonnées de contact.', 'error');
      return;
    }

    const details = {
      destinations: smDest,
      duration: smDuration,
      profile: smProfile,
      passengers: smPassengers,
      budget: smBudget,
      notes: smNotes
    };

    try {
      const { error } = await supabase.from('leads').insert([{
        type: 'sur_mesure',
        name: smName,
        email: smEmail,
        phone: smPhone,
        status: 'Nouveau',
        details
      }]);
      if (error) throw error;
      addToast('Votre demande de création sur-mesure a été soumise avec succès !', 'success');
      // Reset
      setStep(1);
      setSmDest('');
      setSmNotes('');
      setSmName('');
      setSmEmail('');
      setSmPhone('');
    } catch (err) {
      console.error(err);
      addToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <Header />

      {/* Banner */}
      <section className="bg-slate-900 text-white py-16 w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">Concepteur de séjours</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">Voyages Sur-Mesure</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            Prenez 2 minutes pour exprimer vos envies de voyage, et laissez notre équipe d'experts concevoir votre itinéraire sur-mesure.
          </p>
        </div>
      </section>

      {/* Main Questionnaire Box */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-slate-950 text-white p-8 text-center flex flex-col gap-2">
            <h3 className="font-heading text-lg font-bold">
              {step === 1 && "Étape 1 : Votre Destination"}
              {step === 2 && "Étape 2 : Profil des Voyageurs"}
              {step === 3 && "Étape 3 : Budget & Coordonnées"}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {step === 1 && "Définissez votre destination de rêve et la durée souhaitée."}
              {step === 2 && "Qui participe à ce projet de voyage exclusif ?"}
              {step === 3 && "Indiquez votre budget estimé et vos coordonnées."}
            </p>
          </div>

          <div className="h-1 bg-slate-800">
            <motion.div 
              className="h-full bg-blue-600" 
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="p-8 min-h-[300px]">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div 
                    key="step-1"
                    initial={{ opacity: 0, x: 15 }} 
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Destination(s) souhaitée(s)</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Safari en Tanzanie, Circuit Ouest Américain, Voyage de noces à Bora Bora"
                        value={smDest}
                        onChange={e => setSmDest(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white font-medium"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Durée approximative du séjour</label>
                      <select 
                        value={smDuration}
                        onChange={e => setSmDuration(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white font-semibold text-slate-700"
                      >
                        <option value="1 week">Moins d'une semaine</option>
                        <option value="10-12 days">10 à 12 jours</option>
                        <option value="2 weeks">2 semaines</option>
                        <option value="3 weeks+">3 semaines et plus</option>
                      </select>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    key="step-2"
                    initial={{ opacity: 0, x: 15 }} 
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-6"
                  >
                    <label className="text-sm font-bold text-slate-700 block">Profil des voyageurs</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'couple', title: 'En Couple', desc: 'Séjour romantique', icon: Heart },
                        { id: 'solo', title: 'Solo', desc: 'Aventure personnelle', icon: User },
                        { id: 'family', title: 'En Famille', desc: 'Moments partagés', icon: Users },
                        { id: 'friends', title: 'Entre Amis', desc: 'Découvertes à plusieurs', icon: Compass }
                      ].map(item => {
                        const Icon = item.icon;
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setSmProfile(item.id)}
                            className={`p-4 border rounded-xl cursor-pointer text-center flex flex-col items-center gap-2 transition-all ${
                              smProfile === item.id 
                                ? 'border-blue-600 bg-blue-50/50 shadow-sm text-blue-600 font-extrabold' 
                                : 'border-slate-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <Icon className="w-7 h-7 text-blue-600" />
                            <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                            <p className="text-[10px] text-slate-500">{item.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">Nombre de participants</label>
                      <input 
                        type="number" 
                        value={smPassengers}
                        onChange={e => setSmPassengers(parseInt(e.target.value) || 1)}
                        min={1}
                        className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white font-bold"
                      />
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div 
                    key="step-3"
                    initial={{ opacity: 0, x: 15 }} 
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -15 }}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Budget estimé / pers.</label>
                        <select 
                          value={smBudget}
                          onChange={e => setSmBudget(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                        >
                          <option value="Eco">Éco (&lt; 1500 DA)</option>
                          <option value="Confort">Confort (1500 DA - 3000 DA)</option>
                          <option value="Premium">Premium (3000 DA - 5000 DA)</option>
                          <option value="Luxe">Luxe (&gt; 5000 DA)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Nom Complet</label>
                        <input 
                          type="text" 
                          placeholder="Nom Prénom"
                          value={smName}
                          onChange={e => setSmName(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">E-mail</label>
                        <input 
                          type="email" 
                          placeholder="email@example.com"
                          value={smEmail}
                          onChange={e => setSmEmail(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                          required
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Téléphone</label>
                        <input 
                          type="tel" 
                          placeholder="+33 6..."
                          value={smPhone}
                          onChange={e => setSmPhone(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">Projet, activités & notes particulières</label>
                      <textarea 
                        rows={3} 
                        placeholder="Ex: Escapade en bungalows sur pilotis, activités de plongée, chauffeur privé..."
                        value={smNotes}
                        onChange={e => setSmNotes(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-slate-100/80 px-8 py-5 border-t border-slate-200/50 flex justify-between">
              <button 
                type="button"
                onClick={() => step > 1 && setStep(step - 1)}
                className={`px-4 py-2 rounded-lg font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5 text-sm cursor-pointer ${step === 1 ? 'invisible' : ''}`}
              >
                <ArrowLeft className="w-4 h-4" /> Précédent
              </button>
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={handleStepNext}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  Suivant <ArrowRight className="w-4.5 h-4.5" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm cursor-pointer shadow-md"
                >
                  Envoyer ma Demande <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <Footer />

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
