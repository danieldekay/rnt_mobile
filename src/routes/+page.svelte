<script lang="ts">
	import { onMount } from 'svelte';
	import { eventStore } from '$lib/stores/events.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import DateFilter from '$lib/components/DateFilter.svelte';
	import Search from 'carbon-icons-svelte/lib/Search.svelte';
	import Close from 'carbon-icons-svelte/lib/Close.svelte';
	import Image from 'carbon-icons-svelte/lib/Image.svelte';
	import Map from 'carbon-icons-svelte/lib/Map.svelte';
	import List from 'carbon-icons-svelte/lib/List.svelte';
	import type { EventType, TribeEvent } from '$lib/types';
	import 'leaflet/dist/leaflet.css';

	const eventTypes: EventType[] = ['milonga', 'practica', 'workshop', 'kurs'];

	let isRefreshing = $state(false);
	let showImages = $state(true);
	let showMap = $state(false);
	let mapContainer = $state<HTMLDivElement | null>(null);
	let mapLoading = $state(false);
	let map: any = null;
	let mapMarkers: any[] = [];

	const eventsWithGeo = $derived(
		eventStore.allEvents.filter((e) => e.venue?.geo_lat && e.venue?.geo_lng)
	);

	const searchCount = $derived(eventStore.events.length);
	const totalCount = $derived(eventStore.allEvents.length);

	onMount(() => {
		eventStore.loadEvents();
	});

	$effect(() => {
		if (showMap && mapContainer) {
			if (!map && eventsWithGeo.length > 0) {
				initMap();
			}
		}
		if (!showMap && map) {
			map.remove();
			map = null;
		}
	});

	async function initMap() {
		const L = await import('leaflet');
		
		map = L.map(mapContainer!).setView([49.4, 8.6], 10);
		
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
		}).addTo(map);

		const customIcon = L.divIcon({
			className: 'custom-marker',
			html: `<div style="background: #0ea5e9; width: 28px; height: 28px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
				<svg style="transform: rotate(45deg); width: 14px; height: 14px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
				</svg>
			</div>`,
			iconSize: [28, 28],
			iconAnchor: [14, 28]
		});

		const markers = eventsWithGeo.map((event) => {
			const eventId = event.id;
			const eventTitle = event.title;
			const venueName = event.venue?.venue ?? '';
			const marker = L.marker([event.venue!.geo_lat!, event.venue!.geo_lng!], { icon: customIcon })
				.addTo(map!)
				.bindPopup(`<strong>${eventTitle}</strong><br/>${venueName}<br/><a href="/event/${eventId}">Mehr info</a>`);
			return marker;
		});

		if (markers.length > 0) {
			const group = L.featureGroup(markers);
			map.fitBounds(group.getBounds().pad(0.1));
		}
	}

	async function handleRefresh() {
		isRefreshing = true;
		await eventStore.loadEvents(true);
		isRefreshing = false;
	}
</script>

<svelte:head>
	<title>RNT Kalender - Tango Events</title>
</svelte:head>

<div class="space-y-4">
	<!-- Filters -->
	<div class="space-y-3">
		<!-- Date filter -->
		<DateFilter 
			active={eventStore.filters.date} 
			onchange={(date) => eventStore.setDateFilter(date)} 
		/>
		
		<!-- Search -->
		<div class="relative">
			<Search class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
			<input
				type="text"
				placeholder="Suchen nach Event, Ort, DJ..."
				value={eventStore.searchQuery}
				oninput={(e) => eventStore.setSearchQuery(e.currentTarget.value)}
				class="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent"
			/>
			{#if eventStore.searchQuery}
				<button
					onclick={() => eventStore.clearSearch()}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
				>
					<Close class="w-4 h-4" />
				</button>
			{/if}
		</div>
		{#if eventStore.searchQuery && searchCount !== totalCount}
			<p class="text-sm text-gray-500">
				{searchCount} von {totalCount} Events
			</p>
		{/if}
		
		<!-- Type filters + toggles -->
		<div class="flex flex-wrap gap-2 items-center">
			{#each eventTypes as type}
				<FilterChip
					{type}
					active={eventStore.filters.types.includes(type)}
					onclick={() => eventStore.toggleType(type)}
				/>
			{/each}
			<div class="flex-1"></div>
			<button
				onclick={() => showImages = !showImages}
				class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors {showImages ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}"
				title={showImages ? 'Bilder ausblenden' : 'Bilder anzeigen'}
			>
				<Image class="w-4 h-4" />
				<span class="hidden sm:inline">Bilder</span>
			</button>
			<button
				onclick={() => showMap = !showMap}
				class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-colors {showMap ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'}"
				title={showMap ? 'Zur Liste' : 'Zur Karte'}
			>
				{#if showMap}
					<List class="w-4 h-4" />
				{:else}
					<Map class="w-4 h-4" />
				{/if}
				<span class="hidden sm:inline">{showMap ? 'Liste' : 'Karte'}</span>
			</button>
		</div>
	</div>

	{#if showMap && eventStore.events.length > 0}
		<div class="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
			{#if eventsWithGeo.length > 0}
				<div bind:this={mapContainer} class="h-[60vh] w-full"></div>
			{:else}
				<div class="h-[60vh] flex items-center justify-center bg-gray-50 text-gray-400">
					Keine Events mit Standortdaten
				</div>
			{/if}
		</div>
	{/if}

	<!-- Loading state -->
	{#if eventStore.loading && eventStore.events.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<div class="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mb-4"></div>
			<p class="text-gray-500">Lade Events...</p>
		</div>
	{:else if eventStore.error}
		<!-- Error state -->
		<div class="bg-red-50 border border-red-200 rounded-2xl p-4 text-center">
			<p class="text-red-600 font-medium">Fehler beim Laden</p>
			<p class="text-red-500 text-sm mt-1">{eventStore.error}</p>
			<button 
				onclick={handleRefresh}
				class="mt-3 btn-primary"
			>
				Erneut versuchen
			</button>
		</div>
	{:else if eventStore.events.length === 0}
		<!-- Empty state -->
		<div class="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
			<svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
			</svg>
			<p class="text-gray-500 font-medium">Keine Events gefunden</p>
			<p class="text-gray-400 text-sm mt-1">Versuche andere Filtereinstellungen</p>
		</div>
	{:else}
		{#if !showMap}
		<!-- Event list -->
		<div class="relative">
			<!-- Pull to refresh indicator -->
			{#if isRefreshing}
				<div class="absolute -top-8 left-0 right-0 flex justify-center">
					<div class="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
				</div>
			{/if}
			
			<div class="space-y-3">
				{#each eventStore.events as event (event.id)}
					<EventCard {event} showImage={showImages} />
				{/each}
			</div>
			
			<!-- Refresh button -->
			<div class="mt-6 flex justify-center">
				<button 
					onclick={handleRefresh}
					disabled={eventStore.loading}
					class="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50"
				>
					<svg class="w-4 h-4 {eventStore.loading ? 'animate-spin' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
					</svg>
					{eventStore.loading ? 'Lädt...' : 'Aktualisieren'}
				</button>
			</div>
		</div>
		{/if}
	{/if}
</div>
