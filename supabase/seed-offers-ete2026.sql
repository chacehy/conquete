-- Conquête Voyages – Offres Été 2026
-- Paste this in your Supabase SQL Editor: https://app.supabase.com/project/vgwytvwcvxqwouxvxrgq/sql

INSERT INTO packages (
  title, description, type, destinations, duration,
  price_adult, price_child, image_url,
  included, excluded, itinerary, departure_dates,
  season, hotel_proximity, accompaniment, is_signature
) VALUES

-- ─────────────────────────────────────────────────────────────────
-- 1. El Mouradi Club Selima 3★ – Sousse, Tunisie
-- ─────────────────────────────────────────────────────────────────
(
  'El Mouradi Club Selima 3★ – Sousse, Tunisie',
  $$Séjour All Inclusive au bord de la mer à Port El Kantaoui, Sousse. Vacances inoubliables avec accès direct à la plage, toboggans aquatiques, animations et mini-club pour toute la famille.

✈️ Vol direct Air Algérie : Oran → Monastir → Oran

💰 Tarif adulte : 139 000 DA / personne (chambre double)
👶 1er & 2ème enfant (-12 ans) : 95 000 DA$$,
  'international',
  'Sousse, Tunisie',
  '8 Jours / 7 Nuits',
  139000,
  95000,
  '/offers/tunisie-el-mouradi.jpg',
  ARRAY[
    'Vol direct Oran – Monastir – Oran (Air Algérie)',
    'Transferts Aéroport ↔ Hôtel ↔ Aéroport',
    'Hébergement en formule All Inclusive',
    'Accès direct à la plage',
    'Toboggans aquatiques',
    'Animations & Mini-club',
    'Activités sportives et nautiques',
    'Piscines'
  ],
  ARRAY[
    'Dépenses personnelles',
    'Excursions facultatives',
    'Taxe de séjour tunisienne (à régler sur place)'
  ],
  '[]'::jsonb,
  ARRAY['2026-07-21','2026-07-28','2026-08-04','2026-08-11','2026-08-18','2026-08-25','2026-09-01','2026-09-08']::date[],
  NULL, NULL, NULL, false
),

-- ─────────────────────────────────────────────────────────────────
-- 2. Bella Vista Family Resort 4★ – Monastir, Tunisie
-- ─────────────────────────────────────────────────────────────────
(
  'Bella Vista Family Resort 4★ – Monastir, Tunisie',
  $$Séjour All Inclusive en famille à Monastir, pieds dans l'eau. Hôtel familial 4 étoiles avec accès direct à la plage, aquapark et toboggans, animations pour toute la famille.

✈️ Vol direct Air Algérie : Oran → Monastir → Oran

💰 Tarif adulte : 165 000 DA / personne (chambre double)
👶 1er enfant (2 à 5 ans) : 59 000 DA
👦 2ème enfant (2 à 11 ans) : 109 000 DA$$,
  'international',
  'Monastir, Tunisie',
  '8 Jours / 7 Nuits',
  165000,
  59000,
  '/offers/tunisie-bella-vista.jpg',
  ARRAY[
    'Vol direct Oran – Monastir – Oran (Air Algérie)',
    'Transferts Aéroport ↔ Hôtel ↔ Aéroport',
    'Hébergement en formule All Inclusive',
    'Accès direct à la plage (pieds dans l''eau)',
    'Aquapark et toboggans',
    'Animations & Mini-club',
    'Activités sportives et nautiques',
    'Piscines pour adultes et enfants'
  ],
  ARRAY[
    'Dépenses personnelles',
    'Excursions facultatives',
    'Taxe de séjour tunisienne (à régler sur place)'
  ],
  '[]'::jsonb,
  ARRAY['2026-07-21','2026-07-28','2026-08-04','2026-08-11','2026-08-18','2026-08-25','2026-09-01','2026-09-08']::date[],
  NULL, NULL, NULL, false
),

-- ─────────────────────────────────────────────────────────────────
-- 3. Abou Sofiane 4★ – Port El Kantaoui, Sousse, Tunisie
-- ─────────────────────────────────────────────────────────────────
(
  'Abou Sofiane 4★ – Port El Kantaoui, Tunisie',
  $$Séjour All Inclusive au magnifique Port El Kantaoui. Plage de sable fin, piscines, espaces de loisirs et toboggans dans cet hôtel 4 étoiles pieds dans l'eau.

✈️ Vol direct Air Algérie : Oran → Monastir → Oran

💰 Tarif adulte : 188 000 DA / personne (chambre double)
👶 1er enfant (2 à 5 ans) : 59 000 DA
👦 2ème enfant (2 à 11 ans) : 119 000 DA$$,
  'international',
  'Sousse, Tunisie',
  '8 Jours / 7 Nuits',
  188000,
  59000,
  '/offers/tunisie-abou-sofiane.jpg',
  ARRAY[
    'Vol direct Oran – Monastir – Oran (Air Algérie)',
    'Transferts Aéroport ↔ Hôtel ↔ Aéroport',
    'Hébergement en formule All Inclusive',
    'Magnifique plage de sable fin',
    'Piscines et espaces de loisirs',
    'Toboggans pour enfants',
    'Activités sportives et nautiques'
  ],
  ARRAY[
    'Dépenses personnelles',
    'Excursions facultatives',
    'Taxe de séjour tunisienne (à régler sur place)'
  ],
  '[]'::jsonb,
  ARRAY['2026-07-21','2026-07-28','2026-08-04','2026-08-11','2026-08-18','2026-08-25','2026-09-01','2026-09-08']::date[],
  NULL, NULL, NULL, false
),

-- ─────────────────────────────────────────────────────────────────
-- 4. Sharm El Sheikh Été 2026 – Égypte
-- ─────────────────────────────────────────────────────────────────
(
  'Sharm El Sheikh Été 2026 – Égypte',
  $$Vol direct 9 Jours / 8 Nuits – Oran → Sharm El Sheikh → Oran
Sans visa ✅ – Hôtels 4★ & 5★ en Soft All Inclusive
Vol direct Air Algérie | Juillet – Août – Septembre 2026

3 VISITES GUIDÉES INCLUSES :
📍 Soho Square | 📍 Naama Bay | 📍 Souk El Kadim

━━━━━━━━━━━━━━━
CHOIX D'HÔTELS :

▸ PARROTEL AQUA PARK RESORT 4★
Double : 215 000 DA | Triple : 208 000 DA | Single : 265 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 549 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 565 000 DA
Pack Famille (2 adultes + 2 enfants) : à partir de 712 000 DA

▸ CORAL SEA AQUA CLUB 4★
Double : 280 000 DA | Triple : 276 000 DA | Single : 368 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 679 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 695 000 DA

▸ CONCORDE EL SALAM FRONT 5★
Double : 299 000 DA | Triple : 297 000 DA | Single : 399 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 717 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 733 000 DA

▸ CHARMILLION GARDENS AQUA PARK 5★
Double : 335 000 DA | Triple : 330 000 DA | Single : 450 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 789 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 805 000 DA

▸ PICKALBATROS GOLF BEACH RESORT 5★
Double : 354 000 DA | Triple : 350 000 DA | Single : 510 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 827 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 843 000 DA

▸ PICKALBATROS PALACE RESORT 5★
(Royal Moderna / Laguna Vista / Palace)
Double : 385 000 DA | Triple : 383 000 DA | Single : 564 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 889 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 905 000 DA

▸ BARON SHARM RESORT 5★
Double : 406 000 DA | Triple : 402 000 DA | Single : 568 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 930 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 947 000 DA

▸ SULTAN GARDENS RESORT 5★
Double : 430 000 DA | Triple : 427 000 DA | Single : 550 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 979 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 995 000 DA

▸ RIXOS PREMIUM RADAMIS 5★
Double : 595 000 DA | Triple : 590 000 DA | Single : 809 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 1 299 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 1 325 000 DA

▸ RIXOS PREMIUM SEAGATE 5★
Double : 667 000 DA | Triple : 660 000 DA | Single : 910 000 DA
Bébé : 25 000 DA
Pack Famille (2 adultes + 1 enfant 2–6 ans) : 1 450 000 DA
Pack Famille (2 adultes + 1 enfant 6–12 ans) : 1 469 000 DA$$,
  'international',
  'Sharm El Sheikh, Égypte',
  '9 Jours / 8 Nuits',
  208000,
  25000,
  '/offers/sharm-el-sheikh.jpg',
  ARRAY[
    'Vol direct Oran – Sharm El Sheikh – Oran (Air Algérie)',
    '9 Jours / 8 Nuits en Soft All Inclusive',
    'Hôtels 4★ & 5★ au choix du client',
    'Transferts Aéroport ↔ Hôtel ↔ Aéroport',
    'Assistance sur place',
    '3 visites guidées : Soho Square, Naama Bay, Souk El Kadim',
    'Sans visa'
  ],
  ARRAY[
    'Baignade avec les dauphins',
    'Sortie bateau avec plongée et déjeuner',
    'Sortie Quad',
    'Parachute ascensionnel',
    'Excursion Le Caire et Pyramides',
    'Croisière sur le Nil',
    'Dépenses personnelles'
  ],
  '[]'::jsonb,
  ARRAY['2026-07-29','2026-08-05','2026-08-12','2026-08-19','2026-08-26','2026-09-02']::date[],
  NULL, NULL, NULL, false
);
