<script lang="ts">
	import { onMount } from 'svelte';
	import { eventStore } from '$lib/stores/events.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import type { TribeEvent } from '$lib/types';

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
	<!-- Calendar -->
	<Calendar 
		events={eventStore.events}
		{currentMonth}
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
			<h3 class="text-lg font-bold text-gray-900">
				Events am {selectedDate.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })}
			</h3>
			{#each eventsForSelectedDate as event (event.id)}
				<EventCard {event} />
			{/each}
		</div>
	{:else if selectedDate}
		<div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
			<p class="text-gray-500">Keine Events an diesem Tag</p>
		</div>
	{:else}
		<div class="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
			<p class="text-gray-500">Tippe auf einen Tag, um Events zu sehen</p>
		</div>
	{/if}
</div>
