export interface ItineraryDay {
  day: number;
  title: string;
  desc: string;
}

export interface Package {
  id: string;
  created_at: string;
  title: string;
  description: string;
  image_url: string;
  type: 'international' | 'omra';
  destinations: string;
  duration: string;
  price_adult: number;
  price_child: number;
  itinerary: ItineraryDay[];
  included: string[];
  excluded: string[];
  season?: 'Ramadan' | 'Mawlid' | 'Automne' | 'Hiver' | null;
  departure_dates?: string[] | null;
  hotel_proximity?: string | null;
  accompaniment?: string | null;
  is_signature?: boolean;
}

export interface Lead {
  id: string;
  created_at: string;
  type: 'billetterie' | 'hotel' | 'package' | 'sur_mesure';
  name: string;
  email: string;
  phone: string;
  status: 'Nouveau' | 'En cours' | 'Traité';
  details: {
    departure?: string;
    destination?: string;
    date_departure?: string;
    date_return?: string;
    luggage?: string;
    transfer?: boolean;
    flex_dates?: boolean;
    flight_class?: string;
    city?: string;
    room_type?: string;
    date_checkin?: string;
    date_checkout?: string;
    package_id?: string;
    package_title?: string;
    adults?: number;
    children?: number;
    total_price?: number;
    preferred_date?: string;
    destinations?: string;
    duration?: string;
    profile?: string;
    passengers?: number;
    budget?: string;
    notes?: string;
  };
}
