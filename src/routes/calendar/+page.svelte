<script lang="ts">
	import { onMount } from 'svelte';
	import { eventStore } from '$lib/stores/events.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import MusicFilterChip from '$lib/components/MusicFilterChip.svelte';
	import type { EventType, MusicType, TribeEvent } from '$lib/types';

	const eventTypes: EventType[] = ['milonga', 'practica', 'workshop', 'kurs'];
	const musicTypes: MusicType[] = ['traditional', 'mixed', 'neo'];

	let selectedDate = $state<Date | null>(null);
	let currentMonth = $state(new Date());

	onMount(() => {
		eventStore.setDateFilter('all');
		eventStore.loadEvents(true);
	});

	function getEventsForDate(date: Date): TribeEvent[] {
		return eventStore.events.filter((event) => {
			const eventDate = new Date(event.start_date);
			return eventDate.getFullYear() === date.getFullYear() &&
				eventDate.getMonth() === date.getMonth() &&
				eventDate.getDate() === date.getDate();
		});
	}

	function handleDateSelect(date: Date) {
		selectedDate = date;
	}

	const eventsForSelectedDate = $derived(selectedDate ? getEventsForDate(selectedDate) : []);
</script>

<svelte:head>
	<title>RNT Kalender - Monatsansicht</title>
</svelte:head>

<div class="space-y-4">
	<section class="space-y-2">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Kalenderansicht</p>
		<h2 class="font-display text-[2rem] font-semibold text-text-default">Monat im Überblick</h2>
		<p class="meta-text max-w-[36ch]">Wähle einen Tag und springe direkt zu den Veranstaltungen, ohne die Chronologie der Liste zu verlieren.</p>
	</section>

	<section class="space-y-3">
		<p class="text-[0.9375rem] font-medium text-text-default">Filter</p>
		<div class="flex flex-wrap gap-2 items-center">
			{#each musicTypes as music (music)}
				<MusicFilterChip
					{music}
					active={eventStore.filters.music === music}
					onclick={() => eventStore.toggleMusic(music)}
				/>
			{/each}
		</div>
		<div class="flex flex-wrap gap-2 items-center">
			{#each eventTypes as type (type)}
				<FilterChip
					{type}
					active={eventStore.filters.types.includes(type)}
					onclick={() => eventStore.toggleType(type)}
				/>
			{/each}
		</div>
	</section>

	<!-- Calendar -->
	<Calendar 
		events={eventStore.events}
		{currentMonth}
		{selectedDate}
		onselectDate={handleDateSelect}
	/>
	
	<!-- Date selector -->
	<DateSelector 
		selectedDate={selectedDate}
		eventsForDate={eventsForSelectedDate}
		ondatechange={(date) => { selectedDate = date; }}
	/>
	
	<!-- Events for selected date -->
	{#if selectedDate && eventsForSelectedDate.length > 0}
		<div class="space-y-3">
			<h3 class="section-title">
				Events am {selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
			</h3>
			{#each eventsForSelectedDate as event (event.id)}
				<EventCard {event} />
			{/each}
		</div>
	{:else if selectedDate}
		<div class="card p-6 text-center">
			<p class="text-[1rem] font-medium text-text-default">Keine Events an diesem Tag</p>
			<p class="meta-text mt-2">Wähle einen anderen Tag oder springe mit „Heute“ zurück.</p>
		</div>
	{:else}
		<div class="card p-6 text-center">
			<p class="text-[1rem] font-medium text-text-default">Tippe auf einen Tag, um Events zu sehen</p>
			<p class="meta-text mt-2">Die Monatsansicht bleibt die Orientierung, die Liste darunter zeigt die Details.</p>
		</div>
	{/if}
</div>
