<script lang="ts">
	import type { Snippet } from "svelte";

	let { error, fallback, children }: {
		error?: Error | null;
		fallback?: Snippet<[Error | null]>;
		children: Snippet;
	} = $props();
</script>

{#if error}
	{#if fallback}
		{@render fallback(error)}
	{:else}
		<div class="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center">
			<div class="mb-4 text-4xl" aria-hidden="true">⚠️</div>
			<h2 class="font-display text-xl font-semibold text-text-default mb-2">
				Ein Fehler ist aufgetreten
			</h2>
			<p class="text-text-subtle max-w-md">
				{error.message || "Unbekannter Fehler"}
			</p>
			<button
				onclick={() => window.location.reload()}
				type="button"
				class="btn-primary mt-4 min-h-12"
				aria-label="Seite neu laden"
			>
				Neu laden
			</button>
		</div>
	{/if}
{:else}
	{@render children()}
{/if}
