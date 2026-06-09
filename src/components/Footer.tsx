'use client';

import Link from 'next/link';
import { Compass, MapPin, Mail, Phone, MessageCircle, Globe, Sliders } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        <div className="md:col-span-4 flex flex-col gap-4">
          <span className="font-heading text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-blue-500" /> Conquête<span className="text-blue-500">.</span>
          </span>
          <p className="text-sm leading-relaxed">
            {t('footer_tagline')}
          </p>
          <div className="flex gap-4 mt-2 text-slate-500">
            <a href="#" className="hover:text-white transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Youtube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.507 9.388.507 9.388.507s7.518 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>
        <div className="md:col-span-3 flex flex-col gap-4">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">{t('footer_prestations')}</h4>
          <ul className="space-y-2 text-sm font-semibold">
            <li><Link href="/international" className="hover:text-white transition-colors">{t('footer_international_circuits')}</Link></li>
            <li><Link href="/omra" className="hover:text-white transition-colors">{t('footer_omra_hadj')}</Link></li>
            <li><Link href="/sur-mesure" className="hover:text-white transition-colors">{t('footer_tailormade')}</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2 flex flex-col gap-4">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">{t('footer_links')}</h4>
          <ul className="space-y-2 text-sm font-semibold">
            <li><a href="#" className="hover:text-white transition-colors">{t('footer_cookies')}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t('footer_terms')}</a></li>
            <li><a href="#" className="hover:text-white transition-colors">{t('footer_insurance')}</a></li>
          </ul>
        </div>
        <div className="md:col-span-3 flex flex-col gap-4">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">{t('footer_contact_title')}</h4>
          <ul className="space-y-2 text-sm font-semibold">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" /> 
              <span>{t('footer_address')}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-blue-500 shrink-0" />
              <a href="tel:0550404320" className="hover:text-white transition-colors">0550 40 43 20</a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <a href="https://wa.me/213550404320" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">WhatsApp : +213 550 40 43 20</a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <a href="mailto:conquetevoyages@yahoo.fr" className="hover:text-white transition-colors">conquetevoyages@yahoo.fr</a>
            </li>
            <li className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500 shrink-0" />
              <a href="https://conquetevoyages.dz" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">conquetevoyages.dz</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-semibold">
        <p>&copy; 2026 Conquête Voyages. {t('footer_rights')}</p>
        <Link href="/admin" className="text-blue-500 hover:text-blue-400 font-bold flex items-center gap-1.5">
          <Sliders className="w-3.5 h-3.5" /> {t('footer_agent_portal')}
        </Link>
      </div>
    </footer>
  );
}
