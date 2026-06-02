'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Sliders } from 'lucide-react';

interface HeaderProps {
  transparent?: boolean;
}

export default function Header({ transparent = false }: HeaderProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (pathname === path) {
      return transparent ? 'text-blue-400 font-extrabold' : 'text-blue-600 font-extrabold';
    }
    return transparent ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-blue-600';
  };

  return (
    <header className={
      transparent 
        ? "absolute top-0 left-0 z-40 w-full bg-transparent border-b border-white/10 transition-all duration-300"
        : "sticky top-0 z-40 w-full bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all duration-300"
    }>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className={`font-heading text-2xl font-black tracking-tight flex items-center gap-2 transition-colors ${
          transparent ? 'text-blue-400' : 'text-blue-600'
        }`}>
          <Compass className="w-7 h-7" /> Conquête<span className={transparent ? 'text-white' : 'text-slate-900'}>.</span>
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
            className={`px-4 py-2 border rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
              transparent 
                ? 'border-white/20 text-white hover:border-white/50 hover:bg-white/5' 
                : 'border-slate-200 hover:border-blue-500 text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sliders className="w-4 h-4 text-blue-400" /> Espace Agent
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
