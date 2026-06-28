'use client';

import Link from 'next/link';
import { MapPin, Mail, Phone, MessageCircle, Globe, Clock, Sliders } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import BrandLogo from './BrandLogo';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
        <div className="md:col-span-5 flex flex-col gap-4">
          <Link href="/" className="flex items-center text-white hover:text-blue-400 transition-colors w-fit">
            <BrandLogo className="h-10 w-auto" fillClassName="fill-current" />
          </Link>
          <p className="text-sm leading-relaxed">
            {t('footer_tagline')}
          </p>
          <div className="flex items-start gap-2 text-sm font-semibold">
            <Clock className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{t('footer_hours')}</span>
          </div>
          <div className="flex gap-4 mt-2 text-slate-500">
            <a href="https://web.facebook.com/ConqueteVoyages/?_rdc=1&_rdr" target="_blank" rel="noopener noreferrer" className="hover:text-[#1877F2] transition-colors" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
              </svg>
            </a>
            <a href="https://wa.me/213550404320" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors" aria-label="WhatsApp">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.97 4.463-9.97 9.97 0 1.76.457 3.477 1.325 5L2 22l5.176-1.359c1.477.805 3.137 1.229 4.832 1.229 5.506 0 9.97-4.463 9.97-9.97 0-2.656-1.034-5.153-2.915-7.034C17.18 3.034 14.675 2 12.012 2zm5.836 14.199c-.24.674-1.196 1.233-1.642 1.277-.446.044-.888.23-2.859-.536-2.522-.98-4.137-3.535-4.263-3.702-.127-.168-1.028-1.365-1.028-2.6 0-1.236.648-1.844.877-2.09.23-.246.505-.308.673-.308.169 0 .337 0 .484.007.153.007.359-.059.562.44.208.508.708 1.725.77 1.849.062.124.103.27.021.436-.082.166-.124.27-.248.414-.124.145-.262.32-.375.43-.127.124-.26.26-.112.517.148.257.659 1.085 1.413 1.758.97.867 1.785 1.135 2.039 1.263.254.128.403.107.55-.062.148-.169.636-.74.805-.99.168-.25.337-.209.567-.125.23.084 1.46.689 1.71.815.25.126.417.189.479.297.062.108.062.623-.178 1.298z"/>
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
        <div className="md:col-span-4 flex flex-col gap-4">
          <h4 className="text-white font-extrabold text-sm uppercase tracking-wider">{t('footer_contact_title')}</h4>
          <ul className="space-y-2.5 text-sm font-semibold">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider">Tlemcen</span>
                <span className="leading-relaxed">{t('footer_address_tlemcen')}</span>
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider mt-1">Oran</span>
                <span className="leading-relaxed">{t('footer_address_oran')}</span>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <Phone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider mb-0.5">Tlemcen</span>
                <a href="tel:0550404320" className="hover:text-white transition-colors">0550 404 320</a>
                <a href="tel:0770204119" className="hover:text-white transition-colors">0770 204 119</a>
                <a href="tel:0560916367" className="hover:text-white transition-colors">0560 916 367</a>
                <a href="tel:0770052213" className="hover:text-white transition-colors">0770 052 213</a>
                <span className="text-xs text-slate-500 uppercase font-black tracking-wider mt-1.5 mb-0.5">Oran</span>
                <a href="tel:0540242384" className="hover:text-white transition-colors">0540 242 384</a>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-blue-500 shrink-0" />
              <a href="mailto:conquetevoyages@yahoo.fr" className="hover:text-white transition-colors">conquetevoyages@yahoo.fr</a>
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
