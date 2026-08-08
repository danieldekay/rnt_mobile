<script lang="ts">
	import { eventStore } from '$lib/stores/events.svelte';
	import { favoritesStore } from '$lib/stores/favorites.svelte';
	import FavoriteToggle from '$lib/components/FavoriteToggle.svelte';

	interface Props {
		kind: 'organizer' | 'venue' | 'dj';
		id: number | string;
		size?: 'sm' | 'md';
		class?: string;
	}

	let { kind, id, size = 'md', class: className = '' }: Props = $props();

	const active = $derived.by(() => {
		if (kind === 'organizer') return favoritesStore.isOrganizerFavorite(id as number);
		if (kind === 'venue') return favoritesStore.isVenueFavorite(id as number);
		return favoritesStore.isDjFavorite(String(id));
	});

	const label = $derived(
		kind === 'organizer' ? 'Veranstalter' : kind === 'venue' ? 'Tanzraum' : 'DJ'
	);

	function handleToggle(clickEvent: MouseEvent) {
		clickEvent.preventDefault();
		clickEvent.stopPropagation();

		if (kind === 'organizer') {
			favoritesStore.toggleOrganizer(id as number);
		} else if (kind === 'venue') {
			favoritesStore.toggleVenue(id as number);
		} else {
			favoritesStore.toggleDj(String(id));
		}

		eventStore.refreshFilters();
	}
</script>

<FavoriteToggle {active} {size} label={label} class={className} onclick={handleToggle} />
