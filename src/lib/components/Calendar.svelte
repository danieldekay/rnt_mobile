<script lang="ts">
	import type { TribeEvent } from '$lib/types';
	import { getEventAccentClass } from '$lib/utils/event-presentation';

	interface Props {
		events: TribeEvent[];
		currentMonth: Date;
		selectedDate?: Date | null;
		onselectDate: (date: Date) => void;
		onmonthchange?: (date: Date) => void;
	}

	let { events, currentMonth, selectedDate = null, onselectDate, onmonthchange = () => {} }: Props = $props();

	const weekDays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

	let currentDate = new Date();
	
	function getMonthData(date: Date) {
		const year = date.getFullYear();
		const month = date.getMonth();
		
		const firstDay = new Date(year, month, 1);
		const lastDay = new Date(year, month + 1, 0);
		
		const startDow = (firstDay.getDay() + 6) % 7;
		const days: (Date | null)[] = [];
		
		for (let i = 0; i < startDow; i++) days.push(null);
		for (let i = 1; i <= lastDay.getDate(); i++) {
			days.push(new Date(year, month, i));
		}
		
		return {
			year,
			month,
			days,
			monthName: date.toLocaleDateString('de-DE', { month: 'long' })
		};
	}

	function getEventsForDate(date: Date): TribeEvent[] {
		return events.filter((event) => {
			const eventDate = new Date(event.start_date);
			return eventDate.getFullYear() === date.getFullYear() &&
				eventDate.getMonth() === date.getMonth() &&
				eventDate.getDate() === date.getDate();
		});
	}

	function isToday(date: Date): boolean {
		return date.toDateString() === currentDate.toDateString();
	}

	function isSelected(date: Date): boolean {
		return selectedDate ? date.toDateString() === selectedDate.toDateString() : false;
	}

	function isPast(date: Date): boolean {
		const startOfToday = new Date(currentDate);
		startOfToday.setHours(0, 0, 0, 0);
		return date < startOfToday;
	}

	function getDateLabel(date: Date, eventCount: number): string {
		const label = date.toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});

		if (eventCount === 0) {
			return label;
		}

		return `${label}, ${eventCount} Veranstaltung${eventCount === 1 ? '' : 'en'}`;
	}

	function changeMonth(offset: number) {
		onmonthchange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
	}

	const { days, monthName, year } = $derived(getMonthData(currentMonth));
</script>

<div class="card p-4">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<button
			onclick={() => changeMonth(-1)}
			type="button"
			class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-border-default bg-surface-card text-text-default transition-colors hover:bg-action-secondary"
			aria-label="Vorherigen Monat anzeigen"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
			</svg>
		</button>
		<h3 class="font-display text-[1.5rem] font-semibold capitalize text-text-default">{monthName} {year}</h3>
		<button
			onclick={() => changeMonth(1)}
			type="button"
			class="inline-flex min-h-10 min-w-10 items-center justify-center rounded-control border border-border-default bg-surface-card text-text-default transition-colors hover:bg-action-secondary"
			aria-label="Nächsten Monat anzeigen"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
			</svg>
		</button>
	</div>

	<!-- Week days header -->
	<div class="grid grid-cols-7 gap-1 mb-2">
		{#each weekDays as day (day)}
			<div class="py-1 text-center text-[0.875rem] font-medium text-text-muted">{day}</div>
		{/each}
	</div>

	<!-- Calendar grid -->
	<div class="grid grid-cols-7 gap-1">
		{#each days as day, index (day ? day.toISOString() : `empty-${index}`)}
			{#if day}
				{@const dayEvents = getEventsForDate(day)}
				{@const hasEvents = dayEvents.length > 0}
				{@const past = isPast(day)}
				{@const selected = isSelected(day)}
				<button
					onclick={() => onselectDate(day)}
					type="button"
					class="relative aspect-square flex flex-col items-center justify-center rounded-control border text-sm transition-colors duration-150 {selected ? 'border-border-accent bg-action-primary text-text-inverse' : isToday(day) ? 'border-border-accent bg-surface-card text-text-default' : hasEvents ? 'border-border-default bg-surface-subtle text-text-default hover:bg-action-secondary' : 'border-transparent bg-transparent text-text-muted hover:border-border-default hover:bg-surface-card hover:text-text-default'} {past && !isToday(day) && !selected ? 'opacity-50' : ''}"
					aria-pressed={selected}
					aria-label={getDateLabel(day, dayEvents.length)}
					aria-current={isToday(day) ? 'date' : undefined}
				>
					{#if hasEvents}
						<span class="absolute right-1.5 top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.625rem] font-semibold leading-none {selected ? 'bg-white/18 text-text-inverse' : 'border border-border-default bg-surface-card text-text-default'}">
							{dayEvents.length}
						</span>
					{/if}
					{#if isToday(day) && !selected}
						<span class="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-focus-ring" aria-hidden="true"></span>
					{/if}
					<span class="font-medium">{day.getDate()}</span>
					{#if hasEvents && !selected}
						<div class="absolute bottom-1 flex gap-0.5" aria-hidden="true">
							{#each dayEvents.slice(0, 3) as event (event.id)}
								<div class="h-1.5 w-1.5 rounded-full {getEventAccentClass(event)}"></div>
							{/each}
						</div>
					{/if}
				</button>
			{:else}
				<div class="aspect-square"></div>
			{/if}
		{/each}
	</div>
</div>
