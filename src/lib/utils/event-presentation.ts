import type { EventType, TribeEvent } from '$lib/types';

import type { MusicType } from '$lib/types';

const EVENT_TYPE_NAMES: Record<EventType, string> = {
	milonga: 'Milonga',
	practica: 'Practica',
	workshop: 'Workshop',
	kurs: 'Kurs'
};

const EVENT_TYPE_BADGE_CLASSES: Record<EventType, string> = {
	milonga: 'event-badge-milonga',
	practica: 'event-badge-practica',
	workshop: 'event-badge-workshop',
	kurs: 'event-badge-kurs'
};

const EVENT_TYPE_ACCENT_CLASSES: Record<EventType, string> = {
	milonga: 'event-accent-milonga',
	practica: 'event-accent-practica',
	workshop: 'event-accent-workshop',
	kurs: 'event-accent-kurs'
};

const EVENT_TYPE_FILTER_ACTIVE_CLASSES: Record<EventType, string> = {
	milonga: 'event-filter-active-milonga',
	practica: 'event-filter-active-practica',
	workshop: 'event-filter-active-workshop',
	kurs: 'event-filter-active-kurs'
};

const EVENT_TYPE_FILTER_INACTIVE_CLASSES: Record<EventType, string> = {
	milonga: 'event-filter-inactive-milonga',
	practica: 'event-filter-inactive-practica',
	workshop: 'event-filter-inactive-workshop',
	kurs: 'event-filter-inactive-kurs'
};

const MUSIC_TYPE_NAMES: Record<MusicType, string> = {
	traditional: 'Traditionell',
	mixed: '50%',
	neo: 'Neo'
};

const MUSIC_TYPE_BADGE_CLASSES: Record<MusicType, string> = {
	traditional: 'music-badge-traditional',
	mixed: 'music-badge-mixed',
	neo: 'music-badge-neo'
};

const MUSIC_TYPE_FILTER_ACTIVE_CLASSES: Record<MusicType, string> = {
	traditional: 'music-filter-active-traditional',
	mixed: 'music-filter-active-mixed',
	neo: 'music-filter-active-neo'
};

const MUSIC_TYPE_FILTER_INACTIVE_CLASSES: Record<MusicType, string> = {
	traditional: 'music-filter-inactive-traditional',
	mixed: 'music-filter-inactive-mixed',
	neo: 'music-filter-inactive-neo'
};

const EVENT_TYPE_SLUGS: Record<EventType, string> = {
	milonga: 'typ_milonga',
	practica: 'typ_practica',
	workshop: 'typ_workshop',
	kurs: 'typ_kurs'
};

const MUSIC_TYPE_SLUGS: Record<MusicType, string> = {
	traditional: 'musik_traditionell',
	mixed: 'musik_gemischt',
	neo: 'musik_neo-oder-non'
};

function hasCategorySlug(event: TribeEvent, slug: string): boolean {
	return event.categories?.some((category) => category.slug === slug) ?? false;
}

export function getEventType(event: TribeEvent): EventType | null {
	if (hasCategorySlug(event, EVENT_TYPE_SLUGS.milonga)) return 'milonga';
	if (hasCategorySlug(event, EVENT_TYPE_SLUGS.practica)) return 'practica';
	if (hasCategorySlug(event, EVENT_TYPE_SLUGS.workshop)) return 'workshop';
	if (hasCategorySlug(event, EVENT_TYPE_SLUGS.kurs)) return 'kurs';

	return null;
}

export function getEventTypeLabel(event: TribeEvent): string | null {
	const eventType = getEventType(event);
	return eventType ? EVENT_TYPE_NAMES[eventType] : null;
}

export function getEventTypeBadgeClass(event: TribeEvent): string {
	const eventType = getEventType(event);
	return eventType ? EVENT_TYPE_BADGE_CLASSES[eventType] : 'event-badge-default';
}

export function getEventAccentClass(event: TribeEvent): string {
	const eventType = getEventType(event);
	return eventType ? EVENT_TYPE_ACCENT_CLASSES[eventType] : 'bg-border-strong';
}

export function getEventTypeFilterClass(type: EventType, active: boolean): string {
	return active ? EVENT_TYPE_FILTER_ACTIVE_CLASSES[type] : EVENT_TYPE_FILTER_INACTIVE_CLASSES[type];
}

export function getMusicType(event: TribeEvent): MusicType | null {
	if (hasCategorySlug(event, MUSIC_TYPE_SLUGS.traditional)) return 'traditional';
	if (hasCategorySlug(event, MUSIC_TYPE_SLUGS.mixed)) return 'mixed';
	if (hasCategorySlug(event, MUSIC_TYPE_SLUGS.neo)) return 'neo';

	return null;
}

export function getMusicLabel(music: MusicType): string {
	return MUSIC_TYPE_NAMES[music];
}

export function getEventMusicLabel(event: TribeEvent): string | null {
	const musicType = getMusicType(event);
	return musicType ? MUSIC_TYPE_NAMES[musicType] : null;
}

export function getEventMusicBadgeClass(event: TribeEvent): string {
	const musicType = getMusicType(event);
	return musicType ? MUSIC_TYPE_BADGE_CLASSES[musicType] : 'music-badge-default';
}

export function getMusicFilterClass(music: MusicType, active: boolean): string {
	return active ? MUSIC_TYPE_FILTER_ACTIVE_CLASSES[music] : MUSIC_TYPE_FILTER_INACTIVE_CLASSES[music];
}