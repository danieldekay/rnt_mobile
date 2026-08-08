<script lang="ts">
	import { eventStore } from '$lib/stores/events.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import type { TribeEvent } from '$lib/types';
	import FavoriteToggle from '$lib/components/FavoriteToggle.svelte';

	interface Props {
		event: TribeEvent;
		size?: 'sm' | 'md';
		class?: string;
	}

	let { event, size = 'md', class: className = '' }: Props = $props();

	let chooserOpen = $state(false);

	const favoriteState = $derived(favoritesStore.getEventState(event));

	function refreshList() {
		eventStore.refreshFilters();
	}

	function handleToggleClick(clickEvent: MouseEvent) {
		clickEvent.preventDefault();
		clickEvent.stopPropagation();

		if (favoriteState.isFavorite) {
			favoritesStore.removeEvent(event);
			refreshList();
			return;
		}

		chooserOpen = true;
	}

	function chooseSingle(clickEvent: MouseEvent) {
		clickEvent.preventDefault();
		clickEvent.stopPropagation();
		favoritesStore.addEventSingle(event.id);
		chooserOpen = false;
		refreshList();
	}

	function chooseSeries(clickEvent: MouseEvent) {
		clickEvent.preventDefault();
		clickEvent.stopPropagation();
		if (event.slug) {
			favoritesStore.addEventSeries(event.slug);
		}
		chooserOpen = false;
		refreshList();
	}

	function closeChooser(clickEvent: MouseEvent) {
		clickEvent.preventDefault();
		clickEvent.stopPropagation();
		chooserOpen = false;
	}
</script>

<div class={`relative ${className}`}>
	<FavoriteToggle
		active={favoriteState.isFavorite}
		{size}
		label="Veranstaltung favorisieren"
		onclick={handleToggleClick}
	/>

	{#if chooserOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
			onclick={closeChooser}
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div
				class="w-full max-w-md rounded-card border border-border-default bg-surface-card p-4 shadow-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby="favorite-chooser-title"
				tabindex="-1"
				onclick={(clickEvent) => clickEvent.stopPropagation()}
			>
				<h2 id="favorite-chooser-title" class="text-base font-semibold text-text-default">
					Als Favorit speichern
				</h2>
				<p class="mt-1 text-sm text-text-muted">
					Wie möchtest du „{event.title}“ speichern?
				</p>
				<div class="mt-4 grid gap-2">
					<button
						type="button"
						class="inline-flex min-h-12 items-center justify-center rounded-control border border-border-default bg-surface-card px-4 py-2 text-sm font-medium text-text-default transition-colors hover:bg-action-secondary"
						onclick={chooseSingle}
					>
						Nur diesen Termin
					</button>
					<button
						type="button"
						class="inline-flex min-h-12 items-center justify-center rounded-control border border-action-primary bg-action-primary px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:opacity-90"
						onclick={chooseSeries}
					>
						Alle Termine dieser Reihe
					</button>
					<button
						type="button"
						class="inline-flex min-h-10 items-center justify-center rounded-control px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:text-text-default"
						onclick={closeChooser}
					>
						Abbrechen
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
