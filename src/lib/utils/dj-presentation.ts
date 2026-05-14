/**
 * DJ presentation helpers – extracted from djs/+page.svelte
 */

import type { DjProfileSummary, DjStyleKey, EntityDateFilter } from "$lib/types";
import { MUSIC_TYPE_NAMES, MUSIC_TYPE_BADGE_CLASSES } from "$lib/constants";

export function getInitials(name: string): string {
	const words = name
		.split(/\s+/)
		.map((value) => value.trim())
		.filter((value) => value.length > 0);

	if (words.length === 0) return "DJ";
	if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
	return `${words[0][0]}${words[1][0]}`.toUpperCase();
}

export function getStyleLabel(style: DjStyleKey): string {
	const styleLabels: Record<DjStyleKey, string> = {
		traditional: "Traditionell",
		neo: "Neo",
		"fifty-fifty": "50/50",
		mixed: "Gemischt",
	};
	return styleLabels[style] ?? "Gemischt";
}

export function getAvatarTone(style: DjStyleKey): string {
	switch (style) {
		case "traditional":
			return "border-dj-traditional/25 bg-dj-traditional/15 text-dj-traditional";
		case "neo":
			return "border-dj-neo/20 bg-dj-neo/15 text-dj-neo";
		case "fifty-fifty":
			return "border-dj-fifty-fifty/20 bg-dj-fifty-fifty/15 text-dj-fifty-fifty";
		default:
			return "border-border-default bg-surface-subtle text-text-default";
	}
}

export function getNextEventMeta(dj: DjProfileSummary, activeDateFilter: EntityDateFilter): string {
	const nextEvent = dj.nextEventsByDateFilter[activeDateFilter] ?? dj.nextEventsByDateFilter.all;
	if (!nextEvent) return "Kein Termin im Zeitraum";
	return nextEvent.city
		? `${nextEvent.dateLabel} · ${nextEvent.city}`
		: nextEvent.dateLabel;
}

export function getUpcomingCount(dj: DjProfileSummary, activeDateFilter: EntityDateFilter): number {
	return dj.countsByDateFilter[activeDateFilter] ?? 0;
}

export function getNextEvent(dj: DjProfileSummary, activeDateFilter: EntityDateFilter) {
	return (
		dj.nextEventsByDateFilter[activeDateFilter] ??
		dj.nextEventsByDateFilter.all ??
		null
	);
}

export function getMusicBadge(dj: DjProfileSummary) {
	return {
		label: MUSIC_TYPE_NAMES[dj.style as keyof typeof MUSIC_TYPE_NAMES]?.charAt(0) ?? "",
		classes: MUSIC_TYPE_BADGE_CLASSES[dj.style as keyof typeof MUSIC_TYPE_BADGE_CLASSES] ?? "",
	};
}
