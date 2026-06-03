'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
  tText: (text: string) => string;
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
    no_signature_hint: "Marquez vos meilleurs voyages comme \"Signature\" dans le backoffice pour les afficher ici.",

    // Destinations Right Column (legacy, kept for reference)
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
    field_dep: "Départ",
    field_arr: "Destination",
    field_date_dep: "Aller",
    field_date_ret: "Retour (Optionnel)",
    field_luggage: "Bagages",
    field_transfer: "Transferts aéroports",
    field_flex: "Dates flexibles",
    btn_search_flights: "Demander un Devis Express",

    field_city: "Destination / Ville",
    field_room: "Type de Chambre",
    field_checkin: "Date d'arrivée",
    field_checkout: "Date de départ",
    btn_search_hotels: "Rechercher & Demander Devis",

    // Placeholders
    placeholder_dep: "Ex: Paris (CDG)",
    placeholder_arr: "Ex: Alger (ALG)",
    placeholder_city: "Ex: La Mecque, Rome, Tokyo",

    // Select choices
    opt_cabin_only: "Cabine seulement",
    opt_cabin_hold: "Cabine + 1 Bagage en soute",
    opt_cabin_2hold: "Cabine + 2 Bagages en soute",
    opt_room_single: "Chambre Simple",
    opt_room_double: "Chambre Double",
    opt_room_triple: "Chambre Triple",

    // Packages Catalog Headers
    lbl_evasion: "Évasion Globale",
    lbl_circuits_vedettes: "Circuits Internationaux Vedettes",
    lbl_voir_catalogue: "Voir tout le catalogue",
    lbl_no_int_packages: "Aucun circuit international disponible.",
    lbl_explore_circuits_title: "Explorez nos circuits guidés thématiques",
    lbl_explore_circuits_desc: "Découvrez nos fiches séjours structurées avec itinéraires détaillés.",
    lbl_voir_cat_int: "Voir le Catalogue International",
    lbl_custom_route_title: "Itinéraire 100% personnalisé",
    lbl_custom_route_desc: "Accédez à notre concepteur de circuits pour un séjour sur-mesure unique.",
    lbl_concevoir_voyage: "Concevoir mon Voyage",
    lbl_a_partir_de: "À partir de",
    lbl_decouvrir: "Découvrir",

    // Package catalog sections
    sec_int_title: "Nos Échappées Internationales",
    sec_int_desc: "Découvrez notre collection de séjours exclusifs à travers les plus belles destinations mondiales.",
    sec_omra_title: "Séjours Omra & Hadj",
    sec_omra_desc: "Un accompagnement d'exception pour vos pèlerinages sacrés, à proximité des lieux saints.",
    btn_details: "Voir les détails",
    btn_book: "Réserver ce séjour",

    // Interactive custom form teaser (Home Page)
    sec_custom_teaser_title: "Envie d'un voyage 100% sur-mesure ?",
    sec_custom_teaser_desc: "De la lune de miel romantique aux circuits d'aventure dans les contrées les plus sauvages, concevez un itinéraire d'exception entièrement personnalisé avec notre configurateur interactif.",
    btn_launch_planner: "Lancer le Questionnaire",

    // Details Drawer
    drawer_inclusion: "Ce qui est inclus",
    drawer_exclusion: "Non inclus / Extras",
    drawer_itinerary: "Programme jour par jour",
    drawer_calc_title: "Calculateur de Devis Estimé",
    drawer_calc_desc: "Ajustez le nombre de voyageurs pour estimer le tarif total de votre séjour.",
    drawer_adults: "Adultes",
    drawer_children: "Enfants (moins de 12 ans)",
    drawer_total: "Tarif Estimé Total",
    drawer_book_title: "Coordonnées de Réservation",
    drawer_full_name: "Nom complet",
    drawer_email: "Adresse e-mail",
    drawer_phone: "Numéro de téléphone",
    drawer_preferred_date: "Date de départ souhaitée",
    btn_confirm_booking: "Confirmer la demande de devis",
    btn_back: "Retour",
    btn_cancel: "Annuler",
    drawer_hotel_proximity_prefix: "Hôtels situés à",

    // Status & Misc
    loading_data: "Chargement du catalogue...",
    no_packages: "Aucun séjour disponible pour le moment.",
    dest_count: "Dest.",
    preferred_dates_list: "Dates de départs",
    haram_proximity: "du Haram",
    lbl_day_prefix: "J",
    lbl_days: "jours",
    lbl_nights: "nuits",
    lbl_creation_unique: "CRÉATION UNIQUE",

    // International Page Extra
    int_banner_badge: "Voyages",
    int_banner_title: "Circuits Internationaux",
    int_banner_desc: "Explorez les merveilles de notre catalogue international. Des itinéraires d'exception préparés de A à Z par nos agents.",
    int_no_packages: "Aucun séjour international disponible pour le moment.",
    toast_error_load: "Erreur de chargement des circuits.",
    toast_success_lead: "Votre demande a été prise en compte avec succès !",
    toast_error_lead: "Erreur lors de l'enregistrement.",

    // Omra Page Extra
    omra_banner_badge: "Tourisme Religieux",
    omra_banner_title: "Omra & Hadj",
    omra_banner_desc: "Vivez un pèlerinage spirituel d'exception. Un encadrement rigoureux et des hôtels premium à proximité des lieux saints.",
    omra_filter_all: "Toutes les offres",
    omra_filter_ramadan: "Ramadan",
    omra_filter_mawlid: "Mawlid",
    omra_filter_autumn: "Automne / Hiver",
    omra_filter_spring: "Printemps",
    omra_upcoming_title: "Calendrier des Prochains Départs",
    omra_upcoming_desc: "Planifiez votre départ selon nos sessions de groupes garanties.",
    omra_hotel_proximity_title: "Proximité du Haram",
    omra_accompaniment_title: "Accompagnement & Guides",
    omra_no_packages: "Aucun package Omra disponible pour le moment.",
    toast_error_load_omra: "Erreur de chargement des offres Omra.",
    lbl_sacred_pilgrim: "Pèlerinages Sacrés",
    lbl_omra_title: "Omra & Hadj Spirituel",
    lbl_voir_offres_omra: "Voir les offres Omra",

    // Sur-Mesure Page Extra
    sm_banner_badge: "Concepteur de séjours",
    sm_banner_title: "Voyages Sur-Mesure",
    sm_banner_desc: "Prenez 2 minutes pour exprimer vos envies de voyage, et laissez notre équipe d'experts concevoir votre itinéraire sur-mesure.",
    sm_step_1_title: "Étape 1 : Votre Destination",
    sm_step_2_title: "Étape 2 : Profil des Voyageurs",
    sm_step_3_title: "Étape 3 : Budget & Coordonnées",
    sm_step_1_desc: "Définissez votre destination de rêve et la durée souhaitée.",
    sm_step_2_desc: "Qui participe à ce projet de voyage exclusif ?",
    sm_step_3_desc: "Indiquez votre budget estimé et vos coordonnées.",
    sm_lbl_destination: "Destination(s) souhaitée(s)",
    sm_placeholder_destination: "Ex: Safari en Tanzanie, Voyage de noces à Bora Bora...",
    sm_lbl_duration: "Durée estimée du séjour",
    sm_duration_short: "Moins d'une semaine",
    sm_duration_medium: "1 à 2 semaines",
    sm_duration_long: "Plus de 2 semaines",
    sm_lbl_profile: "Profil du voyage",
    sm_profile_solo: "Voyage Solo",
    sm_profile_couple: "En Couple (Lune de miel...)",
    sm_profile_family: "En Famille (avec enfants)",
    sm_profile_friends: "Groupe d'amis / Collègues",
    sm_lbl_passengers: "Nombre de passagers",
    sm_lbl_budget: "Niveau de gamme & Budget",
    sm_budget_luxury: "Prestige / Luxe (Hôtels 5* d'exception)",
    sm_budget_comfort: "Confort Premium (Hôtels 4* de charme)",
    sm_budget_standard: "Équilibré (Hôtels 3* ou typiques)",
    sm_lbl_name: "Nom & Prénom",
    sm_lbl_email: "Adresse e-mail",
    sm_lbl_phone: "Téléphone",
    sm_lbl_notes: "Remarques spéciales ou envies particulières",
    sm_placeholder_notes: "Hôtels en bord de mer, guide francophone, visites privatives...",
    sm_btn_next: "Suivant",
    sm_btn_submit: "Soumettre ma demande",
    toast_success_sm: "Votre demande de création sur-mesure a été soumise avec succès !",
    toast_error_sm_dest: "Veuillez renseigner votre destination.",
    toast_error_sm_passengers: "Le nombre de voyageurs doit être supérieur à 0.",
    toast_error_sm_contact: "Veuillez remplir vos coordonnées de contact.",

    // Footer
    footer_tagline: "Votre partenaire de prestige pour des séjours d'exception et pèlerinages sacrés.",
    footer_prestations: "Prestations",
    footer_international_circuits: "Circuits Internationaux",
    footer_omra_hadj: "Pèlerinages Omra / Hadj",
    footer_tailormade: "Voyages Sur-Mesure",
    footer_links: "Liens Utiles",
    footer_cookies: "Politique de cookies",
    footer_insurance: "Assurances de voyages",
    footer_contact_title: "Contact & Agence",
    footer_address: "45 Avenue de la République, Paris",
    footer_agent_portal: "Accéder au Portail Agent",
    footer_rights: "Tous droits réservés.",
    footer_terms: "Mentions Légales",
    footer_contact: "Contactez-nous",
    toast_required_fields: "Veuillez remplir les informations obligatoires.",
    toast_search_required: "Veuillez remplir les informations de recherche.",
    prompt_email_devis: "Adresse e-mail pour recevoir votre devis express :",
    prompt_name: "Nom complet :",
    prompt_phone: "Téléphone :",
    prompt_email_proposition: "Adresse e-mail pour recevoir les propositions :"
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
    no_signature_hint: "ضع علامة \"Signature\" على أفضل رحلاتك في لوحة التحكم لعرضها هنا.",

    // Destinations Right Column (legacy, kept for reference)
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
    btn_search_flights: "طلب تسعيرة سريع",

    field_city: "الوجهة / المدينة",
    field_room: "نوع الغرفة",
    field_checkin: "تاريخ الوصول",
    field_checkout: "تاريخ المغادرة",
    btn_search_hotels: "البحث وطلب تسعيرة",

    // Placeholders
    placeholder_dep: "مثال: باريس (CDG)",
    placeholder_arr: "مثال: الجزائر (ALG)",
    placeholder_city: "مثال: مكة، روما، طوكيو",

    // Select choices
    opt_cabin_only: "حقيبة يد فقط",
    opt_cabin_hold: "حقيبة يد + حقيبة شحن واحدة",
    opt_cabin_2hold: "حقيبة يد + حقيبتي شحن",
    opt_room_single: "غرفة فردية",
    opt_room_double: "غرفة مزدوجة",
    opt_room_triple: "غرفة ثلاثية",

    // Packages Catalog Headers
    lbl_evasion: "هروب عالمي",
    lbl_circuits_vedettes: "جولاتنا الدولية المتميزة",
    lbl_voir_catalogue: "عرض الكتالوج بالكامل",
    lbl_no_int_packages: "لا توجد رحلات دولية متاحة حالياً.",
    lbl_explore_circuits_title: "استكشف جولاتنا الإرشادية المميزة",
    lbl_explore_circuits_desc: "اكتشف برامج رحلاتنا المنظمة مع تفاصيل المسارات يوماً بيوم.",
    lbl_voir_cat_int: "عرض الكتالوج الدولي",
    lbl_custom_route_title: "مسار مخصص بالكامل 100%",
    lbl_custom_route_desc: "تفضل بزيارة مصمم الرحلات للحصول على إقامة فريدة مصممة خصيصاً لك.",
    lbl_concevoir_voyage: "تصميم رحلتي الخاصة",
    lbl_a_partir_de: "ابتداءً من",
    lbl_decouvrir: "اكتشف",

    // Package catalog sections
    sec_int_title: "رحلاتنا الدولية المميزة",
    sec_int_desc: "اكتشف مجموعتنا المختارة من الرحلات الاستثنائية عبر أجمل الوجهات العالمية.",
    sec_omra_title: "رحلات العمرة والحج",
    sec_omra_desc: "مرافقة وإرشاد متميز لرحلتك الإيمانية المقدسة، بالقرب من الحرمين الشريفين.",
    btn_details: "عرض التفاصيل",
    btn_book: "احجز هذا السفر",

    // Interactive custom form teaser (Home Page)
    sec_custom_teaser_title: "هل ترغب في رحلة مصممة بالكامل على المقاس؟",
    sec_custom_teaser_desc: "من شهر العسل الرومانسي إلى رحلات المغامرة في البراري، صمم مساراً استثنائياً مخصصاً بالكامل عبر أداتنا التفاعلية.",
    btn_launch_planner: "ابدأ الاستبيان",

    // Details Drawer
    drawer_inclusion: "الخدمات المشمولة",
    drawer_exclusion: "غير مشمول / إضافي",
    drawer_itinerary: "برنامج الرحلة يوماً بيوم",
    drawer_calc_title: "حساب التكلفة التقديرية",
    drawer_calc_desc: "اضبط عدد المسافرين لتقدير التكلفة الإجمالية لرحلتك.",
    drawer_adults: "البالغين",
    drawer_children: "الأطفال (دون 12 سنة)",
    drawer_total: "التكلفة التقديرية الإجمالية",
    drawer_book_title: "معلومات الاتصال للحجز",
    drawer_full_name: "الاسم الكامل",
    drawer_email: "البريد الإلكتروني",
    drawer_phone: "رقم الهاتف",
    drawer_preferred_date: "تاريخ السفر المفضل",
    btn_confirm_booking: "تأكيد طلب التسعيرة",
    btn_back: "رجوع",
    btn_cancel: "إلغاء",
    drawer_hotel_proximity_prefix: "فنادق على بعد",

    // Status & Misc
    loading_data: "جاري تحميل البيانات...",
    no_packages: "لا توجد رحلات متاحة حالياً.",
    dest_count: "وجهات",
    preferred_dates_list: "تواريخ المغادرة",
    haram_proximity: "من الحرم",
    lbl_day_prefix: "اليوم ",
    lbl_days: "أيام",
    lbl_nights: "ليالي",
    lbl_creation_unique: "تصميم فريد",

    // International Page Extra
    int_banner_badge: "رحلات سياحية",
    int_banner_title: "جولات سياحية دولية",
    int_banner_desc: "اكتشف عجائب كتالوجنا الدولي. مسارات استثنائية مجهزة من الألف إلى الياء من قبل وكلائنا.",
    int_no_packages: "لا توجد أي رحلات دولية متاحة حالياً.",
    toast_error_load: "خطأ أثناء تحميل الرحلات.",
    toast_success_lead: "تم تسجيل طلبك بنجاح وسنتصل بك قريباً!",
    toast_error_lead: "حدث خطأ أثناء حفظ طلبك.",

    // Omra Page Extra
    omra_banner_badge: "سياحة دينية",
    omra_banner_title: "عمرة وحج",
    omra_banner_desc: "عش رحلة إيمانية روحية استثنائية. تأطير دقيق وفنادق ممتازة بالقرب من الأماكن المقدسة.",
    omra_filter_all: "جميع العروض",
    omra_filter_ramadan: "رمضان",
    omra_filter_mawlid: "المولد النبوي",
    omra_filter_autumn: "الخريف / الشتاء",
    omra_filter_spring: "الربيع",
    omra_upcoming_title: "جدول الرحلات القادمة",
    omra_upcoming_desc: "خطط لرحلتك وفقاً لرحلاتنا الجماعية المضمونة.",
    omra_hotel_proximity_title: "القرب من الحرم",
    omra_accompaniment_title: "المرافقة والإرشاد",
    omra_no_packages: "لا تتوفر أي عروض عمرة حالياً.",
    toast_error_load_omra: "خطأ في تحميل عروض العمرة.",
    lbl_sacred_pilgrim: "رحلات الحج والعمرة",
    lbl_omra_title: "عمرة وحج روحي",
    lbl_voir_offres_omra: "عرض عروض العمرة",

    // Sur-Mesure Page Extra
    sm_banner_badge: "مصمم الرحلات",
    sm_banner_title: "رحلات على المقاس",
    sm_banner_desc: "خصّص دقيقتين للتعبير عن رغباتك، ودع فريق خبرائنا يصمم لك برنامجاً مخصصاً.",
    sm_step_1_title: "الخطوة 1: وجهتك",
    sm_step_2_title: "الخطوة 2: ملف المسافرين",
    sm_step_3_title: "الخطوة 3: الميزانية ومعلومات الاتصال",
    sm_step_1_desc: "حدد وجهة أحلامك والمدة المرغوبة.",
    sm_step_2_desc: "من يشارك في هذا المشروع المميز؟",
    sm_step_3_desc: "حدد الميزانية المقدرة ومعلومات الاتصال.",
    sm_lbl_destination: "الوجهة (الوجهات) المطلوبة",
    sm_placeholder_destination: "مثال: رحلة سفاري في تنزانيا، شهر عسل في بورا بورا...",
    sm_lbl_duration: "المدة المقدرة للإقامة",
    sm_duration_short: "أقل من أسبوع",
    sm_duration_medium: "من أسبوع إلى أسبوعين",
    sm_duration_long: "أكثر من أسبوعين",
    sm_lbl_profile: "نوع الرحلة",
    sm_profile_solo: "سفر فردي",
    sm_profile_couple: "شخصين (شهر عسل...)",
    sm_profile_family: "عائلي (مع أطفال)",
    sm_profile_friends: "مجموعة أصدقاء / زملاء",
    sm_lbl_passengers: "عدد المسافرين",
    sm_lbl_budget: "مستوى الميزانية والراحة",
    sm_budget_luxury: "فاخر جداً (فنادق 5 نجوم استثنائية)",
    sm_budget_comfort: "ممتاز ومريح (فنادق 4 نجوم ممتازة)",
    sm_budget_standard: "اقتصادي متوازن (فنادق 3 نجوم)",
    sm_lbl_name: "الاسم واللقب",
    sm_lbl_email: "البريد الإلكتروني",
    sm_lbl_phone: "رقم الهاتف",
    sm_lbl_notes: "ملاحظات خاصة أو رغبات معينة",
    sm_placeholder_notes: "فنادق مطلة على البحر، مرشد خاص، زيارات خاصة...",
    sm_btn_next: "التالي",
    sm_btn_submit: "إرسال الطلب",
    toast_success_sm: "تم تقديم طلب التصميم المخصص بنجاح وسيتواصل معك خبيرنا قريباً!",
    toast_error_sm_dest: "يرجى تحديد الوجهة المطلوبة.",
    toast_error_sm_passengers: "يجب أن يكون عدد المسافرين أكبر من 0.",
    toast_error_sm_contact: "يرجى ملء معلومات الاتصال الخاصة بك.",

    // Footer
    footer_tagline: "شريككم المميز للرحلات الاستثنائية والزيارات المقدسة.",
    footer_prestations: "الخدمات",
    footer_international_circuits: "Circuits Internationaux",
    footer_omra_hadj: "رحلات العمرة والحج",
    footer_tailormade: "رحلات على المقاس",
    footer_links: "روابط مفيدة",
    footer_cookies: "سياسة ملفات الارتباط",
    footer_insurance: "تأمين السفر",
    footer_contact_title: "الاتصال والوكالة",
    footer_address: "45 شارع الجمهورية، باريس",
    footer_agent_portal: "الدخول إلى بوابة الوكلاء",
    footer_rights: "جميع الحقوق محفوظة.",
    footer_terms: "الشروط القانونية",
    footer_contact: "اتصل بنا",
    toast_required_fields: "يرجى ملء جميع الحقول المطلوبة.",
    toast_search_required: "يرجى ملء تفاصيل البحث المطلوبة.",
    prompt_email_devis: "البريد الإلكتروني لتلقي عرض الأسعار السريع:",
    prompt_name: "الاسم الكامل:",
    prompt_phone: "الهاتف:",
    prompt_email_proposition: "البريد الإلكتروني لتلقي مقترحات العروض:"
  }
};

// Client-side translation of text coming from the database
const databaseTranslations: Record<string, string> = {
  // Titles
  "Merveilles d'Europe : Paris - Rome - Barcelone": "عجائب أوروبا: باريس - روما - برشلونة",
  "Splendeurs d'Asie : Tokyo - Kyoto - Séoul": "روائع آسيا: طوكيو - كيوتو - سيول",
  "Omra Confort - Ramadan 2026": "عمرة راحة - رمضان 2026",
  "Omra Premium - Printemps 2026": "عمرة ممتازة - ربيع 2026",
  
  // Descriptions
  "Parcourez les plus belles capitales européennes de Paris à Barcelone.": "سافر عبر أجمل العواصم الأوروبية من باريس إلى برشلونة.",
  "Un voyage exceptionnel mariant la modernité fulgurante de Tokyo, la tradition millénaire de Kyoto et le dynamisme de Séoul.": "رحلة استثنائية تجمع بين الحداثة الفائقة لطوكيو والتقاليد العريقة لكيوتو وحيوية سيول.",
  "Une Omra sereine avec hébergement 4 étoiles à moins de 300m des deux Saintes Mosquées.": "عمرة هادئة مع إقامة 4 نجوم على بعد أقل من 300 متر من الحرمين الشريفين.",
  "Prestations haut de gamme, hébergement en hôtel 5 étoiles en face du Haram.": "خدمات راقية، إقامة في فندق 5 نجوم أمام الحرم مباشرة.",

  // Inclusions/Exclusions & Accompaniment
  "Vols directs A/R": "رحلات طيران مباشرة ذهاباً وإياباً",
  "Hôtels 4 étoiles": "فنادق 4 نجوم",
  "Transferts VIP": "نقل خاص لكبار الشخصيات",
  "Guide francophone": "مرشد سياحي يتحدث العربية والفرنسية",
  "Assurance voyage": "تأمين السفر",
  "Repas non mentionnés": "الوجبات غير المذكورة",
  "Vols A/R Premium": "رحلات طيران ذهاب وإياب درجة أولى",
  "Hôtels 5 étoiles": "فنادق 5 نجوم",
  "Visa Omra inclus": "تأشيرة العمرة مشمولة",
  "Accompagnement religieux": "مرافقة وإرشاد ديني",
  "Assurance médicale": "تأمين طبي",
  "Repas non inclus": "الوجبات غير مشمولة",
  "Guide spirituel bilingue": "مرشد روحي ثنائي اللغة",
  "Guide accompagnateur francophone": "مرشد سياحي مرافق",

  // Itinerary titles & descriptions
  "Arrivée à Paris": "الوصول إلى باريس",
  "Installation à l'hôtel, après-midi libre.": "تسجيل الدخول في الفندق، وقت حر بعد الظهر.",
  "Découverte de Paris": "اكتشاف باريس",
  "Tour guidé (Eiffel, Louvre) et croisière Seine.": "جولة سياحية موجهة (برج إيفل، متحف اللوفر) ورحلة بحرية في السين.",
  "Paris - Barcelone": "باريس - برشلونة",
  "Train rapide vers Barcelone, installation.": "قطار سريع نحو برشلونة، تسجيل الدخول في الفندق.",
  "Arrivée à Tokyo": "الوصول إلى طوكيو",
  "Accueil et transfert privé à l'hôtel.": "الاستقبال والنقل الخاص إلى الفندق.",
  "Exploration de Tokyo": "استكشاف طوكيو",
  "Visite d'Asakusa, Shibuya et Harajuku.": "زيارة أساكوسا، شيبويا وهاراجوكو.",
  "Escapade au Mont Fuji": "رحلة إلى جبل فوجي",
  "Excursion d'une journée au lac Kawaguchi.": "رحلة ليوم كامل إلى بحيرة كاواغوتشي.",
  "Vol pour Séoul": "رحلة طيران إلى سيول",
  "Transfert et installation à Séoul.": "النقل وتسجيل الدخول في سيول.",
  "Arrivée à Médine": "الوصول إلى المدينة المنورة",
  "Accueil à l'aéroport et transfert à l'hôtel proche du Haram.": "الاستقبال في المطار والنقل إلى الفندق القريب من الحرم.",
  "Recueillement à Médine": "زيارة معالم المدينة المنورة",
  "Visites religieuses guidées (Ziyarat).": "زيارات دينية موجهة (الزيارات).",
  "Transfert à La Mecque": "النقل إلى مكة المكرمة",
  "Départ en train rapide Haramain, installation et accomplissement de l'Omra.": "الذهاب عبر قطار الحرمين السريع، تسجيل الدخول وأداء مناسك العمرة.",
  "Arrivée à Djeddah": "الوصول إلى جدة"
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

  const tText = (text: string): string => {
    if (language === 'fr') return text;
    return databaseTranslations[text] || text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, tText }}>
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
