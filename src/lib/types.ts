export interface TribeEvent {
  id: number;
  title: string;
  description: string;
  excerpt: string;
  slug: string;
  url: string;
  image: EventImage;
  all_day: boolean;
  start_date: string;
  end_date: string;
  start_date_details: DateDetails;
  end_date_details: DateDetails;
  timezone: string;
  timezone_abbr: string;
  cost: string;
  cost_details: CostDetails;
  categories: Category[];
  venue: Venue | null;
  organizer: Organizer[];
  featured: boolean;
  sticky: boolean;
}

export type EventImage =
  | string
  | false
  | {
      url?: string;
      sizes?: {
        thumbnail?: { url?: string };
        medium?: { url?: string };
        medium_large?: { url?: string };
      };
    };

export interface DateDetails {
  year: string;
  month: string;
  day: string;
  hour: string;
  minutes: string;
  seconds: string;
}

export interface CostDetails {
  currency_symbol: string;
  currency_code: string;
  currency_position: string;
  values: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  count: number;
}

export interface Venue {
  id: number;
  venue: string;
  address: string;
  city: string;
  province: string;
  zip: string;
  country: string;
  geo_lat: number;
  geo_lng: number;
  website: string;
  phone: string;
}

export interface Organizer {
  id: number;
  organizer: string;
  slug: string;
  url: string;
  website: string;
  email: string;
  description?: string;
}

export interface TribeOrganizer {
  id: number;
  organizer: string;
  slug: string;
  url: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  image: string | false;
}

export interface TribeVenue {
  id: number;
  venue: string;
  address: string;
  city: string;
  geo_lat: number | null;
  geo_lng: number | null;
  website: string;
}

export interface EventsResponse {
  events: TribeEvent[];
  total: number;
  total_pages: number;
  rest_url: string;
  next_rest_url: string;
}

export interface BlogPost {
  id: number;
  date: string;
  modified?: string;
  slug: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  content?: { rendered: string };
  link: string;
  categories: number[];
  meta?: {
    rnt_termin?: string | null;
    rnt_veranstalter?: number | string | null;
    rnt_url?: string | null;
  };
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url?: string;
      alt_text?: string;
    }>;
    "wp:term"?: Array<
      Array<{
        id?: number;
        name?: string;
        taxonomy?: string;
      }>
    >;
  };
}

export interface DjCptEntry {
  id: number;
  slug: string;
  name: string;
  meta_box?: DjMetaBox;
}

export interface DjMetaBox {
  rnt_vorname?: string;
  rnt_nachname?: string;
  rnt_spitzname?: string;
  rnt_stadt?: string;
  rnt_stil?: "traditionell" | "non/neo" | "gemischt";
  dj_image?: {
    url?: string;
    sizes?: Record<string, { url?: string }>;
  };
  rnt_biografie?: string;
}

export type EventType = "milonga" | "practica" | "workshop" | "kurs";
export type MusicType = "traditional" | "mixed" | "neo";
export type DateFilter = "today" | "week" | "month" | "all";
export type EntityDateFilter =
  | "all"
  | "next-7-days"
  | "current-month"
  | "next-3-months";

export interface Filters {
  types: EventType[];
  music: MusicType | null;
  date: DateFilter;
}

export type DateFilterCounts = Record<EntityDateFilter, number>;

export type DjStyleKey = "traditional" | "neo" | "fifty-fifty" | "mixed";

export interface DjStyleCounts {
  traditional: number;
  mixed: number;
  neo: number;
}

export interface DjNextEventSummary {
  internalPath: `/event/${number}` | null;
  externalUrl: string | null;
  title: string;
  dateLabel: string;
  city: string;
}

export interface DjProfileSummary {
  id: string;
  slug: string;
  name: string;
  image: string | false;
  bio?: string;
  city?: string;
  stylePreference?: "traditionell" | "non/neo" | "gemischt";
  upcomingCount: number;
  style: DjStyleKey;
  styleCounts: DjStyleCounts;
  nextEventInternalPath: `/event/${number}` | null;
  nextEventExternalUrl: string | null;
  nextEventTitle: string;
  nextEventDateLabel: string;
  nextEventCity: string;
  countsByDateFilter: DateFilterCounts;
  nextEvents?: DjNextEventSummary[];
  nextEventsByDateFilter: Partial<Record<EntityDateFilter, DjNextEventSummary>>;
  searchText: string;
}

export interface OrganizerWithStats extends TribeOrganizer {
  upcomingCount: number;
  cityLabel: string;
  countsByDateFilter: DateFilterCounts;
  nextEvents?: DjNextEventSummary[];
}

export interface CategoryStat {
  id: number;
  name: string;
  count: number;
}

export interface FeaturedMedia {
  source_url?: string;
  alt_text?: string;
}

// Organizer next event summary - mirrors DjNextEventSummary for consistency
export interface OrganizerNextEventSummary {
  internalPath: `/event/${number}` | null;
  externalUrl: string | null;
  title: string;
  dateLabel: string;
  city: string;
}

// Venue next event summary - simpler version for venue cards
export interface VenueNextEventSummary {
  internalPath: `/event/${number}` | null;
  externalUrl: string | null;
  title: string;
  dateLabel: string;
  city: string;
}

// Enhanced organizer interface with additional metadata
export interface EnhancedOrganizer extends TribeOrganizer {
  // Social media links
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
    soundcloud?: string;
    website?: string;
  };

  // Additional contact information
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };

  // Organizer details
  details?: {
    establishedYear?: number;
    organizationType?: 'verein' | 'privat' | 'geschaeft' | 'kuenstler' | 'other';
    description?: string;
    tags?: string[];
    keywords?: string[];
  };

  // Media assets
  media?: {
    logo?: string;
    banner?: string;
    gallery?: string[];
    featuredImage?: string;
  };

  // Event statistics
  stats?: {
    totalEvents?: number;
    upcomingEvents?: number;
    pastEvents?: number;
    eventsThisMonth?: number;
    eventsThisYear?: number;
    averageAttendance?: number;
  };

  // Specializations
  specializations?: {
    musicStyles?: string[];
    eventTypes?: string[];
    targetAudience?: string[];
  };

  // Verification status
  verification?: {
    isVerified?: boolean;
    verifiedDate?: string;
    verificationLevel?: 'basic' | 'premium' | 'trusted';
  };

  // Additional timestamps
  timestamps?: {
    createdAt?: string;
    updatedAt?: string;
    lastEventDate?: string;
    nextEventDate?: string;
  };
}

// Enhanced venue interface with additional metadata
export interface EnhancedVenue extends TribeVenue {
  // Detailed location information
  location?: {
    address?: string;
    city?: string;
    postalCode?: string;
    region?: string;
    country?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // Venue facilities and features
  facilities?: {
    capacity?: number;
    indoor?: boolean;
    outdoor?: boolean;
    airConditioning?: boolean;
    heating?: boolean;
    parking?: boolean;
    wheelchairAccessible?: boolean;
    restaurant?: boolean;
    bar?: boolean;
    stage?: boolean;
    danceFloor?: boolean;
    soundSystem?: boolean;
    lighting?: boolean;
  };

  // Contact information
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
    bookingEmail?: string;
    boxOfficePhone?: string;
  };

  // Social media and links
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
    googleMaps?: string;
  };

  // Media assets
  media?: {
    logo?: string;
    heroImage?: string;
    gallery?: string[];
    floorPlan?: string;
    virtualTour?: string;
  };

  // Event information
  nextEvent?: VenueNextEventSummary;
  upcomingCount?: number;

  // Operating hours
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    holidays?: string;
  };

  // Additional details
  details?: {
    description?: string;
    history?: string;
    awards?: string[];
    partners?: string[];
    tags?: string[];
    keywords?: string[];
  };

  // Accessibility information
  accessibility?: {
    wheelchairAccessible?: boolean;
    accessibleParking?: boolean;
    accessibleEntrance?: boolean;
    accessibleRestrooms?: boolean;
    hearingAssistance?: boolean;
    visualAssistance?: boolean;
  };

  // Pricing and booking
  pricing?: {
    entryFee?: string;
    happyHour?: string;
    bottleService?: boolean;
    privateEvents?: boolean;
    rentalInfo?: {
      minimumHours?: number;
      rentalRate?: string;
      includes?: string[];
    };
  };

  // Verification status
  verification?: {
    isVerified?: boolean;
    verifiedDate?: string;
    verificationLevel?: 'basic' | 'premium' | 'trusted';
  };

  // Additional timestamps
  timestamps?: {
    createdAt?: string;
    updatedAt?: string;
    lastEventDate?: string;
    nextEventDate?: string;
  };
}
