<script lang="ts">
	import type { Snippet } from 'svelte';
	import LeftSidebar from './LeftSidebar.svelte';
	import RightSidebar from './RightSidebar.svelte';

	let {
		children,
		rightSidebar
	}: {
		children: Snippet;
		rightSidebar?: Snippet;
	} = $props();

	const desktopColumns = $derived(
		rightSidebar
			? 'var(--desktop-sidebar-width) minmax(0, 1fr) var(--desktop-right-sidebar-width)'
			: 'var(--desktop-sidebar-width) minmax(0, 1fr)'
	);
</script>

<div class="min-h-screen bg-surface-canvas">
	<div class="lg:grid" style={`grid-template-columns: ${desktopColumns};`}>
		<div class="hidden lg:block">
			<LeftSidebar />
		</div>

		<div class="min-w-0 lg:px-8 lg:py-8 xl:px-12 flex justify-center">
			<div class="app-content-shell w-full">
				{@render children()}
			</div>
		</div>

		{#if rightSidebar}
			<div class="hidden lg:block">
				<RightSidebar>
					{@render rightSidebar()}
				</RightSidebar>
			</div>
		{/if}
	</div>
</div>
