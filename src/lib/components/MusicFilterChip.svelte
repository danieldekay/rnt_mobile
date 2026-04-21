<script lang="ts">
	import type { MusicType } from '$lib/types';
	import { getMusicFilterClass, getMusicLabel } from '$lib/utils/event-presentation';

	interface Props {
		music: MusicType;
		active: boolean;
		onclick: () => void;
	}

	let { music, active, onclick }: Props = $props();
</script>

<button
	{onclick}
	class="filter-chip {getMusicFilterClass(music, active)}"
	aria-pressed={active}
>
	<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
		<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
	</svg>
	<span>{getMusicLabel(music)}</span>
	{#if active}
		<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
		</svg>
	{/if}
</button>