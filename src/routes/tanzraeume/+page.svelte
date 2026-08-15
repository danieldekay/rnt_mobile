<script lang="ts">
	import { resolve } from '$app/paths';
	import { navigating } from '$app/state';
	import DateFilterChips from '$lib/components/DateFilterChips.svelte';
	import VenueCard from '$lib/components/VenueCard.svelte';
	import {
		countEntitiesForDateFilters,
		getDateFilterLabel,
		type EntityDateFilter
	} from '$lib/utils/date-filters';
	import type { PageProps } from './$types';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { mapHubPageSeo } from '$lib/seo/pages';

	const seo = mapHubPageSeo('tanzraeume');
	import type { EnhancedVenue } from '$lib/types';
	import {
		normalizeCity,
		normalizeText,
		normalizeForSearch,
		getWebsiteUrl,
		getWebsiteHost,
		getAddressCore,
		isRelatedVenue,
		buildRelatedVenueLabel,
		toEnhancedVenue,
	} from '$lib/utils/venue-presentation';

	type VenueRecord = PageProps['data']['venues'][number];

	type VenueViewModel = VenueRecord & {
		cityLabel: string;
		addressLine: string;
		websiteUrl: string | null;
		websiteHost: string | null;
		addressCore: string | null;
		relatedVenueCount: number;
		relatedVenueLabel: string | null;
		searchIndex: string;
	};

	let { data }: PageProps = $props();
	let activeCity = $state('');
	let searchQuery = $state('');
	let activeDateFilter = $state<EntityDateFilter>('current-month');
	let onlyWithEvents = $state(true);

	// Show ALL venues, sorted: those with events first, then others
	const allVenues = $derived.by(() => buildVenueViewModels(data.venues));

	// Sort: venues with events (nextEvents.length > 0) first, then by city
	const venues = $derived.by(() => 
		[...allVenues].sort((left, right) => {
			// First by whether they have next events
			const leftHasEvents = (left.nextEvents?.length ?? 0) > 0;
			const rightHasEvents = (right.nextEvents?.length ?? 0) > 0;
			if (leftHasEvents !== rightHasEvents) {
				return rightHasEvents ? 1 : -1; // Events first
			}
			// Then by city
			return left.cityLabel.localeCompare(right.cityLabel, 'de');
		})
	);

	const venuesWithEvents = $derived.by(() => 
		venues.filter((venue) => (venue.nextEvents?.length ?? 0) > 0)
	);

	const cityOptions = $derived.by(() => {
		const counts: Record<string, number> = {};
		const sourceForCities = onlyWithEvents ? venuesWithEvents : venues;

		for (const venue of sourceForCities) {
			if (venue.cityLabel === 'Unbekannt') continue;
			counts[venue.cityLabel] = (counts[venue.cityLabel] ?? 0) + 1;
		}

		return Object.entries(counts)
			.sort(([left], [right]) => left.localeCompare(right, 'de'))
			.map(([city, count]) => ({ city, count }));
	});

	const filteredVenues = $derived.by(() => {
		const normalizedQuery = normalizeForSearch(searchQuery);
		const sourceVenues = onlyWithEvents ? venuesWithEvents : venues;

		return sourceVenues.filter((venue) => {
			const matchesCity = activeCity.length === 0 || venue.cityLabel === activeCity;
			const matchesSearch = normalizedQuery.length === 0 || venue.searchIndex.includes(normalizedQuery);

			return matchesCity && matchesSearch;
		});
	});

	const visibleCount = $derived(filteredVenues.length);
	const totalCount = $derived(onlyWithEvents ? venuesWithEvents.length : venues.length);
	const dateFilterCounts = $derived.by(() => countEntitiesForDateFilters(venues, (venue) => venue.countsByDateFilter || {}));
	const hasActiveFilters = $derived(activeCity.length > 0 || searchQuery.trim().length > 0 || activeDateFilter !== 'current-month' || !onlyWithEvents);
	const hasRelatedEntries = $derived(filteredVenues.some((venue) => venue.relatedVenueCount > 0));
	const showLoading = $derived(
		Boolean(navigating.to && navigating.to.url.pathname === resolve('/tanzraeume') && !data.loadError && venues.length === 0)
	);

	function buildVenueViewModels(source: VenueRecord[]): VenueViewModel[] {
		const baseVenues = source.map((venue) => {
			const cityLabel = normalizeCity(venue.city);
			const addressLine = normalizeText(venue.address) || 'Adresse nicht hinterlegt';
			const websiteUrl = getWebsiteUrl(venue.website);
			const websiteHost = getWebsiteHost(websiteUrl);
			const searchIndex = normalizeForSearch([venue.venue, venue.address, cityLabel, websiteHost ?? ''].join(' '));

			return {
				...venue,
				cityLabel,
				addressLine,
				websiteUrl,
				websiteHost,
				addressCore: getAddressCore(venue.address),
				relatedVenueCount: 0,
				relatedVenueLabel: null,
				searchIndex
			};
		});

		return baseVenues.map((venue) => {
			const relatedVenues = baseVenues.filter((candidate) => isRelatedVenue(venue, candidate));
			const sharesWebsite = relatedVenues.some(
				(candidate) => venue.websiteHost !== null && candidate.websiteHost === venue.websiteHost
			);
			const sharesAddress = relatedVenues.some(
				(candidate) => venue.addressCore !== null && candidate.addressCore === venue.addressCore
			);

			return {
				...venue,
				relatedVenueCount: relatedVenues.length,
				relatedVenueLabel: buildRelatedVenueLabel(
					relatedVenues.length,
					sharesWebsite,
					sharesAddress,
					venue.cityLabel
				)
			};
		});
	}

	function resetFilters(): void {
		activeDateFilter = 'current-month';
		activeCity = '';
		searchQuery = '';
		onlyWithEvents = true;
	}
</script>

<SeoHead {seo} />

{#snippet filterToolbar()}
	<section class="card space-y-4 p-4">
		<div class="grid gap-3 lg:grid-cols-[minmax(0,1.7fr)_minmax(14rem,0.9fr)_auto] lg:items-end">
			<label class="block min-w-0">
				<span class="mb-1.5 block text-sm font-medium text-text-default">Suche</span>
				<input
					type="search"
					bind:value={searchQuery}
					placeholder="Nach Ort, Stadt, Straße oder Website suchen"
					enterkeyhint="search"
					autocomplete="off"
					spellcheck={false}
					class="min-h-11 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors placeholder:text-text-muted focus:border-action-primary focus-visible:ring-4 focus-visible:ring-focus-ring/35"
				/>
			</label>

			<label class="block min-w-0">
				<span class="mb-1.5 block text-sm font-medium text-text-default">Stadt</span>
				<select
					bind:value={activeCity}
					class="min-h-11 w-full rounded-control border border-border-default bg-surface-card px-4 py-2 text-[0.95rem] text-text-default outline-none transition-colors focus:border-action-primary focus-visible:ring-4 focus-visible:ring-focus-ring/35"
				>
					<option value="">Alle Städte</option>
					{#each cityOptions as option (option.city)}
						<option value={option.city}>{option.city} ({option.count})</option>
					{/each}
				</select>
			</label>

			<button
				type="button"
				onclick={resetFilters}
				disabled={!hasActiveFilters}
				class="inline-flex min-h-11 items-center justify-center rounded-control border border-border-default bg-surface-subtle px-4 py-2 text-[0.95rem] font-medium text-text-default transition-colors enabled:hover:bg-action-secondary disabled:cursor-not-allowed disabled:opacity-55"
			>
				Zurücksetzen
			</button>
		</div>

		<DateFilterChips bind:value={activeDateFilter} counts={dateFilterCounts} />

		<div class="flex flex-wrap items-center gap-4 border-t border-border-default pt-3">
			<label class="flex items-center gap-2">
				<input
					type="checkbox"
					bind:checked={onlyWithEvents}
					class="h-4 w-4 rounded border-border-default text-action-primary focus:ring-action-primary"
				/>
				<span class="text-sm font-medium text-text-default">Nur mit Termine</span>
			</label>
		</div>

		<div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
			<p class="text-sm font-medium text-text-default">{visibleCount} von {totalCount} Tanzräumen</p>
			<p class="meta-text">
				Zeitraum: {getDateFilterLabel(activeDateFilter)}. Suche durchsucht Namen, Stadt, Adresse und Website.
				{#if activeCity}
					Aktive Stadt: {activeCity}.
				{/if}
				{#if hasRelatedEntries}
					Ähnliche Einträge bleiben separat markiert.
				{/if}
			</p>
		</div>
	</section>
{/snippet}

<div class="space-y-4">
	<div class="space-y-4">
		<section class="space-y-3">
			<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Orte in der Region</p>
			<h1 class="font-display text-[2rem] font-semibold text-text-default">Tanzräume</h1>
			<p class="meta-text max-w-[58ch]">
				Alle wichtigen Tango-Locations im Rhein-Neckar-Gebiet. Sortiert nach Stadt, zuerst Orte mit bevorstehenden Terminen.
			</p>
		</section>

		{@render filterToolbar()}

	{#if showLoading}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3" role="status" aria-live="polite">
			{#each Array.from({ length: 4 }) as _, index (index)}
				<article class="card space-y-3 p-4 animate-pulse">
					<div class="h-5 w-2/3 rounded bg-surface-subtle"></div>
					<div class="h-4 w-1/3 rounded bg-surface-subtle"></div>
					<div class="h-4 w-full rounded bg-surface-subtle"></div>
					<div class="h-4 w-1/2 rounded bg-surface-subtle"></div>
				</article>
			{/each}
		</div>
	{:else if data.loadError}
		<section class="card space-y-2 p-6 text-center" role="alert">
			<p class="text-[1rem] font-semibold text-text-default">Tanzräume konnten nicht geladen werden</p>
			<p class="meta-text">Bitte versuche es später erneut.</p>
		</section>
	{:else}
		<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
			{#each filteredVenues as venue (venue.id)}
				{@const enhancedVenue = toEnhancedVenue(venue, venue.nextEvents)}
				<VenueCard venue={enhancedVenue} nextEvents={venue.nextEvents} responsive={true} />
			{/each}
		</div>
		{/if}
	</div>
</div>