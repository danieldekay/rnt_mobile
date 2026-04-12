<script lang="ts">
	import type { TribeEvent } from '$lib/types';

	interface Props {
		events: TribeEvent[];
		currentMonth: Date;
		onselectDate: (date: Date) => void;
	}

	let { events, currentMonth, onselectDate }: Props = $props();

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

	function isPast(date: Date): boolean {
		return date < new Date(currentDate.setHours(0, 0, 0, 0));
	}

	const { days, monthName, year } = $derived(getMonthData(currentMonth));
</script>

<div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
	<!-- Header -->
	<div class="flex items-center justify-between mb-4">
		<h3 class="text-lg font-bold text-gray-900 capitalize">{monthName} {year}</h3>
	</div>

	<!-- Week days header -->
	<div class="grid grid-cols-7 gap-1 mb-2">
		{#each weekDays as day}
			<div class="text-center text-xs font-medium text-gray-400 py-1">{day}</div>
		{/each}
	</div>

	<!-- Calendar grid -->
	<div class="grid grid-cols-7 gap-1">
		{#each days as day}
			{#if day}
				{@const dayEvents = getEventsForDate(day)}
				{@const hasEvents = dayEvents.length > 0}
				{@const past = isPast(day)}
				<button
					onclick={() => onselectDate(day)}
					class="relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm transition-all duration-200 {isToday(day) ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30' : hasEvents ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'text-gray-600 hover:bg-gray-50'} {past && !isToday(day) ? 'opacity-40' : ''}"
				>
					<span class="font-medium">{day.getDate()}</span>
					{#if hasEvents && !isToday(day)}
						<div class="absolute bottom-1 flex gap-0.5">
							{#each dayEvents.slice(0, 3) as event}
								{@const isMilonga = event.categories?.some(c => c.name?.toLowerCase().includes('milonga'))}
								{@const isPractica = event.categories?.some(c => c.name?.toLowerCase().includes('practica'))}
								<div class="w-1.5 h-1.5 rounded-full {isMilonga ? 'bg-coral' : isPractica ? 'bg-mint' : 'bg-lavender'}"></div>
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
