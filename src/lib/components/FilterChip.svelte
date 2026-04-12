<script lang="ts">
	import type { EventType } from '$lib/types';

	interface Props {
		type: EventType;
		active: boolean;
		onclick: () => void;
	}

	let { type, active, onclick }: Props = $props();

	const labels: Record<EventType, string> = {
		milonga: 'Milongas',
		practica: 'Practicas',
		workshop: 'Workshops',
		kurs: 'Kurse'
	};

	const icons: Record<EventType, string> = {
		milonga: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
		practica: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
		workshop: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
		kurs: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
	};
</script>

<button
	{onclick}
	class="filter-chip {active ? 'filter-chip-active' : 'filter-chip-inactive'}"
>
	<svg class="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={icons[type]} />
	</svg>
	{labels[type]}
</button>
