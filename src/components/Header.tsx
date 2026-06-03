'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sliders, Globe, Menu, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const pathname = usePathname();
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (pathname === path) {
      return transparent ? 'text-blue-400 font-extrabold' : 'text-blue-600 font-extrabold';
    }
    return transparent ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-blue-600';
  };

  return (
    <header className={
      mobileMenuOpen
        ? "fixed inset-0 z-50 bg-[#0A1128] bg-gradient-to-b from-[#0A1128] to-[#040817] flex flex-col p-6 overflow-y-auto transition-all duration-300"
        : transparent 
          ? "absolute top-0 left-0 z-40 w-full bg-transparent border-b border-white/10 transition-all duration-300"
          : "sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300"
    }>
      {!mobileMenuOpen ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between w-full">
          <Link href="/" className={`font-heading text-2xl font-black tracking-tight flex items-center gap-2 transition-colors ${
            transparent ? 'text-blue-400' : 'text-blue-600'
          }`}>
            <Compass className="w-7 h-7 shrink-0" /> <span className="truncate">Conquête</span><span className={transparent ? 'text-white' : 'text-slate-900'}>.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-semibold text-sm">
            <Link href="/international" className={`transition-colors ${isActive('/international')}`}>
              {t('nav_international')}
            </Link>
            <Link href="/omra" className={`transition-colors ${isActive('/omra')}`}>
              {t('nav_omra')}
            </Link>
            <Link href="/sur-mesure" className={`transition-colors ${isActive('/sur-mesure')}`}>
              {t('nav_tailormade')}
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Toggle */}
            <button 
              onClick={toggleLanguage}
              className={`px-2.5 py-1.5 sm:px-3 sm:py-2 border rounded-lg text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                transparent 
                  ? 'border-white/20 text-white hover:border-white/50 hover:bg-white/5' 
                  : 'border-slate-200 text-slate-800 hover:border-blue-500 hover:bg-slate-50'
              }`}
              title={language === 'fr' ? 'Changer la langue en Arabe' : 'Changer la langue en Français'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'fr' ? 'AR' : 'FR'}</span>
            </button>

            <Link 
              href="/admin" 
              className={`hidden md:flex px-4 py-2 border rounded-lg text-sm font-semibold items-center gap-2 transition-all ${
                transparent 
                  ? 'border-white/20 text-white hover:border-white/50 hover:bg-white/5' 
                  : 'border-slate-200 hover:border-blue-500 text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Sliders className="w-4 h-4 text-blue-400" /> {t('nav_agent')}
            </Link>

            <Link 
              href="/sur-mesure" 
              className="hidden sm:inline-flex px-4 sm:px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all whitespace-nowrap shrink-0"
            >
              {t('nav_quote')}
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`md:hidden p-2 rounded-lg transition-all cursor-pointer shrink-0 ${
                transparent
                  ? 'border border-white/20 text-white hover:border-white/50'
                  : 'border border-transparent bg-transparent text-slate-800 hover:text-blue-600'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full min-h-[450px] w-full">
          <div className="flex items-center justify-between mb-8 h-20 px-4 sm:px-6">
            <Link 
              href="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className="font-heading text-2xl font-black tracking-tight flex items-center gap-2 text-blue-500"
            >
              <Compass className="w-7 h-7" /> Conquête<span className="text-white">.</span>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-slate-400 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-4 text-lg font-bold text-slate-200 px-4 sm:px-6">
            <Link 
              href="/international" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`hover:text-blue-400 transition-colors py-3 border-b border-slate-800/60 ${pathname === '/international' ? 'text-blue-400' : ''}`}
            >
              {t('nav_international')}
            </Link>
            <Link 
              href="/omra" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`hover:text-blue-400 transition-colors py-3 border-b border-slate-800/60 ${pathname === '/omra' ? 'text-blue-400' : ''}`}
            >
              {t('nav_omra')}
            </Link>
            <Link 
              href="/sur-mesure" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`hover:text-blue-400 transition-colors py-3 border-b border-slate-800/60 ${pathname === '/sur-mesure' ? 'text-blue-400' : ''}`}
            >
              {t('nav_tailormade')}
            </Link>
            <Link 
              href="/admin" 
              onClick={() => setMobileMenuOpen(false)} 
              className={`hover:text-blue-400 transition-colors py-3 border-b border-slate-800/60 flex items-center gap-2 ${pathname === '/admin' ? 'text-blue-400' : ''}`}
            >
              <Sliders className="w-5 h-5 text-blue-400" /> {t('nav_agent')}
            </Link>
          </nav>

          <div className="mt-auto pt-6 flex flex-col gap-4 px-4 sm:px-6">
            <Link 
              href="/sur-mesure" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-center font-extrabold shadow-lg shadow-blue-500/20 transition-all"
            >
              {t('nav_quote')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
