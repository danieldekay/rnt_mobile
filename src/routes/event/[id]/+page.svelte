<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import ConsentPlaceholder from '$lib/components/ConsentPlaceholder.svelte';
	import { escapeHtml, sanitizeHtml } from '$lib/utils/html';
	import { trackFeatureEvent } from '$lib/matomo';
	import { consentStore } from '$lib/stores/consent.svelte';
	import { page } from '$app/stores';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import { fetchEventById, extractDjFromDescription, extractWorkshopFromDescription, formatEventCost } from '$lib/api/tribe';
	import type { TribeEvent } from '$lib/types';
	import { createEventCalendarIcs, getEventCalendarFileName, getEventShareData } from '$lib/utils/event-actions';
	import { getEventMusicBadgeClass, getEventMusicLabel, getEventTypeBadgeClass, getEventTypeLabel } from '$lib/utils/event-presentation';
	import 'leaflet/dist/leaflet.css';

	let event = $state<TribeEvent | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let mapContainer = $state<HTMLDivElement | null>(null);
	let map: any = null;
	let shareState = $state<'idle' | 'copied' | 'error'>('idle');
	let calendarState = $state<'idle' | 'saved' | 'error'>('idle');

	const eventId = $derived.by(() => {
		const id = $page.params.id;
		return id ? parseInt(id, 10) : null;
	});

	onMount(async () => {
		const id = eventId;
		if (!id) {
			error = 'Ungültige Veranstaltungs-ID';
			loading = false;
			return;
		}

		try {
			event = await fetchEventById(id);
		} catch (e) {
			error = 'Veranstaltung nicht gefunden';
			console.error(e);
		} finally {
			loading = false;
		}
	});

	onMount(() => {
		return () => {
			if (map) {
				map.remove();
				map = null;
			}
		};
	});

	$effect(() => {
		if (event?.venue?.geo_lat && event?.venue?.geo_lng && mapConsentGranted && mapContainer && !map) {
			initMap(event.venue.geo_lat, event.venue.geo_lng, event.venue.venue);
		}

		if (!mapConsentGranted && map) {
			map.remove();
			map = null;
		}
	});

	function enableMaps() {
		consentStore.savePreferences({ maps: true });
		trackFeatureEvent('event-map', 'enable');
	}

	async function initMap(lat: number, lng: number, venueName: string) {
		const L = await import('leaflet');
		
		map = L.map(mapContainer!).setView([lat, lng], 15);
		
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		const customIcon = L.divIcon({
			className: 'custom-marker',
			html: `<div style="background: #0ea5e9; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
				<svg style="transform: rotate(45deg); width: 16px; height: 16px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
				</svg>
			</div>`,
			iconSize: [32, 32],
			iconAnchor: [16, 32]
		});

		L.marker([lat, lng], { icon: customIcon })
			.addTo(map)
			.bindPopup(`<strong>${escapeHtml(venueName)}</strong>`)
			.openPopup();
	}

	const startDate = $derived(event ? parseISO(event.start_date) : null);
	const endDate = $derived(event ? parseISO(event.end_date) : null);
	const dj = $derived(event ? extractDjFromDescription(event) : null);
	const workshop = $derived(event ? extractWorkshopFromDescription(event) : null);
	const detailImage = $derived(event?.image && typeof event.image === 'string' ? event.image : null);

	const formattedDate = $derived(startDate ? format(startDate, 'EEEE, d. MMMM yyyy', { locale: de }) : '');
	const startTime = $derived(startDate ? format(startDate, 'HH:mm') : '');
	const endTime = $derived(endDate ? format(endDate, 'HH:mm') : '');

	const eventTypeLabel = $derived(event ? getEventTypeLabel(event) : null);
	const eventTypeBadgeClass = $derived(event ? getEventTypeBadgeClass(event) : 'event-badge-default');
	const musicLabel = $derived(event ? getEventMusicLabel(event) : null);
	const musicBadgeClass = $derived(event ? getEventMusicBadgeClass(event) : 'music-badge-default');
	const hasGeo = $derived(event?.venue?.geo_lat && event?.venue?.geo_lng);
	const mapConsentGranted = $derived(consentStore.hasConsent('maps'));
	const sanitizedDescription = $derived(event ? sanitizeHtml(event.description) : '');
	const shareData = $derived(event ? getEventShareData(event) : null);
	const calendarFileName = $derived(event ? getEventCalendarFileName(event) : 'rnt-event.ics');

	function resetShareState() {
		window.setTimeout(() => {
			shareState = 'idle';
		}, 2200);
	}

	function resetCalendarState() {
		window.setTimeout(() => {
			calendarState = 'idle';
		}, 2200);
	}

	async function handleShare() {
		if (!event || !shareData) {
			return;
		}

		try {
			if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
				await navigator.share(shareData);
				trackFeatureEvent('event-share', 'native', String(event.id));
				return;
			}
		} catch (shareError) {
			if (shareError instanceof DOMException && shareError.name === 'AbortError') {
				trackFeatureEvent('event-share', 'cancelled', String(event.id));
				return;
			}
		}

		try {
			await navigator.clipboard.writeText([shareData.text, shareData.url].join('\n'));
			shareState = 'copied';
			trackFeatureEvent('event-share', 'copy_link', String(event.id));
			resetShareState();
		} catch {
			shareState = 'error';
			trackFeatureEvent('event-share', 'copy_failed', String(event.id));
			resetShareState();
		}
	}

	function handleCalendarSave() {
		if (!event) {
			return;
		}

		try {
			const ics = createEventCalendarIcs(event);
			const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
			const url = URL.createObjectURL(blob);
			const link = document.createElement('a');

			link.href = url;
			link.download = calendarFileName;
			document.body.append(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);

			calendarState = 'saved';
			trackFeatureEvent('event-calendar', 'download_ics', String(event.id));
			resetCalendarState();
		} catch {
			calendarState = 'error';
			trackFeatureEvent('event-calendar', 'download_failed', String(event.id));
			resetCalendarState();
		}
	}
</script>

<svelte:head>
	<title>{event ? event.title : 'Veranstaltung'} - RNT Kalender</title>
</svelte:head>

{#if loading}
	<div class="card flex flex-col items-center justify-center py-12 text-center" role="status" aria-live="polite">
		<div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
		<p class="text-gray-500">Lade Veranstaltung…</p>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center" role="alert">
		<svg class="w-12 h-12 mx-auto text-red-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
		</svg>
		<p class="text-red-600 font-medium">{error}</p>
		<a href={resolve('/')} class="mt-4 inline-block btn-primary">
			Zurück zur Übersicht
		</a>
	</div>
{:else if event}
	<article class="space-y-5">
		<!-- Back button -->
		<div>
			<a href={resolve('/')} class="inline-flex min-h-12 items-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Zurück
			</a>
		</div>

		<section class="card overflow-hidden">
			{#if detailImage}
				<div class="border-b border-border-default bg-surface-subtle p-4">
					<img 
						src={detailImage} 
						alt={event?.title}
						width="1200"
						height="700"
						fetchpriority="high"
						class="h-52 w-full rounded-card object-cover"
					/>
				</div>
			{/if}
			<div class="space-y-4 p-5">
				<div class="flex flex-wrap gap-2">
					{#if eventTypeLabel}
						<span class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {eventTypeBadgeClass}">
							{eventTypeLabel}
						</span>
					{/if}
					{#if musicLabel}
						<span class="inline-flex min-h-8 items-center rounded-badge border px-3 py-1 text-[0.75rem] font-semibold {musicBadgeClass}">
							{musicLabel}
						</span>
					{/if}
				</div>
				<h1 class="font-display text-[2rem] font-semibold leading-tight text-text-default">
					{event.title}
				</h1>
				<p class="meta-text max-w-[40ch]">Zeit, Ort und Zugang zuerst. Weitere Details folgen darunter in klar getrennten Abschnitten.</p>
			</div>
		</section>

		<section class="card p-4">
			<p class="meta-text">Schnellaktionen</p>
			<div class="mt-3 grid gap-3 sm:grid-cols-2">
				<button
					type="button"
					onclick={handleShare}
					class="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C9.314 12.955 10.055 12.73 10.848 12.73c.793 0 1.534.225 2.164.612m-4.328 0a3 3 0 10-2.165-2.91m6.493 2.91a3 3 0 112.164-2.91m-8.657 2.91l8.657-5.82"/>
					</svg>
					{shareState === 'copied' ? 'Link kopiert' : shareState === 'error' ? 'Teilen fehlgeschlagen' : 'Teilen'}
				</button>

				<button
					type="button"
					onclick={handleCalendarSave}
					class="inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
					</svg>
					{calendarState === 'saved' ? 'Kalenderdatei geladen' : calendarState === 'error' ? 'Kalender fehlgeschlagen' : 'In Kalender speichern'}
				</button>
			</div>

			{#if shareState === 'copied'}
				<p class="meta-text mt-3">Den Veranstaltungslink kannst du jetzt in Messenger oder Mail einfuegen.</p>
			{:else if shareState === 'error'}
				<p class="meta-text mt-3">Teilen war in diesem Browser nicht moeglich.</p>
			{/if}

			{#if calendarState === 'saved'}
				<p class="meta-text mt-3">Die `.ics`-Datei wurde fuer deinen Kalender heruntergeladen.</p>
			{:else if calendarState === 'error'}
				<p class="meta-text mt-3">Die Kalenderdatei konnte nicht erstellt werden.</p>
			{/if}
		</section>

		<!-- Info cards -->
		<div class="space-y-3">
			<!-- Date & Time -->
			<div class="card p-4">
				<div class="flex items-center gap-4">
					<div class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
						<svg class="h-6 w-6 text-text-default" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
					</div>
					<div>
						<p class="text-[1rem] font-semibold text-text-default">{formattedDate}</p>
						<p class="meta-text">
							{#if event.all_day}
								Ganztägig
							{:else}
								{startTime}{endTime ? ` – ${endTime}` : ''}
							{/if}
						</p>
					</div>
				</div>
			</div>

			<!-- Venue -->
			{#if event.venue}
				<div class="card p-4">
					<div class="flex items-start gap-4">
						<div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
							<svg class="h-6 w-6 text-text-default" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-[1rem] font-semibold text-text-default">{event.venue.venue}</p>
							{#if event.venue.address || event.venue.city}
								<p class="meta-text">
									{[event.venue.address, event.venue.city].filter(Boolean).join(', ')}
								</p>
							{/if}
							{#if event.venue.website}
								<a 
									href={event.venue.website} 
									target="_blank" 
									rel="noopener noreferrer"
									class="mt-2 inline-flex items-center gap-1 text-[0.9375rem] text-text-link underline underline-offset-4"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
									</svg>
									Website
								</a>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Price -->
			{#if event.cost}
				<div class="card p-4">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
							<svg class="h-6 w-6 text-text-default" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
						<div>
							<p class="meta-text">Eintritt</p>
							<p class="text-[1rem] font-semibold text-text-default">
								{formatEventCost(event.cost)}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- DJ & Workshop -->
			{#if dj || workshop}
				<div class="card p-4">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
							<svg class="h-6 w-6 text-text-default" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
							</svg>
						</div>
						<div>
							{#if dj}
								<p class="meta-text">DJ</p>
								<p class="text-[1rem] font-semibold text-text-default">{dj}</p>
							{/if}
							{#if workshop}
								<p class="meta-text mt-2">Workshop</p>
								<p class="text-[1rem] font-semibold text-text-default">{workshop}</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Organizer -->
			{#if event.organizer?.length > 0}
				<div class="card p-4">
					<div class="flex items-center gap-4">
						<div class="flex h-12 w-12 items-center justify-center rounded-control border border-border-default bg-surface-subtle">
							<svg class="h-6 w-6 text-text-default" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
						</div>
						<div>
							<p class="meta-text">Veranstalter</p>
							<p class="text-[1rem] font-semibold text-text-default">{event.organizer[0].organizer}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Map -->
		{#if hasGeo}
			<div>
				<div class="card overflow-hidden">
					{#if mapConsentGranted}
						<div bind:this={mapContainer} class="h-48 w-full"></div>
					{:else}
						<ConsentPlaceholder
							title="Eingebettete Karte nur nach Zustimmung"
							description="Die Veranstaltungsansicht laedt externe OpenStreetMap-Kacheln erst, wenn du Karten fuer die App aktivierst."
							actionLabel="Karten aktivieren"
							onEnable={enableMaps}
						/>
					{/if}
				</div>
				<a 
					href="https://www.google.com/maps/search/?api=1&query={event.venue!.geo_lat},{event.venue!.geo_lng}"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-3 inline-flex min-h-12 items-center justify-center gap-2 rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
					</svg>
					In Maps öffnen
				</a>
			</div>
		{/if}

		<!-- Description -->
		{#if event.description}
			<div class="card p-5">
				<h2 class="section-title mb-3">Beschreibung</h2>
				<div class="prose prose-sm max-w-none break-words text-text-default [&_a]:text-text-link [&_a]:underline [&_a]:underline-offset-4 [&_p]:text-[1.0625rem] [&_p]:leading-[1.6]">
					{@html sanitizedDescription}
				</div>
			</div>
		{/if}

		<!-- External link to WP -->
		<div class="pb-2">
			<a 
				href={event.url} 
				target="_blank" 
				rel="noopener noreferrer"
				class="btn-primary w-full text-center"
			>
				<span class="flex items-center justify-center gap-2">
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
					</svg>
					Auf Website ansehen
				</span>
			</a>
		</div>
	</article>
{/if}

<style>
	:global(.custom-marker) {
		background: transparent !important;
		border: none !important;
	}
	:global(.leaflet-control-attribution) {
		font-size: 10px !important;
	}
</style>