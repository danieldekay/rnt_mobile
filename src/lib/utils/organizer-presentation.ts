/**
 * Organizer presentation helpers – extracted from veranstalter/+page.svelte
 */

import type { OrganizerWithStats } from "$lib/types";

export function resetOrganizerFilters(
	activeCity: string,
	searchQuery: string,
	activeDateFilter: string,
): boolean {
	return (
		activeCity.length > 0 ||
		searchQuery.trim().length > 0 ||
		activeDateFilter !== "current-month"
	);
}

export function formatUpcomingBadge(upcomingCount: number): string {
	if (upcomingCount <= 0) return "Keine Termine";
	if (upcomingCount === 1) return "1 Termin";
	return `${upcomingCount} Termine`;
}

export function getCityOptions(
	organizers: OrganizerWithStats[],
): { city: string; count: number }[] {
	const counts: Record<string, number> = {};

	for (const organizer of organizers) {
		if (organizer.cityLabel === "Unbekannt") continue;
		counts[organizer.cityLabel] = (counts[organizer.cityLabel] ?? 0) + 1;
	}

	return Object.entries(counts)
		.sort(([left], [right]) => left.localeCompare(right, "de"))
		.map(([city, count]) => ({ city, count }));
}

export function filterOrganizersBySearch(
	organizers: OrganizerWithStats[],
	query: string,
): OrganizerWithStats[] {
	if (!query.trim()) return organizers;

	const normalizedQuery = query.trim().toLocaleLowerCase("de");

	return organizers.filter((organizer) => {
		const matchesSearch =
			organizer.organizer.toLocaleLowerCase("de").includes(normalizedQuery) ||
			organizer.cityLabel.toLocaleLowerCase("de").includes(normalizedQuery) ||
			organizer.website.toLocaleLowerCase("de").includes(normalizedQuery);
		return matchesSearch;
	});
}

export function filterOrganizersByCity(
	organizers: OrganizerWithStats[],
	city: string,
): OrganizerWithStats[] {
	if (!city) return organizers;
	return organizers.filter((o) => o.cityLabel === city);
}
