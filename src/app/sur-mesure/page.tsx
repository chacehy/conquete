'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Sliders, User, Heart, Users, Send, ArrowRight, ArrowLeft, Check, AlertCircle, Sparkles
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '@/lib/LanguageContext';
import SuccessModal from '@/components/SuccessModal';

export default function SurMesurePage() {
  const { t, language } = useLanguage();
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

  // Success Modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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
      addToast(t('toast_error_sm_dest'), 'error');
      return;
    }
    if (step === 2 && (!smPassengers || smPassengers < 1)) {
      addToast(t('toast_error_sm_passengers'), 'error');
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!smName || !smEmail || !smPhone) {
      addToast(t('toast_error_sm_contact'), 'error');
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
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      addToast(t('toast_error_save'), 'error');
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.href = '/';
  };

  return (
    <div className="flex-1 flex flex-col relative">
      <Header />

      {/* Banner */}
      <section className="bg-slate-900 text-white py-16 w-full border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-widest block mb-2">{t('sm_banner_badge')}</span>
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white">{t('sm_banner_title')}</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            {t('sm_banner_desc')}
          </p>
        </div>
      </section>

      {/* Main Questionnaire Box */}
      <section className="flex-1 max-w-7xl mx-auto px-6 py-12 lg:py-20 w-full flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
          <div className="bg-slate-950 text-white p-8 text-center flex flex-col gap-2">
            <h3 className="font-heading text-lg font-bold">
              {step === 1 && t('sm_step_1_title')}
              {step === 2 && t('sm_step_2_title')}
              {step === 3 && t('sm_step_3_title')}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              {step === 1 && t('sm_step_1_desc')}
              {step === 2 && t('sm_step_2_desc')}
              {step === 3 && t('sm_step_3_desc')}
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
                      <label className="text-sm font-bold text-slate-700">{t('sm_lbl_destination')}</label>
                      <input 
                        type="text" 
                        placeholder={t('sm_placeholder_destination')}
                        value={smDest}
                        onChange={e => setSmDest(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white font-medium"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700">{t('sm_lbl_duration')}</label>
                      <select 
                        value={smDuration}
                        onChange={e => setSmDuration(e.target.value)}
                        className="px-4 py-3 rounded-lg border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white font-semibold text-slate-700 bg-no-repeat"
                      >
                        <option value="1 week">{t('sm_duration_short')}</option>
                        <option value="10-12 days">{t('sm_duration_medium')}</option>
                        <option value="2 weeks">{t('sm_duration_long')}</option>
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
                    <label className="text-sm font-bold text-slate-700 block">{t('sm_lbl_profile')}</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'couple', title: t('sm_profile_couple'), desc: language === 'ar' ? 'رحلة رومانسية' : 'Séjour romantique', icon: Heart },
                        { id: 'solo', title: t('sm_profile_solo'), desc: language === 'ar' ? 'مغامرة شخصية' : 'Aventure personnelle', icon: User },
                        { id: 'family', title: t('sm_profile_family'), desc: language === 'ar' ? 'لحظات مشتركة' : 'Moments partagés', icon: Users },
                        { id: 'friends', title: t('sm_profile_friends'), desc: language === 'ar' ? 'اكتشافات جماعية' : 'Découvertes à plusieurs', icon: Compass }
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
                      <label className="text-sm font-bold text-slate-700">{t('sm_lbl_passengers')}</label>
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
                        <label className="text-xs font-bold text-slate-600">{t('sm_lbl_budget')}</label>
                        <select 
                          value={smBudget}
                          onChange={e => setSmBudget(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                        >
                          <option value="Confort">{language === 'ar' ? 'مريح' : 'Confort'}</option>
                          <option value="Premium">{language === 'ar' ? 'ممتاز' : 'Premium'}</option>
                          <option value="Luxe">{language === 'ar' ? 'فاخر' : 'Luxe'}</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">{t('sm_lbl_name')}</label>
                        <input 
                          type="text" 
                          placeholder={language === 'ar' ? 'الاسم واللقب' : 'Nom Prénom'}
                          value={smName}
                          onChange={e => setSmName(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">{t('sm_lbl_email')}</label>
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
                        <label className="text-xs font-bold text-slate-600">{t('sm_lbl_phone')}</label>
                        <input 
                          type="tel" 
                          placeholder={language === 'ar' ? 'رقم الهاتف' : 'Téléphone'}
                          value={smPhone}
                          onChange={e => setSmPhone(e.target.value)}
                          className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-600">{t('sm_lbl_notes')}</label>
                      <textarea 
                        rows={3} 
                        placeholder={t('sm_placeholder_notes')}
                        value={smNotes}
                        onChange={e => setSmNotes(e.target.value)}
                        className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold hover:border-slate-350 outline-none"
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
                <ArrowLeft className="w-4 h-4" /> {t('btn_back')}
              </button>
              {step < 3 ? (
                <button 
                  type="button"
                  onClick={handleStepNext}
                  className="px-5 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm cursor-pointer"
                >
                  {t('sm_btn_next')} <ArrowRight className="w-4.5 h-4.5" />
                </button>
              ) : (
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1.5 text-sm cursor-pointer shadow-md"
                >
                  {t('sm_btn_submit')} <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <Footer />

      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} language={language} />

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
