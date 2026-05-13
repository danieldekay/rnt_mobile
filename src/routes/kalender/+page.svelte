<script lang="ts">
	import { onMount } from 'svelte';
	import { eventStore } from '$lib/stores/events.svelte';
	import Calendar from '$lib/components/Calendar.svelte';
	import DateSelector from '$lib/components/DateSelector.svelte';
	import EventCard from '$lib/components/EventCard.svelte';
	import FilterChip from '$lib/components/FilterChip.svelte';
	import MusicFilterChip from '$lib/components/MusicFilterChip.svelte';
	import type { EventType, MusicType, TribeEvent } from '$lib/types';
	import { EVENT_TYPE_SLUGS, MUSIC_SLUGS } from '$lib/constants';
	import { trackFeatureEvent } from '$lib/matomo';

	const eventTypes: EventType[] = ['milonga', 'practica', 'workshop', 'kurs'];
	const musicTypes: MusicType[] = ['traditional', 'mixed', 'neo'];

	let selectedDate = $state<Date | null>(null);
	let currentMonth = $state(new Date());
	const showInlineLoading = $derived($eventStore.loading);

	const typeCounts = $derived.by(() => {
		const counts: Record<EventType, number> = { milonga: 0, practica: 0, workshop: 0, kurs: 0 };
		for (const event of $eventStore.allEvents) {
			const slugs = event.categories?.map((c) => c.slug) ?? [];
			for (const type of eventTypes) {
				if (slugs.includes(EVENT_TYPE_SLUGS[type])) counts[type]++;
			}
		}
		return counts;
	});

	const musicCounts = $derived.by(() => {
		const counts: Record<MusicType, number> = { traditional: 0, mixed: 0, neo: 0 };
		for (const event of $eventStore.allEvents) {
			const slugs = event.categories?.map((c) => c.slug) ?? [];
			for (const music of musicTypes) {
				if (slugs.includes(MUSIC_SLUGS[music])) counts[music]++;
			}
		}
		return counts;
	});

	onMount(() => {
		eventStore.setFilters({ date: 'all' });
		void eventStore.loadCalendarMonth(currentMonth, true);
	});

	function getEventsForDate(date: Date): TribeEvent[] {
		return $eventStore.events.filter((event) => {
			const eventDate = new Date(event.start_date);
			return eventDate.getFullYear() === date.getFullYear() &&
				eventDate.getMonth() === date.getMonth() &&
				eventDate.getDate() === date.getDate();
		});
	}

	function handleDateSelect(date: Date) {
		trackFeatureEvent('calendar', 'date_select', date.toLocaleDateString('de-DE'));
		selectedDate = date;
	}

	function handleMonthChange(date: Date) {
		currentMonth = date;
		trackFeatureEvent('calendar', 'month_change', date.toLocaleDateString('de-DE'));
		void eventStore.loadCalendarMonth(date, true);

		if (
			selectedDate &&
			(selectedDate.getFullYear() !== date.getFullYear() || selectedDate.getMonth() !== date.getMonth())
		) {
			selectedDate = null;
		}
	}

	const eventsForSelectedDate = $derived(selectedDate ? getEventsForDate(selectedDate) : []);
</script>

<svelte:head>
	<title>RNT Kalender - Monatsansicht</title>
</svelte:head>

<div class="space-y-4">
	<section class="space-y-3">
		<p class="text-[0.875rem] font-medium uppercase tracking-[0.08em] text-text-muted">Kalenderansicht</p>
		<h2 class="font-display text-[2rem] font-semibold text-text-default">Monat im Überblick</h2>
		<p class="meta-text max-w-[36ch]">Wähle einen Tag und springe direkt zu den Veranstaltungen, ohne die Chronologie der Liste zu verlieren.</p>
	</section>

	<a
		href="#calendar-filters-region"
		class="max-lg:hidden lg:sr-only lg:focus:not-sr-only lg:focus:fixed lg:focus:left-6 lg:focus:top-6 lg:focus:z-50 lg:focus:inline-flex lg:focus:rounded-control lg:focus:border lg:focus:border-border-default lg:focus:bg-surface-card lg:focus:px-3 lg:focus:py-2 lg:focus:text-sm lg:focus:font-medium lg:focus:text-text-default"
	>
		Zu den Filtern springen
	</a>

	<section class="space-y-3 lg:hidden" aria-labelledby="calendar-filters-heading-mobile">
		<h3 id="calendar-filters-heading-mobile" class="text-[0.9375rem] font-medium text-text-default">Filter</h3>
		<div class="flex flex-wrap gap-2 items-center">
			{#each musicTypes as music (music)}
				<MusicFilterChip
					{music}
					active={$eventStore.filters.music === music}
					onclick={() => eventStore.toggleMusic(music)}
					count={musicCounts[music]}
				/>
			{/each}
		</div>
		<div class="flex flex-wrap gap-2 items-center">
			{#each eventTypes as type (type)}
				<FilterChip
					{type}
					active={$eventStore.filters.types.includes(type)}
					onclick={() => eventStore.toggleType(type)}
					count={typeCounts[type]}
				/>
			{/each}
		</div>
	</section>

	{#if showInlineLoading}
		<div class="card flex items-center gap-3 p-3 lg:hidden" role="status" aria-live="polite">
			<div class="h-4 w-4 animate-spin rounded-full border-2 border-action-secondary border-t-action-primary"></div>
			<p class="meta-text">Kalenderdaten werden aktualisiert…</p>
		</div>
	{/if}

	<div class="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-4 lg:space-y-0 xl:grid-cols-[minmax(0,1fr)_17rem] xl:gap-5 2xl:grid-cols-[minmax(0,1fr)_18rem]">
		<section class="space-y-4 lg:min-w-0">
			<div class="w-full max-w-[42rem] space-y-4">
				<div class="w-full">
					<Calendar
						events={$eventStore.events}
						{currentMonth}
						{selectedDate}
						onselectDate={handleDateSelect}
						onmonthchange={handleMonthChange}
					/>
				</div>

				<div class="w-full">
					<DateSelector
						selectedDate={selectedDate}
						eventsForDate={eventsForSelectedDate}
						ondatechange={(date) => { selectedDate = date; }}
					/>
				</div>

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
		</section>

		<aside
			id="calendar-filters-region"
			class="hidden space-y-4 lg:block lg:sticky lg:top-6"
			aria-labelledby="calendar-filters-heading"
			tabindex="-1"
		>
			<section class="space-y-3">
				<h3 id="calendar-filters-heading" class="text-[0.9375rem] font-medium text-text-default">Filter</h3>
				<div class="flex flex-wrap gap-2 items-center">
					{#each musicTypes as music (music)}
						<MusicFilterChip
							{music}
							active={$eventStore.filters.music === music}
							onclick={() => eventStore.toggleMusic(music)}
							count={musicCounts[music]}
						/>
					{/each}
				</div>
				<div class="flex flex-wrap gap-2 items-center">
					{#each eventTypes as type (type)}
						<FilterChip
							{type}
							active={$eventStore.filters.types.includes(type)}
							onclick={() => eventStore.toggleType(type)}
							count={typeCounts[type]}
						/>
					{/each}
				</div>
			</section>

			{#if showInlineLoading}
				<div class="card flex items-center gap-3 p-3" role="status" aria-live="polite">
					<div class="h-4 w-4 animate-spin rounded-full border-2 border-action-secondary border-t-action-primary"></div>
					<p class="meta-text">Kalenderdaten werden aktualisiert…</p>
				</div>
			{/if}
		</aside>
	</div>
</div>
