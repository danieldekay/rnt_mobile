import type { EventType, MusicType } from "$lib/types";

export const EVENT_TYPE_SLUGS: Record<EventType, string> = {
	milonga: "typ_milonga",
	practica: "typ_practica",
	workshop: "typ_workshop",
	kurs: "typ_kurs",
};

export const MUSIC_SLUGS: Record<MusicType, string> = {
	traditional: "musik_traditionell",
	mixed: "musik_gemischt",
	neo: "musik_neo-oder-non",
};

export const EVENT_TYPE_NAMES: Record<EventType, string> = {
	milonga: "Milonga",
	practica: "Practica",
	workshop: "Workshop",
	kurs: "Kurs",
};

export const EVENT_TYPE_BADGE_CLASSES: Record<EventType, string> = {
	milonga: "event-badge-milonga",
	practica: "event-badge-practica",
	workshop: "event-badge-workshop",
	kurs: "event-badge-kurs",
};

export const EVENT_TYPE_ACCENT_CLASSES: Record<EventType, string> = {
	milonga: "event-accent-milonga",
	practica: "event-accent-practica",
	workshop: "event-accent-workshop",
	kurs: "event-accent-kurs",
};

export const EVENT_TYPE_FILTER_ACTIVE_CLASSES: Record<EventType, string> = {
	milonga: "event-filter-active-milonga",
	practica: "event-filter-active-practica",
	workshop: "event-filter-active-workshop",
	kurs: "event-filter-active-kurs",
};

export const EVENT_TYPE_FILTER_INACTIVE_CLASSES: Record<EventType, string> = {
	milonga: "event-filter-inactive-milonga",
	practica: "event-filter-inactive-practica",
	workshop: "event-filter-inactive-workshop",
	kurs: "event-filter-inactive-kurs",
};

export const MUSIC_TYPE_NAMES: Record<MusicType, string> = {
	traditional: "Traditionell",
	mixed: "Gemischt",
	neo: "Neo",
};

export const MUSIC_TYPE_BADGE_CLASSES: Record<MusicType, string> = {
	traditional: "music-badge-traditional",
	mixed: "music-badge-mixed",
	neo: "music-badge-neo",
};

export const MUSIC_TYPE_FILTER_ACTIVE_CLASSES: Record<MusicType, string> = {
	traditional: "music-filter-active-traditional",
	mixed: "music-filter-active-mixed",
	neo: "music-filter-active-neo",
};

export const MUSIC_TYPE_FILTER_INACTIVE_CLASSES: Record<MusicType, string> = {
	traditional: "music-filter-inactive-traditional",
	mixed: "music-filter-inactive-mixed",
	neo: "music-filter-inactive-neo",
};
