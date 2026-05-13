<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<aside
	class="hidden lg:block w-[320px] border-l border-border-default px-6 py-6 sticky top-0 h-dvh overflow-y-auto"
	style="width: var(--desktop-right-sidebar-width);"
>
	{@render children()}
</aside>