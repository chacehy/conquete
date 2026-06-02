'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, Inbox, Clock, CheckCircle2, FileSpreadsheet, Plus, 
  Trash2, Edit3, X, Save, AlertCircle, Check, ArrowLeft, RefreshCw, 
  PlusCircle, MinusCircle, ShieldCheck, HelpCircle, Eye, Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Package, Lead, ItineraryDay } from '@/types';

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'leads' | 'packages'>('leads');

  // Filters
  const [leadTypeFilter, setLeadTypeFilter] = useState('all');
  const [leadStatusFilter, setLeadStatusFilter] = useState('all');

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

  // Toasts
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' }[]>([]);

  useEffect(() => {
    fetchAdminData();
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
    
    if (pkg.type === 'omra') {
      setPkgSeason(pkg.season || 'Ramadan');
      setPkgProximity(pkg.hotel_proximity || '');
      setPkgDepartureDates(pkg.departure_dates ? pkg.departure_dates.join(', ') : '');
    } else {
      setPkgSeason('Ramadan');
      setPkgProximity('');
      setPkgDepartureDates('');
    }

    setItineraryDays(pkg.itinerary || [{ day: 1, title: '', desc: '' }]);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkgTitle || !pkgDesc || !pkgImage || !pkgDuration) {
      addToast('Veuillez remplir les informations obligatoires.', 'error');
      return;
    }

    const payload: Partial<Package> = {
      title: pkgTitle,
      type: pkgType,
      description: pkgDesc,
      image_url: pkgImage,
      destinations: pkgDestinations,
      duration: pkgDuration,
      price_adult: pkgPriceAdult,
      price_child: pkgPriceChild,
      included: pkgIncluded.split('\n').map(x => x.trim()).filter(Boolean),
      excluded: pkgExcluded.split('\n').map(x => x.trim()).filter(Boolean),
      accompaniment: pkgAccompaniment.trim(),
      itinerary: itineraryDays,
      is_signature: pkgIsSignature
    };

    if (pkgType === 'omra') {
      payload.season = pkgSeason;
      payload.hotel_proximity = pkgProximity.trim();
      payload.departure_dates = pkgDepartureDates.split(',').map(x => x.trim()).filter(Boolean);
    } else {
      payload.season = null;
      payload.hotel_proximity = null;
      payload.departure_dates = null;
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

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    if (leadTypeFilter !== 'all' && l.type !== leadTypeFilter) return false;
    if (leadStatusFilter !== 'all' && l.status !== leadStatusFilter) return false;
    return true;
  });

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
        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-700 hover:border-slate-500 hover:bg-slate-800 rounded-lg text-xs font-bold text-slate-300 transition-all">
            <ArrowLeft className="w-4.5 h-4.5" /> Retour au Site Vitrine
          </Link>
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

                {/* Table Filters */}
                <div className="flex gap-4">
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

                  <select 
                    value={leadStatusFilter}
                    onChange={e => setLeadStatusFilter(e.target.value)}
                    className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg outline-none focus:border-blue-500 text-sm font-semibold text-slate-700 cursor-pointer"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours">En cours</option>
                    <option value="Traité">Traité</option>
                  </select>
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
                                    <div className="text-xs text-slate-500">Passagers: {det.adults} Adulte(s), {det.children} Enfant(s)</div>
                                    <div className="text-xs text-blue-600 font-bold">Total estimé: {det.total_price} DA (Départ: {det.preferred_date})</div>
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

                {/* Specific to Omra */}
                {pkgType === 'omra' && (
                  <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-4">
                    <h4 className="font-extrabold text-xs text-emerald-800 uppercase tracking-wider">Champs Spécifiques Omra / Hadj</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase">Prochains départs (séparés par virgule)</label>
                        <input 
                          type="text" 
                          value={pkgDepartureDates} 
                          onChange={e => setPkgDepartureDates(e.target.value)}
                          className="px-3.5 py-2 border border-slate-200 bg-white rounded-lg outline-none" 
                          placeholder="YYYY-MM-DD, YYYY-MM-DD"
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
