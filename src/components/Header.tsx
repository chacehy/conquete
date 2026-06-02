'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sliders } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600 font-extrabold' : 'text-slate-700 hover:text-blue-600';
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="font-heading text-2xl font-black text-blue-600 tracking-tight flex items-center gap-2">
          <Compass className="w-7 h-7" /> Conquête<span className="text-slate-900">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm">
          <Link href="/international" className={`transition-colors ${isActive('/international')}`}>
            International
          </Link>
          <Link href="/omra" className={`transition-colors ${isActive('/omra')}`}>
            Omra & Hadj
          </Link>
          <Link href="/sur-mesure" className={`transition-colors ${isActive('/sur-mesure')}`}>
            Voyage sur-mesure
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="px-4 py-2 border border-slate-200 rounded-lg hover:border-blue-500 text-sm font-semibold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Sliders className="w-4 h-4 text-blue-600" /> Espace Agent
          </Link>
          <Link 
            href="/sur-mesure" 
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            Demander un Devis
          </Link>
        </div>
      </div>
    </header>
  );
}
