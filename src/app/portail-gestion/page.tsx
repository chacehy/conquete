'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sliders, Inbox, Clock, CheckCircle2, FileSpreadsheet, Plus,
  Trash2, Edit3, X, Save, AlertCircle, Check, ArrowLeft, RefreshCw,
  PlusCircle, MinusCircle, ShieldCheck, Star, LogOut, Search
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package, Lead, ItineraryDay, HotelOption, ChildPriceTier } from '@/types';

export default function AdminPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminEmail, setAdminEmail] = useState('');
  const [activeTab, setActiveTab] = useState<'leads' | 'packages'>('leads');

  // Filters
  const [leadTypeFilter, setLeadTypeFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');
  const [leadSearchQuery, setLeadSearchQuery] = useState('');

  // Modal package states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgTitle, setPkgTitle] = useState('');
  const [pkgType, setPkgType] = useState<'international' | 'omra'>('international');
  const [pkgDesc, setPkgDesc] = useState('');
  const [pkgImage, setPkgImage] = useState('');
  const [pkgDestinations, setPkgDestinations] = useState('');
  const [pkgDuration, setPkgDuration] = useState('');
  const [pkgPriceAdult, setPkgPriceAdult] = useState(0);
  const [pkgPriceChild, setPkgPriceChild] = useState(0);
  const [pkgIncluded, setPkgIncluded] = useState('');
  const [pkgExcluded, setPkgExcluded] = useState('');
  const [pkgAccompaniment, setPkgAccompaniment] = useState('');
  const [pkgIsSignature, setPkgIsSignature] = useState(false);
  
  // Specific to Omra
  const [pkgSeason, setPkgSeason] = useState<'Ramadan' | 'Mawlid' | 'Automne' | 'Hiver'>('Ramadan');
  const [pkgProximity, setPkgProximity] = useState('');
  const [pkgDepartureDates, setPkgDepartureDates] = useState('');

  // Itinerary
  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>([]);

  // Hotel options
  const [hotelOptions, setHotelOptions] = useState<HotelOption[]>([]);

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) {
        router.replace('/portail-gestion/login');
        return;
      }
      if (data.user.email) setAdminEmail(data.user.email);
      fetchAdminData();
    });
  }, []);

  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Fetch leads
      const { data: leadsData, error: leadsErr } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });
      if (leadsErr) throw leadsErr;
      setLeads(leadsData || []);

      // 2. Fetch packages
      const { data: pkgsData, error: pkgsErr } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });
      if (pkgsErr) throw pkgsErr;
      setPackages(pkgsData || []);
    } catch (err) {
      console.error(err);
      addToast('Erreur de chargement des données.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Lead actions
  const handleStatusChange = async (leadId: string, status: 'Nouveau' | 'En cours' | 'Traité') => {
    try {
      const { error } = await supabase
        .from('leads')
        .update({ status })
        .eq('id', leadId);
      if (error) throw error;
      addToast('Statut du prospect mis à jour.', 'success');
      
      // Update local state
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
    } catch (err) {
      console.error(err);
      addToast('Erreur lors du changement de statut.', 'error');
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!confirm('Supprimer définitivement ce prospect ?')) return;
    try {
      const { error } = await supabase.from('leads').delete().eq('id', leadId);
      if (error) throw error;
      addToast('Prospect supprimé.', 'success');
      setLeads(prev => prev.filter(l => l.id !== leadId));
    } catch (err) {
      console.error(err);
      addToast('Erreur de suppression.', 'error');
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) {
      addToast('Aucun prospect à exporter.', 'error');
      return;
    }

    const formatDetailsText = (lead: Lead) => {
      if (!lead.details) return '';
      const det = lead.details;
      switch (lead.type) {
        case 'billetterie':
          return `Vol: ${det.departure || ''} -> ${det.destination || ''} | Dates: ${det.date_departure || ''} au ${det.date_return || ''} | Bagages: ${det.luggage || ''} ${det.transfer ? '| Transfert' : ''}`;
        case 'hotel':
          return `Hôtel à ${det.city || ''} | Chambre: ${det.room_type || ''} | Dates: Du ${det.date_checkin || ''} au ${det.date_checkout || ''}`;
        case 'package':
          return `Séjour: ${det.package_title || ''} | Passagers: ${det.adults || 0} Adulte(s), ${det.children || 0} Enfant(s) | Tarif total: ${det.total_price || 0} DA | Départ: ${det.preferred_date || ''}`;
        case 'sur_mesure':
          return `Sur-mesure: ${det.destinations || ''} (${det.duration || ''}) | Passagers: ${det.passengers || ''} | Profil: ${det.profile || ''} | Budget: ${det.budget || ''} | Notes: ${det.notes || ''}`;
        default:
          return JSON.stringify(lead.details);
      }
    };

    let csvContent = "\uFEFF"; // BOM for excel french accents
    csvContent += "Client,Type Demande,Date Soumission,Email,Telephone,Statut,Details\r\n";

    leads.forEach(l => {
      const detailsStr = formatDetailsText(l).replace(/"/g, '""');
      const row = [
        `"${l.name}"`,
        `"${l.type}"`,
        `"${new Date(l.created_at).toLocaleString('fr-FR')}"`,
        `"${l.email}"`,
        `"${l.phone}"`,
        `"${l.status}"`,
        `"${detailsStr}"`
      ].join(",");
      csvContent += row + "\r\n";
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `conquete_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Package modal CRUD actions
  const openModalForAdd = () => {
    setEditingPkgId(null);
    setPkgTitle('');
    setPkgType('international');
    setPkgDesc('');
    setPkgImage('');
    setPkgDestinations('');
    setPkgDuration('');
    setPkgPriceAdult(1500);
    setPkgPriceChild(1000);
    setPkgIncluded('');
    setPkgExcluded('');
    setPkgAccompaniment('');
    setPkgIsSignature(false);
    setPkgSeason('Ramadan');
    setPkgProximity('');
    setPkgDepartureDates('');
    setItineraryDays([{ day: 1, title: '', desc: '' }]);
    setHotelOptions([]);
    setIsModalOpen(true);
  };

  const openModalForEdit = (pkg: Package) => {
    setEditingPkgId(pkg.id);
    setPkgTitle(pkg.title);
    setPkgType(pkg.type);
    setPkgDesc(pkg.description);
    setPkgImage(pkg.image_url);
    setPkgDestinations(pkg.destinations || '');
    setPkgDuration(pkg.duration);
    setPkgPriceAdult(pkg.price_adult);
    setPkgPriceChild(pkg.price_child);
    setPkgIncluded(pkg.included ? pkg.included.join('\n') : '');
    setPkgExcluded(pkg.excluded ? pkg.excluded.join('\n') : '');
    setPkgAccompaniment(pkg.accompaniment || '');
    setPkgIsSignature(pkg.is_signature || false);
    
    setPkgDepartureDates(pkg.departure_dates ? pkg.departure_dates.join(', ') : '');

    if (pkg.type === 'omra') {
      setPkgSeason(pkg.season || 'Ramadan');
      setPkgProximity(pkg.hotel_proximity || '');
    } else {
      setPkgSeason('Ramadan');
      setPkgProximity('');
    }

    setItineraryDays(pkg.itinerary || [{ day: 1, title: '', desc: '' }]);
    setHotelOptions(pkg.hotels || []);
    setIsModalOpen(true);
  };

  const handleDeletePackage = async (pkgId: string) => {
    if (!confirm('Voulez-vous supprimer ce voyage du catalogue ?')) return;
    try {
      const { error } = await supabase.from('packages').delete().eq('id', pkgId);
      if (error) throw error;
      addToast('Voyage supprimé du catalogue.', 'success');
      setPackages(prev => prev.filter(p => p.id !== pkgId));
    } catch (err) {
      console.error(err);
      addToast('Erreur de suppression du package.', 'error');
    }
  };

  const handleItineraryDayChange = (index: number, field: 'title' | 'desc', val: string) => {
    setItineraryDays(prev => prev.map((day, idx) => {
      if (idx === index) {
        return { ...day, [field]: val };
      }
      return day;
    }));
  };

  const addItineraryDay = () => {
    setItineraryDays(prev => [
      ...prev, 
      { day: prev.length + 1, title: '', desc: '' }
    ]);
  };

  const removeItineraryDay = (index: number) => {
    setItineraryDays(prev => prev
      .filter((_, idx) => idx !== index)
      .map((day, idx) => ({ ...day, day: idx + 1 }))
    );
  };

  const addHotelOption = () => {
    setHotelOptions(prev => [...prev, {
      name: '', stars: 3, location: '', formula: 'All Inclusive',
      price_adult: 0, child_prices: [{ label: 'Enfant (-12 ans)', price: 0 }],
      amenities: [], child_max_age: 12, reference_url: '', image_url: ''
    }]);
  };

  const removeHotelOption = (idx: number) => {
    setHotelOptions(prev => prev.filter((_, i) => i !== idx));
  };

  const updateHotelOption = (idx: number, field: keyof HotelOption, val: unknown) => {
    setHotelOptions(prev => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h));
  };

  const addChildTier = (hotelIdx: number) => {
    setHotelOptions(prev => prev.map((h, i) => i === hotelIdx
      ? { ...h, child_prices: [...h.child_prices, { label: `Enfant ${h.child_prices.length + 1}`, price: 0 }] }
      : h
    ));
  };

  const removeChildTier = (hotelIdx: number, tierIdx: number) => {
    setHotelOptions(prev => prev.map((h, i) => i === hotelIdx
      ? { ...h, child_prices: h.child_prices.filter((_, ti) => ti !== tierIdx) }
      : h
    ));
  };

  const updateChildTier = (hotelIdx: number, tierIdx: number, field: keyof ChildPriceTier, val: string | number) => {
    setHotelOptions(prev => prev.map((h, i) => i === hotelIdx
      ? { ...h, child_prices: h.child_prices.map((t, ti) => ti === tierIdx ? { ...t, [field]: val } : t) }
      : h
    ));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle || !pkgDesc || !pkgImage || !pkgDuration) {
      addToast('Veuillez remplir les informations obligatoires.', 'error');
      return;
    }

    const parsedDepartureDates = pkgDepartureDates.split(',').map(x => x.trim()).filter(Boolean);
    const validHotels = hotelOptions.filter(h => h.name.trim());

    let computedPriceAdult = pkgPriceAdult;
    let computedPriceChild = pkgPriceChild;
    if (validHotels.length > 0) {
      const cheapest = validHotels.reduce((a, b) => a.price_adult <= b.price_adult ? a : b);
      computedPriceAdult = cheapest.price_adult;
      computedPriceChild = cheapest.child_prices[0]?.price ?? pkgPriceChild;
    }

    const payload: Partial<Package> = {
      title: pkgTitle,
      type: pkgType,
      description: pkgDesc,
      image_url: pkgImage,
      destinations: pkgDestinations,
      duration: pkgDuration,
      price_adult: computedPriceAdult,
      price_child: computedPriceChild,
      included: pkgIncluded.split('\n').map(x => x.trim()).filter(Boolean),
      excluded: pkgExcluded.split('\n').map(x => x.trim()).filter(Boolean),
      accompaniment: pkgAccompaniment.trim(),
      itinerary: itineraryDays,
      is_signature: pkgIsSignature,
      departure_dates: parsedDepartureDates.length > 0 ? parsedDepartureDates : null,
      hotels: validHotels.length > 0 ? validHotels : null,
    };

    if (pkgType === 'omra') {
      payload.season = pkgSeason;
      payload.hotel_proximity = pkgProximity.trim();
    } else {
      payload.season = null;
      payload.hotel_proximity = null;
    }

    try {
      if (editingPkgId) {
        // Update
        const { error } = await supabase.from('packages').update(payload).eq('id', editingPkgId);
        if (error) throw error;
        addToast('Voyage mis à jour.', 'success');
      } else {
        // Insert
        const { error } = await supabase.from('packages').insert([payload]);
        if (error) throw error;
        addToast('Nouveau voyage créé.', 'success');
      }

      setIsModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
      addToast('Erreur technique lors de l\'enregistrement.', 'error');
    }
  };

  // Metrics details
  const statsTotalLeads = leads.length;
  const statsPendingLeads = leads.filter(l => l.status === 'Nouveau' || l.status === 'En cours').length;
  const statsProcessedLeads = leads.filter(l => l.status === 'Traité').length;

  // Fuzzy search
  const fuzzyMatch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().replace(/\s+/g, '');
    const t = text.toLowerCase();
    let qi = 0;
    for (let i = 0; i < t.length && qi < q.length; i++) {
      if (t[i] === q[qi]) qi++;
    }
    return qi === q.length;
  };

  const leadMatchesSearch = (lead: Lead): boolean => {
    if (!leadSearchQuery.trim()) return true;
    const fields = [
      lead.name,
      lead.email,
      lead.phone,
      lead.details?.package_title || '',
      lead.details?.destinations || '',
      lead.details?.city || '',
      lead.details?.departure || '',
      lead.details?.destination || '',
      lead.details?.notes || '',
    ];
    return fields.some(f => fuzzyMatch(f, leadSearchQuery));
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (leadTypeFilter !== 'all' && l.type !== leadTypeFilter) return false;
    if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
    if (!leadMatchesSearch(l)) return false;
    return true;
  });

  const statusCounts = {
    all: leads.filter(l => leadTypeFilter === 'all' || l.type === leadTypeFilter).length,
    Nouveau: leads.filter(l => l.status === 'Nouveau' && (leadTypeFilter === 'all' || l.type === leadTypeFilter)).length,
    'En cours': leads.filter(l => l.status === 'En cours' && (leadTypeFilter === 'all' || l.type === leadTypeFilter)).length,
    Traité: leads.filter(l => l.status === 'Traité' && (leadTypeFilter === 'all' || l.type === leadTypeFilter)).length,
  };

  return (
    <div className="flex-1 bg-slate-100 min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center gap-2 text-white font-heading text-lg font-black tracking-tight">
          <ShieldCheck className="w-5 h-5 text-blue-500" /> Espace Agent
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'leads' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Inbox className="w-4.5 h-4.5" /> Prospects & Devis
          </button>
          <button 
            onClick={() => setActiveTab('packages')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'packages' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/10' : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Sliders className="w-4.5 h-4.5" /> Catalogue Voyages
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          {adminEmail && (
            <div className="px-3 py-2 text-[11px] text-slate-500 truncate" title={adminEmail}>
              Connecté : <span className="text-slate-300 font-semibold">{adminEmail}</span>
            </div>
          )}
          <Link href="/" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300 transition-all">
            <ArrowLeft className="w-4.5 h-4.5" /> Retour au Site Vitrine
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/portail-gestion/login');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-rose-800/50 hover:border-rose-500 hover:bg-rose-950/30 rounded-lg text-xs font-bold text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
            <p className="font-semibold text-sm">Chargement des données CRM...</p>
          </div>
        ) : (
          <>
            {/* TAB: LEADS PANEL */}
            {activeTab === 'leads' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">Gestion des Prospects</h1>
                    <p className="text-sm text-slate-500">Qualifiez et gérez les prospects générés par les formulaires.</p>
                  </div>
                  <button 
                    onClick={exportCSV}
                    className="px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 text-slate-800 font-bold rounded-lg text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exporter prospects (CSV)
                  </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { title: 'Leads Reçus', value: statsTotalLeads, icon: Inbox, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { title: 'En Attente', value: statsPendingLeads, icon: Clock, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                    { title: 'Traités', value: statsProcessedLeads, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' }
                  ].map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                      <div key={idx} className="bg-white p-6 border border-slate-200/60 rounded-xl shadow-sm flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${stat.color}`}>
                          <Icon className="w-5.5 h-5.5" />
                        </div>
                        <div>
                          <div className="text-2xl font-black text-slate-950 leading-tight">{stat.value}</div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.title}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Search + Filters */}
                <div className="space-y-3">
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      value={leadSearchQuery}
                      onChange={e => setLeadSearchQuery(e.target.value)}
                      placeholder="Rechercher par nom, email, téléphone, destination..."
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-200 bg-white rounded-xl outline-none focus:border-blue-500 text-sm text-slate-700 placeholder-slate-400 shadow-sm"
                    />
                    {leadSearchQuery && (
                      <button
                        onClick={() => setLeadSearchQuery('')}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Service filter + Status tabs */}
                  <div className="flex flex-wrap items-center gap-3">
                    <select
                      value={leadTypeFilter}
                      onChange={e => setLeadTypeFilter(e.target.value)}
                      className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 text-sm font-semibold text-slate-700 cursor-pointer"
                    >
                      <option value="all">Tous les services</option>
                      <option value="billetterie">Billetterie Express</option>
                      <option value="hotel">Hôtels</option>
                      <option value="package">Séjours Organisés</option>
                      <option value="sur_mesure">Sur-Mesure</option>
                    </select>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      {([
                        { key: 'all', label: 'Tous' },
                        { key: 'Nouveau', label: 'Nouveau' },
                        { key: 'En cours', label: 'En cours' },
                        { key: 'Traité', label: 'Traité' },
                      ] as const).map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setLeadStatusFilter(tab.key)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            leadStatusFilter === tab.key
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >
                          {tab.label}
                          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                            leadStatusFilter === tab.key
                              ? tab.key === 'Nouveau' ? 'bg-amber-100 text-amber-700'
                                : tab.key === 'En cours' ? 'bg-blue-100 text-blue-700'
                                : tab.key === 'Traité' ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                              : 'bg-slate-200 text-slate-500'
                          }`}>
                            {statusCounts[tab.key]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                          <th className="py-4.5 px-6">Client</th>
                          <th className="py-4.5 px-6">Service</th>
                          <th className="py-4.5 px-6">Date</th>
                          <th className="py-4.5 px-6">Détails de la demande</th>
                          <th className="py-4.5 px-6">Statut</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredLeads.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                              Aucun prospect correspondant aux filtres.
                            </td>
                          </tr>
                        ) : (
                          filteredLeads.map(lead => {
                            const dateFmt = new Date(lead.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                            });

                            let typeBadgeColor = 'bg-slate-100 text-slate-700';
                            if (lead.type === 'billetterie') typeBadgeColor = 'bg-sky-50 text-sky-700 border-sky-100';
                            if (lead.type === 'hotel') typeBadgeColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                            if (lead.type === 'package') typeBadgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
                            if (lead.type === 'sur_mesure') typeBadgeColor = 'bg-pink-50 text-pink-700 border-pink-100';

                            // Render lead specific options
                            let detailsNode = null;
                            if (lead.details) {
                              const det = lead.details;
                              if (lead.type === 'billetterie') {
                                detailsNode = (
                                  <>
                                    <div className="font-semibold text-slate-900">{det.departure} &rarr; {det.destination}</div>
                                    <div className="text-xs text-slate-500">Dates: {det.date_departure} au {det.date_return}</div>
                                    <div className="text-xs text-slate-500">Bagages: {det.luggage} {det.transfer ? '| Transferts' : ''}</div>
                                  </>
                                );
                              } else if (lead.type === 'hotel') {
                                detailsNode = (
                                  <>
                                    <div className="font-semibold text-slate-900">Hôtel à {det.city}</div>
                                    <div className="text-xs text-slate-500">Chambre {det.room_type}</div>
                                    <div className="text-xs text-slate-500">Dates: Du {det.date_checkin} au {det.date_checkout}</div>
                                  </>
                                );
                              } else if (lead.type === 'package') {
                                detailsNode = (
                                  <>
                                    <div className="font-semibold text-slate-900">{det.package_title}</div>
                                    {det.selected_hotel && (
                                      <div className="text-xs text-slate-700 font-semibold">
                                        Hôtel: {det.selected_hotel} {'★'.repeat(det.selected_hotel_stars || 0)}
                                      </div>
                                    )}
                                    <div className="text-xs text-slate-500">Passagers: {det.adults} Adulte(s), {det.children} Enfant(s)</div>
                                    <div className="text-xs text-blue-600 font-bold">Total estimé: {det.total_price?.toLocaleString('fr-DZ')} DA{det.selected_departure_date ? ` · Départ: ${det.selected_departure_date}` : det.preferred_date ? ` · Départ: ${det.preferred_date}` : ''}</div>
                                  </>
                                );
                              } else if (lead.type === 'sur_mesure') {
                                detailsNode = (
                                  <>
                                    <div className="font-semibold text-slate-900">{det.destinations} ({det.duration})</div>
                                    <div className="text-xs text-slate-500">Passagers: {det.passengers} pers. | Profil: {det.profile} | Budget: {det.budget}</div>
                                    <div className="text-[11px] text-slate-400 mt-1 italic leading-tight">Notes: {det.notes}</div>
                                  </>
                                );
                              }
                            }

                            return (
                              <tr key={lead.id} className="hover:bg-slate-50/50">
                                <td className="py-4 px-6">
                                  <div className="font-extrabold text-slate-900 leading-snug">{lead.name}</div>
                                  <div className="text-xs text-slate-500">{lead.email}</div>
                                  <div className="text-xs text-slate-500 font-semibold">{lead.phone}</div>
                                </td>
                                <td className="py-4 px-6">
                                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md border uppercase ${typeBadgeColor}`}>
                                    {lead.type === 'sur_mesure' ? 'Sur-mesure' : lead.type}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                                  {dateFmt}
                                </td>
                                <td className="py-4 px-6 max-w-xs leading-normal">
                                  {detailsNode}
                                </td>
                                <td className="py-4 px-6">
                                  <select 
                                    value={lead.status}
                                    onChange={e => handleStatusChange(lead.id, e.target.value as any)}
                                    className="px-2 py-1.5 border border-slate-200 bg-white rounded-md text-xs font-bold outline-none focus:border-blue-500 cursor-pointer"
                                  >
                                    <option value="Nouveau">Nouveau</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Traité">Traité</option>
                                  </select>
                                </td>
                                <td className="py-4 px-6 text-center">
                                  <button 
                                    onClick={() => handleDeleteLead(lead.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CATALOG PACKAGES PANEL */}
            {activeTab === 'packages' && (
              <div className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-black text-slate-900 leading-tight">Catalogue des Voyages</h1>
                    <p className="text-sm text-slate-500">Créez, modifiez et gérez les packages affichés sur la vitrine.</p>
                  </div>
                  <button 
                    onClick={openModalForAdd}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center gap-2 shadow-md shadow-blue-500/10 cursor-pointer transition-all"
                  >
                    <Plus className="w-5 h-5" /> Ajouter un Voyage
                  </button>
                </div>

                {/* Packages Table */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                          <th className="py-4.5 px-6 w-20">Aperçu</th>
                          <th className="py-4.5 px-6">Titre de l'offre</th>
                          <th className="py-4.5 px-6">Type</th>
                          <th className="py-4.5 px-6">Tarifs Adulte / Enfant</th>
                          <th className="py-4.5 px-6">Durée</th>
                          <th className="py-4.5 px-6 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {packages.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                              Aucun package dans la base de données.
                            </td>
                          </tr>
                        ) : (
                          packages.map(pkg => (
                            <tr key={pkg.id} className="hover:bg-slate-50/50">
                              <td className="py-4 px-6">
                                <div className="relative w-14 h-10 rounded border border-slate-100 overflow-hidden bg-slate-50">
                                  <img src={pkg.image_url} alt="" className="object-cover w-full h-full" />
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="font-extrabold text-slate-900 leading-snug flex items-center gap-2">
                                  {pkg.title}
                                  {pkg.is_signature && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                      <Star className="w-3 h-3 fill-amber-400" /> Signature
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">Destinations: {pkg.destinations || 'N/A'}</div>
                              </td>
                              <td className="py-4 px-6">
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase border ${
                                  pkg.type === 'omra' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-700 border-slate-200'
                                }`}>
                                  {pkg.type === 'omra' ? 'Omra' : 'International'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                 <div className="font-semibold text-slate-900">Adultes: {pkg.price_adult} DA</div>
                                 <div className="text-xs text-slate-500">Enfants: {pkg.price_child} DA</div>
                              </td>
                              <td className="py-4 px-6 font-medium text-slate-700">
                                {pkg.duration}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center justify-center gap-2">
                                  <button 
                                    onClick={() => openModalForEdit(pkg)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg cursor-pointer"
                                    title="Modifier le package"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeletePackage(pkg.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg cursor-pointer"
                                    title="Supprimer le package"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ==================== CREATE / EDIT MODAL FORM ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col border border-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {editingPkgId ? "Modifier l'Offre de Voyage" : "Ajouter une Nouvelle Offre"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Titre du voyage</label>
                    <input 
                      type="text" 
                      value={pkgTitle} 
                      onChange={e => setPkgTitle(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="Ex: Splendeurs d'Europe : Paris - Barcelone"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Type de Voyage</label>
                    <select 
                      value={pkgType} 
                      onChange={e => setPkgType(e.target.value as any)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500 bg-white text-slate-700" 
                    >
                      <option value="international">Tourisme International</option>
                      <option value="omra">Omra & Hadj (Religieux)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description générale</label>
                  <textarea 
                    value={pkgDesc} 
                    onChange={e => setPkgDesc(e.target.value)}
                    rows={3}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                    placeholder="Accroche descriptive du voyage..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">URL de l'image de couverture</label>
                    <input 
                      type="url" 
                      value={pkgImage} 
                      onChange={e => setPkgImage(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="https://images.unsplash.com/..."
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Destinations (Villes / Pays)</label>
                    <input 
                      type="text" 
                      value={pkgDestinations} 
                      onChange={e => setPkgDestinations(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="Ex: Paris, Barcelone, Rome"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Durée (jours/nuits)</label>
                    <input 
                      type="text" 
                      value={pkgDuration} 
                      onChange={e => setPkgDuration(e.target.value)}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="Ex: 10 jours / 9 nuits"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prix Adulte (DA)</label>
                    <input 
                      type="number" 
                      value={pkgPriceAdult} 
                      onChange={e => setPkgPriceAdult(parseFloat(e.target.value) || 0)}
                      min={0}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prix Enfant (DA)</label>
                    <input 
                      type="number" 
                      value={pkgPriceChild} 
                      onChange={e => setPkgPriceChild(parseFloat(e.target.value) || 0)}
                      min={0}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      required
                    />
                  </div>
                </div>

                {/* Departure Dates (all package types) */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Prochains départs (séparés par virgule)</label>
                  <input
                    type="text"
                    value={pkgDepartureDates}
                    onChange={e => setPkgDepartureDates(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500"
                    placeholder="YYYY-MM-DD, YYYY-MM-DD, ..."
                  />
                </div>

                {/* Specific to Omra */}
                {pkgType === 'omra' && (
                  <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider">Champs Spécifiques Omra / Hadj</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Saison</label>
                        <select
                          value={pkgSeason}
                          onChange={e => setPkgSeason(e.target.value as any)}
                          className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg outline-none text-slate-700"
                        >
                          <option value="Ramadan">Ramadan</option>
                          <option value="Mawlid">Mawlid</option>
                          <option value="Automne">Automne / Hiver</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Proximité Haram</label>
                        <input
                          type="text"
                          value={pkgProximity}
                          onChange={e => setPkgProximity(e.target.value)}
                          className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg outline-none"
                          placeholder="Ex: 150m"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Included / Excluded / Accompagnement */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Inclusions (Une par ligne)</label>
                    <textarea 
                      value={pkgIncluded} 
                      onChange={e => setPkgIncluded(e.target.value)}
                      rows={3}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="Ex: Vols directs A/R&#10;Hôtels 4 étoiles&#10;Transferts VIP"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Exclusions (Une par ligne)</label>
                    <textarea 
                      value={pkgExcluded} 
                      onChange={e => setPkgExcluded(e.target.value)}
                      rows={3}
                      className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                      placeholder="Ex: Assurance voyage&#10;Repas non mentionnés"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Accompagnement & Guides</label>
                  <input 
                    type="text" 
                    value={pkgAccompaniment} 
                    onChange={e => setPkgAccompaniment(e.target.value)}
                    className="px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-500" 
                    placeholder="Ex: Accompagnement logistique et religieux francophone 24/7"
                  />
                </div>

                {/* Signature Destination Toggle */}
                <div className="p-5 bg-gradient-to-r from-amber-50/80 to-orange-50/50 border border-amber-200/60 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Destination Signature</h4>
                        <p className="text-xs text-slate-500 mt-0.5">Afficher ce voyage dans les 3 destinations vedettes de la page d'accueil</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPkgIsSignature(!pkgIsSignature)}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer ${
                        pkgIsSignature ? 'bg-amber-500' : 'bg-slate-300'
                      }`}
                    >
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                        pkgIsSignature ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  {pkgIsSignature && (
                    <div className="mt-3 p-3 bg-amber-100/50 rounded-lg border border-amber-200/40">
                      <p className="text-xs text-amber-700 font-medium flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Maximum 3 destinations signature recommandées pour un affichage optimal.
                      </p>
                    </div>
                  )}
                </div>

                {/* Dynamic Itinerary Builder */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-heading font-bold text-lg text-slate-900">Programme Jour par Jour (Itinéraire)</h3>
                    <button 
                      type="button" 
                      onClick={addItineraryDay}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                    >
                      <PlusCircle className="w-4 h-4" /> Ajouter un Jour
                    </button>
                  </div>

                  <div className="space-y-4">
                    {itineraryDays.map((day, idx) => (
                      <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl relative space-y-3">
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(idx)}
                          className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                          title="Supprimer cette journée"
                        >
                          <MinusCircle className="w-5 h-5" />
                        </button>
                        <div className="font-bold text-blue-600 text-sm">Jour {day.day}</div>
                        <div className="grid grid-cols-1 gap-3">
                          <input
                            type="text"
                            value={day.title}
                            onChange={e => handleItineraryDayChange(idx, 'title', e.target.value)}
                            placeholder="Titre de la journée (ex: Arrivée à Rome & installation)"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            required
                          />
                          <textarea
                            value={day.desc}
                            onChange={e => handleItineraryDayChange(idx, 'desc', e.target.value)}
                            placeholder="Détail des activités, repas, transferts..."
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Options Builder */}
                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-heading font-bold text-lg text-slate-900">Options d'Hébergement</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Définissez plusieurs hôtels à différents prix. Le moins cher deviendra le prix de départ affiché.</p>
                    </div>
                    <button
                      type="button"
                      onClick={addHotelOption}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-200"
                    >
                      <PlusCircle className="w-4 h-4" /> Ajouter un Hôtel
                    </button>
                  </div>

                  {hotelOptions.length === 0 && (
                    <p className="text-sm text-slate-400 italic py-3 text-center border border-dashed border-slate-200 rounded-xl">
                      Aucun hôtel — les prix saisis manuellement ci-dessus seront utilisés.
                    </p>
                  )}

                  <div className="space-y-5">
                    {hotelOptions.map((hotel, hIdx) => (
                      <div key={hIdx} className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative">
                        <button
                          type="button"
                          onClick={() => removeHotelOption(hIdx)}
                          className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                        >
                          <MinusCircle className="w-5 h-5" />
                        </button>
                        <div className="font-bold text-blue-600 text-sm">Hôtel {hIdx + 1}</div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2 flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Nom de l'hôtel</label>
                            <input
                              type="text"
                              value={hotel.name}
                              onChange={e => updateHotelOption(hIdx, 'name', e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                              placeholder="EL MOURADI CLUB SELIMA"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Étoiles</label>
                            <select
                              value={hotel.stars}
                              onChange={e => updateHotelOption(hIdx, 'stars', parseInt(e.target.value))}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            >
                              {[2, 3, 4, 5].map(s => <option key={s} value={s}>{s} ★</option>)}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Ville / Localisation</label>
                            <input
                              type="text"
                              value={hotel.location}
                              onChange={e => updateHotelOption(hIdx, 'location', e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                              placeholder="SOUSSE"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Formule</label>
                            <input
                              type="text"
                              value={hotel.formula}
                              onChange={e => updateHotelOption(hIdx, 'formula', e.target.value)}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                              placeholder="All Inclusive"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Prix Adulte (DA)</label>
                            <input
                              type="number"
                              value={hotel.price_adult}
                              onChange={e => updateHotelOption(hIdx, 'price_adult', parseFloat(e.target.value) || 0)}
                              min={0}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Âge max enfants</label>
                            <input
                              type="number"
                              value={hotel.child_max_age ?? 12}
                              onChange={e => updateHotelOption(hIdx, 'child_max_age', parseInt(e.target.value) || 12)}
                              min={1}
                              max={18}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"
                              placeholder="12"
                            />
                          </div>
                        </div>

                        {/* Child Price Tiers */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Tarifs Enfants</label>
                            <button
                              type="button"
                              onClick={() => addChildTier(hIdx)}
                              className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <PlusCircle className="w-3 h-3" /> Ajouter tranche
                            </button>
                          </div>
                          {hotel.child_prices.map((tier, tIdx) => (
                            <div key={tIdx} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={tier.label}
                                onChange={e => updateChildTier(hIdx, tIdx, 'label', e.target.value)}
                                className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                                placeholder="Enfant (-12 ans)"
                              />
                              <input
                                type="number"
                                value={tier.price}
                                onChange={e => updateChildTier(hIdx, tIdx, 'price', parseFloat(e.target.value) || 0)}
                                min={0}
                                className="w-28 px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                                placeholder="Prix DA"
                              />
                              <button
                                type="button"
                                onClick={() => removeChildTier(hIdx, tIdx)}
                                className="text-rose-400 hover:text-rose-600 cursor-pointer shrink-0"
                              >
                                <MinusCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Amenities + URLs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Équipements (une par ligne)</label>
                            <textarea
                              value={hotel.amenities.join('\n')}
                              onChange={e => updateHotelOption(hIdx, 'amenities', e.target.value.split('\n').map(x => x.trim()).filter(Boolean))}
                              rows={3}
                              className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                              placeholder={"Accès plage\nToboggans\nPiscine chauffée"}
                            />
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">URL Photo Hôtel</label>
                              <input
                                type="url"
                                value={hotel.image_url || ''}
                                onChange={e => updateHotelOption(hIdx, 'image_url', e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                                placeholder="https://..."
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Lien Référence (Booking...)</label>
                              <input
                                type="url"
                                value={hotel.reference_url || ''}
                                onChange={e => updateHotelOption(hIdx, 'reference_url', e.target.value)}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                                placeholder="https://booking.com/..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 sticky bottom-0 z-10">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 hover:bg-white text-slate-700 font-bold rounded-lg text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <Save className="w-4.5 h-4.5" /> Enregistrer le voyage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification Container */}
      <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-3 max-w-sm w-full">
        {toasts.map(toast => (
          <div 
            key={toast.id}
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
          </div>
        ))}
      </div>
    </div>
  );
}
