# Spécifications du Projet Conquête (Phase 1)

Ce document sert de source absolue de vérité pour la conception et le développement du site vitrine et du backoffice de l'agence de voyages **Conquête**.

## 1. Les 5 Fonctionnalités Clés
1.  **Section Hero Immersive & Widget de Recherche** :
    *   Un Hero haut de gamme avec une typographie soignée et des animations fluides.
    *   Un widget de recherche rapide à 4 onglets : *Billetterie Express*, *Séjours Organisés*, *Réservation Hôtels* et *Voyage à la Carte*.
2.  **Pôle Tourisme International** :
    *   Grille de cartes premium pour les packages multi-destinations.
    *   Tiroir/Modale interactive avec itinéraire jour par jour, inclusions/exclusions, et calculateur dynamique de tarif (Adulte / Enfant).
    *   Formulaire d'étape pour les demandes de voyage à la carte (Sur-mesure).
3.  **Pôle Tourisme Religieux (Omra & Hadj)** :
    *   Catalogue d'offres Omra triées par saisons (Ramadan, Mawlid, etc.).
    *   Calendrier des départs fixes.
    *   Indicateurs de proximité du Haram (ex: "150m"), encadrement, et pack de bienvenue.
4.  **Persistance Supabase** :
    *   Toutes les offres/packages sont chargés dynamiquement depuis la base de données.
    *   Tous les formulaires soumettent des leads qui sont insérés directement dans Supabase.
5.  **Backoffice Agent (CRUD & Gestion)** :
    *   Accès discret ou via `#admin` à un tableau de bord.
    *   Gestion des prospects (leads) : Affichage, changement de statut, suppression, export CSV.
    *   Gestion des offres (packages) : Création, modification, suppression complète avec gestion d'itinéraires et métadonnées.

## 2. Les 4 Contraintes Techniques et Architecturales
1.  **Identité Visuelle** : Charte graphique **Bleu & Blanc** premium. Utilisation de bleus profonds, blancs purs et d'un accent bleu électrique/glacier. Pas de design générique ou "AI-slop". Polices : *Playfair Display* (titres) & *Plus Jakarta Sans* (corps).
2.  **Technologies** : HTML5 sémantique, CSS3 (variables CSS, flexbox/grid, animations) et Vanilla JS (sans framework ni Tailwind) sous forme de Single Page Application (SPA) réactive.
3.  **Base de données** : Connexion directe via `@supabase/supabase-js` (CDN). RLS désactivé pour la Phase 1 (prototype de démonstration).
4.  **Gestion des Médias** : Gestion des images par URL uniquement (pas d'upload de fichiers locaux pour simplifier la Phase 1).

## 3. Les 3 Personas Utilisateurs
1.  **Le Voyageur International** : Souhaite un devis rapide ou recherche des circuits clés en main originaux.
2.  **Le Pèlerin Omra** : Souhaite un encadrement sérieux, des dates fixes claires et des hôtels proches du Haram.
3.  **L'Agent de l'Agence** : Souhaite consulter les leads reçus pour les recontacter et mettre à jour le catalogue des offres.

## 4. Les 2 Anti-Objectifs (Hors-scope)
1.  **Aucun Paiement en Ligne** : Les tarifs calculés sont des estimations de devis. Pas d'intégration Stripe ou bancaire.
2.  **Pas d'Espace Client Authentifié** : Les utilisateurs finaux ne créent pas de compte. Seul le backoffice est une interface de gestion interne.

## 5. La Métrique de Succès Suprême
*   **Synchronisation et Capture Bidirectionnelle Instantanée** : Une soumission de formulaire par un client génère instantanément un lead visible dans le Backoffice, et une modification d'offre dans le Backoffice se répercute immédiatement sur le site vitrine.
