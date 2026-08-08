<script lang="ts">
	interface Props {
		active: boolean;
		label?: string;
		size?: 'sm' | 'md';
		class?: string;
		onclick: (event: MouseEvent) => void;
	}

	let {
		active,
		label = 'Favorit',
		size = 'md',
		class: className = '',
		onclick
	}: Props = $props();

	const sizeClass = $derived(size === 'sm' ? 'h-8 w-8' : 'h-10 w-10');
</script>

<button
	type="button"
	class={`inline-flex shrink-0 items-center justify-center rounded-full border transition-colors ${sizeClass} ${
		active
			? 'border-amber-500 bg-amber-50 text-amber-600'
			: 'border-border-default bg-surface-card text-text-muted hover:border-amber-400 hover:text-amber-600'
	} ${className}`}
	aria-label={active ? `${label} entfernen` : `${label} hinzufügen`}
	aria-pressed={active}
	{onclick}
>
	<svg
		class={size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}
		fill={active ? 'currentColor' : 'none'}
		stroke="currentColor"
		viewBox="0 0 24 24"
		aria-hidden="true"
	>
		<path
			stroke-linecap="round"
			stroke-linejoin="round"
			stroke-width="2"
			d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
		/>
	</svg>
</button>
