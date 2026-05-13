import {
	EVENT_TYPE_NAMES,
	EVENT_TYPE_BADGE_CLASSES,
	EVENT_TYPE_ACCENT_CLASSES,
	EVENT_TYPE_FILTER_ACTIVE_CLASSES,
	EVENT_TYPE_FILTER_INACTIVE_CLASSES,
	EVENT_TYPE_SLUGS,
	MUSIC_SLUGS,
	MUSIC_TYPE_NAMES,
	MUSIC_TYPE_BADGE_CLASSES,
	MUSIC_TYPE_FILTER_ACTIVE_CLASSES,
	MUSIC_TYPE_FILTER_INACTIVE_CLASSES
} from '$lib/constants';
import type { EventType, MusicType, TribeEvent } from '$lib/types';

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
	if (hasCategorySlug(event, MUSIC_SLUGS.traditional)) return 'traditional';
	if (hasCategorySlug(event, MUSIC_SLUGS.mixed)) return 'mixed';
	if (hasCategorySlug(event, MUSIC_SLUGS.neo)) return 'neo';

	return null;
}

export function getMusicLabel(music: MusicType): string {
	return MUSIC_TYPE_NAMES[music] ?? '';
}

export function getEventMusicLabel(event: TribeEvent): string | null {
	const musicType = getMusicType(event);
	return musicType ? MUSIC_TYPE_NAMES[musicType] ?? null : null;
}

export function getEventMusicBadgeClass(event: TribeEvent): string {
	const musicType = getMusicType(event);
	return musicType ? MUSIC_TYPE_BADGE_CLASSES[musicType] ?? 'music-badge-default' : 'music-badge-default';
}

export function getMusicFilterClass(music: MusicType, active: boolean): string {
	return active ? MUSIC_TYPE_FILTER_ACTIVE_CLASSES[music] ?? '' : MUSIC_TYPE_FILTER_INACTIVE_CLASSES[music] ?? '';
}
