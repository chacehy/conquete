'use client';

import React, { useEffect } from 'react';
import { animate, createMotionPath } from 'animejs';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'fr' | 'ar';
}

export default function SuccessModal({ isOpen, onClose, language }: SuccessModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Handle ESC key press
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Initialize Anime.js animations after modal renders
    const timer = setTimeout(() => {
      // 1. Draw the path trail
      const pathEl = document.querySelector('#modal-flight-path') as SVGPathElement;
      if (pathEl) {
        const length = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = `${length}`;
        pathEl.style.strokeDashoffset = `${length}`;
        
        animate(pathEl, {
          strokeDashoffset: [length, 0],
          duration: 1800,
          easing: 'easeInOutSine',
        });
      }

      // 2. Animate plane along path using createMotionPath
      try {
        const path = createMotionPath('#modal-flight-path');
        animate('#modal-plane-container', {
          translateX: path.translateX,
          translateY: path.translateY,
          rotate: path.rotate,
          duration: 2200,
          easing: 'easeInOutQuad',
        });
      } catch (err) {
        console.error("Anime.js motion path animation error:", err);
      }
    }, 100);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  const isAr = language === 'ar';

  const title = "Merci pour votre confiance !";
  const subTitle = isAr ? 'شكراً لثقتكم' : 'Votre demande a été reçue';
  const desc = isAr
    ? 'تم تسجيل طلبكم بنجاح. سيتواصل معكم أحد مستشارينا لتأكيد التفاصيل وتصميم رحلتكم المثالية.'
    : 'Votre demande a été enregistrée avec succès. Un conseiller vous contactera sous peu pour finaliser votre projet de voyage.';
  const btnText = isAr ? 'إغلاق' : 'Fermer';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center overflow-hidden z-10"
          >
            {/* Header Badge */}
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-2">
              <Check className="w-6 h-6" />
            </div>

            <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">{subTitle}</span>
            <h3 className="font-heading text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {title}
            </h3>

            {/* Flight Path Animation View */}
            <div className="relative w-[288px] h-[160px] my-3">
              <div className="absolute inset-0 m-auto w-36 h-36 bg-blue-50/60 rounded-full scale-90 animate-pulse pointer-events-none" />
              
              {/* SVG containing the dotted line path */}
              <svg 
                className="absolute inset-0 w-full h-full overflow-visible" 
                viewBox="0 0 288 160"
                fill="none"
              >
                <path
                  id="modal-flight-path"
                  d="M 30 110 C 90 110, 115 90, 125 70 C 140 40, 175 40, 155 80 C 140 110, 110 80, 130 50 C 145 30, 220 30, 260 80"
                  stroke="#3b82f6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray="4 6"
                  className="opacity-70"
                />
              </svg>

              {/* The plane is a absolute HTML div positioned at (0, 0) relative to the SVG container */}
              <div 
                id="modal-plane-container" 
                className="absolute top-0 left-0 w-0 h-0 pointer-events-none"
              >
                {/* Offset the plane by -12px (-top-3 -left-3) so its center is exactly on the path point */}
                <div className="absolute -top-3 -left-3 w-6 h-6 flex items-center justify-center -rotate-45">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600 drop-shadow-[0_2px_5px_rgba(59,130,246,0.35)]"
                  >
                    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3.5c-.5-.5-2.5 0-4 1.5L13.5 8.5 5.3 6.7c-.9-.2-1.6.3-1.6 1.2l.4 1.9 6.3 3.1-3.6 3.6L3.9 16c-.4-.1-.8.2-.8.6l-.1 1.2c0 .3.2.5.5.5l2.4-.2 1.8-2.9 3.6-3.6 3.1 6.3 1.9.4c.9 0 1.4-.7 1.2-1.6z" />
                  </svg>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-sm font-medium leading-relaxed px-2 mb-6">
              {desc}
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300 text-sm cursor-pointer"
            >
              {btnText}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
