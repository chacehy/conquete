'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  fr: {
    // Header & Navigation
    nav_international: "International",
    nav_omra: "Omra & Hadj",
    nav_tailormade: "Voyage sur-mesure",
    nav_agent: "Espace Agent",
    nav_quote: "Demander un Devis",

    // Hero Section
    hero_badge: "AGENT DE VOYAGE DE PRESTIGE",
    hero_title_1: "Explorez le monde,",
    hero_title_2: "conquérez vos ",
    hero_title_3: "rêves.",
    hero_desc: "Des expéditions internationales mémorables aux pèlerinages sacrés de l'Omra, nous façonnons des séjours exclusifs et sur-mesure d'un raffinement incomparable.",
    hero_btn_explore: "Explorer les Séjours",
    hero_btn_custom: "Créer un Itinéraire",
    hero_signature: "Destinations Signature",

    // Destinations Right Column
    dest_rome_title: "Rome Éternelle",
    dest_rome_desc: "Circuits exclusifs à la découverte de l'histoire, du Colisée et du raffinement de la Dolce Vita.",
    dest_tokyo_title: "Tokyo Mystique",
    dest_tokyo_desc: "Immersion sur-mesure entre sanctuaires shintoïstes, Mont Fuji et l'effervescence de Shibuya.",
    dest_mecca_title: "Omra Privilège",
    dest_mecca_desc: "Pèlerinages guidés haut de gamme avec hôtels d'exception en accès direct à l'Esplanade du Haram.",

    // Search Widget Tabs
    tab_flights: "Billetterie Express",
    tab_packages: "Séjours Organisés",
    tab_hotels: "Hôtels",
    tab_custom: "Sur-Mesure",

    // Search Widget Forms
    field_dep: "DÉPART",
    field_arr: "DESTINATION",
    field_date_dep: "ALLER",
    field_date_ret: "RETOUR (OPTIONNEL)",
    field_luggage: "BAGAGES",
    field_transfer: "Transfert aéroport inclus",
    field_flex: "Dates flexibles (+/- 3 jours)",
    btn_search_flights: "Rechercher un Vol",

    field_city: "VILLE OU HÔTEL",
    field_room: "TYPE DE CHAMBRE",
    field_checkin: "ARRIVÉE",
    field_checkout: "DÉPART",
    btn_search_hotels: "Rechercher un Hôtel",

    // Package catalog sections
    sec_int_title: "Nos Échappées Internationales",
    sec_int_desc: "Découvrez notre collection de séjours exclusifs à travers les plus belles destinations mondiales.",
    sec_omra_title: "Séjours Omra & Hadj",
    sec_omra_desc: "Un accompagnement d'exception pour vos pèlerinages sacrés, à proximité des lieux saints.",
    btn_details: "Voir les détails",
    btn_book: "Réserver ce séjour",

    // Interactive custom form teaser
    sec_custom_title: "Créez Votre Voyage d'Exception",
    sec_custom_desc: "Confiez-nous vos envies. Nos experts concevront un itinéraire entièrement personnalisé selon vos critères de prestige.",
    btn_start_planner: "Lancer le planificateur",

    // Details Drawer
    drawer_inclusion: "Ce qui est inclus",
    drawer_exclusion: "Non inclus / Extras",
    drawer_itinerary: "Programme jour par jour",
    drawer_calc_title: "Calculateur de Devis Estimé",
    drawer_calc_desc: "Ajustez le nombre de voyageurs pour estimer le tarif total de votre séjour.",
    drawer_adults: "Adultes",
    drawer_children: "Enfants (moins de 12 ans)",
    drawer_total: "Tarif Estimé Total",
    drawer_book_title: "Demander une réservation",
    drawer_full_name: "Nom complet",
    drawer_email: "Adresse e-mail",
    drawer_phone: "Numéro de téléphone",
    drawer_preferred_date: "Date de départ souhaitée",
    btn_confirm_booking: "Confirmer la demande de devis",
    btn_back: "Retour",
    
    // Status
    loading_data: "Chargement du catalogue...",
    no_packages: "Aucun séjour disponible pour le moment.",
    
    // Footer
    footer_tagline: "Votre partenaire de prestige pour des séjours d'exception et pèlerinages sacrés.",
    footer_rights: "Tous droits réservés.",
    footer_terms: "Mentions Légales",
    footer_contact: "Contactez-nous"
  },
  ar: {
    // Header & Navigation
    nav_international: "سياحة دولية",
    nav_omra: "عمرة وحج",
    nav_tailormade: "رحلات على المقاس",
    nav_agent: "فضاء الوكيل",
    nav_quote: "طلب تسعيرة",

    // Hero Section
    hero_badge: "وكيل سفر مرموق",
    hero_title_1: "اكتشف العالم،",
    hero_title_2: "وحقق ",
    hero_title_3: "أحلامك.",
    hero_desc: "من الرحلات الدولية التي لا تُنسى إلى رحلات العمرة المقدسة، نصمم رحلات حصرية ومخصصة برقي لا يضاهى.",
    hero_btn_explore: "استكشف الرحلات",
    hero_btn_custom: "خطط لرحلتك",
    hero_signature: "وجهاتنا المميزة",

    // Destinations Right Column
    dest_rome_title: "روما الخالدة",
    dest_rome_desc: "رحلات حصرية لاكتشاف التاريخ، الكولوسيوم ورقّة الحياة الإيطالية.",
    dest_tokyo_title: "طوكيو الساحرة",
    dest_tokyo_desc: "انغماس مخصص بين المعابد الشنتوية، جبل فوجي وصخب شيبويا.",
    dest_mecca_title: "عمرة فاخرة",
    dest_mecca_desc: "رحلات عمرة إرشادية راقية مع فنادق استثنائية مطلة مباشرة على ساحة الحرم.",

    // Search Widget Tabs
    tab_flights: "حجز تذاكر سريع",
    tab_packages: "رحلات منظمة",
    tab_hotels: "فنادق",
    tab_custom: "على المقاس",

    // Search Widget Forms
    field_dep: "مكان المغادرة",
    field_arr: "الوجهة",
    field_date_dep: "تاريخ الذهاب",
    field_date_ret: "تاريخ الإياب (اختياري)",
    field_luggage: "الأمتعة",
    field_transfer: "تشمل خدمة النقل من المطار",
    field_flex: "تواريخ مرنة (+/- 3 أيام)",
    btn_search_flights: "بحث عن رحلة طيران",

    field_city: "المدينة أو الفندق",
    field_room: "نوع الغرفة",
    field_checkin: "تاريخ الدخول",
    field_checkout: "تاريخ الخروج",
    btn_search_hotels: "بحث عن فندق",

    // Package catalog sections
    sec_int_title: "رحلاتنا الدولية المميزة",
    sec_int_desc: "اكتشف مجموعتنا المختارة من الرحلات الاستثنائية عبر أجمل الوجهات العالمية.",
    sec_omra_title: "رحلات العمرة والحج",
    sec_omra_desc: "مرافقة وإرشاد متميز لرحلتك الإيمانية المقدسة، بالقرب من الحرمين الشريفين.",
    btn_details: "عرض التفاصيل",
    btn_book: "احجز هذا السفر",

    // Interactive custom form teaser
    sec_custom_title: "صمم رحلتك الاستثنائية الخاصة",
    sec_custom_desc: "شاركنا رغباتك وسيقوم خبراؤنا بتصميم مسار مخصص لك بالكامل وفقًا لمعايير الرفاهية والتميز.",
    btn_start_planner: "ابدأ التخطيط",

    // Details Drawer
    drawer_inclusion: "الخدمات المشمولة",
    drawer_exclusion: "غير مشمول / إضافي",
    drawer_itinerary: "برنامج الرحلة يوماً بيوم",
    drawer_calc_title: "حساب التكلفة التقديرية",
    drawer_calc_desc: "اضبط عدد المسافرين لتقدير التكلفة الإجمالية لرحلتك.",
    drawer_adults: "البالغين",
    drawer_children: "الأطفال (دون 12 سنة)",
    drawer_total: "التكلفة التقديرية الإجمالية",
    drawer_book_title: "طلب حجز رحلة",
    drawer_full_name: "الاسم الكامل",
    drawer_email: "البريد الإلكتروني",
    drawer_phone: "رقم الهاتف",
    drawer_preferred_date: "تاريخ السفر المفضل",
    btn_confirm_booking: "تأكيد طلب التسعيرة",
    btn_back: "رجوع",
    
    // Status
    loading_data: "جاري تحميل البيانات...",
    no_packages: "لا توجد رحلات متاحة حالياً.",
    
    // Footer
    footer_tagline: "شريككم المميز للرحلات الاستثنائية والزيارات المقدسة.",
    footer_rights: "جميع الحقوق محفوظة.",
    footer_terms: "الشروط القانونية",
    footer_contact: "اتصل بنا"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr');

  useEffect(() => {
    const saved = localStorage.getItem('conquete_lang') as Language;
    if (saved === 'fr' || saved === 'ar') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('conquete_lang', lang);
  };

  const toggleLanguage = () => {
    const next: Language = language === 'fr' ? 'ar' : 'fr';
    setLanguage(next);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || translations['fr'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
