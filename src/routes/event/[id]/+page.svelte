<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { format, parseISO } from 'date-fns';
	import { de } from 'date-fns/locale';
	import { fetchEventById, extractDjFromDescription, extractWorkshopFromDescription } from '$lib/api/tribe';
	import type { TribeEvent } from '$lib/types';
	import 'leaflet/dist/leaflet.css';

	let event = $state<TribeEvent | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let mapContainer = $state<HTMLDivElement | null>(null);
	let map: any = null;

	const eventId = $derived(() => {
		const id = $page.params.id;
		return id ? parseInt(id, 10) : null;
	});

	onMount(async () => {
		const id = eventId();
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
		if (event?.venue?.geo_lat && event?.venue?.geo_lng && mapContainer && !map) {
			initMap(event.venue.geo_lat, event.venue.geo_lng, event.venue.venue);
		}
	});

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
			.bindPopup(`<strong>${venueName}</strong>`)
			.openPopup();
	}

	const startDate = $derived(event ? parseISO(event.start_date) : null);
	const endDate = $derived(event ? parseISO(event.end_date) : null);
	const dj = $derived(event ? extractDjFromDescription(event) : null);
	const workshop = $derived(event ? extractWorkshopFromDescription(event) : null);
	const detailImage = $derived.by(() => {
		if (event?.image && typeof event.image === 'string') return event.image;
		const match = event?.description?.match(/<img[^>]+src="([^"]+)"/);
		return match ? match[1] : null;
	});

	const formattedDate = $derived(startDate ? format(startDate, 'EEEE, d. MMMM yyyy', { locale: de }) : '');
	const startTime = $derived(startDate ? format(startDate, 'HH:mm') : '');
	const endTime = $derived(endDate ? format(endDate, 'HH:mm') : '');

	const categoryNames = $derived(event?.categories?.map((c) => c.name).filter((n) => n) ?? []);
	const isMilonga = $derived(categoryNames.some((c) => c.toLowerCase().includes('milonga')));
	const isPractica = $derived(categoryNames.some((c) => c.toLowerCase().includes('practica')));
	const isWorkshop = $derived(categoryNames.some((c) => c.toLowerCase().includes('workshop')));

	const badgeColor = $derived(isMilonga ? 'bg-coral' : isPractica ? 'bg-mint' : isWorkshop ? 'bg-lavender' : 'bg-primary-500');
	const gradientBg = $derived(isMilonga ? 'from-coral/10 to-rose-50' : isPractica ? 'from-mint/10 to-teal-50' : isWorkshop ? 'from-lavender/10 to-purple-50' : 'from-primary-500/10 to-sky-50');
	const hasGeo = $derived(event?.venue?.geo_lat && event?.venue?.geo_lng);
</script>

<svelte:head>
	<title>{event ? event.title : 'Veranstaltung'} - RNT Kalender</title>
</svelte:head>

{#if loading}
	<div class="flex flex-col items-center justify-center py-12 text-center">
		<div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
		<p class="text-gray-500">Lade Veranstaltung...</p>
	</div>
{:else if error}
	<div class="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
		<svg class="w-12 h-12 mx-auto text-red-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
		</svg>
		<p class="text-red-600 font-medium">{error}</p>
		<a href="/" class="mt-4 inline-block btn-primary">
			Zurück zur Übersicht
		</a>
	</div>
{:else if event}
	<article class="space-y-5 -mx-4">
		<!-- Back button -->
		<div class="px-4">
			<a href="/" class="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
				Zurück
			</a>
		</div>

		<!-- Featured Image with overlay -->
		{#if detailImage}
			<div class="relative h-56 overflow-hidden">
				<img 
					src={detailImage} 
					alt={event?.title}
					class="w-full h-full object-cover"
				/>
				<div class="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent"></div>
				<div class="absolute bottom-0 left-0 right-0 p-5">
					<div class="flex flex-wrap gap-2 mb-3">
						{#if isMilonga || isPractica || isWorkshop}
							<span class="px-3 py-1 {badgeColor} text-white text-xs font-bold rounded-full shadow-lg">
								{isMilonga ? 'Milonga' : isPractica ? 'Practica' : 'Workshop'}
							</span>
						{/if}
						{#if event.featured}
							<span class="px-3 py-1 bg-amber text-white text-xs font-bold rounded-full shadow-lg">
								Empfohlen
							</span>
						{/if}
					</div>
					<h1 class="text-2xl font-bold text-white leading-tight drop-shadow-lg">
						{event.title}
					</h1>
				</div>
			</div>
		{:else}
			<div class="px-4">
				<div class="flex flex-wrap gap-2 mb-3">
					{#if isMilonga || isPractica || isWorkshop}
						<span class="px-3 py-1 {badgeColor} text-white text-xs font-bold rounded-full">
							{isMilonga ? 'Milonga' : isPractica ? 'Practica' : 'Workshop'}
						</span>
					{/if}
					{#if event.featured}
						<span class="px-3 py-1 bg-amber text-white text-xs font-bold rounded-full">
							Empfohlen
						</span>
					{/if}
				</div>
				<h1 class="text-2xl font-bold text-gray-900 leading-tight">
					{event.title}
				</h1>
			</div>
		{/if}

		<!-- Info cards -->
		<div class="px-4 space-y-3">
			<!-- Date & Time -->
			<div class="bg-linear-to-r {gradientBg} rounded-2xl p-4 border border-gray-100">
				<div class="flex items-center gap-4">
					<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xs">
						<svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
						</svg>
					</div>
					<div>
						<p class="font-semibold text-gray-900">{formattedDate}</p>
						<p class="text-sm text-gray-500">
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
				<div class="bg-linear-to-r {gradientBg} rounded-2xl p-4 border border-gray-100">
					<div class="flex items-start gap-4">
						<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xs shrink-0">
							<svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
							</svg>
						</div>
						<div class="flex-1 min-w-0">
							<p class="font-semibold text-gray-900">{event.venue.venue}</p>
							{#if event.venue.address || event.venue.city}
								<p class="text-sm text-gray-500">
									{[event.venue.address, event.venue.city].filter(Boolean).join(', ')}
								</p>
							{/if}
							{#if event.venue.website}
								<a 
									href={event.venue.website} 
									target="_blank" 
									rel="noopener noreferrer"
									class="text-sm text-primary-600 hover:underline inline-flex items-center gap-1 mt-1"
								>
									<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
				<div class="bg-linear-to-r {gradientBg} rounded-2xl p-4 border border-gray-100">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xs">
							<svg class="w-6 h-6 {event.cost.includes('frei') || event.cost === '0' ? 'text-mint' : 'text-primary-500'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
							</svg>
						</div>
						<div>
							<p class="text-sm text-gray-500">Eintritt</p>
							<p class="font-bold {event.cost.includes('frei') || event.cost === '0' ? 'text-mint' : 'text-primary-600'}">
								{event.cost === '0' || event.cost.includes('frei') ? 'Frei' : event.cost}
							</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- DJ & Workshop -->
			{#if dj || workshop}
				<div class="bg-linear-to-r {gradientBg} rounded-2xl p-4 border border-gray-100">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xs">
							<svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
							</svg>
						</div>
						<div>
							{#if dj}
								<p class="text-sm text-gray-500">DJ</p>
								<p class="font-semibold text-gray-900">{dj}</p>
							{/if}
							{#if workshop}
								<p class="text-sm text-gray-500 mt-1">Workshop</p>
								<p class="font-semibold text-gray-900">{workshop}</p>
							{/if}
						</div>
					</div>
				</div>
			{/if}

			<!-- Organizer -->
			{#if event.organizer?.length > 0}
				<div class="bg-linear-to-r {gradientBg} rounded-2xl p-4 border border-gray-100">
					<div class="flex items-center gap-4">
						<div class="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-xs">
							<svg class="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
							</svg>
						</div>
						<div>
							<p class="text-sm text-gray-500">Veranstalter</p>
							<p class="font-semibold text-gray-900">{event.organizer[0].organizer}</p>
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Map -->
		{#if hasGeo}
			<div class="px-4">
				<div class="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
					<div bind:this={mapContainer} class="h-48 w-full"></div>
				</div>
				<a 
					href="https://www.google.com/maps/search/?api=1&query={event.venue!.geo_lat},{event.venue!.geo_lng}"
					target="_blank"
					rel="noopener noreferrer"
					class="mt-2 flex items-center justify-center gap-2 text-sm text-primary-600 hover:text-primary-700"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
					</svg>
					In Maps öffnen
				</a>
			</div>
		{/if}

		<!-- Description -->
		{#if event.description}
			<div class="px-4 border-t border-gray-100 pt-5">
				<h2 class="text-lg font-semibold text-gray-900 mb-3">Beschreibung</h2>
				<div class="prose prose-sm max-w-none text-gray-700 [&_a]:text-primary-600 [&_a]:underline">
					{@html event.description}
				</div>
			</div>
		{/if}

		<!-- External link to WP -->
		<div class="px-4 pb-4">
			<a 
				href={event.url} 
				target="_blank" 
				rel="noopener noreferrer"
				class="btn-primary w-full text-center block"
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