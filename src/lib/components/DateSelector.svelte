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
	<div class="bg-white rounded-2xl p-4 shadow-xs border border-gray-100">
		<div class="flex items-center justify-between mb-3">
			<button onclick={goToPrevDay} title="Vorheriger Tag" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
				</svg>
			</button>
			
			<div class="text-center">
				<p class="font-semibold text-gray-900 capitalize">{formatSelectedDate(selectedDate)}</p>
				<p class="text-xs text-gray-400">{eventsForDate.length} Veranstaltungen</p>
			</div>
			
			<button onclick={goToNextDay} title="Nächster Tag" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
				<svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
				</svg>
			</button>
		</div>
		
		<button 
			onclick={goToToday}
			class="w-full py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
		>
			Heute
		</button>
	</div>
{/if}
