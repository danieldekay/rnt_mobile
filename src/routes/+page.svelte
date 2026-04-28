<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import { formatEventCost } from '$lib/api/tribe';
	import ConsentPlaceholder from '$lib/components/ConsentPlaceholder.svelte';
	import { escapeHtml } from '$lib/utils/html';
	import { trackFeatureEvent } from '$lib/matomo';
	import { consentStore } from '$lib/stores/consent.svelte';
	import { eventStore } from '$lib/stores/events.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import MusicFilterChip from '$lib/components/MusicFilterChip.svelte';
	import DateFilter from '$lib/components/DateFilter.svelte';
	import type { EventType, MusicType, TribeEvent } from '$lib/types';
	import 'leaflet/dist/leaflet.css';

	const eventTypes: EventType[] = ['milonga', 'practica', 'workshop', 'kurs'];
	const musicTypes: MusicType[] = ['traditional', 'mixed', 'neo'];

	let showImages = $state(false);
	let showMap = $state(false);
	let mapContainer = $state<HTMLDivElement | null>(null);
	let map: any = null;
	let markerLayer: any = null;
	let leaflet: any = null;

	const eventsWithGeo = $derived(
		$eventStore.events.filter((e) => e.venue?.geo_lat && e.venue?.geo_lng)
	);
	const groupedEventsWithGeo = $derived.by(() => groupEventsByLocation(eventsWithGeo));
	const mapConsentGranted = $derived(consentStore.hasConsent('maps'));

	const searchCount = $derived($eventStore.events.length);
	const totalCount = $derived($eventStore.allEvents.length);
	const showInlineLoading = $derived($eventStore.loading && totalCount > 0);

	onMount(() => {
		eventStore.loadEvents();

		return () => {
			destroyMap();
		};
	});

	$effect(() => {
		if (showMap && mapConsentGranted && mapContainer && groupedEventsWithGeo.length > 0) {
			void ensureMap();
			return;
		}

		destroyMap();
	});

 	type GroupedMapEvents = {
		key: string;
		lat: number;
		lng: number;
		events: TribeEvent[];
		venueName: string;
	};

	function groupEventsByLocation(events: TribeEvent[]): GroupedMapEvents[] {
		const groups: Record<string, GroupedMapEvents> = {};

		for (const event of events) {
			if (!event.venue?.geo_lat || !event.venue?.geo_lng) {
				continue;
			}

			const key = `${event.venue.geo_lat}:${event.venue.geo_lng}`;
			const existing = groups[key];

			if (existing) {
				existing.events.push(event);
				continue;
			}

			groups[key] = {
				key,
				lat: event.venue.geo_lat,
				lng: event.venue.geo_lng,
				events: [event],
				venueName: event.venue.venue ?? ''
			};
		}

		return Object.values(groups);
	}

	function getPopupDate(event: TribeEvent): string {
		return format(parseISO(event.start_date), 'EEE, d. MMM', { locale: de });
	}

	function getPopupTime(event: TribeEvent): string {
		if (event.all_day) {
			return 'Ganztägig';
		}

		const start = format(parseISO(event.start_date), 'HH:mm');
		const end = format(parseISO(event.end_date), 'HH:mm');

		return end ? `${start} - ${end}` : start;
	}

	function buildPopupContent(group: GroupedMapEvents): string {
		const heading = escapeHtml(group.venueName || 'Veranstaltungen an diesem Ort');
		const items = group.events
			.map((event) => {
				const detailUrl = resolve(`/event/${event.id}`);
				const title = escapeHtml(event.title);
				const date = escapeHtml(getPopupDate(event));
				const time = escapeHtml(getPopupTime(event));
				const price = escapeHtml(formatEventCost(event.cost));

				return `<li class="map-popup__item"><a class="map-popup__title" href="${detailUrl}">${title}</a><div class="map-popup__meta">${date}</div><div class="map-popup__meta">${time}</div><div class="map-popup__meta">${price}</div></li>`;
			})
			.join('');

		return `<div class="map-popup"><p class="map-popup__heading">${heading}</p><ul class="map-popup__list">${items}</ul></div>`;
	}

	async function getLeaflet() {
		if (!leaflet) {
			leaflet = await import('leaflet');
		}

		return leaflet;
	}

	async function ensureMap() {
		const L = await getLeaflet();

		if (!map) {
			map = L.map(mapContainer!).setView([49.4, 8.6], 10);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
			}).addTo(map);
		}

		renderMarkers(L);
	}

	function createSingleMarkerIcon(L: any) {
		return L.divIcon({
			className: 'custom-marker',
			html: `<div style="background: #0ea5e9; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"><svg style="transform: rotate(45deg); width: 14px; height: 14px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg></div>`,
			iconSize: [28, 28],
			iconAnchor: [14, 28],
			popupAnchor: [0, -24]
		});
	}

	function createGroupMarkerIcon(L: any, count: number) {
		return L.divIcon({
			className: 'custom-marker custom-marker--group',
			html: `<div class="map-cluster-marker"><span>${count}</span></div>`,
			iconSize: [36, 36],
			iconAnchor: [18, 18],
			popupAnchor: [0, -18]
		});
	}

	function renderMarkers(L: any) {
		if (!map) {
			return;
		}

		markerLayer?.remove();

		const markers = groupedEventsWithGeo.map((group) => {
			const icon = group.events.length > 1 ? createGroupMarkerIcon(L, group.events.length) : createSingleMarkerIcon(L);

			return L.marker([group.lat, group.lng], { icon }).bindPopup(buildPopupContent(group));
		});

		markerLayer = L.featureGroup(markers).addTo(map);

		if (markers.length > 0) {
			map.fitBounds(markerLayer.getBounds().pad(0.1), { maxZoom: 13 });
		}
	}

	function destroyMap() {
		markerLayer?.remove();
		markerLayer = null;

		if (map) {
			map.remove();
			map = null;
		}
	}

	async function handleRefresh() {
		await eventStore.loadEvents(true);
	}

	function handleMapToggle() {
		showMap = !showMap;
		if (showMap) {
			trackFeatureEvent('home-map', 'open');
		}
	}

	function enableMaps() {
		consentStore.savePreferences({ maps: true });
		trackFeatureEvent('home-map', 'enable');
	}
</script>

<svelte:head>
	<title>RNT Kalender - Tango Events</title>
</svelte:head>

<div class="space-y-4">
	<section class="space-y-2">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Region Rhein-Neckar</p>
		<h2 class="font-display text-[2rem] font-semibold text-text-default">Nächste Veranstaltungen</h2>
		<p class="meta-text max-w-[36ch]">Datum, Ort und Format zuerst. Alles Wichtige bleibt auf dem Handy schnell lesbar.</p>
	</section>

	<!-- Filters -->
	<div class="space-y-3">
		<!-- Date filter -->
		<DateFilter 
			active={$eventStore.filters.date} 
			onchange={(date) => eventStore.setDateFilter(date)} 
		/>
		
		<!-- Search -->
		<div class="space-y-2">
			<label for="event-search" class="text-[0.9375rem] font-medium text-text-default">Suche</label>
			<div class="relative">
				<svg class="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
					<path d="M29,27.5859l-7.5521-7.5521a11.0177,11.0177,0,1,0-1.4141,1.4141L27.5859,29ZM4,13a9,9,0,1,1,9,9A9.01,9.01,0,0,1,4,13Z"></path>
				</svg>
			<input
				id="event-search"
				type="search"
				name="event-search"
				autocomplete="off"
				spellcheck={false}
				enterkeyhint="search"
				placeholder="Event, Ort oder DJ suchen…"
				value={$eventStore.searchQuery}
				oninput={(e) => eventStore.setSearchQuery(e.currentTarget.value)}
				class="field-input pl-12 pr-12"
			/>
				{#if $eventStore.searchQuery}
					<button
						onclick={() => eventStore.clearSearch()}
						class="absolute right-3 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-badge text-text-muted transition-colors hover:bg-action-secondary hover:text-text-default"
						aria-label="Suche leeren"
						type="button"
					>
						<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
							<path d="M17.4141 16 24 9.4141 22.5859 8 16 14.5859 9.4143 8 8 9.4141 14.5859 16 8 22.5859 9.4143 24 16 17.4141 22.5859 24 24 22.5859 17.4141 16z"></path>
						</svg>
					</button>
				{/if}
			</div>
		</div>
		{#if $eventStore.searchQuery && searchCount !== totalCount}
			<p class="meta-text" aria-live="polite">
				{searchCount} von {totalCount} Events
			</p>
		{/if}
		
		<!-- Type filters + toggles -->
		<div class="space-y-3">
			<p class="text-[0.9375rem] font-medium text-text-default">Filter und Ansicht</p>
			<div class="flex flex-wrap gap-2 items-center">
			{#each musicTypes as music (music)}
				<MusicFilterChip
					{music}
					active={$eventStore.filters.music === music}
					onclick={() => eventStore.toggleMusic(music)}
				/>
			{/each}
			</div>
			<div class="flex flex-wrap gap-2 items-center">
			{#each eventTypes as type (type)}
				<FilterChip
					{type}
					active={$eventStore.filters.types.includes(type)}
					onclick={() => eventStore.toggleType(type)}
				/>
			{/each}
			<div class="flex-1"></div>
			<button
				onclick={() => showImages = !showImages}
				class="inline-flex min-h-12 items-center gap-2 rounded-control border px-4 py-2 text-sm font-medium transition-colors {showImages ? 'border-border-accent bg-action-secondary text-text-default' : 'border-border-default bg-surface-card text-text-muted hover:bg-action-secondary hover:text-text-default'}"
				title={showImages ? 'Bilder ausblenden' : 'Bilder anzeigen'}
				aria-pressed={showImages}
				type="button"
			>
				<svg class="h-4 w-4" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
					<path d="M28,26H4a2.0023,2.0023,0,0,1-2-2V8A2.0023,2.0023,0,0,1,4,6H28a2.0023,2.0023,0,0,1,2,2V24A2.0023,2.0023,0,0,1,28,26ZM4,8V24H28.0012L28,8Z"></path>
					<path d="M8 12A2 2 0 1 0 10 14 2.0025 2.0025 0 0 0 8 12zM6 22l5-6 3 4 4-5 6 7H6z"></path>
				</svg>
				<span>Bilder</span>
			</button>
			<button
				onclick={handleMapToggle}
				class="inline-flex min-h-12 items-center gap-2 rounded-control border px-4 py-2 text-sm font-medium transition-colors {showMap ? 'border-border-accent bg-action-secondary text-text-default' : 'border-border-default bg-surface-card text-text-muted hover:bg-action-secondary hover:text-text-default'}"
				title={showMap ? 'Zur Liste' : 'Zur Karte'}
				aria-pressed={showMap}
				type="button"
			>
				{#if showMap}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				{:else}
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"></path>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
					</svg>
				{/if}
				<span>{showMap ? 'Liste' : 'Karte'}</span>
			</button>
			</div>
		</div>
	</div>

	{#if showInlineLoading}
		<div class="card flex items-center gap-3 p-3" role="status" aria-live="polite">
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-action-secondary border-t-action-primary"></div>
			<p class="meta-text">Aktualisiere Veranstaltungen…</p>
		</div>
	{/if}

	{#if showMap && $eventStore.events.length > 0}
		<div class="card overflow-hidden">
			{#if !mapConsentGranted}
				<ConsentPlaceholder
					title="Karte erst nach Zustimmung"
					description="Die Kartenansicht laedt externe OpenStreetMap-Kacheln. Aktiviere Karten nur, wenn du diese externen Anfragen zulassen willst."
					actionLabel="Karten aktivieren"
					onEnable={enableMaps}
				/>
			{:else if eventsWithGeo.length > 0}
				<div bind:this={mapContainer} class="h-[60vh] w-full"></div>
			{:else}
				<div class="flex h-[60vh] items-center justify-center bg-surface-subtle px-6 text-center text-text-muted">
					Keine Events mit Standortdaten
				</div>
			{/if}
		</div>
	{/if}

	<!-- Loading state -->
	{#if $eventStore.loading && $eventStore.events.length === 0}
		<div class="card flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
			<div class="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-action-secondary border-t-action-primary"></div>
			<p class="text-[1rem] font-medium text-text-default">Lade Veranstaltungen…</p>
		</div>
	{:else if $eventStore.error}
		<!-- Error state -->
		<div class="card space-y-3 p-5 text-center" role="alert">
			<p class="font-display text-[1.25rem] font-semibold text-text-default">Fehler beim Laden</p>
			<p class="meta-text">{$eventStore.error}</p>
			<button 
				onclick={handleRefresh}
				class="btn-primary"
				type="button"
			>
				Erneut versuchen
			</button>
		</div>
	{:else if $eventStore.events.length === 0}
		<!-- Empty state -->
		<div class="card p-8 text-center">
			<svg class="mx-auto mb-4 h-16 w-16 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
			</svg>
			<p class="text-[1rem] font-medium text-text-default">Keine Events gefunden</p>
			<p class="meta-text mt-1">Versuche andere Filtereinstellungen</p>
		</div>
	{:else}
		{#if !showMap}
		<!-- Event list -->
		<div class="relative">
			<div class="space-y-3">
				{#each $eventStore.events as event (event.id)}
					<EventCard {event} showImage={showImages} />
				{/each}
			</div>
			
			<!-- Refresh button -->
			<div class="mt-6 flex justify-center">
				<button 
					onclick={handleRefresh}
					disabled={$eventStore.loading}
					class="btn-secondary gap-2 disabled:opacity-50"
					type="button"
				>
					<svg class="h-4 w-4 {$eventStore.loading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
					{$eventStore.loading ? 'Lädt…' : 'Aktualisieren'}
				</button>
			</div>
		</div>
		{/if}
	{/if}
</div>

<style>
	:global(.map-cluster-marker) {
		display: flex;
		height: 36px;
		width: 36px;
		align-items: center;
		justify-content: center;
		border: 2px solid rgba(255, 255, 255, 0.95);
		border-radius: 999px;
		background: #0f766e;
		box-shadow: 0 3px 10px rgba(15, 23, 42, 0.28);
		color: #fff;
		font-size: 0.875rem;
		font-weight: 700;
	}

	:global(.map-popup) {
		min-width: 180px;
	}

	:global(.map-popup__heading) {
		margin: 0 0 0.5rem;
		font-size: 0.9375rem;
		font-weight: 700;
		color: #111827;
	}

	:global(.map-popup__list) {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	:global(.map-popup__item + .map-popup__item) {
		margin-top: 0.625rem;
		padding-top: 0.625rem;
		border-top: 1px solid #e5e7eb;
	}

	:global(.map-popup__title) {
		display: inline-block;
		margin-bottom: 0.125rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: #0f172a;
		text-decoration: none;
	}

	:global(.map-popup__title:hover) {
		text-decoration: underline;
	}

	:global(.map-popup__meta) {
		font-size: 0.8125rem;
		line-height: 1.35;
		color: #4b5563;
	}
</style>
