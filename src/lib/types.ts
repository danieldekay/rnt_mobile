export interface TribeEvent {
	id: number;
	title: string;
	description: string;
	excerpt: string;
	slug: string;
	url: string;
	image: string | false;
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
	website: string;
	email: string;
	description?: string;
}

export interface EventsResponse {
	events: TribeEvent[];
	total: number;
	total_pages: number;
	rest_url: string;
	next_rest_url: string;
}

export type EventType = 'milonga' | 'practica' | 'workshop' | 'kurs';
export type MusicType = 'traditional' | 'mixed' | 'neo';
export type DateFilter = 'today' | 'week' | 'month' | 'all';

export interface Filters {
	types: EventType[];
	music: MusicType | null;
	date: DateFilter;
}
