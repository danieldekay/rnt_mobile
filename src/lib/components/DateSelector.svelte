<script lang="ts">
	import type { EventType } from '$lib/types';

	interface Props {
		selectedDate: Date | null;
		eventsForDate: import('$lib/types').TribeEvent[];
		ondatechange: (date: Date) => void;
	}

	let { selectedDate, eventsForDate, ondatechange }: Props = $props();

	function formatSelectedDate(date: Date | null): string {
		if (!date) return '';
		return date.toLocaleDateString('de-DE', {
			weekday: 'long',
			day: 'numeric',
			month: 'long'
		});
	}

	function goToPrevDay() {
		if (selectedDate) {
			const prev = new Date(selectedDate);
			prev.setDate(prev.getDate() - 1);
			ondatechange(prev);
		}
	}

	function goToNextDay() {
		if (selectedDate) {
			const next = new Date(selectedDate);
			next.setDate(next.getDate() + 1);
			ondatechange(next);
		}
	}

	function goToToday() {
		ondatechange(new Date());
	}
</script>

{#if selectedDate}
	<div class="card p-4">
		<div class="flex items-center justify-between mb-3">
			<button onclick={goToPrevDay} title="Vorheriger Tag" aria-label="Vorherigen Tag auswählen" type="button" class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-control border border-border-default bg-surface-card text-text-default transition-colors hover:bg-action-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/35">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
			</button>
			
			<div class="text-center">
				<p class="font-display text-[1.125rem] font-semibold capitalize text-text-default">{formatSelectedDate(selectedDate)}</p>
				<p class="meta-text" aria-live="polite">{eventsForDate.length} Veranstaltungen</p>
			</div>
			
			<button onclick={goToNextDay} title="Nächster Tag" aria-label="Nächsten Tag auswählen" type="button" class="inline-flex min-h-12 min-w-12 items-center justify-center rounded-control border border-border-default bg-surface-card text-text-default transition-colors hover:bg-action-secondary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus-ring/35">
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
		
		<button 
			onclick={goToToday}
			class="btn-secondary w-full"
			type="button"
		>
			Heute
		</button>
	</div>
{/if}
