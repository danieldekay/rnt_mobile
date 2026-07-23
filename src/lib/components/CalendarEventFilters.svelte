<script lang="ts">
	import FilterChip from '$lib/components/FilterChip.svelte';
	import MusicFilterChip from '$lib/components/MusicFilterChip.svelte';
	import type { EventType, MusicType } from '$lib/types';

	let {
		eventTypes,
		musicTypes,
		activeTypes,
		activeMusic,
		typeCounts,
		musicCounts,
		onToggleType,
		onToggleMusic,
		headingId,
	}: {
		eventTypes: EventType[];
		musicTypes: MusicType[];
		activeTypes: EventType[];
		activeMusic: MusicType | null;
		typeCounts: Record<EventType, number>;
		musicCounts: Record<MusicType, number>;
		onToggleType: (type: EventType) => void;
		onToggleMusic: (music: MusicType) => void;
		headingId?: string;
	} = $props();
</script>

<section class="space-y-3" aria-labelledby={headingId}>
	{#if headingId}
		<h3 id={headingId} class="text-[0.9375rem] font-medium text-text-default">Filter</h3>
	{/if}
	<div class="flex flex-wrap gap-2 items-center">
		{#each musicTypes as music (music)}
			<MusicFilterChip
				{music}
				active={activeMusic === music}
				onclick={() => onToggleMusic(music)}
				count={musicCounts[music]}
			/>
		{/each}
	</div>
	<div class="flex flex-wrap gap-2 items-center">
		{#each eventTypes as type (type)}
			<FilterChip
				{type}
				active={activeTypes.includes(type)}
				onclick={() => onToggleType(type)}
				count={typeCounts[type]}
			/>
		{/each}
	</div>
</section>
